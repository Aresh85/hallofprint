import Link from 'next/link';
import { sanityFetch } from '../../../../lib/sanity';
import ProductsWithFilters from '../../../../components/Products/ProductsWithFilters';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  sortOrder: number;
}

interface ProductListing {
  _id: string;
  name: string;
  slug: { current: string };
  basePrice: number;
  isQuoteOnly: boolean;
  imageUrl?: string;
  category?: {
    name: string;
    slug: string;
  };
  productSize?: string;
  badges?: string[];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Redirect to boards landing page if this is the boards category
  if (slug === 'boards') {
    const { redirect } = await import('next/navigation');
    redirect('/products/category/boards');
  }

  // Fetch the category
  const categoryQuery = `*[_type == "category" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    description,
    featured,
    sortOrder
  }`;

  const category = await sanityFetch<Category>(categoryQuery, { slug });

  if (!category) {
    notFound();
  }

  // Fetch all categories for filter
  const categoriesQuery = `*[_type == "category"] | order(sortOrder asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    featured,
    sortOrder
  }`;

  const categories = await sanityFetch<Category[]>(categoriesQuery);

  // Fetch products for this category
  const productsQuery = `*[_type == "product" && status == "active" && category._ref == $categoryId] | order(sortOrder asc, name asc) {
    _id,
    name,
    slug,
    basePrice,
    isQuoteOnly,
    "imageUrl": mainImage.asset->url,
    "category": category->{name, "slug": slug.current},
    productSize,
    badges,
    configurationGroups[]{
      groupName,
      choices[]{
        name,
        priceModifier,
        unit
      }
    }
  }`;

  const products = await sanityFetch<ProductListing[]>(productsQuery, { categoryId: category._id });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Category Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center text-sm text-indigo-100">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-white transition-colors">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white font-semibold">{category.name}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              {category.name}
              {category.featured && <span className="ml-3 text-3xl">⭐</span>}
            </h1>
            {category.description && (
              <p className="text-xl text-indigo-100 mb-6">
                {category.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
              {category.featured && (
                <span className="bg-yellow-400 text-indigo-900 font-semibold px-4 py-2 rounded-full">
                  Featured Category
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Back to All Products */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Products
        </Link>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product._id} 
                href={`/products/${product.slug.current}`} 
                className="group block"
              >
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Badges */}
                  {product.badges && product.badges.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                      {product.badges.includes('bestseller') && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Best Seller
                        </span>
                      )}
                      {product.badges.includes('popular') && (
                        <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      {product.badges.includes('new') && (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                            £{product.basePrice.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Products Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're adding products to this category soon. Check back later or browse our other categories!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Browse All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Related Categories */}
        {categories.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Browse Other Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories
                .filter((cat) => cat.slug !== category.slug)
                .map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products/category/${cat.slug}`}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">
                      {cat.name}
                      {cat.featured && <span className="ml-1 text-xs">⭐</span>}
                    </h3>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            We offer custom printing services for unique requirements. Get a personalized quote today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/request-quote"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Request a Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors border-2 border-white/20"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all categories (for build time)
export async function generateStaticParams() {
  const categoriesQuery = `*[_type == "category"]{"slug": slug.current}`;
  
  try {
    const categories = await sanityFetch<{ slug: string }[]>(categoriesQuery);
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
