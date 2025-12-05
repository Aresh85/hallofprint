'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-indigo-600 shadow-2xl animate-slide-up">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Icon and Message */}
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                We use cookies to enhance your browsing experience, provide personalised content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                <Link href="/cookie-policy" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 whitespace-nowrap"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Optional Close Button */}
      <button
        onClick={handleDecline}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close cookie banner"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
