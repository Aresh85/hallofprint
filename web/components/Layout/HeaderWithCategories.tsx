'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingCart, Printer, User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { supabase } from '@/lib/auth';
import { client } from '@/lib/sanity';

interface Category {
  _id: string;
  name: string;
  slug: string;
  featured: boolean;
}

export default function HeaderWithCategories() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { itemCount } = useCart();

  useEffect(() => {
    checkUser();
    fetchCategories();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category"] | order(sortOrder asc, name asc) {
        _id,
        name,
        "slug": slug.current,
        featured
      }`;
      const data = await client.fetch<Category[]>(query);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');
      setUserRole(profile?.role || '');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/categories', hasDropdown: true },
    { name: 'Request Quote', href: '/request-quote' },
    { name: 'Upload Artwork', href: '/upload-artwork' },
    { name: 'Cart', href: '/cart', badge: itemCount }
  ];

  return (
    <>
      <header className="bg-indigo-700 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Printer className="w-8 h-8" />
              <span className="text-xl font-bold hidden sm:inline">Hall of Print</span>
              <span className="text-xl font-bold sm:hidden">HoP</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                item.hasDropdown ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setIsProductsMenuOpen(true)}
                    onMouseLeave={() => setIsProductsMenuOpen(false)}
                  >
                    <button className="flex items-center gap-1 text-white hover:text-indigo-200 transition-colors font-medium">
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Products Dropdown */}
                    {isProductsMenuOpen && (
                      <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                        <Link
                          href="/categories"
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 font-semibold"
                        >
                          All Categories
                        </Link>
                        <hr className="my-2" />
                        <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Categories
                        </div>
                        {categories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/products/category/${category.slug}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                          >
                            {category.name}
                            {category.featured && <span className="ml-2 text-yellow-500">⭐</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
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
                      item.name
                    )}
                  </Link>
                )
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
                          <span>Your Orders</span>
                        </Link>
                        {(userRole === 'admin' || userRole === 'operator') && (
                          <Link
                            href="/admin/orders-enhanced"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 transition-colors font-semibold"
                          >
                            <Package className="w-4 h-4" />
                            <span>Orders Enhanced</span>
                          </Link>
                        )}
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

            {/* Mobile: Cart + Menu */}
            <div className="flex items-center space-x-4 md:hidden">
              <Link
                href="/cart"
                className="relative p-2 text-white hover:text-indigo-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-indigo-200 transition-colors p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2 text-indigo-700">
                  <Printer className="w-6 h-6" />
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      Home
                    </Link>
                  </li>
                  
                  {/* Products with Categories */}
                  <li>
                    <Link
                      href="/categories"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      All Categories
                    </Link>
                    <div className="pl-8 py-2 bg-gray-50">
                      {categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/products/category/${category.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-indigo-600"
                        >
                          {category.name}
                          {category.featured && <span className="ml-2">⭐</span>}
                        </Link>
                      ))}
                    </div>
                  </li>

                  <li>
                    <Link
                      href="/request-quote"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      Request Quote
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/upload-artwork"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      Upload Artwork
                    </Link>
                  </li>

                  {user && (
                    <>
                      <li className="mt-4 pt-4 border-t">
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Account</div>
                      </li>
                      <li>
                        <Link
                          href="/account"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50"
                        >
                          <User className="w-5 h-5" />
                          <span>My Account</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Your Orders</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              <div className="p-4 border-t bg-gray-50">
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Login / Sign Up</span>
                  </Link>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">{userName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mt-4">© 2025 Hall of Print</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
