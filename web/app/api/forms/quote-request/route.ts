import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, details, product, configuration } = body;

    // Validate required fields
    if (!name || !email || !details || !product) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email notification using Resend
    const emailResponse = await resend.emails.send({
      from: 'Hall of Prints <noreply@hallofprint.com>',
      to: 'aresh@inteeka.com',
      replyTo: email,
      subject: `Quote Request for: ${product}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        
        <h3>Product Details:</h3>
        <p><strong>Product:</strong> ${product}</p>
        
        <h3>Configuration:</h3>
        <pre>${configuration}</pre>
        
        <h3>Additional Details:</h3>
        <p>${details}</p>
        
        <hr>
        <p><small>This quote request was submitted via the Hall of Prints website.</small></p>
      `,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
    });

  } catch (error) {
    console.error('Quote request submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
