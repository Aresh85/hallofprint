import Link from 'next/link';
import { Cookie, Home, ChevronRight } from 'lucide-react';

export default function CookiePolicyPage() {
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
            <span className="text-gray-900 font-medium">Cookie Policy</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Cookie className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: December 4, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners about how visitors use their site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hall of Print uses cookies and similar tracking technologies to enhance your experience on our website, analyze site usage, and assist in our marketing efforts. We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential Operations:</strong> To enable core functionality such as security, network management, and accessibility</li>
              <li><strong>Shopping Cart:</strong> To remember items in your shopping cart and maintain your session</li>
              <li><strong>Authentication:</strong> To remember your login status and preferences</li>
              <li><strong>Analytics:</strong> To understand how visitors interact with our website</li>
              <li><strong>Marketing:</strong> To deliver relevant advertisements and measure campaign effectiveness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Strictly Necessary Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies are essential for the website to function properly. They enable core functionality such as page navigation, access to secure areas, and processing payments.
                </p>
                <div className="text-sm text-gray-600">
                  <p><strong>Duration:</strong> Session or up to 1 year</p>
                  <p><strong>Purpose:</strong> Website functionality, security, and payment processing</p>
                  <p><strong>Can be disabled:</strong> No - these cookies are required for the site to work</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies collect information about how you use our website, such as which pages you visit most often and if you receive error messages. This helps us improve the website's performance and user experience.
                </p>
                <div className="text-sm text-gray-600">
                  <p><strong>Duration:</strong> Up to 2 years</p>
                  <p><strong>Purpose:</strong> Website analytics and performance monitoring</p>
                  <p><strong>Can be disabled:</strong> Yes</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Functional Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, personalised features.
                </p>
                <div className="text-sm text-gray-600">
                  <p><strong>Duration:</strong> Session or up to 1 year</p>
                  <p><strong>Purpose:</strong> Remember your preferences and settings</p>
                  <p><strong>Can be disabled:</strong> Yes, but may affect functionality</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Targeting/Advertising Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                </p>
                <div className="text-sm text-gray-600">
                  <p><strong>Duration:</strong> Up to 2 years</p>
                  <p><strong>Purpose:</strong> Targeted advertising and campaign measurement</p>
                  <p><strong>Can be disabled:</strong> Yes</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use services from third-party companies that may set cookies on your device. These companies include:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Stripe:</strong> We use Stripe to process payments securely. Stripe may set cookies to prevent fraud and ensure secure transactions. For more information, see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">Stripe's Privacy Policy</a>.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may use analytics services such as Google Analytics to help us understand how visitors use our website. These services collect information anonymously and report website trends without identifying individual visitors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Content Management</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Sanity.io:</strong> We use Sanity as our content management system. Sanity may set cookies when you interact with our content.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. How to Control Cookies</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                <p className="leading-relaxed mb-2">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Delete all cookies from your browser</li>
                  <li>Block all cookies from being set</li>
                  <li>Allow only cookies from specific websites</li>
                  <li>Be notified when a website tries to set a cookie</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Browser-Specific Instructions</h3>
                <ul className="space-y-2">
                  <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Important Note</h3>
                <p className="leading-relaxed">
                  Please note that blocking or deleting cookies may impact your experience on our website. Some features may not function properly, and you may need to re-enter information more frequently.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Do Not Track Signals</h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for how to respond to DNT signals. Our website does not currently respond to DNT signals, but we are committed to respecting your privacy preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Mobile Devices</h2>
            <p className="text-gray-700 leading-relaxed">
              Mobile devices may use advertising identifiers instead of cookies. You can control advertising tracking on mobile devices through your device settings:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li><strong>iOS:</strong> Settings → Privacy → Advertising → Limit Ad Tracking</li>
              <li><strong>Android:</strong> Settings → Google → Ads → Opt out of Ads Personalization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookie Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies have different lifespans:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li><strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> These remain on your device for a set period (ranging from a few hours to several years) or until you delete them manually</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Updates to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Last updated" date. We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. More Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For more information about how we collect, use, and protect your data, please see our <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-800 font-medium">Privacy Policy</Link>.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              For general information about cookies, visit:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">AllAboutCookies.org</a></li>
              <li><a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">UK Information Commissioner's Office - Cookies</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Print</strong></p>
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
