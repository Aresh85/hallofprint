'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { Package, ArrowLeft, Calendar, DollarSign, Truck, ChevronDown, ChevronUp, FileText, Upload, AlertTriangle } from 'lucide-react';

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status?: string;
  total: number;
  currency: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_postcode: string;
  tracking_number?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  order_files?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_by: string;
    uploaded_at: string;
    uploader?: {
      full_name: string;
    };
  }>;
};

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'quotes') {
          return isQuote(order as any) && order.payment_status !== 'paid';
        }
        if (statusFilter === 'paid') {
          return order.payment_status === 'paid';
        }
        if (statusFilter === 'pending_payment') {
          return order.status === 'quote_priced' && order.payment_status !== 'paid';
        }
        return order.status === statusFilter;
      });
    }
    
    setFilteredOrders(filtered);
  };

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_sundries (*),
          order_files (
            id,
            file_url,
            file_name,
            file_type,
            file_size,
            uploaded_by,
            uploaded_at,
            uploader:uploaded_by (full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false});

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      // Quote statuses
      case 'quote_pending':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'quote_reviewed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'quote_priced':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quote_accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      // Order statuses
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'dispatched':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'quote_pending': return 'Quote: Pending Review';
      case 'quote_reviewed': return 'Quote: Under Review';
      case 'quote_priced': return 'Quote: Priced';
      case 'quote_accepted': return 'Quote: Accepted';
      default: return status.replace('_', ' ').toUpperCase();
    }
  };

  const isQuote = (order: any) => {
    return order.order_type === 'quote' || order.order_type === 'price_match';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order History</h1>

        {/* Filter Dropdown */}
        {orders.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Orders:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="quotes">Quotes Only ({orders.filter(o => isQuote(o as any) && o.payment_status !== 'paid').length})</option>
              <option value="paid">Paid Orders ({orders.filter(o => o.payment_status === 'paid').length})</option>
              <option value="pending_payment">Pending Payment ({orders.filter(o => o.status === 'quote_priced' && o.payment_status !== 'paid').length})</option>
              <option value="processing">In Production ({orders.filter(o => o.status === 'processing').length})</option>
            </select>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.payment_status === 'paid' ? 'Order' : (isQuote(order as any) ? 'Quote' : 'Order')} #{order.order_number}
                        </h3>
                        {/* Show ORDER badge if paid, otherwise show QUOTE badge */}
                        {order.payment_status === 'paid' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                            📦 ORDER
                          </span>
                        ) : (
                          isQuote(order as any) && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                              💬 QUOTE
                            </span>
                          )
                        )}
                        {/* Show PRICE MATCH badge if applicable */}
                        {(order as any).order_type === 'price_match' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            🎯 PRICE MATCH
                          </span>
                        )}
                        {/* Production Status */}
                        {(order as any).production_status && (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            (order as any).production_status === 'not_started' ? 'bg-gray-100 text-gray-800' :
                            (order as any).production_status === 'design_in_progress' ? 'bg-purple-100 text-purple-800' :
                            (order as any).production_status === 'awaiting_proof_approval' ? 'bg-yellow-100 text-yellow-800' :
                            (order as any).production_status === 'printing' ? 'bg-blue-100 text-blue-800' :
                            (order as any).production_status === 'finishing' ? 'bg-cyan-100 text-cyan-800' :
                            (order as any).production_status === 'ready_for_dispatch' ? 'bg-green-100 text-green-800' :
                            (order as any).production_status === 'dispatched' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {(order as any).production_status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      {(order as any).project_title && (
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {(order as any).project_title}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-gray-900">
                        £{order.total.toFixed(2)}
                      </p>
                      {/* Payment Status */}
                      {order.payment_status === 'paid' && (
                        <div className="mt-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <p className="text-xs font-semibold text-green-800 mb-1">✅ Paid</p>
                          {(order as any).paid_at && (
                            <p className="text-xs text-green-700">
                              {new Date((order as any).paid_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          {(order as any).payment_method_brand && (order as any).payment_method_last4 && (
                            <p className="text-xs text-green-700">
                              {(order as any).payment_method_brand.toUpperCase()} •••• {(order as any).payment_method_last4}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.shipping_address_line1}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_city}, {order.shipping_postcode}
                      </p>
                    </div>
                  </div>

                  {/* File Status */}
                  <div className="mb-4">
                    {(order as any).file_urls && (order as any).file_urls.length > 0 ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center text-sm">
                          <FileText className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-green-800 font-semibold">
                            {(order as any).file_urls.length} file(s) uploaded
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center text-sm">
                          <Upload className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-yellow-800 font-semibold">
                            Pending file upload
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {order.tracking_number && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-sm">
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-gray-700">Tracking: </span>
                        <span className="font-semibold text-gray-900 ml-1">{order.tracking_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Pay Now Button or Status for Priced Quotes */}
                  {order.status === 'quote_priced' && order.payment_status !== 'paid' && (
                    <>
                      {(order as any).stripe_payment_url ? (
                        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900 mb-1">💰 Your Quote is Ready!</p>
                              <p className="text-sm text-gray-600">
                                Total: <span className="font-bold text-green-700">£{order.total.toFixed(2)}</span> (incl. VAT)
                              </p>
                            </div>
                            <a
                              href={(order as any).stripe_payment_url}
                              className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                            >
                              Pay Now
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                          <div>
                            <p className="font-bold text-gray-900 mb-1">✅ Quote Approved!</p>
                            <p className="text-sm text-gray-600 mb-1">
                              Total: <span className="font-bold text-indigo-700">£{order.total.toFixed(2)}</span> (incl. VAT)
                            </p>
                            <p className="text-sm text-gray-600">
                              We're preparing your payment link. You'll receive an email shortly with payment instructions.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                  >
                    {expandedOrder === order.id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide Items
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View Items ({order.order_items?.length || 0})
                      </>
                    )}
                  </button>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t bg-gray-50 p-6">
                    {/* Uploaded Files Section */}
                    {(order as any).file_urls && (order as any).file_urls.length > 0 && (
                      <div className="mb-6 border-b pb-4">
                        <h4 className="font-bold text-gray-900 mb-3">📎 Uploaded Files</h4>
                        <div className="space-y-2 mb-4">
                          {/* Show metadata if available */}
                          {order.order_files && order.order_files.length > 0 ? (
                            order.order_files.map((file) => (
                              <a
                                key={file.id}
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white p-3 rounded border hover:border-indigo-400 hover:shadow transition-all"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 truncate">
                                        {file.file_name}
                                      </p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                                        <span>Type: {file.file_type.split('/').pop()}</span>
                                        <span>Size: {formatFileSize(file.file_size)}</span>
                                        <span>
                                          Uploaded: {new Date(file.uploaded_at).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        {file.uploader?.full_name && (
                                          <span>By: {file.uploader.full_name}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-indigo-600 text-sm font-semibold ml-2 flex-shrink-0">→</span>
                                </div>
                              </a>
                            ))
                          ) : (
                            /* Fallback to legacy file_urls display */
                            <>
                              {(order as any).file_urls.map((url: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border">
                                  <div className="flex items-center">
                                    <FileText className="w-4 h-4 text-indigo-600 mr-2" />
                                    <span className="text-sm text-gray-700">File {idx + 1} (legacy)</span>
                                  </div>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                                  >
                                    View File →
                                  </a>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                        
                        {/* File Update Warning & Upload */}
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                          <div className="flex items-start mb-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-bold text-yellow-900 text-sm mb-1">
                                Need to Update Your Files?
                              </h5>
                              <p className="text-xs text-yellow-800 mb-2">
                                ⚠️ Uploading new files may affect your quote pricing or delivery timeline. 
                                Our team will review and contact you if adjustments are needed.
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/upload-artwork?order_id=${order.id}&order_number=${order.order_number}`}
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Updated Files
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Quote Details */}
                    {isQuote(order as any) && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-3">Quote Details</h4>
                        {(order as any).project_description && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-700">Description:</p>
                            <p className="text-sm text-gray-600">{(order as any).project_description}</p>
                          </div>
                        )}
                        {(order as any).quantity && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Quantity:</span> {(order as any).quantity}
                          </p>
                        )}
                        {(order as any).specifications && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700">Specifications:</p>
                            <p className="text-sm text-gray-600">{(order as any).specifications}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Items */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">
                          {isQuote(order as any) ? 'Quote Items' : 'Order Items'}
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                              <div>
                                <p className="font-semibold text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-gray-900">
                                £{item.total_price.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sundries (Additional Charges) */}
                    {(order as any).order_sundries && (order as any).order_sundries.length > 0 && (
                      <div className="mb-6 border-t pt-4">
                        <h4 className="font-bold text-gray-900 mb-4">Additional Charges</h4>
                        <div className="space-y-2">
                          {(order as any).order_sundries.map((sundry: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-yellow-50 p-3 rounded">
                              <div>
                                <p className="font-semibold text-gray-900">{sundry.description}</p>
                                <p className="text-sm text-gray-600">
                                  Qty: {sundry.quantity} × £{sundry.unit_price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-bold text-gray-900">£{sundry.total_price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {(order as any).subtotal && (
                      <div className="border-t pt-4 space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">£{(order as any).subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">VAT (20%):</span>
                          <span className="font-semibold">£{(order as any).tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>£{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {(order as any).operator_customer_notes && (
                      <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-2 text-sm">📝 Message from our team:</h4>
                          <p className="text-sm text-gray-700">{(order as any).operator_customer_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* No items message for quotes without pricing */}
                    {(!order.order_items || order.order_items.length === 0) && 
                     (!(order as any).order_sundries || (order as any).order_sundries.length === 0) && 
                     isQuote(order as any) && (
                      <p className="text-sm text-gray-500 italic">
                        This quote is pending pricing from our team.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
