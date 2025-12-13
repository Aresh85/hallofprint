'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Filter, X, Grid, List } from 'lucide-react';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
}

interface Props {
  products: ProductListing[];
  categories: Category[];
}

export default function ProductsWithFilters({ products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => {
      if (p.productSize) sizes.add(p.productSize);
    });
    return Array.from(sizes).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory && product.category?.slug !== selectedCategory) {
        return false;
      }
      
      // Size filter
      if (selectedSize && product.productSize !== selectedSize) {
        return false;
      }
      
      // Price filter
      if (product.basePrice < priceRange[0] || product.basePrice > priceRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [products, selectedCategory, selectedSize, priceRange]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setPriceRange([0, 1000]);
  };

  const activeFiltersCount = [selectedCategory, selectedSize].filter(Boolean).length;

  return (
    <div>
      {/* Category Pills */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
            selectedCategory === null
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
          }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category.slug)}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
              selectedCategory === category.slug
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {category.name}
            {category.featured && (
              <span className="ml-2 text-xs">⭐</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Size Filter */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Price Range: £{priceRange[0]} - £{priceRange[1]}
              </h3>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>£0</span>
                <span>£1000+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
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
                {product.category && (
                  <p className="text-xs text-indigo-600 font-semibold mb-1 uppercase tracking-wide">
                    {product.category.name}
                  </p>
                )}
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

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or browse all products
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
