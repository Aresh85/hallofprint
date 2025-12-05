import Link from 'next/link';
import { HelpCircle, Home, ChevronRight } from 'lucide-react';

export default function FAQsPage() {
  const faqData = [
    {
      question: "How do I place an order?",
      answer: "Placing an order with Hall of Print is easy! Simply browse our product range, select the items you need, customize your specifications, and add them to your cart. Once you're ready, proceed to checkout where you'll provide your delivery details and payment information. You'll receive an order confirmation via email once your purchase is complete."
    },
    {
      question: "Where is my order?",
      answer: "We make every effort to dispatch your order on time. Once we have carefully packed your order, and it is ready for dispatch, we'll send you an email from CustomerService@hallofprint.com - look out for this email as it will have all the information you need to track your order, and confirm which carrier will be delivering it to you (or your lucky recipient)."
    },
    {
      question: "Why does the tracking information say it has been delivered when it has not?",
      answer: "Let's see if we can help. Sometimes if you are not home, your regular postie may put your delivery in a safe place, or perhaps leave it with a neighbour. All of our orders are carefully packaged and will keep in perfect condition whilst you locate it. We do ask that you have a look around and if you cannot find it on the day that it says delivered, just let us know so that we can make things right. If you were not home and your postie couldn't find a safe place or a neighbour, they will take your delivery back to the local depot instead, and leave a card through your door to let you know this has happened. They'll keep it safe here for up to 14 days ready for you to collect…although we're sure you won't want to wait that long!"
    },
    {
      question: "You have substituted an item",
      answer: "We make every effort to manage our stock levels carefully and correctly. In very rare instances, something may change as we are packing your order. We understand that you may have chosen Hall of Print for a time sensitive print or for its high quality. Should this happen, our team will carefully select items of the same paper or finish genre, even upgrading the value of the item to ensure your print still has that same impact. Whilst we will let you know if this happens, we do act quickly to meet delivery dates and it may be that you receive our advice after dispatch. Please don't worry; you are under no obligation to keep any substituted item and we do ask that you just let us know so that we can put things right."
    },
    {
      question: "How do I change my password?",
      answer: "You can view this by logging in and viewing your account by clicking 'My Account' and then 'Edit', then you can change your password."
    },
    {
      question: "Where can I manage my addresses?",
      answer: "You can view this by logging in and viewing your account by clicking 'My Account' and then 'Address Book'. This will present you with a list including your main address and previous addresses that you have saved. You will also have the option to 'Enter New Address' to your address book."
    },
    {
      question: "Where can I manage my payment cards?",
      answer: "You can view this by logging in and viewing your account by clicking 'My Account' and then 'Payment Methods'. By selecting this, you will have a further list of options, including 'Saved Payment Cards'. This will show a list of payment cards you have previously used and give you the option to delete these."
    },
    {
      question: "I can't find a product on your website, have you stopped producing it?",
      answer: "We do strive to constantly improve and refresh our product range and try out new ideas, and therefore our range can change from time to time."
    },
    {
      question: "Are there age restrictions on certain products?",
      answer: "No – But orders must be made or approved by the name of the card holder and accounts are for persons age 13 or over."
    },
    {
      question: "What is your approach to recycling?",
      answer: "Our goal at Hall of Print is to provide consumers with safe, effective products and use recyclable materials whenever possible. What happens then depends on the local facilities available for recovery or recycling of packaging waste."
    },
    {
      question: "Can I pick up my order from your commercial premises?",
      answer: "Currently we do not support local pick up of orders, due to current on site restrictions we are unable to serve customers from our premises."
    }
  ];

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
            <span className="text-gray-900 font-medium">FAQs</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about Hall of Print services</p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <details key={index} className="group border-b border-gray-200 pb-4 last:border-0">
                <summary className="flex justify-between items-center cursor-pointer list-none py-3 hover:text-indigo-600 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 pr-4">
                    {faq.question}
                  </h3>
                  <span className="flex-shrink-0 text-indigo-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-3 pr-8 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </Link>
            <a 
              href="mailto:support@hallofprint.com" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Email Us
            </a>
          </div>
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
