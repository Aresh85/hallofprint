'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle, XCircle, Printer, LogIn, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ACCEPTED_FILE_TYPES = 'application/pdf,image/tiff,application/postscript,.ai,.psd,image/*';
const MAX_FILE_SIZE_MB = 50;

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  order_items: Array<{
    product_name: string;
  }>;
};

type Address = {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  is_default: boolean;
};

export default function UploadArtworkPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCustomerName(profile.full_name || '');
        setCustomerEmail(user.email || profile.email || '');
      }

      // Load user's orders with job titles (exclude dispatched)
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total,
          status,
          production_status,
          order_items (
            product_name
          )
        `)
        .eq('user_id', user.id)
        .neq('production_status', 'dispatched')
        .order('created_at', { ascending: false });

      if (orders) {
        setUserOrders(orders as Order[]);
      }

      // Load user's addresses
      const { data: addresses } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addresses) {
        setUserAddresses(addresses as Address[]);
        // Auto-select default address if exists
        const defaultAddress = addresses.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
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
    if (!selectedOrderId) {
      setMessage('Please select an order to upload artwork for.');
      setUploadStatus('error');
      return;
    }
    
    if (!file) {
      setMessage('Please select a file to upload.');
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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('artwork-files')
        .getPublicUrl(storagePath);

      const fileUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', fileUrl);

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Save artwork submission linked to order
      const { error: dbError } = await supabase
        .from('artwork_submissions')
        .insert({
          order_id: selectedOrderId,
          customer_name: customerName,
          customer_email: customerEmail,
          notes: notes || null,
          file_name: file.name,
          file_size: file.size,
          file_url: fileUrl,
          user_id: user?.id || null,
          status: 'pending'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message);
      }

      // Update order artwork status
      await supabase
        .from('orders')
        .update({
          artwork_received: true,
          artwork_url: file.name,
          artwork_submitted_at: new Date().toISOString()
        })
        .eq('id', selectedOrderId);

      setUploadStatus('success');
      const selectedOrder = userOrders.find(o => o.id === selectedOrderId);
      setMessage(`Success! Your artwork has been uploaded for Order #${selectedOrder?.order_number}. We'll review it and contact you at ${customerEmail}.`);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(`Upload failed: ${error.message}. Please try again or contact support.`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
          <LogIn className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-700 mb-6">
            You need to be signed in to upload artwork for your orders.
          </p>
          <div className="space-y-3">
            <Link 
              href="/login"
              className="block w-full bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup"
              className="block w-full bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Create Account
            </Link>
            <Link 
              href="/"
              className="block text-indigo-600 hover:text-indigo-800 font-medium mt-4"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No orders found
  if (userOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
          <Printer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Found</h1>
          <p className="text-gray-700 mb-6">
            You don't have any orders yet. Please place an order first, then you can upload artwork for it.
          </p>
          <div className="space-y-3">
            <Link 
              href="/request-quote"
              className="block w-full bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Request a Quote
            </Link>
            <Link 
              href="/products"
              className="block w-full bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Products
            </Link>
            <Link 
              href="/"
              className="block text-indigo-600 hover:text-indigo-800 font-medium mt-4"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-start justify-center bg-gray-50">
      <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-indigo-600">
        
        <div className="flex items-center mb-6">
          <Printer className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Artwork for Order</h1>
        </div>
        <p className="text-lg text-gray-700 mb-8">
          Upload artwork files for your existing order. We accept PDF, AI, PSD, TIFF, and common image formats.
        </p>

        {/* Order Selection */}
        <div className="mb-8">
          <label htmlFor="order" className="block text-lg font-semibold text-gray-800 mb-3">
            Select Order <span className="text-red-500">*</span>
          </label>
          <select
            id="order"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            disabled={uploadStatus === 'success'}
          >
            <option value="">Choose an order...</option>
            {userOrders.map((order) => {
              const jobTitle = order.order_items?.[0]?.product_name || 'Print Job';
              const statusBadge = order.status === 'pending' ? '⏳' : 
                                  order.status === 'processing' ? '🔄' : 
                                  order.status === 'dispatched' ? '✅' : '📦';
              const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              return (
                <option key={order.id} value={order.id}>
                  {statusBadge} Order #{order.order_number} - {jobTitle} - {orderDate} - £{order.total.toFixed(2)}
                </option>
              );
            })}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Select which order you're uploading artwork for
          </p>
        </div>

        {/* File Input Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-colors duration-200 hover:border-indigo-500 cursor-pointer mb-6"
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
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="font-medium text-gray-800 truncate">{file.name}</span>
            </div>
            <span className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Contact Information - Pre-filled from Profile */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={customerName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This information is from your profile and cannot be changed here.
          </p>
        </div>

        {/* Delivery Address Selection */}
        {userAddresses.length > 0 && (
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Delivery Address (Optional)
            </label>
            <select
              id="address"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={uploadStatus === 'success'}
            >
              <option value="">Select a delivery address...</option>
              {userAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.is_default && '⭐ '}
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                  , {address.city}, {address.postcode}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select from your saved addresses or{' '}
              <Link href="/account/addresses" className="text-indigo-600 hover:text-indigo-800 underline">
                manage addresses
              </Link>
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes / Special Instructions
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
            placeholder="Any special requirements or instructions for your print job..."
            disabled={uploadStatus === 'success'}
          />
        </div>

        {/* Upload Button */}
        <div>
          <button
            onClick={handleUpload}
            disabled={!file || !selectedOrderId || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className={`w-full py-4 px-6 text-white font-bold rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center text-lg ${
              !file || !selectedOrderId || uploadStatus === 'uploading' || uploadStatus === 'success'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {uploadStatus === 'uploading' ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading Artwork...</>
            ) : uploadStatus === 'success' ? (
              <><CheckCircle className="w-5 h-5 mr-2" /> File Uploaded!</>
            ) : (
              <><UploadCloud className="w-5 h-5 mr-2" /> Upload Artwork for Order</>
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
             uploadStatus === 'error' ? <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : 
             <Loader2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 animate-spin" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/account/orders"
              className="block w-full bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View My Orders
            </Link>
            <button
              onClick={() => {
                setFile(null);
                setSelectedOrderId('');
                setNotes('');
                setUploadStatus('idle');
                setMessage('');
              }}
              className="block w-full bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
