import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quotes: data || [] });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, updates } = await request.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the current quote to check for status change
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Update the quote
    const { error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send alert email if status changed to "accepted_no_payment"
    if (updates.status === 'accepted_no_payment' && currentQuote.status !== 'accepted_no_payment') {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Hall of Print <onboarding@resend.dev>',
            to: ['aresh@inteeka.com'],
            subject: `⚠️ ALERT: Quote Accepted Without Payment - ${currentQuote.project_title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626; margin-bottom: 20px;">
                  <h1 style="color: #DC2626; margin-top: 0;">⚠️ Exception Alert: No Payment Required</h1>
                  <p style="color: #991B1B; font-weight: bold;">A quote has been accepted without payment requirement. This is an exception case.</p>
                </div>
                
                <h2>Quote Details</h2>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Project:</strong> ${currentQuote.project_title}</p>
                  <p><strong>Customer:</strong> ${currentQuote.customer_name}</p>
                  <p><strong>Email:</strong> ${currentQuote.email}</p>
                  <p><strong>Phone:</strong> ${currentQuote.phone || 'N/A'}</p>
                  <p><strong>Company:</strong> ${currentQuote.company_name || 'N/A'}</p>
                  <p><strong>Quoted Price:</strong> £${(updates.quoted_price || currentQuote.quoted_price || 0).toFixed(2)}</p>
                  ${updates.operator_assigned ? `<p><strong>Operator:</strong> ${updates.operator_assigned}</p>` : ''}
                </div>
                
                <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #92400E;">Project Description</h3>
                  <p>${currentQuote.project_description}</p>
                  ${currentQuote.specifications ? `<p><strong>Specifications:</strong> ${currentQuote.specifications}</p>` : ''}
                  ${currentQuote.quantity ? `<p><strong>Quantity:</strong> ${currentQuote.quantity}</p>` : ''}
                </div>
                
                ${updates.admin_notes || currentQuote.admin_notes ? `
                  <div style="background-color: #DBEAFE; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1E40AF;">Admin Notes</h3>
                    <p style="white-space: pre-line;">${updates.admin_notes || currentQuote.admin_notes}</p>
                  </div>
                ` : ''}
                
                <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                  This is an automated alert for exception handling. Please review this case.
                </p>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send alert email:', await emailResponse.text());
        } else {
          console.log('No-payment exception alert email sent');
        }
      } catch (emailError) {
        console.error('Error sending alert email:', emailError);
      }
    }

    // Send email notification if status changed to "accepted"
    if (updates.status === 'accepted' && currentQuote.status !== 'accepted') {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Hall of Print <onboarding@resend.dev>',
            to: [updates.email || currentQuote.email],
            subject: `Quote Accepted - ${currentQuote.project_title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">Your Quote Has Been Accepted! 🎉</h1>
                
                <p>Dear ${currentQuote.customer_name},</p>
                
                <p>Great news! Your quote request for <strong>${currentQuote.project_title}</strong> has been reviewed and accepted.</p>
                
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0; color: #1F2937;">Quote Details</h2>
                  <p><strong>Project:</strong> ${currentQuote.project_title}</p>
                  <p><strong>Quoted Price:</strong> £${(updates.quoted_price || currentQuote.quoted_price || 0).toFixed(2)}</p>
                  ${updates.delivery_time_estimate ? `<p><strong>Estimated Delivery:</strong> ${updates.delivery_time_estimate}</p>` : ''}
                  ${updates.tax_applicable ? `<p><strong>Tax:</strong> ${updates.tax_type || 'Applicable'}</p>` : ''}
                  ${updates.operator_assigned ? `<p><strong>Handled by:</strong> ${updates.operator_assigned}</p>` : ''}
                </div>
                
                ${updates.customer_notes ? `
                  <div style="background-color: #EFF6FF; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1E40AF;">Additional Notes</h3>
                    <p style="white-space: pre-line;">${updates.customer_notes}</p>
                  </div>
                ` : ''}
                
                <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                  <h3 style="margin-top: 0; color: #92400E;">⚡ Payment Required</h3>
                  <p>To proceed with your order, please log in to your account and complete payment.</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hallofprint.vercel.app'}/account/quotes" 
                     style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                    View Quote & Pay Now
                  </a>
                </div>
                
                <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                  If you have any questions, please don't hesitate to contact us at 
                  <a href="mailto:aresh@inteeka.com">aresh@inteeka.com</a>
                </p>
                
                <p style="color: #6B7280; font-size: 14px;">
                  Best regards,<br>
                  The Hall of Print Team
                </p>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
        } else {
          console.log('Quote accepted email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
