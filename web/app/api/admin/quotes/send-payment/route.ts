import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Use service role key - bypasses RLS for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if quote is priced
    if (order.status !== 'quote_priced') {
      return NextResponse.json({ 
        error: 'Quote must be approved and priced before sending to payment' 
      }, { status: 400 });
    }

    // Check if already has payment link
    if (order.stripe_payment_intent_id) {
      return NextResponse.json({ 
        error: 'Payment link already created for this quote' 
      }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Quote #${order.order_number}`,
              description: order.project_title || 'Custom Print Quote',
            },
            unit_amount: Math.round(order.total * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hallofprint.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}&quote=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hallofprint.vercel.app'}/account/orders`,
      customer_email: order.customer_email,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        type: 'quote_payment',
      },
    });

    // Update order with payment intent and URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: session.id,
        stripe_payment_url: session.url,
        stripe_payment_status: 'pending',
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Send email to customer with payment link
    try {
      await resend.emails.send({
        from: 'Hall of Prints <noreply@hallofprint.com>',
        to: order.customer_email,
        subject: `Your Quote is Ready - Order #${order.order_number}`,
        html: `
          <h2>Your Quote is Ready!</h2>
          
          <p>Hi ${order.customer_name},</p>
          
          <p>Great news! We've prepared your quote for "${order.project_title || 'your print project'}".</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Quote Summary</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Subtotal:</strong> £${order.subtotal.toFixed(2)}</p>
            <p><strong>VAT (${order.tax_rate}%):</strong> £${order.tax.toFixed(2)}</p>
            <p><strong style="font-size: 1.2em;">Total: £${order.total.toFixed(2)}</strong></p>
            ${order.delivery_date ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.delivery_date).toLocaleDateString('en-GB')}</p>` : ''}
          </div>
          
          ${order.quote_response_notes ? `
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Message from our team:</h4>
            <p>${order.quote_response_notes}</p>
          </div>
          ` : ''}
          
          <p>To proceed with your order, please complete the payment using the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${session.url}" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Pay Now - £${order.total.toFixed(2)}
            </a>
          </div>
          
          <p>Once payment is complete, we'll begin production immediately.</p>
          
          <p>If you have any questions, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>
          Hall of Prints Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 0.875em; color: #6b7280;">
            Order #${order.order_number}<br>
            This payment link is valid for 24 hours.
          </p>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
    }

    // Log activity (no user tracking for service role operations)
    await supabase.from('order_activity_log').insert({
      order_id,
      activity_type: 'payment_link_sent',
      description: `Payment link sent to customer: ${order.customer_email}. Amount: £${order.total.toFixed(2)}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      payment_url: session.url,
      message: 'Payment link created and sent to customer'
    });

  } catch (error) {
    console.error('Error sending payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
