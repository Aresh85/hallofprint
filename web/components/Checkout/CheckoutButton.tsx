'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react'; // Using Lucide icon for loading

// The Stripe Publishable Key is safe to expose on the client
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutButton() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get the Stripe object
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }

      // 2. Call your Next.js API route to create the Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems: cart }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle server-side validation errors from the API route
        const errorMessage = data.error || 'Server error occurred during checkout initialization.';
        throw new Error(errorMessage);
      }

      // 3. Redirect to Stripe Checkout using the session URL
      // Note: Modern Stripe.js no longer uses redirectToCheckout, we redirect directly
      if (data.url) {
        // If the API returns a URL, use that
        window.location.href = data.url;
      } else if (data.id) {
        // Otherwise, construct the checkout URL manually
        // This is a fallback - ideally the API should return the URL
        window.location.href = `https://checkout.stripe.com/c/pay/${data.id}`;
      } else {
        throw new Error('No checkout URL or session ID received from server.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className="w-full py-4 px-6 bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...</>
        ) : (
          'Proceed to Payment'
        )}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          Error: {error}
        </div>
      )}
    </>
  );
}
