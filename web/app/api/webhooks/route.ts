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
        // Get line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product']
        });

        // Calculate total and prepare items
        const total = (session.amount_total || 0) / 100; // Convert cents to pounds
        const items = lineItems.data.map(item => ({
          name: (item.price?.product as any)?.name || 'Product',
          quantity: item.quantity || 1,
          price: (item.price?.unit_amount || 0) / 100,
          description: item.description || ''
        }));

        // Generate order number
        const orderNumber = `HP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order in Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            customer_email: session.customer_details?.email || session.customer_email,
            customer_name: session.customer_details?.name || 'Customer',
            items: items,
            total: total,
            status: 'pending',
            payment_status: 'paid',
            user_id: session.metadata?.userId || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ Error creating order:', orderError);
          throw orderError;
        }

        console.log(`✅ Order created successfully: ${orderNumber}`, order);

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
