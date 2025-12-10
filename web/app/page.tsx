import Link from 'next/link';
import { ShoppingBag, FileText, UploadCloud } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Hall of Prints
        </h1>
        <p className="text-2xl text-indigo-600 mb-8 font-light">
          Your partner for configurable, high-quality leaflets, posters, and more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Feature 1: Shop */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <ShoppingBag className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-3">Browse Products</h2>
            <p className="text-gray-600 mb-5">
              Configure size, paper stock, and finish before adding to cart.
            </p>
            <Link 
              href="/products" 
              className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>

          {/* Feature 2: Quote */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-3">Request a Quote</h2>
            <p className="text-gray-600 mb-5">
              Need a specialised or large-volume print job? We're here to help.
            </p>
            <Link 
              href="/request-quote" 
              className="inline-block px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Get a Custom Quote
            </Link>
          </div>

          {/* Feature 3: Upload */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <UploadCloud className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-3">Upload Artwork</h2>
            <p className="text-gray-600 mb-5">
              Already placed your order? Quickly submit your print-ready file here.
            </p>
            <Link 
              href="/upload-file" 
              className="inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit File
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
