import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { quote } = await request.json();
    
    if (!quote || !quote.quoted_price) {
      return NextResponse.json(
        { error: 'Quote with quoted_price is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a new order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_email: quote.email,
          customer_name: quote.customer_name,
          total_amount: quote.quoted_price,
          status: 'pending',
          order_type: 'quote_conversion',
          notes: `Converted from quote request: ${quote.project_title}\n\n${quote.project_description}`,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    // Update quote with order_id and status
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        order_id: orderData.id,
        status: 'converted_to_order',
        converted_at: new Date().toISOString(),
      })
      .eq('id', quote.id);

    if (updateError) {
      console.error('Quote update error:', updateError);
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      order_id: orderData.id 
    });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert quote to order' },
      { status: 500 }
    );
  }
}
