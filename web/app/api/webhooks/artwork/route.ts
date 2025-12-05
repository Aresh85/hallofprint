import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('🎨 Artwork Webhook Received:', data);

    // Extract data from Web3Forms webhook
    const customerName = data.name || '';
    const customerEmail = data.email || '';
    const customerPhone = data.phone || '';
    const notes = data.message || '';
    const fileName = data.file_name || 'Unknown file';
    const fileSize = data.file_size || '';
    const hasExistingOrder = data.has_existing_order || 'no';
    const orderId = data.order_id || null;
    
    // Web3Forms might include file URL in webhook - check for it
    const fileUrl = data.file_url || data.attachment_url || data.file || null;

    console.log('📎 File URL from webhook:', fileUrl);
    console.log('📧 File attached:', data.attachment);

    // If they have an existing order, update it
    if (hasExistingOrder === 'yes' && orderId && orderId !== 'No existing order') {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          artwork_received: true,
          artwork_url: fileName,
          artwork_file_url: fileUrl,
          artwork_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
      } else {
        console.log('✅ Order updated with artwork');
      }
    }

    // Always save to artwork_submissions for tracking
    const { data: submission, error: submissionError } = await supabase
      .from('artwork_submissions')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        notes: notes || null,
        file_name: fileName,
        file_size: fileSize ? parseInt(fileSize.replace(/[^0-9]/g, '')) * 1024 * 1024 : null,
        file_url: fileUrl,
        user_id: null, // Will be null from webhook since not authenticated
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error saving artwork submission:', submissionError);
      throw submissionError;
    }

    console.log('✅ Artwork submission saved:', submission);

    return NextResponse.json({ 
      success: true, 
      message: 'Artwork submission received',
      submission_id: submission?.id
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Artwork webhook endpoint is active',
    url: `${request.nextUrl.origin}/api/webhooks/artwork`
  });
}
