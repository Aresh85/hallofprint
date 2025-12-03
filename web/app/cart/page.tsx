'use client';

import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import CheckoutButton from '../../components/Checkout/CheckoutButton';
import { ShoppingCart, XCircle, ArrowLeft, Trash2, Lock, Truck, CheckCircle, Package } from 'lucide-react';

// Helper to format currency
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

export default function CartPage() {
  const { cart, cartTotal, itemCount, removeFromCart } = useCart();

  // Calculate savings or free shipping threshold
  const freeShippingThreshold = 100;
  const remaining = freeShippingThreshold - cartTotal;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-gray-900">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600">
                2
              </div>
              <span className="ml-2 text-gray-500">Checkout</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600">
                3
              </div>
              <span className="ml-2 text-gray-500">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-indigo-600" />
            Shopping Cart
            <span className="ml-3 text-lg text-gray-500 font-normal">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
          <Link 
            href="/products" 
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet. Browse our products and find something you like!
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <Package className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Banner */}
              {remaining > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-indigo-900">
                        Add {formatCurrency(remaining)} more for FREE shipping!
                      </p>
                      <p className="text-sm text-indigo-700">
                        Orders over {formatCurrency(freeShippingThreshold)} ship free
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 bg-indigo-200 rounded-full h-3">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {remaining <= 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="font-semibold text-green-900">
                    🎉 Congratulations! You qualify for FREE shipping!
                  </p>
                </div>
              )}

              {/* Cart Items */}
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image Placeholder */}
                    <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-12 h-12 text-indigo-400" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {item.productName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Quantity: <span className="font-semibold">{item.quantity}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Selections */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                          Configuration:
                        </p>
                        <div className="space-y-1">
                          {item.selections.map((selection, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {selection.groupName}: <span className="font-medium text-gray-900">{selection.name}</span>
                              </span>
                              {selection.priceModifier !== 0 && (
                                <span className="font-mono text-xs text-indigo-600 font-semibold">
                                  {selection.priceModifier > 0 ? '+' : ''}{formatCurrency(selection.priceModifier)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Item Total:</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                    </div>
                    
                    {/* Shipping */}
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-green-600">
                        {remaining <= 0 ? 'FREE' : 'Calculated at checkout'}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-baseline mb-6">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-bold text-indigo-600">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>

                      {/* Checkout Button */}
                      <CheckoutButton />
                    </div>

                    {/* Trust Signals */}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span>Secure checkout with Stripe</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        <span>Fast & reliable delivery</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Quality guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-indigo-800 mb-4">
                    Have questions about your order? Our team is here to help!
                  </p>
                  <a 
                    href="mailto:aresh@inteeka.com"
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
