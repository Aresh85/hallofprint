'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Package, Search, Filter, Calendar, User, MapPin, DollarSign, 
  ChevronDown, ChevronUp, ArrowLeft, Plus, Save, X, Clock,
  AlertCircle, CheckCircle, Flag, FileText, CreditCard
} from 'lucide-react';

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
  file_urls?: string[];
  // New fields
  operator_notes?: string;
  customer_notes?: string;
  operator_customer_notes?: string;
  stripe_payment_intent_id?: string;
  stripe_payment_status?: string;
  production_status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  // Timestamp fields
  operator_notes_updated_at?: string;
  operator_notes_updated_by?: string;
  operator_customer_notes_updated_at?: string;
  operator_customer_notes_updated_by?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  order_sundries?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  order_activity_log?: Array<{
    id: string;
    activity_type: string;
    description: string;
    created_at: string;
    created_by?: string;
  }>;
};

export default function EnhancedOrdersDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productionFilter, setProductionFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showDispatchedOrders, setShowDispatchedOrders] = useState<boolean>(false);
  const [showNewOrdersOnly, setShowNewOrdersOnly] = useState<boolean>(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  
  // Sundries modal
  const [sundryModal, setSundryModal] = useState<string | null>(null);
  const [sundryDescription, setSundryDescription] = useState('');
  const [sundryQuantity, setSundryQuantity] = useState(1);
  const [sundryPrice, setSundryPrice] = useState('');
  const [sundryTaxRate, setSundryTaxRate] = useState(20);
  const [sundryTemplates, setSundryTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  
  // New state for advanced features
  const [operators, setOperators] = useState<Array<{id: string, full_name: string}>>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null);
  
  // Quote pricing state
  const [quotePricingModal, setQuotePricingModal] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [taxRate, setTaxRate] = useState(20);
  const [quoteResponseNotes, setQuoteResponseNotes] = useState('');
  const [processingQuote, setProcessingQuote] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, productionFilter, priorityFilter, orders, showDispatchedOrders, showNewOrdersOnly]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'operator' && profile.role !== 'admin')) {
        router.push('/account');
        return;
      }

      setUserRole(profile.role);
      loadOrders();
      loadOperators();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('role', ['admin', 'operator']);

      if (error) throw error;
      setOperators(data || []);
    } catch (error) {
      console.error('Error loading operators:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_sundries (*),
          order_activity_log (
            id,
            activity_type,
            description,
            created_at,
            created_by
          )
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

  const getUserName = (userId?: string) => {
    if (!userId) return 'Unknown';
    const operator = operators.find(op => op.id === userId);
    return operator?.full_name || 'Unknown';
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Hide dispatched orders by default
    if (!showDispatchedOrders) {
      filtered = filtered.filter((order) => order.production_status !== 'dispatched');
    }

    // Show new orders only filter (paid + not started or pending)
    if (showNewOrdersOnly) {
      filtered = filtered.filter((order) => 
        order.payment_status === 'paid' && 
        (!order.production_status || order.production_status === 'not_started')
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (productionFilter !== 'all') {
      filtered = filtered.filter((order) => order.production_status === productionFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((order) => order.priority === priorityFilter);
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

  const updateOrderField = async (orderId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update order');
    }
  };

  const addSundry = async (orderId: string) => {
    if (!sundryDescription || !sundryPrice) {
      alert('Please fill in all sundry fields');
      return;
    }

    try {
      const unitPrice = parseFloat(sundryPrice);
      const totalPrice = unitPrice * sundryQuantity;

      const { data: { user } } = await supabase.auth.getUser();

      // Add sundry to order
      const { error } = await supabase
        .from('order_sundries')
        .insert({
          order_id: orderId,
          description: sundryDescription,
          quantity: sundryQuantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          added_by: user?.id
        });

      if (error) throw error;

      // Save as template if checkbox was checked
      if (saveAsTemplate) {
        const { error: templateError } = await supabase
          .from('sundries_templates')
          .insert({
            description: sundryDescription,
            default_price: unitPrice,
            created_by: user?.id,
            is_active: true
          });

        if (templateError) {
          console.error('Error saving template:', templateError);
          alert('Sundry added to order, but failed to save as template');
        } else {
          alert('Sundry added successfully and saved as a template!');
        }
      } else {
        alert('Sundry added successfully!');
      }

      setSundryModal(null);
      setSundryDescription('');
      setSundryQuantity(1);
      setSundryPrice('');
      setSundryTaxRate(20);
      setSelectedTemplate('');
      setSaveAsTemplate(false);
      setSundryTemplates([]); // Reset to reload next time
      loadOrders();
    } catch (error) {
      console.error('Error adding sundry:', error);
      alert('Failed to add sundry');
    }
  };

  const approveQuote = async (orderId: string) => {
    if (processingQuote) return;
    
    try {
      setProcessingQuote(true);
      
      const response = await fetch('/api/admin/quotes/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          delivery_date: deliveryDate || null,
          tax_included: taxIncluded,
          tax_rate: taxRate,
          quote_response_notes: quoteResponseNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve quote');
      }

      alert(`Quote approved! Total: £${data.total.toFixed(2)}`);
      setQuotePricingModal(null);
      setDeliveryDate('');
      setQuoteResponseNotes('');
      setTaxIncluded(true);
      setTaxRate(20);
      loadOrders();
    } catch (error: any) {
      console.error('Error approving quote:', error);
      alert(error.message || 'Failed to approve quote');
    } finally {
      setProcessingQuote(false);
    }
  };

  const rejectQuote = async (orderId: string, reason: string) => {
    if (processingQuote) return;
    
    if (!confirm('Are you sure you want to reject this quote?')) return;

    try {
      setProcessingQuote(true);

      const response = await fetch('/api/admin/quotes/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          rejection_reason: reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject quote');
      }

      alert('Quote rejected successfully');
      setQuotePricingModal(null);
      loadOrders();
    } catch (error: any) {
      console.error('Error rejecting quote:', error);
      alert(error.message || 'Failed to reject quote');
    } finally {
      setProcessingQuote(false);
    }
  };

  const sendToPayment = async (orderId: string) => {
    if (processingQuote) return;

    if (!confirm('Send payment link to customer? This will email them with the quote total and payment link.')) return;

    try {
      setProcessingQuote(true);

      const response = await fetch('/api/admin/quotes/send-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send payment link');
      }

      alert('Payment link sent to customer successfully!');
      loadOrders();
    } catch (error: any) {
      console.error('Error sending payment:', error);
      alert(error.message || 'Failed to send payment link');
    } finally {
      setProcessingQuote(false);
    }
  };

  const calculateQuoteTotal = (order: any) => {
    const sundries = order.order_sundries || [];
    const subtotal = sundries.reduce((sum: number, item: any) => sum + item.total_price, 0);
    const tax = taxIncluded ? (subtotal * (taxRate / 100)) : 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal':
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getProductionStatusColor = (status?: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'design_in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'awaiting_proof_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved_for_production':
        return 'bg-blue-100 text-blue-800';
      case 'printing':
        return 'bg-indigo-100 text-indigo-800';
      case 'finishing':
        return 'bg-cyan-100 text-cyan-800';
      case 'quality_check':
        return 'bg-teal-100 text-teal-800';
      case 'ready_for_dispatch':
        return 'bg-lime-100 text-lime-800';
      case 'dispatched':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
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
                <h1 className="text-2xl font-bold text-gray-900">Print Shop Orders</h1>
                <p className="text-sm text-gray-600">Professional order management</p>
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

        {/* Prominent Quick Filters */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Quick View</h2>
                <p className="text-sm text-green-100">Filter orders instantly</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-3">
              <button
                onClick={() => {
                  setShowNewOrdersOnly(!showNewOrdersOnly);
                  if (!showNewOrdersOnly) {
                    setShowDispatchedOrders(false);
                  }
                }}
                className={`px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-all ${
                  showNewOrdersOnly
                    ? 'bg-white text-green-600 ring-4 ring-white ring-opacity-50 scale-105'
                    : 'bg-green-700 text-white hover:bg-green-800'
                }`}
              >
                <AlertCircle className="w-5 h-5 inline mr-2" />
                New Orders Only
                {showNewOrdersOnly && (
                  <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowDispatchedOrders(!showDispatchedOrders)}
                className={`px-4 py-3 rounded-lg font-semibold shadow-lg transition-all ${
                  showDispatchedOrders
                    ? 'bg-white text-green-600'
                    : 'bg-green-700 text-white hover:bg-green-800'
                }`}
              >
                {showDispatchedOrders ? 'Hide' : 'Show'} Dispatched
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <optgroup label="Quote Stages">
                <option value="quote_pending">💬 Quote: Pending</option>
                <option value="quote_reviewed">👀 Quote: Reviewed</option>
                <option value="quote_priced">💰 Quote: Priced</option>
                <option value="quote_accepted">✅ Quote: Accepted</option>
              </optgroup>
              <optgroup label="Order Stages">
                <option value="pending">⏳ Awaiting Production</option>
                <option value="processing">🔄 Processing</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </optgroup>
            </select>
            <select
              value={productionFilter}
              onChange={(e) => setProductionFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Production</option>
              <option value="not_started">Not Started</option>
              <option value="design_in_progress">In Design</option>
              <option value="awaiting_proof_approval">Awaiting Proof</option>
              <option value="printing">Printing</option>
              <option value="finishing">Finishing</option>
              <option value="ready_for_dispatch">Ready</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Urgent</p>
            <p className="text-2xl font-bold text-red-600">
              {orders.filter((o) => o.priority === 'urgent').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">In Production</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.production_status === 'printing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Awaiting Proof</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.production_status === 'awaiting_proof_approval').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Ready</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.production_status === 'ready_for_dispatch').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
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
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      
                      {/* Order Type Badge */}
                      {(order as any).order_type && (order as any).order_type !== 'standard' && (
                        <>
                          {(order as any).order_type === 'quote' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                              💬 QUOTE
                            </span>
                          )}
                          {(order as any).order_type === 'price_match' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border-2 border-yellow-400 animate-pulse">
                              🎯 PRICE MATCH
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Priority Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(order.priority)}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {(order.priority || 'normal').toUpperCase()}
                      </span>

                      {/* Production Status */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProductionStatusColor(order.production_status)}`}>
                        {order.production_status?.replace(/_/g, ' ').toUpperCase() || 'NOT STARTED'}
                      </span>

                      {/* Due Date with Warning */}
                      {order.due_date && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isOverdue(order.due_date) 
                            ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          Due: {new Date(order.due_date).toLocaleDateString('en-GB')}
                          {isOverdue(order.due_date) && ' (OVERDUE!)'}
                        </span>
                      )}
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
                        £{order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <select
                      value={order.priority || 'normal'}
                      onChange={(e) => updateOrderField(order.id, 'priority', e.target.value)}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>

                    <select
                      value={order.production_status || 'not_started'}
                      onChange={(e) => updateOrderField(order.id, 'production_status', e.target.value)}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="design_in_progress">In Design</option>
                      <option value="awaiting_proof_approval">Awaiting Proof</option>
                      <option value="approved_for_production">Approved</option>
                      <option value="printing">Printing</option>
                      <option value="finishing">Finishing</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="ready_for_dispatch">Ready</option>
                      <option value="dispatched">Dispatched</option>
                    </select>
                  </div>
                </div>

                {/* Operator Assignment & Stripe Payment */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      👤 Assigned To:
                    </label>
                    <select
                      value={order.assigned_to || ''}
                      onChange={(e) => updateOrderField(order.id, 'assigned_to', e.target.value || null)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {operators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stripe Payment Status */}
                  {order.stripe_payment_intent_id ? (
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">
                        💳 Payment Status:
                      </label>
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <span className={`text-sm font-semibold ${
                            order.payment_status === 'paid' ? 'text-green-600' : 'text-gray-700'
                          }`}>
                            {order.payment_status === 'paid' ? '✅ PAID' : order.stripe_payment_status?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        {(order as any).paid_at && (
                          <p className="text-xs text-gray-600 mb-1">
                            📅 Paid: {new Date((order as any).paid_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                        <a
                          href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          View in Stripe →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">
                        💳 Payment:
                      </label>
                      <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
                        No Stripe payment linked
                      </div>
                    </div>
                  )}
                </div>

                {/* Quote-Specific Info */}
                {(order as any).order_type === 'quote' && (
                  <div className="pt-4 border-t mb-4 bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-800 mb-3">💬 QUOTE REQUEST DETAILS</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Project Title</p>
                        <p className="text-sm font-semibold text-gray-900">{(order as any).project_title || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Quantity</p>
                        <p className="text-sm text-gray-900">{(order as any).quantity || 'N/A'}</p>
                      </div>
                    </div>
                    {(order as any).project_description && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-900">{(order as any).project_description}</p>
                      </div>
                    )}
                    {(order as any).specifications && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Specifications</p>
                        <p className="text-sm text-gray-900">{(order as any).specifications}</p>
                      </div>
                    )}
                    {(order as any).price_match_requested && (
                      <div className="mt-3 bg-yellow-100 p-3 rounded border border-yellow-300">
                        <p className="text-xs font-semibold text-yellow-900 mb-2">🎯 PRICE MATCH REQUESTED</p>
                        {(order as any).competitor_price && (
                          <p className="text-sm text-gray-900">Competitor Price: <span className="font-bold">£{(order as any).competitor_price}</span> (excl. VAT)</p>
                        )}
                        {(order as any).competitor_url && (
                          <a href={(order as any).competitor_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 underline">
                            View Competitor Link →
                          </a>
                        )}
                      </div>
                    )}
                    {(order as any).file_urls && (order as any).file_urls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">📎 Uploaded Files ({(order as any).file_urls.length})</p>
                        <div className="space-y-1">
                          {(order as any).file_urls.map((url: string, idx: number) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-indigo-600 hover:text-indigo-800">
                              📄 File {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quote Action Buttons */}
                {((order as any).order_type === 'quote' || (order as any).order_type === 'price_match') && 
                 !['quote_priced', 'quote_accepted', 'cancelled', 'completed'].includes(order.status) &&
                 order.payment_status !== 'paid' && (
                  <div className="mt-4 border-t pt-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                      <p className="text-sm font-bold text-gray-900 mb-3">💰 QUOTE ACTIONS</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={async () => {
                            if (!order.order_sundries?.length) {
                              alert('Please add sundries (pricing) first! Click "View Details" below and then "+ Add Sundry"');
                              return;
                            }
                            if (confirm('Approve this quote? This will calculate totals with 20% VAT and mark it ready for payment.')) {
                              try {
                                const { data: { session } } = await supabase.auth.getSession();
                                const response = await fetch('/api/admin/quotes/approve', {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session?.access_token}`
                                  },
                                  body: JSON.stringify({
                                    order_id: order.id,
                                    tax_included: true,
                                    tax_rate: 20
                                  })
                                });
                                const data = await response.json();
                                if (response.ok) {
                                  alert(`Quote approved! Total: £${data.total.toFixed(2)}`);
                                  window.location.reload();
                                } else {
                                  alert('Error: ' + data.error);
                                }
                              } catch (error) {
                                alert('Failed to approve quote');
                              }
                            }
                          }}
                          className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold text-sm"
                        >
                          ✅ Approve & Price Quote
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Rejection reason (optional):');
                            if (confirm('Are you sure you want to reject this quote?')) {
                              try {
                                const response = await fetch('/api/admin/quotes/reject', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    order_id: order.id,
                                    rejection_reason: reason || ''
                                  })
                                });
                                if (response.ok) {
                                  alert('Quote rejected');
                                  window.location.reload();
                                } else {
                                  alert('Failed to reject quote');
                                }
                              } catch (error) {
                                alert('Failed to reject quote');
                              }
                            }
                          }}
                          className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm"
                        >
                          ❌ Reject Quote
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Send to Payment Button */}
                {((order as any).order_type === 'quote' || (order as any).order_type === 'price_match') && order.status === 'quote_priced' && (
                  <div className="mt-4 border-t pt-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                      <p className="text-sm font-bold text-indigo-900 mb-2">💳 QUOTE READY FOR PAYMENT</p>
                      <p className="text-xs text-gray-600 mb-3">Total: £{order.total.toFixed(2)} (incl. VAT)</p>
                      <button
                        onClick={async () => {
                          if (confirm('Send payment link to customer? This will email them with the quote total and payment link.')) {
                            try {
                              const response = await fetch('/api/admin/quotes/send-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ order_id: order.id })
                              });
                              if (response.ok) {
                                alert('Payment link sent to customer successfully!');
                                window.location.reload();
                              } else {
                                const data = await response.json();
                                alert('Error: ' + data.error);
                              }
                            } catch (error) {
                              alert('Failed to send payment link');
                            }
                          }
                        }}
                        disabled={!!order.stripe_payment_intent_id}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {order.stripe_payment_intent_id ? '✅ Payment Link Already Sent' : '📧 Send Payment Link to Customer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer Info & Address */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Customer Info</p>
                      <button
                        onClick={() => setCustomerModal(order)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        View Details →
                      </button>
                    </div>
                    <p className="text-sm text-gray-900">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    )}
                    
                    {/* File Status */}
                    <div className="mt-2">
                      {order.file_urls && order.file_urls.length > 0 ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mb-2">
                            ✓ {order.file_urls.length} file(s)
                          </span>
                          <div className="mt-1 space-y-1">
                            {order.file_urls.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                📄 View File {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          ⏳ Pending upload
                        </span>
                      )}
                    </div>
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
                  </div>
                </div>

                {/* Notes Section */}
                <div className="grid md:grid-cols-3 gap-4 mb-4 pt-4 border-t">
                  {/* Operator Notes (Internal) */}
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-red-800">🔒 INTERNAL NOTES</p>
                      <button
                        onClick={() => setEditingNotes(editingNotes === `operator-${order.id}` ? null : `operator-${order.id}`)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        {editingNotes === `operator-${order.id}` ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {editingNotes === `operator-${order.id}` ? (
                      <div>
                        <textarea
                          defaultValue={order.operator_notes || ''}
                          className="w-full p-2 text-sm border rounded"
                          rows={3}
                          placeholder="Private operator notes..."
                          id={`operator-notes-${order.id}`}
                        />
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`operator-notes-${order.id}`) as HTMLTextAreaElement;
                            updateOrderField(order.id, 'operator_notes', textarea.value);
                            setEditingNotes(null);
                          }}
                          className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{order.operator_notes || 'No notes'}</p>
                        {order.operator_notes_updated_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            📅 Last updated: {formatDate(order.operator_notes_updated_at)}
                            <br />
                            by {getUserName(order.operator_notes_updated_by)}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Customer Notes */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-2">👤 CUSTOMER NOTES</p>
                    <p className="text-sm text-gray-700">{order.customer_notes || 'No notes from customer'}</p>
                  </div>

                  {/* Operator Customer Notes */}
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-purple-800">📝 ABOUT CUSTOMER</p>
                      <button
                        onClick={() => setEditingNotes(editingNotes === `customer-${order.id}` ? null : `customer-${order.id}`)}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        {editingNotes === `customer-${order.id}` ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {editingNotes === `customer-${order.id}` ? (
                      <div>
                        <textarea
                          defaultValue={order.operator_customer_notes || ''}
                          className="w-full p-2 text-sm border rounded"
                          rows={3}
                          placeholder="Notes about this customer..."
                          id={`customer-notes-${order.id}`}
                        />
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`customer-notes-${order.id}`) as HTMLTextAreaElement;
                            updateOrderField(order.id, 'operator_customer_notes', textarea.value);
                            setEditingNotes(null);
                          }}
                          className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{order.operator_customer_notes || 'No customer notes'}</p>
                        {order.operator_customer_notes_updated_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            📅 Last updated: {formatDate(order.operator_customer_notes_updated_at)}
                            <br />
                            by {getUserName(order.operator_customer_notes_updated_by)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Activity Timeline */}
                {order.order_activity_log && order.order_activity_log.length > 0 && (
                  <div className="mb-4 pt-4 border-t">
                    <button
                      onClick={() => setExpandedActivity(expandedActivity === order.id ? null : order.id)}
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-3"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Activity Log ({order.order_activity_log.length} entries)</span>
                      {expandedActivity === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedActivity === order.id && (
                      <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
                        {order.order_activity_log
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((log) => (
                            <div key={log.id} className="flex items-start space-x-3 bg-white p-3 rounded border-l-4 border-indigo-500">
                              <div className="flex-shrink-0 mt-0.5">
                                {log.activity_type === 'status_change' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {log.activity_type === 'production_status_change' && <Package className="w-4 h-4 text-blue-600" />}
                                {log.activity_type === 'priority_change' && <Flag className="w-4 h-4 text-orange-600" />}
                                {log.activity_type === 'note_added' && <FileText className="w-4 h-4 text-purple-600" />}
                                {log.activity_type === 'sundry_added' && <Plus className="w-4 h-4 text-green-600" />}
                                {log.activity_type === 'assignment_change' && <User className="w-4 h-4 text-indigo-600" />}
                                {log.activity_type === 'payment_status_change' && <CreditCard className="w-4 h-4 text-emerald-600" />}
                                {!['status_change', 'production_status_change', 'priority_change', 'note_added', 'sundry_added', 'assignment_change', 'payment_status_change'].includes(log.activity_type) && <AlertCircle className="w-4 h-4 text-gray-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{log.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(log.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                >
                  {expandedOrder === order.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      View Details ({order.order_items?.length || 0} items + {order.order_sundries?.length || 0} sundries)
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × £{item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">£{item.total_price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Sundries Section */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900">Additional Charges (Sundries)</h4>
                        <button
                          onClick={() => setSundryModal(order.id)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Sundry
                        </button>
                      </div>

                      {order.order_sundries && order.order_sundries.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {order.order_sundries.map((sundry) => (
                            <div key={sundry.id} className="flex justify-between items-center bg-yellow-50 p-3 rounded">
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
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">No additional charges</p>
                      )}
                    </div>

                    {/* Total Breakdown */}
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

      {/* Sundry Modal */}
      {sundryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Sundry/Additional Charge</h3>
              <button onClick={async () => {
                setSundryModal(null);
                setSundryDescription('');
                setSundryQuantity(1);
                setSundryPrice('');
                setSelectedTemplate('');
                setSaveAsTemplate(false);
              }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Template Selector */}
              <div className="bg-indigo-50 p-3 rounded-lg border-2 border-indigo-200">
                <label className="block text-sm font-semibold mb-2 text-indigo-900">📋 Use Template (Optional)</label>
                <select
                  value={selectedTemplate}
                  onChange={async (e) => {
                    setSelectedTemplate(e.target.value);
                    if (e.target.value) {
                      const { data } = await supabase
                        .from('sundries_templates')
                        .select('*')
                        .eq('id', e.target.value)
                        .single();
                      if (data) {
                        setSundryDescription(data.description);
                        setSundryPrice(data.default_price.toString());
                        setSundryQuantity(1);
                      }
                    }
                  }}
                  className="w-full p-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onFocus={async () => {
                    if (sundryTemplates.length === 0) {
                      const { data } = await supabase
                        .from('sundries_templates')
                        .select('*')
                        .eq('is_active', true)
                        .order('description');
                      if (data) setSundryTemplates(data);
                    }
                  }}
                >
                  <option value="">-- Select a template or enter custom --</option>
                  {sundryTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.description} - £{template.default_price.toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-indigo-700 mt-1">Select a template to auto-fill or enter custom details below</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={sundryDescription}
                  onChange={(e) => setSundryDescription(e.target.value)}
                  placeholder="e.g., Rush Fee, Setup Fee, Design Work"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Quantity</label>
                  <input
                    type="number"
                    value={sundryQuantity}
                    onChange={(e) => setSundryQuantity(parseInt(e.target.value))}
                    min="1"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Unit Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sundryPrice}
                    onChange={(e) => setSundryPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tax Rate (%)</label>
                <select
                  value={sundryTaxRate}
                  onChange={(e) => setSundryTaxRate(parseInt(e.target.value))}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  <option value="0">0% (No VAT)</option>
                  <option value="5">5% (Reduced Rate)</option>
                  <option value="20">20% (Standard VAT)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">Default: 20% Standard VAT</p>
              </div>

              {/* Save as Template Checkbox */}
              {!selectedTemplate && sundryDescription && sundryPrice && (
                <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-green-900">
                      💾 Save this as a template for future use
                    </span>
                  </label>
                  <p className="text-xs text-green-700 mt-1 ml-6">
                    Check this to add "{sundryDescription}" to your reusable templates library
                  </p>
                </div>
              )}

              <div className="bg-gray-100 p-4 rounded">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">£{(parseFloat(sundryPrice || '0') * sundryQuantity).toFixed(2)}</span>
                  </div>
                  {sundryTaxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({sundryTaxRate}%):</span>
                      <span className="font-semibold">£{((parseFloat(sundryPrice || '0') * sundryQuantity * sundryTaxRate) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>£{((parseFloat(sundryPrice || '0') * sundryQuantity) * (1 + sundryTaxRate / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => addSundry(sundryModal)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  ✅ Add Sundry & Close
                </button>
                <button
                  onClick={() => {
                    if (!sundryDescription || !sundryPrice) {
                      alert('Please fill in all sundry fields');
                      return;
                    }
                    // Add sundry without closing modal
                    const addSundryKeepOpen = async () => {
                      try {
                        const unitPrice = parseFloat(sundryPrice);
                        const totalPrice = unitPrice * sundryQuantity;
                        const { data: { user } } = await supabase.auth.getUser();
                        const { error } = await supabase
                          .from('order_sundries')
                          .insert({
                            order_id: sundryModal,
                            description: sundryDescription,
                            quantity: sundryQuantity,
                            unit_price: unitPrice,
                            total_price: totalPrice,
                            added_by: user?.id
                          });
                        if (error) throw error;
                        // Clear form but keep modal open
                        setSundryDescription('');
                        setSundryQuantity(1);
                        setSundryPrice('');
                        setSundryTaxRate(20);
                        loadOrders();
                        alert('Sundry added! Add another or close.');
                      } catch (error) {
                        console.error('Error adding sundry:', error);
                        alert('Failed to add sundry');
                      }
                    };
                    addSundryKeepOpen();
                  }}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  ➕ Add Another Sundry
                </button>
                <button
                  onClick={() => setSundryModal(null)}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {customerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <button onClick={() => setCustomerModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Order Reference */}
              <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
                <p className="text-xs font-semibold text-indigo-800 mb-2">Order Reference</p>
                <p className="text-lg font-bold text-gray-900">#{customerModal.order_number}</p>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{customerModal.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm text-gray-900">{customerModal.customer_email}</p>
                  </div>
                  {customerModal.customer_phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-sm text-gray-900">{customerModal.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-900 space-y-1">
                  <p>{customerModal.shipping_address_line1}</p>
                  {customerModal.shipping_address_line2 && <p>{customerModal.shipping_address_line2}</p>}
                  <p>{customerModal.shipping_city}</p>
                  <p className="font-semibold">{customerModal.shipping_postcode}</p>
                  <p>{customerModal.shipping_country}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-semibold">{formatDate(customerModal.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold capitalize">{customerModal.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-semibold ${customerModal.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {customerModal.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="text-lg font-bold text-gray-900">£{customerModal.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {customerModal.customer_notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Customer Notes
                  </h4>
                  <p className="text-sm text-gray-700">{customerModal.customer_notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setCustomerModal(null)}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
