'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle, XCircle, Printer } from 'lucide-react';
import Link from 'next/link';

// Define expected file types for print production
const ACCEPTED_FILE_TYPES = 'application/pdf,image/tiff,application/postscript,.ai,.psd';
const MAX_FILE_SIZE_MB = 100; // Common limit for web uploads

export default function FileUploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // NOTE: In a production app, you would fetch the Order ID from 
  // URL search params (e.g., from the /success page redirect) or a secure session.
  const demoOrderId = 'HP-12345';

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setUploadStatus('idle');
    setMessage('');
    
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setMessage(`Error: File size exceeds ${MAX_FILE_SIZE_MB}MB. Please try a compressed ZIP file.`);
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
    
    // Basic email validation
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

    setUploadStatus('uploading');
    setMessage('Uploading file and customer information, please wait...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', demoOrderId);
    formData.append('customerName', customerInfo.name);
    formData.append('customerEmail', customerInfo.email);
    formData.append('customerPhone', customerInfo.phone);
    formData.append('customerNotes', customerInfo.notes);

    try {
      // Calls the secure API route you placed at web/app/api/upload-file/route.ts
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed on the server.';
        
        // Try to parse JSON error, but handle non-JSON responses
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, check status code for common issues
          if (response.status === 413) {
            errorMessage = 'File too large. Maximum file size is 4 MB for uploads.';
          } else {
            errorMessage = `Server error (${response.status}). Please try a smaller file or contact support.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      setUploadStatus('success');
      setMessage(`Success! File "${file.name}" linked to Order ${demoOrderId}. We will review your artwork shortly.`);
      // No need to clear file input here, as we show success message.

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(`Upload failed: ${error.message}`);
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
          Upload the final artwork file for your order (<span className="font-mono text-sm text-indigo-600 font-semibold">{demoOrderId}</span>). Please ensure your file meets our print specifications.
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
              placeholder="+1 (555) 123-4567"
              disabled={uploadStatus === 'success'}
            />
          </div>

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
              Max file size: {MAX_FILE_SIZE_MB}MB. Accepted formats: PDF, AI, PSD, TIFF.
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
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 
            uploadStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {uploadStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : 
             uploadStatus === 'error' ? <XCircle className="w-5 h-5 mr-2" /> : <Loader2 className="w-5 h-5 mr-2" />}
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Back to Homepage
            </Link>
        </div>
      </div>
    </div>
  );
}
