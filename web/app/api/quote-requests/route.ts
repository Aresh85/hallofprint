import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      company_name,
      email,
      phone,
      project_title,
      project_description,
      quantity,
      deadline,
      specifications,
      file_urls,
      // Address fields
      address_line1,
      address_line2,
      city,
      county,
      postcode,
      country,
      // Price match fields
      price_match_requested,
      competitor_price,
      competitor_url,
      company_account_requested,
    } = body;

    // Validate required fields
    if (!customer_name || !email || !project_title || !project_description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get user ID from body (passed from client)
    let userId = body.user_id || null;

    // Generate quote order number
    const orderNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create ORDER directly (quotes ARE orders now)
    const { data: quoteData, error } = await supabase
      .from('orders')
      .insert([
        {
          // Order basics
          order_type: price_match_requested ? 'price_match' : 'quote',
          order_number: orderNumber,
          status: 'quote_pending',
          
          // Customer info
          user_id: userId,
          customer_email: email,
          customer_name,
          company_name: company_name || null,
          phone: phone || null,
          
          // Shipping address
          shipping_address_line1: address_line1 || null,
          shipping_address_line2: address_line2 || null,
          shipping_city: city || null,
          shipping_county: county || null,
          shipping_postcode: postcode || null,
          shipping_country: country || 'United Kingdom',
          
          // Project details (NEW FIELDS in orders table)
          project_title,
          project_description,
          specifications: specifications || null,
          quantity: quantity || null,
          deadline: deadline || null,
          file_urls: file_urls || null,
          
          // Price match fields
          price_match_requested: price_match_requested || false,
          competitor_price: competitor_price || null,
          competitor_url: competitor_url || null,
          
          // Requests
          company_account_requested: company_account_requested || false,
          
          // Timestamps
          quote_submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          
          // Set initial financial values to 0 (will be updated when priced)
          subtotal: 0,
          tax: 0,
          total: 0,
          currency: 'GBP',
          payment_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save quote request' },
        { status: 500 }
      );
    }

    // NEW: Save file metadata to order_files table
    if (file_urls && file_urls.length > 0) {
      const fileMetadata = file_urls.map((url: string) => {
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
          order_id: quoteData.id,
          file_url: url,
          file_name: filename,
          file_type: fileType,
          file_size: 0, // We don't have size info from URL
          uploaded_by: userId || email, // Use userId if available, otherwise email
          uploaded_at: new Date().toISOString(),
        };
      });

      // Insert file metadata (ignore errors if table doesn't exist yet)
      await supabase.from('order_files').insert(fileMetadata);
    }

    // Send email notification using Resend
    try {
      await resend.emails.send({
        from: 'Hall of Print <noreply@hallofprint.com>',
        to: 'aresh@inteeka.com',
        replyTo: email,
        subject: `New Quote Request: ${project_title}`,
        html: `
          <h2>New Quote Request</h2>
          
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${customer_name}</p>
          ${company_name ? `<p><strong>Company:</strong> ${company_name}</p>` : ''}
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          
          <h3>Project Details:</h3>
          <p><strong>Project Title:</strong> ${project_title}</p>
          <p><strong>Description:</strong></p>
          <p>${project_description}</p>
          
          ${quantity ? `<p><strong>Quantity:</strong> ${quantity}</p>` : ''}
          ${deadline ? `<p><strong>Deadline:</strong> ${deadline}</p>` : ''}
          
          ${specifications ? `
          <h3>Specifications:</h3>
          <p>${specifications}</p>
          ` : ''}
          
          ${file_urls && file_urls.length > 0 ? `
          <h3>Attached Files:</h3>
          <ul>
            ${file_urls.map((url: string) => `<li><a href="${url}">View File</a></li>`).join('')}
          </ul>
          ` : ''}
          
          <h3>Delivery Address:</h3>
          <p>${address_line1 || 'Not provided'}</p>
          ${address_line2 ? `<p>${address_line2}</p>` : ''}
          <p>${city || ''}, ${postcode || ''}</p>
          ${county ? `<p>${county}</p>` : ''}
          <p>${country || 'United Kingdom'}</p>
          
          ${price_match_requested ? `
          <h3>Price Match Request:</h3>
          <p><strong>Customer requested price matching</strong></p>
          ${competitor_price ? `<p><strong>Competitor Price:</strong> £${competitor_price} (excl. VAT)</p>` : ''}
          ${competitor_url ? `<p><strong>Competitor URL:</strong> <a href="${competitor_url}">${competitor_url}</a></p>` : ''}
          ` : ''}
          
          ${company_account_requested ? `
          <h3>Company Account Request:</h3>
          <p><strong>Customer requested company account setup</strong></p>
          <p>Company: ${company_name || 'Not provided'}</p>
          ` : ''}
          
          <hr>
          <p><strong>Order Number:</strong> ${quoteData.order_number}</p>
          <p><strong>Order ID:</strong> ${quoteData.id}</p>
          <p><small>Quote submitted via Hall of Print website</small></p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hallofprint.vercel.app'}/admin/orders-enhanced">View in Operations Dashboard</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      data: quoteData,
    });

  } catch (error) {
    console.error('Quote request submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
