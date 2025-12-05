import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Shield, Truck, CheckCircle } from 'lucide-react';
import { client, sanityFetch } from '../../../lib/sanity';
import ProductConfigurator from '../../../components/Products/ProductConfigurator'; 

// 1. Define the full data structure for a single product
interface ProductChoice {
  name: string;
  priceModifier: number;
  unit: string;
}

interface ConfigurationGroup {
  groupName: string;
  choices: ProductChoice[];
}

interface ProductDetails {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  isQuoteOnly: boolean;
  imageUrl?: string;
  configurationGroups: ConfigurationGroup[];
}

// 2. Define the query function using GROQ to fetch the single product
const productDetailsQuery = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  name,
  description,
  basePrice,
  isQuoteOnly,
  "imageUrl": mainImage.asset->url,
  configurationGroups[]{
    groupName,
    choices[]{
      name,
      priceModifier,
      unit
    }
  }
}`;

// 3. Optional: Generate static paths for pre-rendering
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(`*[_type == "product" && defined(slug.current)][].slug.current`);
  return slugs.map((slug) => ({ slug }));
}

// 4. Main Product Component
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!slug) {
      console.error("URL parameter 'slug' is missing.");
      return notFound();
  }
  
  const product = await sanityFetch<ProductDetails>(
    productDetailsQuery, 
    { slug } 
  );

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-indigo-600">
              Products
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="p-8"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📦</div>
                    <p className="text-lg">Product Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Signals */}
            <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Quality Guaranteed</p>
                    <p className="text-sm text-gray-600">Premium materials and printing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Fast Turnaround</p>
                    <p className="text-sm text-gray-600">Quick production and delivery</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Expert Support</p>
                    <p className="text-sm text-gray-600">Professional assistance available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Configuration */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-3">
                {product.isQuoteOnly ? (
                  <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    Request Custom Quote
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-indigo-600">
                      £{product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-gray-500">Starting price</span>
                  </>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Product Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                Customize Your Print
              </h2>
              
              <ProductConfigurator
                basePrice={product.basePrice}
                isQuoteOnly={product.isQuoteOnly}
                configurationGroups={product.configurationGroups}
                productName={product.name}
              />
            </div>

            {/* Additional Info */}
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-3">
                Need Help with Your Order?
              </h3>
              <p className="text-sm text-indigo-800 mb-4">
                Our team is here to assist you with custom specifications, bulk orders, or any questions about the printing process.
              </p>
              <Link 
                href="/upload-file"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                Upload Your Artwork →
              </Link>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Specifications & Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Print Quality</h3>
              <p className="text-gray-600 text-sm">
                High-resolution printing for crisp, professional results
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Materials</h3>
              <p className="text-gray-600 text-sm">
                Premium quality materials sourced from trusted suppliers
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">File Formats</h3>
              <p className="text-gray-600 text-sm">
                Accepts PDF, AI, PSD, TIFF and other common formats
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Turnaround Time</h3>
              <p className="text-gray-600 text-sm">
                Fast production with options for rush orders
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
              <p className="text-gray-600 text-sm">
                Secure packaging and reliable shipping options
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600 text-sm">
                Expert assistance throughout your order process
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
