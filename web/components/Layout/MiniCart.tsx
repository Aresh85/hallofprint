'use client';

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function MiniCart() {
  const { itemCount } = useCart();

  return (
    <Link 
      href="/cart"
      className="relative p-2 rounded-full hover:bg-indigo-600 transition-colors"
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {/* Badge showing item count */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-indigo-700">
          {itemCount}
        </span>
      )}
    </Link>
  );
}