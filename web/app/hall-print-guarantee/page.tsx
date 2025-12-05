import Link from 'next/link';
import { Shield, Home, ChevronRight, CheckCircle, Gift, Sparkles, Award } from 'lucide-react';

export default function HallPrintGuaranteePage() {
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
            <span className="text-gray-900 font-medium">Hall of Print Guarantee</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hall of Print Guarantee</h1>
          <p className="text-xl text-gray-600">
            All of your purchases are covered by our Hall of Print Guarantee
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Promise to You</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Hall of Print, we stand behind every product we produce. Our Hall of Print Guarantee means that if you're not happy with your order for any reason, we'll make it right. Your satisfaction is our top priority, and we're committed to delivering exceptional quality and service with every print job.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether it's a quality issue, delivery problem, or you're simply not satisfied with the result, we're here to ensure you receive the perfect print every time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Our Guarantee Covers</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality Issues</h3>
                  <p className="text-gray-700 text-sm">
                    If your prints don't meet our high-quality standards, we'll reprint them at no additional cost.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Production Errors</h3>
                  <p className="text-gray-700 text-sm">
                    Mistakes on our end? We'll fix them immediately and ensure your order is correct.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Damaged Deliveries</h3>
                  <p className="text-gray-700 text-sm">
                    If your order arrives damaged, we'll replace it promptly and work to prevent future issues.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Color Accuracy</h3>
                  <p className="text-gray-700 text-sm">
                    While slight variations may occur, significant color discrepancies will be addressed and corrected.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Satisfaction Guarantee</h3>
                  <p className="text-gray-700 text-sm">
                    Not happy with your prints? Let us know and we'll work with you to make it right.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Make a Claim</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Contact our customer service team within 48 hours of receiving your order</li>
              <li>Provide your order number and details of the issue</li>
              <li>Include photos if applicable (especially for quality or damage issues)</li>
              <li>Our team will review your claim and respond promptly</li>
              <li>We'll arrange a reprint, replacement, or refund as appropriate</li>
            </ol>
          </section>

          <section className="bg-indigo-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Care</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You will always receive a prompt, helpful, and friendly response. We strive to strengthen our relationship with you and help you retain confidence in our service.
            </p>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Print</strong></p>
              <p className="text-gray-700">Email: <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">support@hallofprint.com</a></p>
              <p className="text-gray-700 mt-2 text-sm">We aim to respond to all guarantee claims within 24 hours during business days.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Excellence</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <Award className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-700 text-sm">
                  Top-notch printing for all your needs, big or small. We never compromise on quality.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <Sparkles className="w-10 h-10 text-green-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Rapid Turnaround</h3>
                <p className="text-gray-700 text-sm">
                  Quick and efficient production to meet your deadlines without sacrificing quality.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Benefits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Hall of Print?</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p>Competitive pricing with our Lowest Price Promise</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p>Fast turnaround times and reliable delivery</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p>Eco-friendly printing options available</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p>Expert customer support throughout your project</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <p>100% satisfaction guarantee on all orders</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Bring Your Vision to Life?</h3>
            <p className="text-gray-700 mb-6">Experience the Hall of Print difference today!</p>
            <Link 
              href="/products"
              className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Our Products
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6">
          <Link 
            href="/lowest-price-promise"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Lowest Price Promise
          </Link>
          <Link 
            href="/" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
