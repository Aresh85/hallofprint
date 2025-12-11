'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, UploadCloud, Printer, ArrowLeft, FileCheck, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/auth';

function SuccessContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id');
  const sessionId = searchParams.get('session_id');
  const [quoteHasFiles, setQuoteHasFiles] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch order from Stripe session
      fetchOrderFromSession();
    } else if (quoteId) {
      checkQuoteFilesAndOrder();
    } else {
      setLoading(false);
    }
  }, [quoteId, sessionId]);

  const fetchOrderFromSession = async () => {
    try {
      // Find order by stripe session ID
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, order_type, file_urls')
        .eq('stripe_payment_intent_id', sessionId)
        .single();

      if (!orderError && orderData) {
        setOrderNumber(orderData.order_number);
        
        // Check if order has files (for quotes)
        if (orderData.file_urls && orderData.file_urls.length > 0) {
          setQuoteHasFiles(true);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkQuoteFilesAndOrder = async () => {
    try {
      // Check quote files and get order ID
      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .select('file_urls, order_id')
        .eq('id', quoteId)
        .single();

      if (!quoteError && quoteData) {
        if (quoteData.file_urls && quoteData.file_urls.length > 0) {
          setQuoteHasFiles(true);
        }

        // Fetch order number if order was created
        if (quoteData.order_id) {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number')
            .eq('id', quoteData.order_id)
            .single();

          if (!orderError && orderData) {
            setOrderNumber(orderData.order_number || `Order #${orderData.id.substring(0, 8)}`);
          }
        }
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
          Thank you for your purchase from Hall of Print. Your order is being processed!
        </p>

        {/* Conditional rendering based on whether order has files */}
        {quoteHasFiles ? (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-3 flex items-center justify-center">
              <FileCheck className="w-6 h-6 mr-2" />
              Your Order is Being Reviewed!
            </h2>
            <p className="text-gray-700 mb-4">
              Your payment has been received and your artwork files are with our team. We're reviewing everything now and will get back to you shortly with any questions or updates.
            </p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex items-center justify-center space-x-2 text-indigo-700 mb-2">
                <Bell className="w-5 h-5" />
                <p className="font-semibold">Our production team has been notified</p>
              </div>
              <p className="text-sm text-gray-600">
                You can track your order progress in your dashboard. If you need to update your artwork file, you can do so via the{' '}
                <Link href="/upload-artwork" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                  Upload Artwork
                </Link>
                {' '}page.
              </p>
            </div>
            <Link 
              href="/account/orders"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-3 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 mr-2" />
              Next Step: Upload Your Print File
            </h2>
            <p className="text-gray-600 mb-4">
              To begin production, please upload your high-resolution artwork file (PDF, AI, PSD). You can also upload it later via the{' '}
              <Link href="/upload-artwork" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                Upload Artwork
              </Link>
              {' '}page.
            </p>
            
            <Link 
              href="/upload-artwork"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
            >
              Upload Artwork Now
            </Link>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="grid grid-cols-2 gap-4 text-left border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Order Number:</p>
            <p className="font-semibold text-gray-900">
              {orderNumber || 'Processing...'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Action:</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Printer className="w-4 h-4 mr-1 text-gray-600" />
              {quoteHasFiles ? 'Team Review' : 'Awaiting File Upload'}
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
