'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Home, ChevronRight, PoundSterling, Calendar, FileText, CreditCard, ArrowRight } from 'lucide-react';

interface Quote {
  id: string;
  created_at: string;
  project_title: string;
  project_description: string;
  status: string;
  quoted_price?: number;
  customer_notes?: string;
  delivery_time_estimate?: string;
  tax_applicable?: boolean;
  tax_type?: string;
  operator_assigned?: string;
  deadline?: string;
  quantity?: string;
  file_urls?: string[];
  payment_required?: boolean;
  order_id?: string;
  paid_at?: string;
}

export default function MyQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndFetchQuotes();
  }, []);

  const checkUserAndFetchQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch quotes for this user
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
      } else {
        setQuotes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
      quoted: 'bg-green-100 text-green-800 border-green-200',
      accepted: 'bg-purple-100 text-purple-800 border-purple-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      converted_to_order: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewing':
        return <AlertCircle className="w-4 h-4" />;
      case 'quoted':
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'converted_to_order':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const acceptedQuotes = quotes.filter(q => q.status === 'accepted' && !q.order_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/account" className="hover:text-indigo-600">
              My Account
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">My Quotes</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
              <p className="text-gray-600">{quotes.length} quote{quotes.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
          <Link
            href="/request-quote"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Request New Quote
          </Link>
        </div>

        {/* Awaiting Payment Banner */}
        {acceptedQuotes.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Action Required</h2>
            </div>
            <p className="text-purple-100 mb-4">
              You have {acceptedQuotes.length} accepted quote{acceptedQuotes.length !== 1 ? 's' : ''} awaiting payment
            </p>
            <p className="text-sm text-purple-100">
              Please complete payment to proceed with your order
            </p>
          </div>
        )}

        {/* Quotes List */}
        {quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Quotes Yet</h2>
            <p className="text-gray-600 mb-6">You haven't requested any quotes yet</p>
            <Link
              href="/request-quote"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Request Your First Quote
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  quote.status === 'accepted' && !quote.order_id ? 'border-2 border-purple-300' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{quote.project_title}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Submitted: {new Date(quote.created_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {quote.paid_at && (
                          <p className="text-sm text-green-600 font-semibold flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paid: {new Date(quote.paid_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusBadge(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      <span className="capitalize">{quote.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{quote.project_description}</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {quote.quantity && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Quantity:</span> {quote.quantity}
                      </div>
                    )}
                    {quote.deadline && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(quote.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {quote.delivery_time_estimate && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Delivery:</span> {quote.delivery_time_estimate}
                      </div>
                    )}
                  </div>

                  {quote.quoted_price && (
                    <div className="text-2xl font-bold text-green-600 mb-4">
                      <span>£{quote.quoted_price.toFixed(2)}</span>
                      {quote.tax_applicable && (
                        <span className="text-sm text-gray-600 font-normal ml-2">+ {quote.tax_type || 'tax'}</span>
                      )}
                    </div>
                  )}

                  {quote.customer_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Notes from Hall of Print</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{quote.customer_notes}</p>
                    </div>
                  )}

                  {quote.file_urls && quote.file_urls.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Files</p>
                      <div className="flex flex-wrap gap-2">
                        {quote.file_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded"
                          >
                            <FileText className="w-4 h-4" />
                            <span>File {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {quote.status === 'accepted' && !quote.order_id && quote.quoted_price && (
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">✅ Quote Accepted! Ready to proceed?</p>
                          <p className="text-sm text-gray-600">Complete payment to start your order</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/checkout/quote', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ quoteId: quote.id }),
                              });
                              const data = await response.json();
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                alert('Failed to create checkout session');
                              }
                            } catch (error) {
                              console.error('Checkout error:', error);
                              alert('Failed to start checkout');
                            }
                          }}
                          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {quote.order_id && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300 shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-green-500 rounded-full p-2">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-900">✓ Paid & Confirmed!</p>
                          <p className="text-sm text-green-700">Your quote has been accepted and paid</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg mb-3">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Status:</strong> Your order is now active and ready for processing
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Next Steps:</strong> Our team has been alerted and will begin processing your order
                        </p>
                      </div>
                      <Link
                        href="/account/orders"
                        className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        <span>View Order Status</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/account" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
