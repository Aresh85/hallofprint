// Manual script to process a quote payment that the webhook missed
// Run with: node web/scripts/manual-process-payment.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'web/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processQuotePayment(quoteId, stripePaymentIntentId) {
  try {
    console.log(`Processing quote: ${quoteId}`);
    
    // Fetch the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    console.log(`Found quote: ${quote.project_title}`);

    if (quote.order_id) {
      console.log(`Quote already has order: ${quote.order_id}`);
      return;
    }

    // Get user_id from quote email
    let userId = null;
    try {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', quote.email)
        .single();
      userId = userData?.id || null;
      if (userId) {
        console.log(`Found user_id: ${userId}`);
      }
    } catch (e) {
      console.log('User not found, creating guest order');
    }

    // Generate order number
    const orderNumber = `HP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`Generated order number: ${orderNumber}`);

    // Calculate tax
    const subtotal = quote.quoted_price || 0;
    const tax = quote.tax_applicable ? subtotal * 0.20 : 0;
    const total = subtotal + tax;

    // Create order notes
    const orderNotes = [
      `Converted from paid quote: ${quote.project_title}`,
      `\nProject Description: ${quote.project_description}`,
      quote.specifications ? `\nSpecifications: ${quote.specifications}` : '',
      quote.quantity ? `\nQuantity: ${quote.quantity}` : '',
      quote.delivery_time_estimate ? `\nEstimated Delivery: ${quote.delivery_time_estimate}` : '',
      quote.customer_notes ? `\n\nCustomer Notes:\n${quote.customer_notes}` : '',
    ].filter(Boolean).join('');

    // Create order
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
          shipping_address_line1: quote.address || 'TBC',
          shipping_address_line2: '',
          shipping_city: 'TBC',
          shipping_county: '',
          shipping_postcode: 'TBC',
          shipping_country: 'United Kingdom',
          
          // Amounts
          subtotal: subtotal,
          tax: tax,
          total: total,
          currency: 'GBP',
          
          // Status
          status: 'processing',
          payment_status: 'paid',
          
          // Payment Info
          stripe_payment_intent_id: stripePaymentIntentId,
          stripe_payment_status: 'succeeded',
          
          // Notes
          customer_notes: orderNotes,
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Order creation failed: ${orderError.message}`);
    }

    console.log(`✅ Order created: ${orderNumber} (${orderData.id})`);

    // Create order items
    const { error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: orderData.id,
        product_name: quote.project_title,
        quantity: parseInt(quote.quantity) || 1,
        unit_price: quote.quoted_price || 0,
        total_price: quote.quoted_price || 0,
      }]);

    if (itemError) {
      console.warn(`Warning: Order items error: ${itemError.message}`);
    } else {
      console.log(`✅ Order items created`);
    }

    // Update quote
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        order_id: orderData.id,
        status: 'converted_to_order',
        paid_at: new Date().toISOString(),
        converted_at: new Date().toISOString(),
      })
      .eq('id', quoteId);

    if (updateError) {
      throw new Error(`Quote update failed: ${updateError.message}`);
    }

    console.log(`✅ Quote updated`);
    console.log(`\n🎉 SUCCESS! Order ${orderNumber} created for quote ${quoteId}`);
    console.log(`   View at: /admin/orders-enhanced`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get arguments from command line
const quoteId = process.argv[2];
const stripePaymentIntentId = process.argv[3] || 'manual_processing';

if (!quoteId) {
  console.error('Usage: node manual-process-payment.js <quoteId> [stripePaymentIntentId]');
  console.error('Example: node manual-process-payment.js 45e52176-3ed5-4336-b733-47decf53cb5e pi_abc123');
  process.exit(1);
}

processQuotePayment(quoteId, stripePaymentIntentId);
