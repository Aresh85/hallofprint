import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the price match request into the database
    const { data: insertedData, error } = await supabase
      .from('price_match_requests')
      .insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          address_line1: data.addressLine1 || null,
          address_line2: data.addressLine2 || null,
          city: data.city || null,
          county: data.county || null,
          postcode: data.postcode || null,
          country: data.country || 'United Kingdom',
          product_name: data.productName,
          quantity: data.quantity,
          competitor_name: data.competitorName,
          competitor_price: data.competitorPrice,
          competitor_url: data.competitorUrl,
          additional_info: data.additionalInfo || null,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Send email notification using Resend
    try {
      await resend.emails.send({
        from: 'Hall of Prints <noreply@hallofprint.com>',
        to: 'pricematch@hallofprint.com', // Update with your actual email
        replyTo: data.email,
        subject: `Price Match Request from ${data.name}`,
        html: `
          <h2>New Price Match Request</h2>
          
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          
          <h3>Delivery Address:</h3>
          <p>${data.addressLine1 || ''}</p>
          ${data.addressLine2 ? `<p>${data.addressLine2}</p>` : ''}
          <p>${data.city || ''}, ${data.county || ''}</p>
          <p>${data.postcode || ''}</p>
          <p>${data.country || 'United Kingdom'}</p>
          
          <h3>Product Details:</h3>
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Quantity:</strong> ${data.quantity}</p>
          
          <h3>Competitor Information:</h3>
          <p><strong>Competitor:</strong> ${data.competitorName}</p>
          <p><strong>Their Price:</strong> ${data.competitorPrice}</p>
          <p><strong>URL:</strong> <a href="${data.competitorUrl}">${data.competitorUrl}</a></p>
          
          ${data.additionalInfo ? `
          <h3>Additional Information:</h3>
          <p>${data.additionalInfo}</p>
          ` : ''}
          
          <hr>
          <p><small>Request ID: ${insertedData?.[0]?.id || 'N/A'}</small></p>
          <p><small>Submitted via Hall of Prints website</small></p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, as data is already saved
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
