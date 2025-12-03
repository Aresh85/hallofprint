'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Printer } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Upload Artwork', href: '/upload-file' },
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
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
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
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              © 2025 Hall of Prints
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
