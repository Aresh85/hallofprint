import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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

    const body = await request.json();
    const { order_id, rejection_reason } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        quote_response_notes: rejection_reason || 'Quote rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to reject quote' }, { status: 500 });
    }

    // Log activity
    await supabase.from('order_activity_log').insert({
      order_id,
      activity_type: 'quote_rejected',
      description: `Quote rejected. Reason: ${rejection_reason || 'No reason provided'}`,
      created_by: user.id,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Quote rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
