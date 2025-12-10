'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Search, Filter, Mail, Phone, Calendar, PoundSterling, CheckCircle, XCircle, Clock, ArrowRight, Edit2, Save, X as XIcon, FileText } from 'lucide-react';

interface QuoteRequest {
  id: string;
  created_at: string;
  customer_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  project_title: string;
  project_description: string;
  quantity?: string;
  deadline?: string;
  specifications?: string;
  file_urls?: string[];
  price_match_requested?: boolean;
  competitor_url?: string;
  company_account_requested?: boolean;
  status: string;
  admin_notes?: string;
  customer_notes?: string;
  operator_assigned?: string;
  delivery_time_estimate?: string;
  tax_applicable?: boolean;
  tax_type?: string;
  payment_required?: boolean;
  payment_deadline?: string;
  quoted_price?: number;
  quote_valid_until?: string;
  order_id?: string;
  converted_at?: string;
}

export default function QuoteDashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteRequest | null>(null);
  const [operators, setOperators] = useState<any[]>([]);

  useEffect(() => {
    checkAccess();
    fetchQuotes();
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/admin/operators');
      const data = await response.json();
      setOperators(data.operators || []);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const checkAccess = async () => {
    // You can implement admin check here
    // For now, we'll rely on the service role key
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/admin/quotes');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quotes');
      }
      
      setQuotes(data.quotes || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (id: string, updates: Partial<QuoteRequest>) => {
    try {
      // Check if status is being changed to accepted_no_payment
      if (updates.status === 'accepted_no_payment') {
        if (!confirm('⚠️ WARNING: You are accepting this quote without payment requirement. This is an exception case and will notify management. Are you sure?')) {
          return;
        }
      }

      const response = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update quote');
      }
      
      await fetchQuotes();
      setEditingQuote(null);
      setSelectedQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote');
    }
  };

  const convertToOrder = async (quote: QuoteRequest) => {
    if (!quote.quoted_price) {
      alert('Please add a quoted price before converting to order');
      return;
    }

    if (!confirm('Convert this quote to an order? This will create a new order record.')) {
      return;
    }

    try {
      const response = await fetch('/api/orders/create-from-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert quote');
      }

      alert('Quote successfully converted to order!');
      router.push(`/admin/orders-enhanced`);
    } catch (error) {
      console.error('Error converting to order:', error);
      alert('Failed to convert quote to order');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.project_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      quoted: 'bg-green-100 text-green-800',
      accepted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      converted_to_order: 'bg-indigo-100 text-indigo-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewing':
        return <Filter className="w-4 h-4" />;
      case 'quoted':
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'converted_to_order':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quotes...</p>
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
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quote Requests Dashboard</h1>
                <p className="text-sm text-gray-600">{quotes.length} total requests</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/orders-enhanced')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Orders
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="converted_to_order">Converted to Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No quote requests found</p>
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{quote.project_title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">{quote.customer_name}</span>
                        {quote.company_name && <span>· {quote.company_name}</span>}
                        <span>· {new Date(quote.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      <span className="capitalize">{quote.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{quote.project_description}</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{quote.email}</span>
                    </div>
                    {quote.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{quote.phone}</span>
                      </div>
                    )}
                    {quote.deadline && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(quote.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {quote.quoted_price && (
                    <div className="flex items-center space-x-2 text-lg font-bold text-green-600 mb-4">
                      <PoundSterling className="w-5 h-5" />
                      <span>£{quote.quoted_price.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View Details
                    </button>
                    {quote.status === 'quoted' && !quote.order_id && (
                      <button
                        onClick={() => convertToOrder(quote)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Convert to Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Quote Details</h2>
              <button
                onClick={() => {
                  setSelectedQuote(null);
                  setEditingQuote(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedQuote.customer_name}</p>
                  </div>
                  {selectedQuote.company_name && (
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{selectedQuote.company_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedQuote.email}</p>
                  </div>
                  {selectedQuote.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedQuote.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {(selectedQuote as any).address_line1 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{(selectedQuote as any).address_line1}</p>
                    {(selectedQuote as any).address_line2 && <p className="text-gray-700">{(selectedQuote as any).address_line2}</p>}
                    <p className="text-gray-700">
                      {(selectedQuote as any).city}, {(selectedQuote as any).postcode}
                    </p>
                    {(selectedQuote as any).county && <p className="text-gray-700">{(selectedQuote as any).county}</p>}
                    <p className="text-gray-700">{(selectedQuote as any).country || 'United Kingdom'}</p>
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Project Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Project Title</p>
                    <p className="font-medium">{selectedQuote.project_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-800">{selectedQuote.project_description}</p>
                  </div>
                  {selectedQuote.specifications && (
                    <div>
                      <p className="text-sm text-gray-600">Specifications</p>
                      <p className="text-gray-800">{selectedQuote.specifications}</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedQuote.quantity && (
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{selectedQuote.quantity}</p>
                      </div>
                    )}
                    {selectedQuote.deadline && (
                      <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="font-medium">{new Date(selectedQuote.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Files */}
                  {selectedQuote.file_urls && selectedQuote.file_urls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Uploaded Files</p>
                      <div className="space-y-2">
                        {selectedQuote.file_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <FileText className="w-4 h-4" />
                            <span>File {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Requests */}
              {(selectedQuote.price_match_requested || selectedQuote.company_account_requested) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Requests</h3>
                  <div className="space-y-3">
                    {selectedQuote.price_match_requested && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="font-semibold text-gray-900 mb-2">Price Match Requested</p>
                        <p className="text-sm text-gray-700 mb-2">Customer wants us to match competitor pricing</p>
                        {(selectedQuote as any).competitor_price && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">Competitor's Price (excl. VAT)</p>
                            <p className="text-lg font-bold text-green-600">£{(selectedQuote as any).competitor_price}</p>
                          </div>
                        )}
                        {selectedQuote.competitor_url && (
                          <a
                            href={selectedQuote.competitor_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 underline inline-flex items-center space-x-1"
                          >
                            <span>View Competitor Link</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                    {selectedQuote.company_account_requested && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold text-gray-900 mb-1">Company Account Requested</p>
                        <p className="text-sm text-gray-700">
                          Customer wants to set up a company account for team ordering
                          {selectedQuote.company_name && ` for ${selectedQuote.company_name}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quote Management */}
              {editingQuote?.id === selectedQuote.id ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Update Quote</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editingQuote.status}
                        onChange={(e) => setEditingQuote({ ...editingQuote, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted (Requires Payment)</option>
                        <option value="accepted_no_payment">Accepted (No Payment - Exception)</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingQuote.quoted_price || ''}
                        onChange={(e) => setEditingQuote({ ...editingQuote, quoted_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., 122.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operator Assigned</label>
                      <select
                        value={editingQuote.operator_assigned || ''}
                        onChange={(e) => setEditingQuote({ ...editingQuote, operator_assigned: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select operator...</option>
                        {operators.map((op) => (
                          <option key={op.id} value={op.full_name}>
                            {op.full_name} ({op.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Time</label>
                      <input
                        type="text"
                        value={editingQuote.delivery_time_estimate || ''}
                        onChange={(e) => setEditingQuote({ ...editingQuote, delivery_time_estimate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., 3-5 business days"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={editingQuote.tax_applicable || false}
                          onChange={(e) => setEditingQuote({ ...editingQuote, tax_applicable: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span>Tax Applicable</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        UK: VAT 20% | EU: Reverse charge with VAT number | Non-EU: No VAT
                      </p>
                    </div>
                    {editingQuote.tax_applicable && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type</label>
                        <select
                          value={editingQuote.tax_type || ''}
                          onChange={(e) => setEditingQuote({ ...editingQuote, tax_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select tax type</option>
                          <option value="UK_VAT_20">UK VAT (20%)</option>
                          <option value="EU_REVERSE_CHARGE">EU Reverse Charge</option>
                          <option value="NON_EU_EXEMPT">Non-EU (Exempt)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes (Shared via Email)</label>
                    <textarea
                      rows={3}
                      value={editingQuote.customer_notes || ''}
                      onChange={(e) => setEditingQuote({ ...editingQuote, customer_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Notes that will be sent to the customer via email..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      These notes will be included in the customer notification email
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Internal Only)</label>
                    <textarea
                      rows={3}
                      value={editingQuote.admin_notes || ''}
                      onChange={(e) => setEditingQuote({ ...editingQuote, admin_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Internal notes about this quote (not shared with customer)..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateQuote(editingQuote.id, editingQuote)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditingQuote(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingQuote(selectedQuote)}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Quote</span>
                  </button>
                  {selectedQuote.status === 'quoted' && !selectedQuote.order_id && (
                    <button
                      onClick={() => convertToOrder(selectedQuote)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Convert to Order</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
