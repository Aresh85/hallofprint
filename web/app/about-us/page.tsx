import Link from 'next/link';
import { Users, Home, ChevronRight, Target, Heart, Zap, Award, Leaf, TrendingUp } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">About Us</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Hall of Print</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for top-quality print jobs across the UK. We bring your ideas to life with precision and passion.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          {/* Who We Are */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hall of Print is a leading UK-based printing company dedicated to providing exceptional print services to businesses and individuals nationwide. With years of experience in the industry, we've built our reputation on quality, reliability, and outstanding customer service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Based in London at 9 Cranleigh Mews, SW11 2QL, we serve customers across the United Kingdom, delivering high-quality printing solutions that exceed expectations. From small personal projects to large corporate campaigns, we handle every print job with the same level of care and attention to detail.
            </p>
          </section>

          {/* Our Mission & Values */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission & Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-xl p-6">
                <Target className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
                <p className="text-gray-700 text-sm">
                  We never compromise on quality. Every print job receives our full attention and expertise to ensure perfect results.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <Heart className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Focus</h3>
                <p className="text-gray-700 text-sm">
                  Your satisfaction is our priority. We're committed to providing exceptional service and support throughout your printing journey.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <Zap className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Speed & Efficiency</h3>
                <p className="text-gray-700 text-sm">
                  Fast turnaround times without sacrificing quality. We understand deadlines matter and work efficiently to meet them.
                </p>
              </div>
            </div>
          </section>

          {/* What Sets Us Apart */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Sets Us Apart</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start space-x-3 mb-4">
                  <Award className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Lowest Price Promise</h3>
                    <p className="text-gray-700 text-sm">
                      Find a better price? We'll beat it by 5%. Our commitment to competitive pricing ensures you always get the best deal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 mb-4">
                  <Leaf className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Eco-Friendly Options</h3>
                    <p className="text-gray-700 text-sm">
                      We offer sustainable printing solutions using recycled materials and minimizing environmental impact wherever possible.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Latest Technology</h3>
                    <p className="text-gray-700 text-sm">
                      State-of-the-art printing equipment ensures crisp, vibrant results that bring your designs to life.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Our Guarantees</h3>
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span>100% satisfaction guarantee on all orders</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span>Free delivery on orders over £195</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span>Next-day shipping available</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span>Secure online ordering with Stripe</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span>Expert customer support team</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Our Services */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Flyers & Leaflets</h4>
                <p className="text-sm text-gray-700">Professional marketing materials for your business</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Business Cards</h4>
                <p className="text-sm text-gray-700">Make a lasting impression with quality cards</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Banners & Signs</h4>
                <p className="text-sm text-gray-700">Eye-catching displays for events and promotions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Custom Prints</h4>
                <p className="text-sm text-gray-700">Specialized printing for unique projects</p>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 text-indigo-100">
              Let's bring your vision to life with professional printing services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products"
                className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Products
              </Link>
              <a 
                href="mailto:support@hallofprint.com"
                className="inline-block bg-indigo-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-indigo-900 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Find Us</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <Home className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hall of Print</h3>
                  <p className="text-gray-700 mb-2">9 Cranleigh Mews</p>
                  <p className="text-gray-700 mb-2">London, SW11 2QL</p>
                  <p className="text-gray-700 mb-4">United Kingdom</p>
                  <p className="text-gray-700">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">
                      support@hallofprint.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
