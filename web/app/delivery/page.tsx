import Link from 'next/link';
import { Truck, Home, ChevronRight, Package, Clock, Leaf, CheckCircle } from 'lucide-react';

export default function DeliveryPage() {
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
            <span className="text-gray-900 font-medium">Delivery</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Truck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Delivery Information</h1>
          <p className="text-gray-600 text-lg">Fast, reliable delivery across the UK</p>
        </div>

        {/* Announcement Banner */}
        <div className="bg-indigo-600 text-white rounded-2xl p-6 mb-8 text-center">
          <p className="text-xl font-semibold">
            Free Delivery for orders over £195 | Next-Day Shipping available
          </p>
        </div>

        {/* Delivery Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Delivery Options</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Standard Delivery */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Standard Delivery</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-600">£5.99</p>
                <p className="text-sm text-gray-600">3-5 working days</p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tracked delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Email updates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Secure packaging</span>
                </li>
              </ul>
            </div>

            {/* Express Delivery */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-indigo-600">
              <div className="absolute -mt-12 ml-auto mr-auto left-0 right-0 w-fit">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Express Delivery</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-600">£9.99</p>
                <p className="text-sm text-gray-600">2-3 working days</p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority handling</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Real-time tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>SMS notifications</span>
                </li>
              </ul>
            </div>

            {/* Next Day Delivery */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Next Day Delivery</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-600">£14.99</p>
                <p className="text-sm text-gray-600">Next working day</p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Order by 2pm</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Fastest service</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Premium tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-indigo-600">
              Free delivery on all orders over £195!
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Process</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Once your order is confirmed and payment is processed, we carefully prepare your print materials with the utmost attention to quality and detail. You'll receive an email from <strong>CustomerService@hallofprint.com</strong> with your tracking information once your order is dispatched.
              </p>
              <p className="leading-relaxed">
                Our tracking emails include all the information you need to monitor your delivery, including the carrier details and estimated delivery date. You can track your order in real-time to know exactly when it will arrive.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Times</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Important:</strong> Delivery times are calculated from the dispatch date, not the order date. Production time varies depending on the product and specifications you choose. You'll see estimated production and delivery times at checkout.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders placed before 2pm are typically processed the same day (subject to production time)</li>
                <li>Weekend and bank holiday orders are processed on the next working day</li>
                <li>Remote areas may require additional delivery time</li>
                <li>We deliver to all UK addresses including Northern Ireland</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe Delivery Practices</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                If you're not home when your order arrives, our delivery partners will:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Leave the package in a safe place (if possible)</li>
                <li>Leave with a neighbour (with your consent)</li>
                <li>Leave a card with collection instructions from your local depot</li>
                <li>Hold your package safely for up to 14 days for collection</li>
              </ul>
              <p className="leading-relaxed mt-3">
                All our orders are carefully packaged to withstand handling and remain in perfect condition until you receive them.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Your Order</h2>
            <p className="text-gray-700 leading-relaxed">
              Once dispatched, you can track your order using the tracking link provided in your dispatch email. If you have any concerns about your delivery or if tracking shows delivered but you haven't received it, please contact us immediately at <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800 font-medium">support@hallofprint.com</a> so we can help resolve the issue.
            </p>
          </section>

          {/* Sustainable Packaging */}
          <section className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Leaf className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Sustainable Packaging Initiative</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We're committed to reducing our environmental impact through:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Using recycled and recyclable materials wherever possible</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Minimising plastic use in all packaging</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ensuring all packaging is either recyclable or biodegradable</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Optimising package sizes to reduce waste</span>
              </li>
            </ul>
          </section>

          {/* Hall of Print Guarantee */}
          <section className="bg-indigo-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <Link href="/hall-print-guarantee" className="hover:text-indigo-600">
                Hall of Print Guarantee
              </Link>
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Hall of Print Guarantee means that if you're not happy with your order for any reason, we'll make it right. Whether it's a quality issue, delivery problem, or you're simply not satisfied with the result, we're committed to ensuring you receive the perfect print every time.{' '}
              <Link href="/hall-print-guarantee" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Learn more about our guarantee →
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection from Premises</h2>
            <p className="text-gray-700 leading-relaxed">
              Currently we do not support local pick up of orders. Due to current on-site restrictions, we are unable to serve customers from our premises. All orders must be delivered to your specified address.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about delivery or need assistance with your order, our customer service team is here to help:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Print</strong></p>
              <p className="text-gray-700">Email: <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">support@hallofprint.com</a></p>
              <p className="text-gray-700 mt-2 text-sm">We aim to respond to all enquiries within 24 hours during business days.</p>
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
