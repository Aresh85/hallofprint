'use client';

import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, FileText, Send, Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface QuoteRequestFormProps {
    productName: string;
    selections: Array<{
        groupName: string;
        name: string;
        unit: string;
    }>;
}

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

export default function QuoteRequestForm({ productName, selections }: QuoteRequestFormProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAddresses, setUserAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        details: '',
        product: productName,
        configuration: JSON.stringify(selections, null, 2), // Send selections as structured text
    });
    
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);
    
    const checkAuthAndLoadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setIsLoggedIn(false);
                return;
            }

            setIsLoggedIn(true);
            
            // Get user profile
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, email, mobile')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    name: profile.full_name || '',
                    email: user.email || profile.email || '',
                    phone: profile.mobile || ''
                }));
            }

            // Load user's addresses
            const { data: addresses } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (addresses) {
                setUserAddresses(addresses as Address[]);
                // Auto-select default address if exists
                const defaultAddress = addresses.find((addr: Address) => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setFile(selectedFile || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setMessage('');

        try {
            // Submit the form data to our native API
            const response = await fetch('/api/forms/quote-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus('success');
                setMessage('Quote request sent successfully! We will contact you shortly.');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    details: '',
                    product: productName,
                    configuration: JSON.stringify(selections, null, 2),
                });
                setFile(null);
            } else {
                throw new Error(result.message || 'Submission failed.');
            }

        } catch (error: any) {
            console.error('Form submission error:', error);
            setStatus('error');
            setMessage(`Failed to submit quote: ${error.message}`);
        }
    };

    const isSubmitting = status === 'submitting';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Product Details */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">{productName} Configuration</h3>
                <div className="text-sm text-gray-700">
                    {selections.map((sel, index) => (
                        <p key={index} className="flex justify-between border-b border-indigo-100 py-1 last:border-b-0">
                            <span className="font-semibold">{sel.groupName}:</span>
                            <span>{sel.name}</span>
                        </p>
                    ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-800">
                    Quote Required for this specific setup.
                </p>
            </div>
            
            {/* Contact Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Full Name"
                            required
                            disabled={isLoggedIn}
                            className={`p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        />
                        {isLoggedIn && (
                            <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input 
                            type="text" 
                            name="company"
                            placeholder="Your Company Ltd (optional)"
                            className="p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            disabled={isLoggedIn}
                            className={`p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        />
                        {isLoggedIn && (
                            <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="07700 900000"
                            disabled={isLoggedIn}
                            className={`p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        />
                        {isLoggedIn && formData.phone && (
                            <p className="text-xs text-green-600 mt-1">✓ Auto-filled from your account</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delivery Address Selection - Only for logged in users with addresses */}
            {isLoggedIn && userAddresses.length > 0 && (
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Delivery Address (Optional)
                    </label>
                    <select
                        id="address"
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a delivery address...</option>
                        {userAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                                {address.is_default && '⭐ '}
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                                , {address.city}, {address.postcode}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        Select from your saved addresses or{' '}
                        <Link href="/account/addresses" className="text-indigo-600 hover:text-indigo-800 underline">
                            manage addresses
                        </Link>
                    </p>
                </div>
            )}

            {/* Additional Details */}
            <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Tell us about your project, quantity needed, and timeline."
                rows={4}
                required
                className="p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            />

            {/* Note: File attachments can be added later via the upload-file page or email */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Need to attach files?</strong> After submitting, you can upload artwork files via our <a href="/upload-file" className="underline font-semibold">File Upload page</a> or reply to our confirmation email with your files attached.
                </p>
            </div>


            {/* Submission Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-xl transition-all duration-300 flex items-center justify-center ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
            >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting Quote...</>
                ) : (
                    <><Send className="w-5 h-5 mr-2" /> Request Quote</>
                )}
            </button>
            
            {/* Status Message */}
            {message && (
                <div className={`mt-4 p-4 rounded-lg flex items-center ${
                    status === 'success' ? 'bg-green-100 text-green-700' : 
                    status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {status === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : 
                     <XCircle className="w-5 h-5 mr-2" />}
                    {message}
                </div>
            )}
        </form>
    );
}
