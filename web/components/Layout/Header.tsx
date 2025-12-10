'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingCart, Printer, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { supabase } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const { itemCount } = useCart();

  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Request Quote', href: '/request-quote' },
    { name: 'Upload Artwork', href: '/upload-artwork' },
    { name: 'Cart', href: '/cart', badge: itemCount }
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-indigo-700 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors"
              onClick={closeMobileMenu}
            >
              <Printer className="w-8 h-8" />
              <span className="text-xl font-bold hidden sm:inline">Hall of Prints</span>
              <span className="text-xl font-bold sm:hidden">HoP</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-white hover:text-indigo-200 transition-colors font-medium"
                >
                  {item.name === 'Cart' ? (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
                          {item.badge}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {item.name}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors font-medium"
                  >
                    <div className="bg-white rounded-full p-1.5">
                      <User className="w-5 h-5 text-indigo-700" />
                    </div>
                    <span className="hidden lg:inline">{userName}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Orders</span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 bg-white text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile: Cart Icon + Menu Button */}
            <div className="flex items-center space-x-4 md:hidden">
              {/* Mobile Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-white hover:text-indigo-200 transition-colors"
                onClick={closeMobileMenu}
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-indigo-200 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-white rounded"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Printer className="w-6 h-6" />
              <span className="font-bold text-lg">Menu</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-gray-500 hover:text-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                  >
                    <span>{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              {/* User Section in Mobile Menu */}
              {user && (
                <>
                  <li className="mt-4 pt-4 border-t border-gray-200">
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Account</p>
                    </div>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>My Account</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {!user ? (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold w-full"
              >
                <User className="w-5 h-5" />
                <span>Login / Sign Up</span>
              </Link>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">{userName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-4">
              © 2025 Hall of Prints
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
