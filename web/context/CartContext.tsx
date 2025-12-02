'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interfaces for a cart item (must match what ProductConfigurator generates)
export interface CartItem {
  id: string; // Unique ID for this specific configured item
  productName: string;
  basePrice: number;
  quantity: number;
  selections: Array<{
    groupName: string;
    name: string;
    priceModifier: number;
    unit: string;
  }>;
  totalPrice: number;
}

// Interface for the Cart Context API
interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  // We'll add update/remove functions later
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to generate a unique ID for a configured product
const generateUniqueId = (item: Omit<CartItem, 'id'>): string => {
    // Creates a simple, unique hash based on product name and configuration selections
    const configString = item.selections.map(s => `${s.groupName}:${s.name}`).join('|');
    return `${item.productName}-${configString}-${Date.now()}`;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Calculate item count and cart total dynamically
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: generateUniqueId(item),
      productName: item.productName, // Ensure the correct field names are used
    };

    // Simple implementation: always add as a new item. 
    setCart(prevCart => [...prevCart, newItem]);
    console.log('Item added to cart:', newItem);
  };

  return (
    <CartContext.Provider value={{ cart, itemCount, cartTotal, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};