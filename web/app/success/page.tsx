'use client';

import { CheckCircle, UploadCloud, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// NOTE: In a real application, you would use the 'session_id' from 
// URL search params here to fetch the order details from your database (e.g., Sanity).
// For now, we assume fulfillment was handled by the Stripe Webhook (Phase IV, Step 5).

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-green-500 text-center">
        
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-700 mb-8">
          Thank you for your purchase from Hall of Prints. Your order is being processed!
        </p>

        {/* --- Next Step: Upload File for Printing (Phase V, Step 2) --- */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-3 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 mr-2" />
                Step 1: Upload Your Print File
            </h2>
            <p className="text-gray-600 mb-4">
                To begin the printing process, please upload your high-resolution artwork file (PDF, AI, PSD).
            </p>
            
            {/* Action button to the dedicated Upload page */}
            <Link 
                href="/upload-file"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
            >
                Go to File Uploader
            </Link>
        </div>

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
                    Awaiting File Upload
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