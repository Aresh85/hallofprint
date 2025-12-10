import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { quoteId } = await request.json();

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    // Get the base URL from the request headers
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!quote.quoted_price) {
      return NextResponse.json({ error: 'Quote has no price' }, { status: 400 });
    }

    if (quote.order_id) {
      return NextResponse.json({ error: 'Quote already converted to order' }, { status: 400 });
    }

    // Calculate tax if applicable
    let totalAmount = quote.quoted_price * 100; // Convert to cents
    const taxAmount = quote.tax_applicable && quote.tax_type === 'UK_VAT_20' 
      ? Math.round(totalAmount * 0.20) 
      : 0;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: quote.project_title,
              description: quote.project_description,
            },
            unit_amount: Math.round(totalAmount),
          },
          quantity: 1,
        },
        ...(taxAmount > 0 ? [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'VAT (20%)',
              description: 'UK Value Added Tax',
            },
            unit_amount: taxAmount,
          },
          quantity: 1,
        }] : []),
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?quote_id=${quoteId}`,
      cancel_url: `${baseUrl}/account/quotes`,
      customer_email: quote.email,
      metadata: {
        quote_id: quoteId,
        type: 'quote_payment',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
