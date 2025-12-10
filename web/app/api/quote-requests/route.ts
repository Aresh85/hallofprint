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
      price_match_requested,
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

    // Insert quote request into database
    const { data: quoteData, error } = await supabase
      .from('quote_requests')
      .insert([
        {
          customer_name,
          company_name: company_name || null,
          email,
          phone: phone || null,
          project_title,
          project_description,
          quantity: quantity || null,
          deadline: deadline || null,
          specifications: specifications || null,
          file_urls: file_urls || null,
          price_match_requested: price_match_requested || false,
          competitor_url: competitor_url || null,
          company_account_requested: company_account_requested || false,
          status: 'pending',
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

    // Send email notification using Resend
    try {
      await resend.emails.send({
        from: 'Hall of Prints <noreply@hallofprint.com>',
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
          
          ${price_match_requested ? `
          <h3>Price Match Request:</h3>
          <p><strong>Customer requested price matching</strong></p>
          ${competitor_url ? `<p><strong>Competitor URL:</strong> <a href="${competitor_url}">${competitor_url}</a></p>` : ''}
          ` : ''}
          
          ${company_account_requested ? `
          <h3>Company Account Request:</h3>
          <p><strong>Customer requested company account setup</strong></p>
          <p>Company: ${company_name || 'Not provided'}</p>
          ` : ''}
          
          <hr>
          <p><strong>Request ID:</strong> ${quoteData.id}</p>
          <p><small>Submitted via Hall of Prints website</small></p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hallofprint.vercel.app'}/admin/quote-dashboard">View in Admin Dashboard</a></p>
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
