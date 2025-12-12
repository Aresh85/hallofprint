'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Home, ChevronRight, CheckCircle, Send, AlertCircle, Briefcase, MapPin } from 'lucide-react';
import { supabase } from '@/lib/auth';

type Address = {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  is_default: boolean;
};

export default function RequestQuotePage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompanyAccount, setHasCompanyAccount] = useState(false);
  const [existingCompanyName, setExistingCompanyName] = useState('');
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    project_title: '',
    project_description: '',
    quantity: '',
    deadline: '',
    specifications: '',
    // Delivery Address
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    // Delivery Contact
    delivery_contact_name: '',
    delivery_contact_number: '',
    // Price Match
    price_match_requested: false,
    competitor_price: '',
    competitor_url: '',
    company_account_requested: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [descriptionHelper, setDescriptionHelper] = useState({
    show: false,
    hasSize: false,
    hasColor: false,
    hasPaper: false,
    hasFinish: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Analyze job description for completeness
  useEffect(() => {
    const description = formData.project_description.toLowerCase();
    
    // Only show helper if description has some content (50+ chars shows engagement)
    if (description.length < 50) {
      setDescriptionHelper(prev => ({ ...prev, show: false }));
      return;
    }

    // Check for size/dimensions
    const hasSize = /\b(a[0-9]|[0-9]+\s?(mm|cm|inch|"|x|×)|\d+x\d+|size|dimension|width|height)\b/i.test(description);
    
    // Check for color
    const hasColor = /\b(color|colour|cmyk|full.?color|black.?white|mono|pantone|rgb|4.?color|spot.?color)\b/i.test(description);
    
    // Check for paper type
    const hasPaper = /\b(gloss|matt|matte|uncoated|silk|gsm|card|paper|stock|weight|[0-9]+gsm)\b/i.test(description);
    
    // Check for finish
    const hasFinish = /\b(laminat|varnish|finish|coating|gloss|matt|foil|emboss|spot|binding|wire.?bind|corner|edge|round|cut)\b/i.test(description);

    setDescriptionHelper({
      show: true,
      hasSize,
      hasColor,
      hasPaper,
      hasFinish,
    });
  }, [formData.project_description]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        
        // Always set email from auth user
        const newFormData: any = {
          email: user.email || '',
        };

        // Get user profile - handle different possible field names
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profileError && profile) {
            // Try different field name variations for name
            newFormData.customer_name = profile.full_name || profile.name || profile.display_name || '';
            
            // Try different field name variations for company
            newFormData.company_name = profile.company_name || profile.company || '';

            // Check if they have a company account
            if (newFormData.company_name) {
              setHasCompanyAccount(true);
              setExistingCompanyName(newFormData.company_name);
            }
          }
        } catch (profileError) {
          console.log('Profile not found:', profileError);
        }

        // Load user's addresses
        try {
          const { data: addresses } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

          if (addresses && addresses.length > 0) {
            setUserAddresses(addresses as Address[]);
            
            // Get phone from default address if available
            const defaultAddress = addresses.find((addr: Address) => addr.is_default);
            if (defaultAddress && (defaultAddress as any).phone) {
              newFormData.phone = (defaultAddress as any).phone;
            }
          }
        } catch (addressError) {
          console.log('Address not found:', addressError);
        }

        // Update form data with all collected values
        setFormData(prev => ({
          ...prev,
          ...newFormData,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    
    if (addressId === '') {
      // Clear address fields if "Enter new address" is selected
      setFormData(prev => ({
        ...prev,
        address_line1: '',
        address_line2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom',
      }));
    } else {
      // Fill in the selected address
      const selectedAddress = userAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2 || '',
          city: selectedAddress.city,
          county: selectedAddress.county || '',
          postcode: selectedAddress.postcode,
          country: selectedAddress.country,
        }));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const newFileUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artwork-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          throw new Error('Upload failed');
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artwork-files')
          .getPublicUrl(fileName);

        newFileUrls.push(publicUrl);
      }

      setUploadedFiles(prev => [...prev, ...newFileUrls]);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload some files. Please try again or upload fewer files at once.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          file_urls: uploadedFiles,
          user_id: user?.id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Server error:', result);
        throw new Error(result.message || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(true);
      alert('Submission failed. Please check the console for details or contact us directly.');
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
              <span className="text-gray-900 font-medium">Request a Quote</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quote Request Submitted!</h1>
            <p className="text-gray-700 mb-6">
              Thank you for your quote request. Our team will review your requirements and get back to you within the hour during business hours (Monday-Friday, 9am-5pm).
            </p>
            
            {/* File Upload Status */}
            {uploadedFiles.length > 0 ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-bold text-green-800">
                    Artwork files uploaded! ✓
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  We have received {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} and can begin reviewing your quote immediately.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>📄 No artwork files uploaded yet?</strong>
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  No problem! You can upload your files later using our{' '}
                  <Link href="/upload-artwork" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                    File Upload page
                  </Link>
                  {' '}or wait for our team to reach out after reviewing your quote.
                </p>
              </div>
            )}

            {isLoggedIn && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Track your quote:</strong> Visit your orders page to see the status of this quote. Once approved and priced, you can make payment directly from there.
                </p>
                <Link 
                  href="/account/orders"
                  className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  View My Orders
                </Link>
              </div>
            )}
            
            <div className="space-x-4">
              <Link 
                href="/products"
                className="inline-block bg-gray-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
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
            <span className="text-gray-900 font-medium">Request a Quote</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Request a Quote</h1>
          <p className="text-gray-600">
            Upload your print-ready files and we'll provide you with a detailed quote tailored to your needs.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Our team will review your files and respond within the hour (business hours)</li>
            <li>• We'll provide a detailed quote with pricing and turnaround time</li>
            <li>• You can approve the quote and we'll convert it to an order</li>
            <li>• No obligation - you're free to accept or decline</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800">
              There was an error submitting your request. Please try again or contact us directly at aresh@inteeka.com
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    disabled={isLoggedIn}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors ${
                      isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="John Smith"
                  />
                  {isLoggedIn && formData.customer_name && (
                    <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Your Company Ltd (optional)"
                  />
                  {isLoggedIn && formData.company_name && (
                    <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoggedIn}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors ${
                      isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="john@example.com"
                  />
                  {isLoggedIn && formData.email && (
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
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="07123 456789"
                  />
                  {isLoggedIn && formData.phone && (
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from your account (you can change if needed)</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>
            <div className="space-y-4">
              {/* Address Selector - Only for logged in users with addresses */}
              {isLoggedIn && userAddresses.length > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <label htmlFor="saved_address" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Choose from your saved addresses
                  </label>
                  <select
                    id="saved_address"
                    value={selectedAddressId}
                    onChange={handleAddressSelection}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Enter a new address below...</option>
                    {userAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.is_default && '⭐ '}
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                        , {address.city}, {address.postcode}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    Select a saved address or enter a new one below. You can{' '}
                    <Link href="/account/addresses" className="text-indigo-600 hover:text-indigo-800 underline">
                      manage your addresses
                    </Link>
                    {' '}in your account.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="address_line1" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  required
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label htmlFor="address_line2" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
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
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label htmlFor="county" className="block text-sm font-semibold text-gray-700 mb-2">
                    County/State
                  </label>
                  <input
                    type="text"
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Greater London (optional)"
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
                    value={formData.postcode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Delivery Contact */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-amber-900 mb-3">📦 Delivery Contact Details</h3>
                <p className="text-xs text-gray-700 mb-3">Who should we contact when the delivery arrives?</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="delivery_contact_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Contact Name
                    </label>
                    <input
                      type="text"
                      id="delivery_contact_name"
                      name="delivery_contact_name"
                      value={formData.delivery_contact_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="delivery_contact_number" className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Contact Number
                    </label>
                    <input
                      type="tel"
                      id="delivery_contact_number"
                      name="delivery_contact_number"
                      value={formData.delivery_contact_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="07123 456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Print Job Details */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Print Job Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="project_title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="project_title"
                  name="project_title"
                  required
                  value={formData.project_title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="e.g., Business Cards, Flyers, Posters"
                />
              </div>

              <div>
                <label htmlFor="project_description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="project_description"
                  name="project_description"
                  required
                  value={formData.project_description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Tell us what you need printed - size, paper type, colors, finishing, etc."
                />
                
                {/* Smart Job Description Helper */}
                {descriptionHelper.show && (
                  <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm font-bold text-gray-900 mb-3">📋 Quick Check - Your description includes:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`flex items-center space-x-2 ${descriptionHelper.hasSize ? 'text-green-700' : 'text-gray-500'}`}>
                        {descriptionHelper.hasSize ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Size/Dimensions ✓</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center text-gray-400">○</span>
                            <span>Size (e.g., A4, 210x297mm)</span>
                          </>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${descriptionHelper.hasColor ? 'text-green-700' : 'text-gray-500'}`}>
                        {descriptionHelper.hasColor ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Color ✓</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center text-gray-400">○</span>
                            <span>Color (e.g., CMYK, B&W)</span>
                          </>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${descriptionHelper.hasPaper ? 'text-green-700' : 'text-gray-500'}`}>
                        {descriptionHelper.hasPaper ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Paper Type ✓</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center text-gray-400">○</span>
                            <span>Paper (e.g., 150gsm gloss)</span>
                          </>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${descriptionHelper.hasFinish ? 'text-green-700' : 'text-gray-500'}`}>
                        {descriptionHelper.hasFinish ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Finish ✓</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center text-gray-400">○</span>
                            <span>Finish (e.g., wire binding, corner edges)</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {(descriptionHelper.hasSize && descriptionHelper.hasColor && descriptionHelper.hasPaper) ? (
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <p className="text-xs text-green-700 font-semibold">
                          ✓ Great! You've included the key details we need to provide an accurate quote.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <p className="text-xs text-gray-600">
                          <strong>Tip:</strong> Including these details helps us provide a faster, more accurate quote. Don't worry if you're missing something - we can always follow up!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Artwork Files
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.zip"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, AI, PSD, JPG, PNG, ZIP</p>
                {uploadingFile && <p className="text-sm text-indigo-600 mt-2">Uploading...</p>}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                    {uploadedFiles.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="truncate">File {index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="e.g., 1000 units"
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>


              <div>
                <label htmlFor="specifications" className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Specifications
                </label>
                <textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Any specific requirements, materials, colors, or special requests..."
                />
              </div>
            </div>
          </div>

          {/* Price Match & Company Account */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="price_match_requested"
                name="price_match_requested"
                checked={formData.price_match_requested}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="flex-1">
                <label htmlFor="price_match_requested" className="text-sm font-semibold text-gray-900 cursor-pointer">
                  Would you like us to price match?
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  If you've found a lower price elsewhere, we'll beat it by 5%
                </p>
              </div>
            </div>

            {formData.price_match_requested && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="competitor_price" className="block text-sm font-semibold text-gray-700 mb-2">
                    Competitor's Price (excluding VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">£</span>
                    <input
                      type="number"
                      id="competitor_price"
                      name="competitor_price"
                      required={formData.price_match_requested}
                      value={formData.competitor_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="99.99"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the competitor's price without VAT</p>
                </div>

                <div>
                  <label htmlFor="competitor_url" className="block text-sm font-semibold text-gray-700 mb-2">
                    Competitor's Website/Quote URL *
                  </label>
                  <input
                    type="url"
                    id="competitor_url"
                    name="competitor_url"
                    required={formData.price_match_requested}
                    value={formData.competitor_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="https://competitor.com/product"
                  />
                  <p className="text-xs text-gray-500 mt-1">Link to the competitor's product or quote</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800">
                    🎯 We'll beat their price by 5%!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Our team will review and provide you with a better quote
                  </p>
                </div>
              </div>
            )}

            {/* Company Account Section */}
            {hasCompanyAccount ? (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      You have an existing company account
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      This quote will be automatically assigned to <strong>{existingCompanyName}</strong>
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="company_account_requested"
                        name="company_account_requested"
                        checked={formData.company_account_requested}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="company_account_requested" className="text-xs text-gray-700 cursor-pointer">
                        Check this box if you want to create a <strong>separate/new</strong> company account instead
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="company_account_requested"
                  name="company_account_requested"
                  checked={formData.company_account_requested}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <label htmlFor="company_account_requested" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    Would you like us to set up a company account?
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Allow your colleagues to order under your company name with streamlined billing
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Quote Request'}</span>
            </button>
            <p className="text-sm text-gray-600 mt-4 text-center">
              We'll review your request and respond within the hour (business hours)
            </p>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6">
          <Link 
            href="/products"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Browse Our Products
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
