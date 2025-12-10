'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { User, Package, MapPin, Settings, LogOut, Mail, FileText, ImageIcon, Briefcase, Tag } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [priceMatchCount, setPriceMatchCount] = useState(0);
  const [pendingArtworkCount, setPendingArtworkCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [acceptedQuotesCount, setAcceptedQuotesCount] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Get order count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setOrderCount(ordersCount || 0);

      // Get price match request count
      const { count: priceMatchesCount } = await supabase
        .from('price_match_requests')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email);

      setPriceMatchCount(priceMatchesCount || 0);

      // Get quote count
      const { count: quotesCount } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email);

      setQuoteCount(quotesCount || 0);

      // Get accepted quotes awaiting payment
      const { count: acceptedCount } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email)
        .eq('status', 'accepted')
        .is('order_id', null);

      setAcceptedQuotesCount(acceptedCount || 0);

      // If admin/operator, get pending counts
      if (profileData?.role === 'operator' || profileData?.role === 'admin') {
        // Get pending artwork submissions count
        const { count: artworkCount } = await supabase
          .from('artwork_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setPendingArtworkCount(artworkCount || 0);

        // Get pending orders count (status = 'pending' or 'processing')
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']);

        setPendingOrdersCount(pendingOrders || 0);

        // Get pending quotes count
        const { count: quotesCount } = await supabase
          .from('quote_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setPendingQuotesCount(quotesCount || 0);
      }

    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message - Now at the top */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'Customer'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your account, view your orders, and update your preferences from your account dashboard.
          </p>
        </div>

        {/* User Features Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Link href="/account/profile" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-600">Edit your details</p>
                </div>
              </div>
            </Link>

            {/* Orders Card */}
            <Link href="/account/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
              {orderCount > 0 && (
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {orderCount}
                </span>
              )}
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Orders</h3>
                  <p className="text-sm text-gray-600">View order history</p>
                </div>
              </div>
            </Link>

            {/* Addresses Card */}
            <Link href="/account/addresses" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Addresses</h3>
                  <p className="text-sm text-gray-600">Manage addresses</p>
                </div>
              </div>
            </Link>

            {/* Preferences Card */}
            <Link href="/account/preferences" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Preferences</h3>
                  <p className="text-sm text-gray-600">Marketing settings</p>
                </div>
              </div>
            </Link>

            {/* Price Match Requests Card */}
            <Link href="/account/price-match" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
              {priceMatchCount > 0 && (
                <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {priceMatchCount}
                </span>
              )}
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Price Match</h3>
                  <p className="text-sm text-gray-600">Track your requests</p>
                </div>
              </div>
            </Link>

            {/* My Quotes Card */}
            <Link href="/account/quotes" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
              {quoteCount > 0 && (
                <span className="absolute top-4 right-4 bg-teal-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {quoteCount}
                </span>
              )}
              {acceptedQuotesCount > 0 && (
                <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {acceptedQuotesCount} awaiting payment
                </span>
              )}
              <div className="flex items-center space-x-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">My Quotes</h3>
                  <p className="text-sm text-gray-600">View quote requests</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Admin Features Section */}
        {(profile?.role === 'operator' || profile?.role === 'admin') && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>Admin Features</span>
              <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                {profile?.role === 'admin' ? 'ADMIN' : 'OPERATOR'}
              </span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Admin Price Match Dashboard */}
              <Link href="/admin/price-match-dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-indigo-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-600 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Price Match Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage price matches</p>
                  </div>
                </div>
              </Link>

              {/* Admin Orders Dashboard */}
              <Link href="/admin/orders-enhanced" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-green-200 relative">
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Order Management</h3>
                    <p className="text-sm text-gray-600">Manage all orders</p>
                  </div>
                </div>
              </Link>

              {/* Admin Artwork Dashboard */}
              <Link href="/admin/artwork-dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-purple-200 relative">
                {pendingArtworkCount > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse">
                    {pendingArtworkCount}
                  </span>
                )}
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Artwork Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage artwork submissions</p>
                  </div>
                </div>
              </Link>

              {/* Admin Quote Dashboard */}
              <Link href="/admin/quote-dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-orange-200 relative">
                {pendingQuotesCount > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse">
                    {pendingQuotesCount}
                  </span>
                )}
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Quote Requests</h3>
                    <p className="text-sm text-gray-600">Manage quote requests</p>
                  </div>
                </div>
              </Link>

              {/* Sundries Management */}
              <Link href="/admin/sundries" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-yellow-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-600 p-3 rounded-lg">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sundries Templates</h3>
                    <p className="text-sm text-gray-600">Manage pricing items</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
