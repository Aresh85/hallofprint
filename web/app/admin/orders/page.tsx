'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, Search, Filter, Calendar, User, MapPin, DollarSign, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  tax: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_postcode: string;
  shipping_country: string;
  tracking_number?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
};

export default function AdminOrdersDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('[Orders Auth] User:', user?.email);
      
      if (!user) {
        console.log('[Orders Auth] No user, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user is operator or admin
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('[Orders Auth] Profile:', profile);
      console.log('[Orders Auth] Profile Error:', profileError);
      console.log('[Orders Auth] Role:', profile?.role);

      if (!profile || (profile.role !== 'operator' && profile.role !== 'admin')) {
        console.log('[Orders Auth] NOT admin/operator, redirecting to /account');
        router.push('/account');
        return;
      }

      console.log('[Orders Auth] Access granted!');
      setUserRole(profile.role);
      loadOrders();
    } catch (error) {
      console.error('[Orders Auth] Error:', error);
      router.push('/login');
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(term) ||
          order.customer_name.toLowerCase().includes(term) ||
          order.customer_email.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-600">View and manage all orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/account" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
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
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Processing</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-indigo-600">
              £{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {order.customer_name}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(order.created_at)}
                      </div>
                      <div className="flex items-center text-gray-900 font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        £{order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={order.payment_status}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer Info</p>
                    <p className="text-sm text-gray-900">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> Delivery Address
                    </p>
                    <p className="text-sm text-gray-900">{order.shipping_address_line1}</p>
                    {order.shipping_address_line2 && (
                      <p className="text-sm text-gray-600">{order.shipping_address_line2}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {order.shipping_city}, {order.shipping_postcode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shipping_country}</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="mt-4 flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                >
                  {expandedOrder === order.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      View Details ({order.order_items?.length || 0} items)
                    </>
                  )}
                </button>

                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × £{item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">
                            £{item.total_price.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">£{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VAT (20%):</span>
                        <span className="font-semibold">£{order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>£{order.total.toFixed(2)}</span>
                      </div>
                    </div>
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
