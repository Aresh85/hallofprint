'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { Package, ArrowLeft, Calendar, DollarSign, Truck, ChevronDown, ChevronUp } from 'lucide-react';

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
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
};

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

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
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {isQuote(order as any) ? 'Quote' : 'Order'} #{order.order_number}
                        </h3>
                        {isQuote(order as any) && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                            💬 QUOTE
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

                  {order.tracking_number && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-sm">
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-gray-700">Tracking: </span>
                        <span className="font-semibold text-gray-900 ml-1">{order.tracking_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Pay Now Button for Priced Quotes */}
                  {order.status === 'quote_priced' && (order as any).stripe_payment_url && (
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
                          className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg flex items-center"
                        >
                          <DollarSign className="w-5 h-5 mr-2" />
                          Pay Now
                        </a>
                      </div>
                    </div>
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
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">
                          {isQuote(order as any) ? 'Quote Items' : 'Order Items'}
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
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

                    {/* No items message for quotes without pricing */}
                    {(!order.order_items || order.order_items.length === 0) && isQuote(order as any) && (
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
