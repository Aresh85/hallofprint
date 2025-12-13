import Link from 'next/link';
import { sanityFetch } from '@/lib/sanity';
import { ArrowRight, Package } from 'lucide-react';

interface BoardCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
}

export default async function BoardsCategoryPage() {
  // Fetch board subcategories
  const boardSubcategories = await sanityFetch<BoardCategory[]>(`
    *[_type == "category" && slug.current in ["display-boards", "foam-boards", "xanita-boards", "di-bond-boards"]] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      "productCount": count(*[_type == "product" && status == "active" && category._ref == ^._id])
    }
  `);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/categories"
              className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition-colors"
            >
              ← Back to All Categories
            </Link>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Package className="w-10 h-10" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Professional Boards
            </h1>
            
            <p className="text-xl text-indigo-100 mb-8">
              Choose from our range of professional display boards - select by material type below
            </p>
            
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {boardSubcategories.length} Board Types
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {boardSubcategories.reduce((sum, cat) => sum + cat.productCount, 0)} Products
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                A0 to A4 Sizes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Select Board Type
          </h2>
          
          {/* Board Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {boardSubcategories.map((category) => (
              <Link
                key={category._id}
                href={`/products/category/${category.slug}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-indigo-500 transform hover:-translate-y-1"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'} Available
                    </span>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-6">Why Choose Our Boards?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="font-bold text-xl mb-2">Multiple Sizes</h4>
                <p className="text-blue-100">Available from A0 (largest) to A4, plus custom sizes on request</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💪</div>
                <h4 className="font-bold text-xl mb-2">Durable Materials</h4>
                <p className="text-blue-100">High-quality materials suitable for indoor and outdoor use</p>
              </div>
              <div>
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="font-bold text-xl mb-2">Quick Turnaround</h4>
                <p className="text-blue-100">Fast production and delivery for your urgent projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
