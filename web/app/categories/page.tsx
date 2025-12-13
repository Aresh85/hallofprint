'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Search, Shield } from 'lucide-react';
import { client } from '../../lib/sanity';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  sortOrder: number;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'products'>('name');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const query = `*[_type == "category"] | order(sortOrder asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      featured,
      sortOrder,
      "productCount": count(*[_type == "product" && status == "active" && category._ref == ^._id])
    }`;
    
    const data = await client.fetch<Category[]>(query);
    setCategories(data);
  };

  const filteredCategories = categories
    .filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'products') {
        return b.productCount - a.productCount;
      }
      return a.name.localeCompare(b.name);
    });

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
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)} Products
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
        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'products')}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white min-w-[200px]"
            >
              <option value="name">Sort by Name</option>
              <option value="products">Sort by Products</option>
            </select>
          </div>

          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredCategories.length} of {categories.length} categories
            </div>
          )}
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
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
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Categories Found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Clear Search
            </button>
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
