'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FileText, Search, Filter, Calendar, Mail, Phone, Package, DollarSign, ExternalLink, StickyNote, ShoppingCart } from 'lucide-react';

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
  notes?: string;
  updated_at: string;
};

export default function PriceMatchDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<PriceMatchRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PriceMatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PriceMatchRequest | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, requests]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is operator or admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'operator' && profile.role !== 'admin')) {
        router.push('/account');
        return;
      }

      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('price_match_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.name.toLowerCase().includes(term) ||
          req.email.toLowerCase().includes(term) ||
          req.product_name.toLowerCase().includes(term) ||
          req.competitor_name.toLowerCase().includes(term)
      );
    }

    setFilteredRequests(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('price_match_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const createOrder = async (priceMatchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ask if VAT should be applied
    const includeVAT = confirm('Apply VAT to this order?\n\nClick OK to include 20% VAT\nClick Cancel for no VAT (VAT-exempt products)');

    try {
      const response = await fetch('/api/orders/create-from-price-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceMatchId,
          includeVAT 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert(`Success! ${data.message}`);
      fetchRequests();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Price Match Dashboard</h1>
                <p className="text-sm text-gray-600">Manage price match requests</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-indigo-600">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, product, or competitor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Contacted</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter((r) => r.status === 'contacted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter((r) => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{request.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {request.email}
                      </div>
                      {request.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {request.phone}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                  <select
                    value={request.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(request.id, e.target.value);
                    }}
                    className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <Package className="w-3 h-3 mr-1" /> Product
                    </p>
                    <p className="font-semibold text-gray-900">{request.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" /> Competitor
                    </p>
                    <p className="font-semibold text-gray-900">{request.competitor_name}</p>
                    <p className="text-sm text-gray-600">Price: {request.competitor_price}</p>
                    <a
                      href={request.competitor_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View competitor site
                    </a>
                  </div>
                </div>

                {request.additional_info && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <StickyNote className="w-3 h-3 mr-1" /> Additional Information
                    </p>
                    <p className="text-sm text-gray-700">{request.additional_info}</p>
                  </div>
                )}

                {/* Create Order Button for Approved Requests */}
                {request.status === 'approved' && !request.notes?.includes('Order') && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={(e) => createOrder(request.id, e)}
                      className="flex items-center space-x-2 bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Create Order (Beat by 5%)</span>
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      This will create an order at 5% below the competitor's price
                    </p>
                  </div>
                )}

                {/* Show order info if already created */}
                {request.notes?.includes('Order') && (
                  <div className="mt-4 pt-4 border-t bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-900 font-semibold">✓ {request.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
