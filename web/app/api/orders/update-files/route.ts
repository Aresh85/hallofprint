import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await request.json();
    const { order_id, new_file_urls, user_id } = body;

    if (!order_id || !new_file_urls || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', user_id) // Ensure user owns this order
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update file URLs (append to existing) - LEGACY
    const existingFiles = order.file_urls || [];
    const updatedFiles = [...existingFiles, ...new_file_urls];

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        file_urls: updatedFiles,
        file_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // NEW: Save file metadata to order_files table
    const fileMetadata = new_file_urls.map((url: string) => {
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Try to determine file type from extension
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      let fileType = 'application/octet-stream';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        fileType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      } else if (['pdf'].includes(extension)) {
        fileType = 'application/pdf';
      } else if (['ai', 'eps'].includes(extension)) {
        fileType = `application/${extension}`;
      } else if (['psd'].includes(extension)) {
        fileType = 'image/vnd.adobe.photoshop';
      }

      return {
        order_id,
        file_url: url,
        file_name: filename,
        file_type: fileType,
        file_size: 0, // We don't have size info from URL
        uploaded_by: user_id,
        uploaded_at: new Date().toISOString(),
      };
    });

    // Insert file metadata (ignore errors if table doesn't exist yet)
    await supabase.from('order_files').insert(fileMetadata);

    // Log activity
    await supabase.from('order_activity_log').insert({
      order_id,
      activity_type: 'files_updated',
      description: `Customer uploaded ${new_file_urls.length} new file(s)`,
      created_at: new Date().toISOString(),
      created_by: user_id,
    });

    // Send email to operators
    try {
      // Get all operators
      const { data: operators } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .in('role', ['admin', 'operator']);

      if (operators && operators.length > 0) {
        const operatorEmails = operators.map(op => op.email);
        
        await resend.emails.send({
          from: 'Hall of Print <noreply@hallofprint.com>',
          to: operatorEmails,
          subject: `🚨 File Update - Order #${order.order_number}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #dc2626;">⚠️ Customer File Update Alert</h2>
              
              <p><strong>Order #${order.order_number}</strong> has been updated with new files by the customer.</p>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #991b1b;">Action Required</h3>
                <p style="margin-bottom: 0;">
                  ⚠️ The customer has uploaded new artwork files. Please review immediately as this may affect:
                </p>
                <ul style="color: #991b1b;">
                  <li>Project cost/pricing</li>
                  <li>Production timeline</li>
                  <li>Delivery date</li>
                </ul>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Order Details:</h4>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Email:</strong> ${order.customer_email}</p>
                <p><strong>Project:</strong> ${order.project_title || 'N/A'}</p>
                <p><strong>Files Uploaded:</strong> ${new_file_urls.length} new file(s)</p>
                <p><strong>Total Files:</strong> ${updatedFiles.length}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hallofprint.vercel.app'}/admin/orders-enhanced" 
                   style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Review Order Now
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 0.875em;">
                Please contact the customer if the new files require pricing adjustments or will affect the delivery timeline.
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Files updated successfully',
      total_files: updatedFiles.length
    });

  } catch (error) {
    console.error('Error updating files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
