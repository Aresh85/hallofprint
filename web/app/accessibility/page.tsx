import Link from 'next/link';
import { Accessibility, Home, ChevronRight } from 'lucide-react';

export default function AccessibilityPage() {
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
            <span className="text-gray-900 font-medium">Accessibility</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Accessibility className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
          <p className="text-gray-600">Last updated: December 4, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
            <p className="text-gray-700 leading-relaxed">
              Hall of Print is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We are working towards meeting the standards set by the UK Equality Act 2010 and the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website includes the following accessibility features:
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Keyboard Navigation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our website can be navigated using a keyboard alone. Users can tab through interactive elements, use arrow keys for navigation, and activate controls using the Enter or Space keys.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Screen Reader Compatibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use semantic HTML and ARIA (Accessible Rich Internet Applications) labels to ensure our content is accessible to screen readers such as JAWS, NVDA, and VoiceOver.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Color Contrast</h3>
                <p className="text-gray-700 leading-relaxed">
                  We maintain sufficient color contrast ratios between text and background colors to ensure readability for users with visual impairments or color blindness.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Text Resizing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Text can be resized up to 200% using browser zoom controls without loss of content or functionality. Our responsive design adapts to different screen sizes and zoom levels.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Alternative Text</h3>
                <p className="text-gray-700 leading-relaxed">
                  All meaningful images include alternative text descriptions to convey their content and function to users who cannot see them.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Clear Navigation</h3>
                <p className="text-gray-700 leading-relaxed">
                  We provide consistent navigation throughout the site with clear headings, landmarks, and skip links to help users navigate efficiently.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Form Accessibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  All forms include properly associated labels, clear error messages, and instructions to help users complete them successfully.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assistive Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Browser text size adjustment and zoom features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browser Compatibility</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website is designed to work with the latest versions of the following browsers:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Safari</li>
              <li>Microsoft Edge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Content</h2>
            <p className="text-gray-700 leading-relaxed">
              We use some third-party services on our website (such as payment processing through Stripe). While we strive to ensure all content is accessible, we cannot always guarantee the accessibility of third-party content. We work with providers who share our commitment to accessibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents and Files</h2>
            <p className="text-gray-700 leading-relaxed">
              When we publish documents for download, we aim to provide them in accessible formats. If you require a document in an alternative format (such as large print, braille, or audio), please contact us and we will do our best to accommodate your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Despite our best efforts, there may be some limitations. Known issues include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Some PDF documents may not be fully accessible (we are working to improve this)</li>
              <li>Certain product images may lack detailed descriptions</li>
              <li>File upload interfaces may have limitations with some assistive technologies</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We are actively working to address these issues and improve accessibility across our entire website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips for Using Our Website</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Adjusting Text Size</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Windows:</strong> Press Ctrl and + to increase or Ctrl and - to decrease</li>
                  <li><strong>Mac:</strong> Press Cmd and + to increase or Cmd and - to decrease</li>
                  <li><strong>Chromebook:</strong> Press Ctrl and + to increase or Ctrl and - to decrease</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Browser Accessibility Settings</h3>
                <p className="leading-relaxed">
                  Most modern browsers include built-in accessibility features. Check your browser's settings or preferences menu for options like high contrast mode, text-to-speech, and more.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Operating System Accessibility</h3>
                <p className="leading-relaxed">
                  Your device's operating system may have additional accessibility features. Windows users can access the Ease of Access Center, Mac users can use VoiceOver and other features in System Preferences, and mobile users can find accessibility options in their device settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ongoing Improvements</h2>
            <p className="text-gray-700 leading-relaxed">
              We regularly review our website and conduct accessibility audits to identify and fix issues. We welcome feedback from our users as part of our ongoing effort to improve accessibility. Your input helps us understand what works well and what needs improvement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Training and Awareness</h2>
            <p className="text-gray-700 leading-relaxed">
              Our team receives regular training on accessibility best practices to ensure we continue to develop and maintain an accessible website. We stay informed about new guidelines and technologies to provide the best possible experience for all users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback and Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We welcome feedback on the accessibility of our website. If you encounter any barriers, have suggestions for improvement, or need assistance accessing any content, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Hall of Print</strong></p>
              <p className="text-gray-700">Email: <a href="mailto:support@hallofprint.com" className="text-indigo-600 hover:text-indigo-800">support@hallofprint.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enforcement and Complaints</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you are not satisfied with our response to your accessibility concerns, you can contact:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Equality Advisory and Support Service (EASS)</strong>
                <br />
                <span className="text-sm">For advice and support on discrimination and human rights issues</span>
                <br />
                <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">www.equalityadvisoryservice.com</a>
              </li>
              <li>
                <strong>Equality and Human Rights Commission (EHRC)</strong>
                <br />
                <span className="text-sm">For information about your rights under the Equality Act</span>
                <br />
                <a href="https://www.equalityhumanrights.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">www.equalityhumanrights.com</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For more information about web accessibility, visit:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                  Web Accessibility Initiative (WAI)
                </a>
              </li>
              <li>
                <a href="https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                  UK Government Accessibility Requirements
                </a>
              </li>
              <li>
                <a href="https://www.abilitynet.org.uk/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                  AbilityNet - Accessibility Resources
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Statement</h2>
            <p className="text-gray-700 leading-relaxed">
              We will update this accessibility statement when we make significant changes to our website or accessibility features. This statement was last updated on December 4, 2025.
            </p>
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
