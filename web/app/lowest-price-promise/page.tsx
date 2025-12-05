import Link from 'next/link';
import { Tag, Home, ChevronRight, CheckCircle, XCircle, TrendingDown } from 'lucide-react';

export default function LowestPricePromisePage() {
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
            <span className="text-gray-900 font-medium">Lowest Price Promise</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Tag className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lowest Price Promise</h1>
          <p className="text-xl text-gray-600">
            At Hall of Print, we're committed to offering you the best value for your printing needs.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How Our Lowest Price Promise Works</h2>
            <p className="text-gray-700 leading-relaxed">
              If you find a lower price on an identical product and service from a competitor, we'll not only match that price but <strong>beat it by an additional 5%</strong>. Our Lowest Price Promise applies to all our printing services, ensuring you always get the best deal with Hall of Print.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility Criteria</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  The competitor's product must be identical in terms of quality, quantity, and specifications
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  The competitor's price must be verifiable and currently available
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  The price comparison must include all costs (e.g., shipping, taxes)
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  The competitor must be an authorised retailer or service provider which is VAT registered
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  The competitor operations must be based within the UK mainland
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Claim</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                Submit a claim using our{' '}
                <Link href="/price-match-request" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Price Match Request Form
                </Link>
              </li>
              <li>Provide proof of the lower price (e.g., website link, advertisement, or written quote)</li>
              <li>Our team will verify the competitor's offer</li>
              <li>Once verified, we'll beat the price by 5%</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exclusions</h2>
            <p className="text-gray-700 mb-3">Our Lowest Price Promise does not apply to:</p>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Special orders or custom printing services</p>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Clearance or closeout sales</p>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Pricing errors</p>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Limited time or limited quantity offers</p>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Membership club prices or bulk discounts</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Match After Purchase</h2>
            <p className="text-gray-700 leading-relaxed">
              We cannot match any price once payment is made.
            </p>
          </section>

          <section className="bg-indigo-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Quality Promise</h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to offer the lowest prices, we never compromise on quality. You can trust that every print job from Hall of Print meets our high standards for excellence, regardless of the price.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sustainable Pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Lowest Price Promise is part of our commitment to sustainable business practices. We believe in fair pricing that benefits our customers while allowing us to maintain our high-quality standards and support our team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Care</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our Lowest Price Promise or need assistance with a claim, our dedicated customer care team is here to help.
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Print</strong></p>
              <p className="text-gray-700">Email: <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">support@hallofprint.com</a></p>
            </div>
          </section>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-green-50 rounded-xl p-6">
              <TrendingDown className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Best Price Guaranteed</h3>
              <p className="text-gray-700 text-sm">
                We'll beat any competitor's price by 5% on identical products and services.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <CheckCircle className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">High-Quality Printing</h3>
              <p className="text-gray-700 text-sm">
                Our commitment to quality never wavers, regardless of price matching.
              </p>
            </div>
          </div>

          {/* Hall of Print Guarantee Link */}
          <div className="bg-indigo-600 text-white rounded-xl p-6 text-center mt-8">
            <h3 className="text-2xl font-bold mb-3">Hall of Print Guarantee</h3>
            <p className="mb-6">
              Our Hall of Print Guarantee means that if you're not happy with your order, we'll make it right.
            </p>
            <Link 
              href="/hall-print-guarantee"
              className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center space-y-4">
          <Link 
            href="/price-match-request"
            className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors mr-4"
          >
            Submit Price Match Request
          </Link>
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
