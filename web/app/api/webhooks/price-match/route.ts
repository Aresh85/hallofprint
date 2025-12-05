import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    return NextResponse.json({ success: true, data: insertedData });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
