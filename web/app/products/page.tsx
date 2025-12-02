import Link from 'next/link';
// Import the necessary functions and queries from your Sanity client
import { sanityFetch, productsQuery } from '../../lib/sanity';
import Image from 'next/image';

// Define the shape of the data returned from Sanity for the listing page
interface ProductListing {
  _id: string;
  name: string;
  slug: { current: string };
  basePrice: number;
  isQuoteOnly: boolean;
  imageUrl?: string; 
}

// Next.js App Router components are async by default (Server Components)
export default async function ProductListingPage() {
  let products: ProductListing[] = [];
  let error: string | null = null;
  
  try {
    // Fetches the data using the GROQ query defined in web/lib/sanity.ts
    products = await sanityFetch<ProductListing[]>(productsQuery);
    
    if (!products || products.length === 0) {
        error = "No products found in Sanity. Please create some in your CMS Studio.";
    }

  } catch (e: any) {
    // This catches connection errors (e.g., Sanity is not running, bad Project ID)
    console.error("Sanity Fetch Error on Product Listing Page:", e);
    error = "Failed to load products. Check server logs for Sanity connection errors (Project ID, Dataset, CORS).";
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-4">
        Our Print Products
      </h1>
      
      {/* Error / Empty State Handling */}
      {error ? (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
            <h2 className="text-2xl font-semibold text-red-700 mb-3">Error Loading Products</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">
                Ensure your Sanity Studio is running and your `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct in `.env.local`.
            </p>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link 
              key={product._id} 
              href={`/products/${product.slug.current}`} 
              className="group block border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white transform hover:scale-[1.02]"
            >
              <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  // Using next/image for optimized images
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
                    No Image Provided
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                  {product.name}
                </h2>
                <p className="mt-2 text-md font-bold">
                  {product.isQuoteOnly ? (
                      <span className="text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs">
                          Request Quote
                      </span>
                  ) : (
                      <span className="text-indigo-600">
                          Starts at ${product.basePrice.toFixed(2)}
                      </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}