import Link from 'next/link';
import { FileText, Home, ChevronRight } from 'lucide-react';

export default function TermsAndConditionsPage() {
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
            <span className="text-gray-900 font-medium">Terms and Conditions</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: December 4, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Hall of Prints' website and services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use our services. These Terms constitute a legally binding agreement between you and Hall of Prints.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Eligibility:</strong> You must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this age requirement.
              </p>
              <p className="leading-relaxed">
                <strong>Account Responsibility:</strong> If you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
              </p>
              <p className="leading-relaxed">
                <strong>Acceptable Use:</strong> You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services. You must not attempt to gain unauthorized access to our systems.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ordering and Payment</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Orders:</strong> All orders are subject to acceptance by Hall of Prints. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.
              </p>
              <p className="leading-relaxed">
                <strong>Pricing:</strong> All prices are displayed in British Pounds (£) and include VAT where applicable. Prices are subject to change without notice. The price charged will be the price displayed at the time of order placement.
              </p>
              <p className="leading-relaxed">
                <strong>Payment:</strong> We accept payment via credit/debit cards processed through Stripe. Payment is due at the time of order placement. You represent and warrant that you have the legal right to use any payment method provided.
              </p>
              <p className="leading-relaxed">
                <strong>Order Confirmation:</strong> You will receive an email confirmation once your order has been placed. This confirmation does not constitute acceptance of your order. We will send a separate email when your order ships.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Artwork and File Requirements</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>File Specifications:</strong> You are responsible for ensuring that all artwork files meet our technical specifications. We accept PDF, AI, PSD, TIFF, and other common formats. Files must meet minimum resolution requirements for quality printing.
              </p>
              <p className="leading-relaxed">
                <strong>Proof Approval:</strong> For certain orders, we may provide a digital proof for your approval before printing. You are responsible for carefully reviewing proofs and notifying us of any required changes. Once approved, we cannot make changes or accept responsibility for errors.
              </p>
              <p className="leading-relaxed">
                <strong>Copyright and Ownership:</strong> You represent and warrant that you own or have the necessary rights to all artwork submitted for printing. You agree to indemnify Hall of Prints against any claims arising from copyright infringement or unauthorized use of intellectual property.
              </p>
              <p className="leading-relaxed">
                <strong>Content Restrictions:</strong> We reserve the right to refuse printing of any content that we deem inappropriate, offensive, defamatory, or that violates any laws or regulations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Production and Delivery</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Production Times:</strong> Production times are estimates only and do not constitute a guarantee. Production begins after artwork approval and payment confirmation. We will make reasonable efforts to meet estimated production times but are not liable for delays.
              </p>
              <p className="leading-relaxed">
                <strong>Shipping:</strong> Delivery times are estimates and may vary based on location and shipping method selected. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>
              <p className="leading-relaxed">
                <strong>Risk of Loss:</strong> Risk of loss and title for products pass to you upon delivery to the shipping carrier.
              </p>
              <p className="leading-relaxed">
                <strong>Inspection:</strong> You must inspect all products immediately upon receipt and report any defects or damages within 48 hours of delivery.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Quality and Color Accuracy</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to produce high-quality prints that match your submitted artwork. However, due to variations in printing processes and materials, we cannot guarantee exact color matching between digital files and printed products. Screen displays may show colors differently than printed output. We recommend ordering samples for critical color-matching projects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Custom Products:</strong> As all products are custom-made to order, we generally cannot accept returns for change of mind. All sales are final unless the product is defective or we have made an error.
              </p>
              <p className="leading-relaxed">
                <strong>Defective Products:</strong> If you receive a defective product or if we have made an error in your order, please contact us within 48 hours of receipt. We will evaluate the claim and, if approved, provide a reprint or refund at our discretion.
              </p>
              <p className="leading-relaxed">
                <strong>Refund Process:</strong> Approved refunds will be processed to the original payment method within 7-10 business days. We reserve the right to require return of defective products before issuing a refund.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Hall of Prints shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services</li>
              <li>Our total liability for any claim arising from your use of our services shall not exceed the amount you paid for the specific product or service giving rise to the claim</li>
              <li>We are not responsible for delays or failures in performance resulting from causes beyond our reasonable control</li>
              <li>We make no warranties about the accuracy, reliability, or availability of our website or services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on our website, including but not limited to text, graphics, logos, images, and software, is the property of Hall of Prints or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of our services is also governed by our <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-800 font-medium">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Hall of Prints and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from: (a) your use of our services, (b) your violation of these Terms, (c) your violation of any rights of another party, or (d) any content you submit for printing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
              </p>
              <p className="leading-relaxed">
                <strong>Jurisdiction:</strong> You agree that any legal action or proceeding shall be brought exclusively in the courts of England and Wales.
              </p>
              <p className="leading-relaxed">
                <strong>Informal Resolution:</strong> We encourage you to contact us first to resolve any disputes informally before pursuing formal legal action.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Hall of Prints regarding your use of our services and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Prints</strong></p>
              <p className="text-gray-700">Email: <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">support@hallofprint.com</a></p>
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
