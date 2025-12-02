import Image from 'next/image';
import { notFound } from 'next/navigation';
// Import the Sanity client and define a specific query
import { client, sanityFetch } from '../../../lib/sanity';
// Import the client component
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
  // CRITICAL: Extracting the slug from the URL parameters
  const { slug } = await params;
  
  // If the slug is somehow missing or null, we stop the query to avoid the GROQ error.
  if (!slug) {
      console.error("URL parameter 'slug' is missing.");
      return notFound();
  }
  
  // CRITICAL: Passing the slug as the second argument (parameters) to sanityFetch
  const product = await sanityFetch<ProductDetails>(
    productDetailsQuery, 
    { slug } 
  );

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 rounded-xl shadow-2xl my-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image and Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-lg text-gray-600 border-b pb-4">{product.description}</p>
          
          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="p-8"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                Product Image Placeholder
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Configuration Component */}
        <div className="lg:pl-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Customize Your Print</h2>
          
          {/* RENDER THE CLIENT COMPONENT HERE */}
          <ProductConfigurator
            basePrice={product.basePrice}
            isQuoteOnly={product.isQuoteOnly}
            configurationGroups={product.configurationGroups}
            productName={product.name}
          />
        </div>
      </div>
    </div>
  );
}
