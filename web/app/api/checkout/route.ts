import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { sanityFetch } from '../../../lib/sanity'; // Import Sanity client for price validation

// Initialize Stripe (uses STRIPE_SECRET_KEY from .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

// Define the expected structure of a cart item sent from the client
interface ClientCartItem {
    productName: string;
    basePrice: number;
    quantity: number;
    selections: Array<{
        groupName: string;
        name: string;
        priceModifier: number;
        unit: string;
    }>;
    totalPrice: number; // For debugging, but we re-validate this server-side
}

// Define the structure of the product data fetched from Sanity
interface SanityProductPrice {
    _id: string;
    name: string;
    basePrice: number;
    configurationGroups: Array<{
        groupName: string;
        choices: Array<{
            name: string;
            priceModifier: number;
        }>;
    }>;
}

// GROQ query to get the necessary price data for validation
const priceValidationQuery = `*[_type == "product" && name in $names]{
  _id,
  name,
  basePrice,
  configurationGroups[]{
    groupName,
    choices[]{
      name,
      priceModifier
    }
  }
}`;

// Main API Route Handler (POST request)
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { cartItems } = (await req.json()) as { cartItems: ClientCartItem[] };

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    // --- 1. Server-Side Price Validation ---
    
    // Get a unique list of product names to fetch from Sanity
    const productNames = [...new Set(cartItems.map(item => item.productName))];

    // Fetch the ground truth product data from Sanity
    const sanityPrices = await sanityFetch<SanityProductPrice[]>(
      priceValidationQuery,
      { names: productNames }
    );
    
    // Map Sanity data for easy lookup
    const sanityPriceMap = new Map(sanityPrices.map(p => [p.name, p]));

    // --- 2. Construct Stripe Line Items and Validate Price ---
    
    const lineItems = cartItems.map(item => {
        const productData = sanityPriceMap.get(item.productName);

        if (!productData) {
            throw new Error(`Product not found in CMS: ${item.productName}`);
        }
        
        let calculatedPricePerUnit = productData.basePrice;
        
        // Calculate the total modifier price based on selected options
        item.selections.forEach(clientSelection => {
            const group = productData.configurationGroups.find(g => g.groupName === clientSelection.groupName);
            const choice = group?.choices.find(c => c.name === clientSelection.name);
            
            if (!choice || choice.priceModifier !== clientSelection.priceModifier) {
                // IMPORTANT: This check ensures the client-side price matches the server-side reality.
                throw new Error(`Price mismatch or invalid option for ${item.productName}: ${clientSelection.name}`);
            }
            calculatedPricePerUnit += choice.priceModifier;
        });

        // Ensure the client's total price matches the server's calculated price
        const serverCalculatedTotal = calculatedPricePerUnit * item.quantity;
        
        // Simple validation check (use a tolerance for floating point, but here we use strict match)
        if (Math.abs(serverCalculatedTotal - item.totalPrice) > 0.01) {
            console.error(`Price discrepancy! Client: ${item.totalPrice}, Server: ${serverCalculatedTotal}`);
            // For production, you would often rely on the server calculation only
        }

        // Stripe requires amounts in cents (integer)
        const unitAmountCents = Math.round(calculatedPricePerUnit * 100);

        // Build description from selections, or use a default
        const description = item.selections.length > 0 
            ? item.selections.map(s => s.name).join(', ')
            : 'Standard configuration';

        return {
            price_data: {
                currency: 'gbp', // Changed from 'usd' to 'gbp' for British Pounds
                product_data: {
                    name: item.productName,
                    description: description,
                },
                unit_amount: unitAmountCents,
            },
            quantity: item.quantity,
        };
    });

    // --- 3. Create Stripe Checkout Session ---

    // Get user ID from request headers (if authenticated)
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      // In a real app, you'd verify the token here
      // For now, we'll try to extract it from the cart items metadata if available
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Redirection URLs defined in .env.local (NEXT_PUBLIC_BASE_URL)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`, // Redirect back to the cart on cancel
      
      // Store cart items in metadata for webhook use
      metadata: {
        userId: userId || '',
        itemCount: cartItems.length.toString(),
        cartData: JSON.stringify(cartItems.map(item => ({
          name: item.productName,
          qty: item.quantity,
          price: item.totalPrice
        })))
      }
    });

    // Return the session ID and URL to the client
    return NextResponse.json({ 
      id: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // Be careful not to expose sensitive error details to the client
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
