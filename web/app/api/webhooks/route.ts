import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe client (uses STRIPE_SECRET_KEY from .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to read the raw body from the incoming request
async function getRawBody(req: NextRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  // Read the request body as a stream and buffer it
  for await (const chunk of req.body as any) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  // 1. Get the raw body and signature header
  const rawBody = await getRawBody(req);
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  // 2. Verify the Webhook Signature
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 3. Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`✅ Payment received for session: ${session.id}`);

      try {
        // Check if this is a quote payment
        if (session.metadata?.type === 'quote_payment' && session.metadata?.quote_id) {
          console.log(`Processing quote payment for quote: ${session.metadata.quote_id}`);
          
          // Fetch the quote
          const { data: quote, error: quoteError } = await supabase
            .from('quote_requests')
            .select('*')
            .eq('id', session.metadata.quote_id)
            .single();

          if (quoteError || !quote) {
            console.error('Quote not found:', quoteError);
            return NextResponse.json({ received: true }, { status: 200 });
          }

          // Generate order number
          const orderNumber = `HP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          // Get user_id from quote email
          let userId = null;
          try {
            const { data: userData } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('email', quote.email)
              .single();
            userId = userData?.id || null;
          } catch (e) {
            console.log('User not found, creating guest order');
          }

          // Get shipping address from session
          const shippingAddress = (session as any).shipping_details?.address || session.customer_details?.address;

          // Calculate tax (20% VAT if applicable)
          const subtotal = quote.quoted_price || 0;
          const tax = quote.tax_applicable ? subtotal * 0.20 : 0;
          const total = subtotal + tax;

          // Create order from quote
          const orderNotes = [
            `Converted from paid quote: ${quote.project_title}`,
            `\nProject Description: ${quote.project_description}`,
            quote.specifications ? `\nSpecifications: ${quote.specifications}` : '',
            quote.quantity ? `\nQuantity: ${quote.quantity}` : '',
            quote.delivery_time_estimate ? `\nEstimated Delivery: ${quote.delivery_time_estimate}` : '',
            quote.operator_assigned ? `\nHandled by: ${quote.operator_assigned}` : '',
            quote.customer_notes ? `\n\nCustomer Notes:\n${quote.customer_notes}` : '',
            quote.admin_notes ? `\n\nAdmin Notes:\n${quote.admin_notes}` : '',
            quote.tax_applicable ? `\n\nTax: ${quote.tax_type || 'VAT 20%'}` : '',
          ].filter(Boolean).join('');

          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                order_number: orderNumber,
                user_id: userId,
                customer_email: quote.email,
                customer_name: quote.customer_name,
                customer_phone: quote.phone_number || '',
                
                // Shipping Address
                shipping_address_line1: shippingAddress?.line1 || quote.address || 'TBC',
                shipping_address_line2: shippingAddress?.line2 || '',
                shipping_city: shippingAddress?.city || 'TBC',
                shipping_county: shippingAddress?.state || '',
                shipping_postcode: shippingAddress?.postal_code || 'TBC',
                shipping_country: shippingAddress?.country || 'United Kingdom',
                
                // Amounts
                subtotal: subtotal,
                tax: tax,
                total: total,
                currency: 'GBP',
                
                // Status
                status: 'processing',
                payment_status: 'paid',
                
                // Payment Info
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_payment_status: 'succeeded',
                
                // Notes
                customer_notes: orderNotes,
              },
            ])
            .select()
            .single();

          if (orderError) {
            console.error('Error creating order from quote:', orderError);
            throw orderError;
          }

          // Create order items from quote
          await supabase
            .from('order_items')
            .insert([{
              order_id: orderData.id,
              product_name: quote.project_title,
              quantity: parseInt(quote.quantity) || 1,
              unit_price: quote.quoted_price || 0,
              total_price: quote.quoted_price || 0,
            }]);

          // Update quote status with paid_at timestamp
          await supabase
            .from('quote_requests')
            .update({
              order_id: orderData.id,
              status: 'converted_to_order',
              paid_at: new Date().toISOString(),
              converted_at: new Date().toISOString(),
            })
            .eq('id', quote.id);

          console.log(`✅ Quote converted to order: ${orderNumber} (${orderData.id})`);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Get line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product']
        });

        // Calculate totals
        const subtotal = (session.amount_subtotal || 0) / 100;
        const tax = (session.total_details?.amount_tax || 0) / 100;
        const total = (session.amount_total || 0) / 100;

        // Generate order number
        const orderNumber = `HP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Get shipping details from session
        const shippingAddress = (session as any).shipping_details?.address || session.customer_details?.address;

        // Create order in Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: session.metadata?.userId || null,
            guest_email: session.metadata?.userId ? null : (session.customer_details?.email || session.customer_email),
            status: 'pending',
            payment_status: 'paid',
            
            // Customer Info
            customer_name: session.customer_details?.name || session.metadata?.customerName || 'Customer',
            customer_email: session.customer_details?.email || session.customer_email || '',
            customer_phone: session.customer_details?.phone || '',
            
            // Shipping Address
            shipping_address_line1: shippingAddress?.line1 || session.metadata?.address_line1 || '',
            shipping_address_line2: shippingAddress?.line2 || session.metadata?.address_line2 || '',
            shipping_city: shippingAddress?.city || session.metadata?.city || '',
            shipping_county: shippingAddress?.state || session.metadata?.county || '',
            shipping_postcode: shippingAddress?.postal_code || session.metadata?.postcode || '',
            shipping_country: shippingAddress?.country || 'United Kingdom',
            
            // Order Details
            subtotal: subtotal,
            shipping_cost: 0,
            tax: tax,
            total: total,
            currency: (session.currency || 'gbp').toUpperCase(),
            
            // Payment Info
            stripe_payment_intent_id: session.payment_intent as string,
            payment_method: session.payment_method_types?.[0] || 'card',
            
            // Notes
            customer_notes: session.metadata?.notes || null,
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ Error creating order:', orderError);
          throw orderError;
        }

        console.log(`✅ Order created: ${orderNumber}`);

        // Create order items in separate table
        const orderItems = lineItems.data.map(item => {
          const unitPrice = (item.price?.unit_amount || 0) / 100;
          const quantity = item.quantity || 1;
          return {
            order_id: order.id,
            product_name: (item.price?.product as any)?.name || item.description || 'Product',
            product_slug: (item.price?.product as any)?.metadata?.slug || null,
            quantity: quantity,
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
            options: (item.price?.product as any)?.metadata || null,
          };
        });

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('❌ Error creating order items:', itemsError);
          throw itemsError;
        }

        console.log(`✅ Order items created for ${orderNumber}`);

        // TODO: Send confirmation email to customer
        // await sendOrderConfirmationEmail(order);

      } catch (error) {
        console.error('❌ Error in webhook handler:', error);
        // We still return 200 to Stripe to prevent retries
      }
      break;

    case 'payment_intent.succeeded':
      // Less common for Checkout, but useful for card payments
      console.log('PaymentIntent was successful!');
      break;
      
    // Handle other events as needed (e.g., failed, refunded)

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to Stripe to acknowledge receipt of the event
  return NextResponse.json({ received: true }, { status: 200 });
}
