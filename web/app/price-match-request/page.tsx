'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Home, ChevronRight, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/auth';

export default function PriceMatchRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  
  // User data for auto-fill
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress1, setUserAddress1] = useState('');
  const [userAddress2, setUserAddress2] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userCounty, setUserCounty] = useState('');
  const [userPostcode, setUserPostcode] = useState('');
  const [userCountry, setUserCountry] = useState('United Kingdom');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || '');

        // Get user profile for name and phone
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || '');
        }

        // Try to get phone and address from default address
        const { data: address } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (address) {
          setUserPhone(address.phone || '');
          setUserAddress1(address.address_line1 || '');
          setUserAddress2(address.address_line2 || '');
          setUserCity(address.city || '');
          setUserCounty(address.county || '');
          setUserPostcode(address.postcode || '');
          setUserCountry(address.country || 'United Kingdom');
        }
      }
    } catch (error) {
      // User not logged in, that's okay
      console.log('Not logged in');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const formData = new FormData(e.currentTarget);

    try {
      // Submit to our native API which handles both email and database storage
      const webhookData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        addressLine1: formData.get('addressLine1'),
        addressLine2: formData.get('addressLine2'),
        city: formData.get('city'),
        county: formData.get('county'),
        postcode: formData.get('postcode'),
        country: formData.get('country'),
        productName: formData.get('productName'),
        quantity: formData.get('quantity'),
        competitorName: formData.get('competitorName'),
        competitorPrice: formData.get('competitorPrice'),
        competitorUrl: formData.get('competitorUrl'),
        additionalInfo: formData.get('additionalInfo'),
      };

      const response = await fetch('/api/webhooks/price-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-indigo-600 flex items-center">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Price Match Request</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-gray-700 mb-6">
              Thank you for your price match request. Our team will review your submission and get back to you within 24 hours.
            </p>
            <div className="space-x-4">
              <Link 
                href="/products"
                className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Products
              </Link>
              <Link 
                href="/"
                className="inline-block bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-900 font-medium">Price Match Request</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Price Match Request Form</h1>
          <p className="text-gray-600">
            Found a lower price? We'll beat it by 5%! Fill out the form below to submit your price match request.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Before You Submit:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• The competitor's product must be identical in quality, quantity, and specifications</li>
            <li>• The competitor's price must be verifiable and currently available</li>
            <li>• Include all costs (shipping, taxes) in your price comparison</li>
            <li>• The competitor must be VAT registered and based in UK mainland</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800">
              There was an error submitting your request. Please try again or contact us directly at support@hallofprint.com
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">

          {/* Your Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={userName}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="John Smith"
                />
                {isLoggedIn && userName && (
                  <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  defaultValue={userEmail}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
                {isLoggedIn && userEmail && (
                  <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={userPhone}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="07123 456789"
                />
                {isLoggedIn && userPhone && (
                  <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  required
                  defaultValue={userAddress1}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Street address"
                />
                {isLoggedIn && userAddress1 && (
                  <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                )}
              </div>

              <div>
                <label htmlFor="addressLine2" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  defaultValue={userAddress2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    defaultValue={userCity}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="county" className="block text-sm font-semibold text-gray-700 mb-2">
                    County
                  </label>
                  <input
                    type="text"
                    id="county"
                    name="county"
                    defaultValue={userCounty}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="County (optional)"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postcode" className="block text-sm font-semibold text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    required
                    defaultValue={userPostcode}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    defaultValue={userCountry}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="United Kingdom"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name/Description *
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="e.g., A4 Flyers, 350gsm Gloss"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="e.g., 1000 units"
                />
              </div>
            </div>
          </div>

          {/* Competitor Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Competitor Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="competitorName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Competitor Name *
                </label>
                <input
                  type="text"
                  id="competitorName"
                  name="competitorName"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Competitor company name"
                />
              </div>

              <div>
                <label htmlFor="competitorPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Competitor's Price (excluding VAT) *
                </label>
                <input
                  type="text"
                  id="competitorPrice"
                  name="competitorPrice"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="£99.99"
                />
                <p className="text-xs text-gray-600 mt-1">Enter the competitor's price without VAT</p>
              </div>

              <div>
                <label htmlFor="competitorUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                  Competitor's Website/Quote URL *
                </label>
                <input
                  type="url"
                  id="competitorUrl"
                  name="competitorUrl"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="https://competitor.com/product"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Any additional details that might help us process your request..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Price Match Request'}</span>
            </button>
            <p className="text-sm text-gray-600 mt-4 text-center">
              We'll review your request and respond within 24 hours
            </p>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6">
          <Link 
            href="/lowest-price-promise"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Our Lowest Price Promise
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
