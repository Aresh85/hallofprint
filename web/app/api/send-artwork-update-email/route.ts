import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, fileName, customerName, customerEmail } = await request.json();

    // Send email to print shop operators
    const operatorEmail = await resend.emails.send({
      from: 'Hall of Prints <onboarding@resend.dev>',
      to: ['aresh@inteeka.com'], // Your operator email
      subject: `🔄 Artwork Updated - Order #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ Artwork File Updated</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">
                A customer has uploaded a new artwork file for an existing order!
              </p>
            </div>

            <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>Order Number:</strong></td>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">#${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>Customer:</strong></td>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>New File:</strong></td>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${fileName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>Updated At:</strong></td>
                <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${new Date().toLocaleString('en-GB')}</td>
              </tr>
            </table>

            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e40af;">Action Required:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a;">
                <li>Review the new artwork file in the admin dashboard</li>
                <li>Check if the order needs to be re-processed</li>
                <li>Contact customer if clarification is needed</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://hallofprint.vercel.app/admin/orders" 
                 style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Order Dashboard
              </a>
            </div>
          </div>
          
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Hall of Prints - Print Shop Management System</p>
            <p style="margin: 5px 0 0 0;">This is an automated notification</p>
          </div>
        </div>
      `,
    });

    // Optionally send confirmation to customer
    if (customerEmail) {
      await resend.emails.send({
        from: 'Hall of Prints <onboarding@resend.dev>',
        to: [customerEmail],
        subject: `Artwork Updated - Order #${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">✅ Artwork Updated Successfully</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #1f2937;">Hi ${customerName},</p>
              
              <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
                We've received your updated artwork file for <strong>Order #${orderNumber}</strong>.
              </p>

              <div style="background-color: white; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">New File:</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${fileName}</p>
              </div>

              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">What happens next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a;">
                  <li>Our team will review your new file</li>
                  <li>We'll check if any order adjustments are needed</li>
                  <li>You'll be notified if we have any questions</li>
                </ul>
              </div>

              <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
                If you have any questions, please don't hesitate to contact us.
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://hallofprint.vercel.app/account/orders" 
                   style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  View My Orders
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Thank you for choosing Hall of Prints!
              </p>
            </div>
            
            <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">Hall of Prints</p>
              <p style="margin: 5px 0 0 0;">Professional Printing Services</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending artwork update email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
