'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, FileText, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface QuoteRequestFormProps {
    productName: string;
    selections: Array<{
        groupName: string;
        name: string;
        unit: string;
    }>;
}

export default function QuoteRequestForm({ productName, selections }: QuoteRequestFormProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Full Name (Required)"
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email (Required)"
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
            </div>
            <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                className="p-3 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />

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
