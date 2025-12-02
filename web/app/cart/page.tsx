'use client';

import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import CheckoutButton from '../../components/Checkout/CheckoutButton';
import { ShoppingCart, XCircle, ArrowLeft } from 'lucide-react'; // Using Lucide icons

// Helper to format currency
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

// NOTE: For simplicity, this cart only lists items. 
// Functionality to remove or update quantity is omitted but would go here.

export default function CartPage() {
  const { cart, cartTotal, itemCount } = useCart();

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-8 flex items-center">
        <ShoppingCart className="w-10 h-10 mr-4 text-indigo-600" />
        Your Print Cart ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-6">Your cart is currently empty.</p>
          <Link href="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-900">{item.productName}</h2>
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-semibold text-gray-700">Selections:</p>
                    {item.selections.map((selection, index) => (
                      <p key={index} className="text-gray-600 ml-2">
                        • {selection.groupName}: {selection.name} 
                        {selection.priceModifier !== 0 && (
                            <span className="ml-2 font-mono text-xs text-indigo-500">
                                ({selection.priceModifier > 0 ? '+' : ''}{formatCurrency(selection.priceModifier)} / {selection.unit})
                            </span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end items-center sm:w-1/4 mt-4 sm:mt-0">
                    <p className="text-lg font-bold text-indigo-600">
                        {formatCurrency(item.totalPrice)}
                    </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Summary and Checkout */}
          <div className="lg:col-span-1 sticky top-4">
            <div className="bg-indigo-50 p-6 rounded-xl shadow-lg border-t-4 border-indigo-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="flex justify-between border-t pt-4 text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              {/* Checkout Button Component is rendered here */}
              <div className="mt-6">
                <CheckoutButton />
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Taxes and shipping calculated at checkout via Stripe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}