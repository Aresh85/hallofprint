'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, UploadCloud, Printer, ArrowLeft, FileCheck, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/auth';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id');
  const [quoteHasFiles, setQuoteHasFiles] = useState(false);
  const [loading, setLoading] = useState(!!quoteId);

  useEffect(() => {
    if (quoteId) {
      checkQuoteFiles();
    }
  }, [quoteId]);

  const checkQuoteFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('file_urls')
        .eq('id', quoteId)
        .single();

      if (!error && data && data.file_urls && data.file_urls.length > 0) {
        setQuoteHasFiles(true);
      }
    } catch (error) {
      console.error('Error checking quote files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-green-500 text-center">
        
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-700 mb-8">
          Thank you for your purchase from Hall of Prints. Your order is being processed!
        </p>

        {/* Conditional rendering based on whether quote has files */}
        {quoteId && quoteHasFiles ? (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-3 flex items-center justify-center">
              <FileCheck className="w-6 h-6 mr-2" />
              Order Ready for Processing!
            </h2>
            <p className="text-gray-700 mb-4">
              Your quote has been <strong>paid and converted to an active order</strong>. Since you already uploaded files with your quote request, we have everything we need to get started!
            </p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex items-center justify-center space-x-2 text-indigo-700 mb-2">
                <Bell className="w-5 h-5" />
                <p className="font-semibold">Our team has been alerted</p>
              </div>
              <p className="text-sm text-gray-600">
                A member of our production team will begin processing your order shortly. You can track the progress in your order dashboard.
              </p>
            </div>
            <Link 
              href="/account/orders"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md"
            >
              View Order Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-3 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 mr-2" />
              Step 1: Upload Your Print File
            </h2>
            <p className="text-gray-600 mb-4">
              To begin the printing process, please upload your high-resolution artwork file (PDF, AI, PSD).
            </p>
            
            <Link 
              href="/upload-file"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
            >
              Go to File Uploader
            </Link>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="grid grid-cols-2 gap-4 text-left border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Order Number:</p>
            <p className="font-semibold text-gray-900">#HP-12345 (Demo)</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Action:</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Printer className="w-4 h-4 mr-1 text-gray-600" />
              {quoteId && quoteHasFiles ? 'Ready for Production' : 'Awaiting File Upload'}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
