import Link from 'next/link';
import { sanityFetch, productsQuery } from '../../lib/sanity';
import Image from 'next/image';
import { ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react';

// Define the shape of the data returned from Sanity for the listing page
interface ProductListing {
  _id: string;
  name: string;
  slug: { current: string };
  basePrice: number;
  isQuoteOnly: boolean;
  imageUrl?: string; 
}

export default async function ProductListingPage() {
  let products: ProductListing[] = [];
  let error: string | null = null;
  
  try {
    products = await sanityFetch<ProductListing[]>(productsQuery);
    
    if (!products || products.length === 0) {
        error = "No products found in Sanity. Please create some in your CMS Studio.";
    }

  } catch (e: any) {
    console.error("Sanity Fetch Error on Product Listing Page:", e);
    error = "Failed to load products. Check server logs for Sanity connection errors (Project ID, Dataset, CORS).";
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Professional Print Products
            </h1>
            <p className="text-xl text-indigo-100 mb-6">
              High-quality printing solutions for businesses and individuals. From banners to business cards, we deliver excellence.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span>Fast Turnaround</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-pink-300" />
                <span>Custom Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Error / Empty State Handling */}
        {error ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-red-200 shadow-lg">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-red-700 mb-3">
                Error Loading Products
              </h2>
              <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
              <p className="text-sm text-gray-500">
                  Ensure your Sanity Studio is running and your configuration is correct in `.env.local`.
              </p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Browse Our Collection
              </h2>
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link 
                  key={product._id} 
                  href={`/products/${product.slug.current}`} 
                  className="group block"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Product Image */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-gray-400">
                            <div className="text-5xl mb-2">📦</div>
                            <p className="text-xs font-medium">No Image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-semibold flex items-center space-x-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        {product.isQuoteOnly ? (
                          <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Request Quote
                          </span>
                        ) : (
                          <div>
                            <span className="text-sm text-gray-500">From</span>
                            <p className="text-2xl font-bold text-indigo-600">
                              ${product.basePrice.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Need Custom Printing Solutions?
              </h2>
              <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
                Can't find exactly what you're looking for? We offer custom printing services tailored to your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/upload-file"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Upload Artwork
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors border-2 border-white/20"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
