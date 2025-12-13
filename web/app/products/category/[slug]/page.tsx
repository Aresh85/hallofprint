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

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

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
          <ProductsWithFilters products={products} categories={categories} />
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
