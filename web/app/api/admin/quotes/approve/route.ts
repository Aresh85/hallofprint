import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Create client from cookies to get authenticated user
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-access-token');
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create client with anon key for auth check
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authCookie.value}`
        }
      }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/operator
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'operator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Now use service key for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

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

    // Log activity
    await supabase.from('order_activity_log').insert({
      order_id,
      activity_type: 'quote_approved',
      description: `Quote approved and priced. Subtotal: £${subtotal.toFixed(2)}, Tax: £${tax.toFixed(2)}, Total: £${total.toFixed(2)}`,
      created_by: user.id,
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
