'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import QuoteRequestForm from '../Forms/QuoteRequestForm'; // NEW: Import the Quote Form

// Define the interfaces used by the component
interface ProductChoice {
  name: string;
  priceModifier: number;
  unit: string;
}

interface ConfigurationGroup {
  groupName: string;
  choices: ProductChoice[];
}

interface ProductConfiguratorProps {
  basePrice: number;
  isQuoteOnly: boolean;
  configurationGroups: ConfigurationGroup[];
  productName: string; 
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export default function ProductConfigurator({
  basePrice,
  isQuoteOnly,
  configurationGroups,
  productName,
}: ProductConfiguratorProps) {
  // Use the cart context
  const { addToCart } = useCart();

  // State to track user selections for each configuration group
  const [selections, setSelections] = useState<Record<string, ProductChoice>>(() => {
    // Initialize state with the first choice from each group (if available)
    const initialSelections: Record<string, ProductChoice> = {};
    if (configurationGroups && Array.isArray(configurationGroups)) {
      configurationGroups.forEach(group => {
        if (group.choices.length > 0) {
          initialSelections[group.groupName] = group.choices[0];
        }
      });
    }
    return initialSelections;
  });
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Loading state for Add to Cart

  // Calculate the total price based on selections and quantity (memoized for performance)
  const totalPrice = useMemo(() => {
    let modifierTotal = 0;
    
    // Sum up the price modifiers from all selected options
    Object.values(selections).forEach(choice => {
      modifierTotal += choice.priceModifier;
    });

    const finalPricePerUnit = basePrice + modifierTotal;
    return finalPricePerUnit * quantity;
  }, [basePrice, selections, quantity]);

  // Handler for when a user changes a selection (e.g., using a <select> or radio button)
  const handleSelectionChange = useCallback((groupName: string, selectedChoiceName: string) => {
    const group = configurationGroups.find(g => g.groupName === groupName);
    const selectedChoice = group?.choices.find(c => c.name === selectedChoiceName);

    if (selectedChoice) {
      setSelections(prev => ({
        ...prev,
        [groupName]: selectedChoice,
      }));
    }
  }, [configurationGroups]);

  // Handler for the "Add to Cart" or "Request a Quote" button
  const handleAction = async () => {
    if (isQuoteOnly) {
      // NOTE: Since the quote form is now displayed below, this button won't exist 
      // when isQuoteOnly is true, but the logic remains for clarity.
      console.log('Quote required - scrolling to form.'); 
      return; 
    } else {
      setIsAdding(true);
      
      // Construct the item to be added to the cart
      const cartItem = {
        productName: productName, 
        basePrice,
        quantity,
        selections: Object.entries(selections).map(([groupName, choice]) => ({
          groupName,
          name: choice.name,
          priceModifier: choice.priceModifier,
          unit: choice.unit,
        })),
        totalPrice: totalPrice,
      };

      // Add the item to the global cart state
      addToCart(cartItem);
      
      // Simulate API call delay for visual confirmation
      await new Promise(resolve => setTimeout(resolve, 500)); 

      setIsAdding(false);
      // Optional: Add a visual toast/notification here instead of console log
      console.log(`${quantity}x ${productName} added to cart!`);
    }
  };


  // Prepare selections for the Quote Form
  const currentSelections = useMemo(() => {
    return Object.entries(selections).map(([groupName, choice]) => ({
        groupName: groupName,
        name: choice.name,
        unit: choice.unit,
    }));
  }, [selections]);


  return (
    <div className="space-y-8">
      {/* 1. Configuration Selections (Common to both Quote and E-commerce) */}
      <div className="space-y-6">
        {configurationGroups && configurationGroups.length > 0 ? configurationGroups.map((group) => (
          <div key={group.groupName} className="p-5 bg-gray-50 rounded-xl shadow-inner">
            <label htmlFor={group.groupName} className="block text-lg font-semibold text-gray-800 mb-3">
              {group.groupName}:
            </label>
            
            <select
              id={group.groupName}
              name={group.groupName}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition-all duration-150"
              value={selections[group.groupName]?.name}
              onChange={(e) => handleSelectionChange(group.groupName, e.target.value)}
              disabled={isAdding}
            >
              {group.choices.map((choice) => (
                <option key={choice.name} value={choice.name}>
                  {choice.name} {choice.priceModifier !== 0 ? `(${choice.priceModifier > 0 ? '+' : ''}${formatCurrency(choice.priceModifier)} ${choice.unit})` : '(Included)'}
                </option>
              ))}
            </select>
          </div>
        )) : (
          <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-yellow-800">No configuration options available for this product.</p>
          </div>
        )}
      </div>

      {/* 2. Quote Only vs E-commerce Action Area (Conditional Rendering) */}
      {isQuoteOnly ? (
        // RENDER THE QUOTE FORM FOR QUOTE-ONLY PRODUCTS
        <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">Submit Request</h3>
            <QuoteRequestForm 
                productName={productName} 
                selections={currentSelections}
            />
            <p className="text-center text-sm text-gray-500 pt-2">
                Your configuration details are pre-filled above.
            </p>
        </div>
      ) : (
        // RENDER THE E-COMMERCE ADD TO CART FLOW
        <>
            {/* Quantity Input */}
            <div className="flex items-center space-x-4 p-5 bg-white rounded-xl shadow-md">
                <label htmlFor="quantity" className="text-lg font-semibold text-gray-800">
                Quantity:
                </label>
                <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center border border-gray-300 rounded-md py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isAdding}
                />
            </div>
            
            {/* Total Price and Action Button */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-semibold text-gray-700">Calculated Price:</span>
                    <span className="text-4xl font-extrabold text-indigo-600">
                        {formatCurrency(totalPrice)}
                    </span>
                </div>

                <button 
                onClick={handleAction}
                disabled={isAdding}
                className={`w-full py-4 px-6 font-bold rounded-xl text-white shadow-lg transition-all duration-300 transform ${
                    'bg-indigo-600 hover:bg-indigo-700'
                } ${isAdding ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                >
                {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-3">
                    Price is final and includes all selections and quantity.
                </p>
            </div>
        </>
      )}
    </div>
  );
}
