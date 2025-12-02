import { NextResponse, NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  // 1. Check for valid method
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  // 2. Process the FormData
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerNotes = formData.get('customerNotes') as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: 'Missing file or order ID.' }, { status: 400 });
    }
    
    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Missing customer information.' }, { status: 400 });
    }

    // Convert file buffer to upload (simulated cloud upload)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- REAL-WORLD IMPLEMENTATION vs SIMULATION ---
    
    // In a production environment, you would use a cloud SDK here:
    // await s3Client.upload({ Bucket: 'hall-of-prints', Key: file.name, Body: buffer });
    // Or:
    // await sanityClient.assets.upload('file', buffer, { filename: file.name, contentType: file.type });
    
    // You would then update the Sanity 'order' document with the file URL:
    // await sanityClient.patch(orderId).set({ printFileUrl: fileUrl, fileStatus: 'Received' }).commit();

    // Since we are simulating, we'll just log the file and customer metadata
    console.log(`
      --- FILE UPLOAD SUCCESS ---
      Order ID: ${orderId}
      Customer Name: ${customerName}
      Customer Email: ${customerEmail}
      Customer Phone: ${customerPhone || 'Not provided'}
      Customer Notes: ${customerNotes || 'None'}
      File Name: ${file.name}
      File Type: ${file.type}
      File Size: ${buffer.length} bytes
      Upload Simulated Successfully.
      -----------------------------
    `);

    // Send email notification
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Hall of Prints <onboarding@resend.dev>',
          to: ['aresh@inteeka.com'],
          subject: `New Artwork Submission - ${customerName}`,
          html: `
            <h2>New Artwork Submission Received</h2>
            <p>A customer has submitted artwork for printing.</p>
            
            <h3>Customer Information:</h3>
            <ul>
              <li><strong>Name:</strong> ${customerName}</li>
              <li><strong>Email:</strong> ${customerEmail}</li>
              <li><strong>Phone:</strong> ${customerPhone || 'Not provided'}</li>
              <li><strong>Order ID:</strong> ${orderId}</li>
            </ul>
            
            <h3>File Details:</h3>
            <ul>
              <li><strong>File Name:</strong> ${file.name}</li>
              <li><strong>File Type:</strong> ${file.type}</li>
              <li><strong>File Size:</strong> ${(buffer.length / 1024 / 1024).toFixed(2)} MB</li>
            </ul>
            
            ${customerNotes ? `<h3>Special Instructions:</h3><p>${customerNotes}</p>` : ''}
            
            <p><em>Please check your Vercel logs for the uploaded file details.</em></p>
          `
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email notification:', await emailResponse.text());
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the upload if email fails
    }

    // 3. Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'File received and processing initiated.',
      fileName: file.name,
    });
    
  } catch (error) {
    console.error('File upload processing error:', error);
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
  }
}
