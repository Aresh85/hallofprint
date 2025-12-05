'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { ArrowLeft, FileText, Calendar, Package, DollarSign, ExternalLink, Clock } from 'lucide-react';

type PriceMatchRequest = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  product_name: string;
  quantity: string;
  competitor_name: string;
  competitor_price: string;
  competitor_url: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
};

export default function MyPriceMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PriceMatchRequest[]>([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');

      // Get all price match requests that match this user's email
      const { data, error } = await supabase
        .from('price_match_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Approved';
      case 'contacted':
        return 'We\'ve Been in Touch';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/account" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Price Match Requests</h1>
        <p className="text-gray-600 mb-8">
          Track the status of your price match submissions
        </p>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Price Match Requests</h2>
            <p className="text-gray-600 mb-6">
              You haven't submitted any price match requests yet.
            </p>
            <Link
              href="/price-match-request"
              className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit a Price Match Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {request.product_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Submitted {formatDate(request.created_at)}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <Package className="w-3 h-3 mr-1" /> Product Details
                    </p>
                    <p className="text-sm text-gray-700">Quantity: {request.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" /> Competitor
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{request.competitor_name}</p>
                    <p className="text-sm text-gray-700">Price: {request.competitor_price}</p>
                  </div>
                </div>

                {request.competitor_url && (
                  <a
                    href={request.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View competitor listing
                  </a>
                )}

                {request.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900">Under Review</p>
                        <p className="text-sm text-yellow-800">
                          We're reviewing your request and will get back to you soon.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'contacted' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      We've been in touch regarding this request. Check your email for details.
                    </p>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-900">✓ Price Match Approved!</p>
                    <p className="text-sm text-green-800">
                      Great news! We've approved your price match. Check your email for next steps.
                    </p>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      Unfortunately, we couldn't match this price at this time.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/price-match-request"
            className="inline-block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Submit Another Price Match Request →
          </Link>
        </div>
      </div>
    </div>
  );
}
