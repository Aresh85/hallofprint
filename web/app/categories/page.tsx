import Link from 'next/link';
import { sanityFetch } from '../../lib/sanity';
import { Package, ArrowRight, Shield } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  sortOrder: number;
  productCount: number;
}

export default async function CategoriesPage() {
  // Server-side fetch all categories EXCLUDING board subcategories
  const categoriesQuery = `*[_type == "category" && !defined(isSubcategory) || isSubcategory != true] | order(sortOrder asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    featured,
    sortOrder,
    "productCount": count(*[_type == "product" && status == "active" && category._ref == ^._id])
  }`;

  const categories = await sanityFetch<Category[]>(categoriesQuery);
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Package className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Browse by Category
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Find the perfect print products for your needs. From flyers to banners, we've got you covered.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {categories.length} Categories
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {totalProducts} Products
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Price Match Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products/category/${category.slug}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                      {category.featured && (
                        <span className="ml-2 text-yellow-500">⭐</span>
                      )}
                    </h3>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Categories Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Categories will be added soon. Check back later!
            </p>
          </div>
        )}

        {/* Price Promise Section */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-3">
                Our Price Match Promise
              </h2>
              <p className="text-lg text-green-50 mb-4">
                Find a lower price for the same product elsewhere? We'll match it and give you an extra 5% off! 
                That's our commitment to providing the best value for your printing needs.
              </p>
              <Link
                href="/lowest-price-promise"
                className="inline-flex items-center text-white font-semibold hover:text-green-100 transition-colors"
              >
                Learn More About Our Price Promise
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You Need?
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
