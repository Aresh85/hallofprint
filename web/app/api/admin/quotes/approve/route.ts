import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Use service role key - it bypasses RLS and can do admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const {
      order_id,
      delivery_date,
      tax_included = true,
      tax_rate = 20.00,
      quote_response_notes,
    } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Get the order with sundries
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_sundries (*)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate subtotal from sundries
    const sundries = order.order_sundries || [];
    const subtotal = sundries.reduce((sum: number, item: any) => sum + item.total_price, 0);

    // Calculate tax
    const tax = tax_included ? (subtotal * (tax_rate / 100)) : 0;
    const total = subtotal + tax;

    // Update order with pricing
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        subtotal,
        tax,
        tax_rate,
        tax_included,
        total,
        delivery_date: delivery_date || null,
        quote_response_notes: quote_response_notes || null,
        status: 'quote_priced',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 });
    }

    // Log activity (no user tracking for service role operations)
    await supabase.from('order_activity_log').insert({
      order_id,
      activity_type: 'quote_approved',
      description: `Quote approved and priced. Subtotal: £${subtotal.toFixed(2)}, Tax: £${tax.toFixed(2)}, Total: £${total.toFixed(2)}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      subtotal,
      tax,
      total,
      message: 'Quote approved successfully'
    });

  } catch (error) {
    console.error('Error approving quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
