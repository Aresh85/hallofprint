import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { priceMatchId, includeVAT = true } = await request.json();

    if (!priceMatchId) {
      return NextResponse.json({ error: 'Price match ID required' }, { status: 400 });
    }

    // Get the price match request
    const { data: priceMatch, error: pmError } = await supabase
      .from('price_match_requests')
      .select('*')
      .eq('id', priceMatchId)
      .single();

    if (pmError || !priceMatch) {
      return NextResponse.json({ error: 'Price match not found' }, { status: 404 });
    }

    // Check if already approved
    if (priceMatch.status !== 'approved') {
      return NextResponse.json({ error: 'Price match must be approved first' }, { status: 400 });
    }

    // Find user by email
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', priceMatch.email)
      .single();

    const userId = users?.id || null;

    // Parse competitor price and calculate our price (beat by 5%)
    // The competitor price is the TOTAL price, not per unit
    const competitorPriceStr = priceMatch.competitor_price.replace(/[^0-9.]/g, '');
    const competitorTotalPrice = parseFloat(competitorPriceStr);
    const ourTotalPrice = competitorTotalPrice * 0.95; // 5% DISCOUNT
    const quantityStr = priceMatch.quantity.match(/\d+/)?.[0] || '1';
    const quantity = parseInt(quantityStr);
    const unitPrice = parseFloat((ourTotalPrice / quantity).toFixed(2)); // Price per unit
    const subtotal = parseFloat(ourTotalPrice.toFixed(2));
    
    // Apply VAT only if includeVAT is true
    const tax = includeVAT ? parseFloat((subtotal * 0.20).toFixed(2)) : 0.00;
    const total = parseFloat((subtotal + tax).toFixed(2));

    // Generate order number
    const orderNumber = `HOP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        guest_email: !userId ? priceMatch.email : null,
        order_number: orderNumber,
        status: 'pending',
        customer_name: priceMatch.name,
        customer_email: priceMatch.email,
        customer_phone: priceMatch.phone,
        shipping_address_line1: priceMatch.address_line1 || 'To be provided',
        shipping_address_line2: priceMatch.address_line2 || null,
        shipping_city: priceMatch.city || 'To be provided',
        shipping_county: priceMatch.county || null,
        shipping_postcode: priceMatch.postcode || 'To be provided',
        shipping_country: priceMatch.country || 'United Kingdom',
        subtotal: subtotal,
        tax: tax,
        total: total,
        currency: 'GBP',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        product_name: priceMatch.product_name,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: subtotal,
        options: {
          original_competitor: priceMatch.competitor_name,
          competitor_price: competitorTotalPrice,
          our_discount_price: ourTotalPrice,
          price_match_id: priceMatchId
        }
      }]);

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // Update price match status to show order was created
    await supabase
      .from('price_match_requests')
      .update({ 
        status: 'approved',
        notes: `Order ${orderNumber} created` 
      })
      .eq('id', priceMatchId);

    return NextResponse.json({ 
      success: true, 
      order: order,
      message: `Order ${orderNumber} created successfully`
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
