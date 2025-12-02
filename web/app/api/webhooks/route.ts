import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe client (uses STRIPE_SECRET_KEY from .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// IMPORTANT: Webhook handlers need the raw request body to verify the signature.
// This is required by Next.js configuration.
export const config = {
  api: {
    bodyParser: false,
  },
};

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

      // --- Order Fulfillment Logic (The main action) ---
      // Here, you would perform the following actions:
      
      // 1. **Fetch Order Details:** Retrieve cart data or metadata attached to the session.
      // 2. **Create Sanity Order Document:** Use the Sanity client to create a new 'order' document 
      //    in your CMS, marking it as paid and storing the session ID and items.
      // 3. **Clear Cart (Optional):** If the user was authenticated, you might clear their remote cart.
      // 4. **Send Confirmation Email:** Trigger an email to the customer.

      // Example of logging the fulfillment status:
      // const orderId = session.metadata?.orderId; 
      // await sanityClient.createOrder({ stripeId: session.id, orderId, status: 'Paid' });

      // For now, we only log the success.
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