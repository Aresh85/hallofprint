'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle, XCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ACCEPTED_FILE_TYPES = 'application/pdf,image/tiff,application/postscript,.ai,.psd,image/*';
const MAX_FILE_SIZE_MB = 50; // Supabase supports larger files

export default function FileUploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    hasExistingOrder: 'no'
  });

  useEffect(() => {
    checkUserAndLoadOrders();
  }, []);

  const checkUserAndLoadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCustomerInfo(prev => ({
            ...prev,
            name: profile.full_name || '',
            email: user.email || profile.email || ''
          }));
        }

        // Load user's active orders
        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_number, created_at, total, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'processing'])
          .order('created_at', { ascending: false });

        if (orders) {
          setUserOrders(orders);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setUploadStatus('idle');
    setMessage('');
    
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setMessage(`Error: File size exceeds ${MAX_FILE_SIZE_MB}MB. Please compress your file.`);
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = async () => {
    // Validate required fields
    if (!customerInfo.name.trim()) {
      setMessage('Please enter your full name.');
      setUploadStatus('error');
      return;
    }
    
    if (!customerInfo.email.trim()) {
      setMessage('Please enter your email address.');
      setUploadStatus('error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      setMessage('Please enter a valid email address.');
      setUploadStatus('error');
      return;
    }
    
    if (!file) {
      setMessage('Please select a file to upload.');
      setUploadStatus('error');
      return;
    }

    // Check if they have an existing order selected
    if (customerInfo.hasExistingOrder === 'yes' && !selectedOrderId) {
      setMessage('Please select an order from the dropdown.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setMessage('Uploading artwork to secure storage...');

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `artwork-submissions/${timestamp}-${sanitizedFileName}`;

      console.log('📤 Uploading file to Supabase Storage:', storagePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artwork-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('artwork-files')
        .getPublicUrl(storagePath);

      const fileUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', fileUrl);

      // Save to database
      if (selectedOrderId && isLoggedIn) {
        await saveArtworkToOrder(selectedOrderId, file.name, fileUrl);
      } else {
        await saveStandaloneArtwork(fileUrl);
      }

      setUploadStatus('success');
      setMessage(`Success! Your artwork "${file.name}" has been uploaded securely. We'll review it shortly and contact you at ${customerInfo.email}.`);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(`Upload failed: ${error.message}. Please try again or contact support.`);
    }
  };

  const saveArtworkToOrder = async (orderId: string, fileName: string, fileUrl: string | null) => {
    try {
      // Check if this is an update (order already has artwork)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('artwork_file_url, artwork_url')
        .eq('id', orderId)
        .single();

      const isUpdate = existingOrder?.artwork_file_url ? true : false;

      // Update the order with new file
      const { error } = await supabase
        .from('orders')
        .update({
          artwork_received: true,
          artwork_url: fileName,
          artwork_file_url: fileUrl,
          artwork_updated: isUpdate,
          artwork_updated_at: isUpdate ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Send email notification if this is an update
      if (isUpdate) {
        await sendArtworkUpdateEmail(orderId, fileName);
      }
    } catch (error) {
      console.error('Error saving artwork to order:', error);
    }
  };

  const sendArtworkUpdateEmail = async (orderId: string, fileName: string) => {
    try {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, user_id')
        .eq('id', orderId)
        .single();

      if (!order) return;

      // Get user email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

      // Send email via your API endpoint
      await fetch('/api/send-artwork-update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.order_number,
          fileName: fileName,
          customerName: profile?.full_name,
          customerEmail: profile?.email
        })
      });
    } catch (error) {
      console.error('Error sending update email:', error);
    }
  };

  const saveStandaloneArtwork = async (fileUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('artwork_submissions')
        .insert({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || null,
          notes: customerInfo.notes || null,
          file_name: file?.name,
          file_size: file?.size,
          file_url: fileUrl,
          user_id: user?.id || null,
          status: 'pending'
        });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('✅ Artwork saved successfully:', data);
    } catch (error: any) {
      console.error('Error saving standalone artwork:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-start justify-center bg-gray-50">
      <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-indigo-600">
        
        <div className="flex items-center mb-6">
          <Printer className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Artwork Submission</h1>
        </div>
        <p className="text-lg text-gray-700 mb-8">
          Upload your artwork file for printing. We accept PDF, AI, PSD, TIFF, and common image formats.
        </p>

        {/* Customer Information Form */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe"
              required
              disabled={uploadStatus === 'success'}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="john@example.com"
              required
              disabled={uploadStatus === 'success'}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+44 7123 456789"
              disabled={uploadStatus === 'success'}
            />
          </div>

          {/* Order Selection for Logged-in Users */}
          {isLoggedIn && userOrders.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Do you have an existing order?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasOrder"
                    value="yes"
                    checked={customerInfo.hasExistingOrder === 'yes'}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, hasExistingOrder: 'yes' })}
                    className="mr-2"
                    disabled={uploadStatus === 'success'}
                  />
                  <span>Yes, link to my existing order</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasOrder"
                    value="no"
                    checked={customerInfo.hasExistingOrder === 'no'}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, hasExistingOrder: 'no' })}
                    className="mr-2"
                    disabled={uploadStatus === 'success'}
                  />
                  <span>No, this is a new submission</span>
                </label>
              </div>

              {customerInfo.hasExistingOrder === 'yes' && (
                <div className="mt-4">
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="order"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={uploadStatus === 'success'}
                  >
                    <option value="">Choose an order...</option>
                    {userOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        Order #{order.order_number} - £{order.total.toFixed(2)} ({order.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes / Special Instructions
            </label>
            <textarea
              id="notes"
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
              placeholder="Any special requirements or instructions for your print job..."
              disabled={uploadStatus === 'success'}
            />
          </div>
        </div>

        {/* File Input Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-colors duration-200 hover:border-indigo-500 cursor-pointer"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input 
            type="file" 
            id="file-input" 
            accept={ACCEPTED_FILE_TYPES}
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
          />
          
          <div className="text-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              Drag and drop your file here, or click to browse.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max file size: {MAX_FILE_SIZE_MB}MB. Accepted formats: PDF, AI, PSD, TIFF, Images.
            </p>
          </div>
        </div>

        {/* Selected File Display */}
        {file && uploadStatus !== 'success' && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="font-medium text-gray-800 truncate">{file.name}</span>
            </div>
            <span className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Upload Button and Status */}
        <div className="mt-8">
          <button
            onClick={handleUpload}
            disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${
              !file || uploadStatus === 'uploading' || uploadStatus === 'success'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {uploadStatus === 'uploading' ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting Artwork...</>
            ) : uploadStatus === 'success' ? (
              <><CheckCircle className="w-5 h-5 mr-2" /> File Uploaded!</>
            ) : (
              <><UploadCloud className="w-5 h-5 mr-2" /> Submit File for Printing</>
            )}
          </button>
        </div>

        {/* Message Area */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-start ${
            uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 
            uploadStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {uploadStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : 
             uploadStatus === 'error' ? <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : <Loader2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <div className="mt-8 text-center">
          {!isLoggedIn && (
            <p className="text-sm text-gray-600 mb-2">
              Have an account? <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link> to link artwork to your orders.
            </p>
          )}
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
