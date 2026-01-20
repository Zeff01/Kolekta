'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Currency = 'USD' | 'PHP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Current exchange rate (you can update this or fetch from an API)
const USD_TO_PHP_RATE = 56.5; // As of January 2025

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [exchangeRate] = useState(USD_TO_PHP_RATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load currency preference on mount
  useEffect(() => {
    const loadCurrency = async () => {
      if (authLoading) return;

      if (isAuthenticated) {
        // Load from database
        try {
          const response = await fetch('/api/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.currency) {
              setCurrencyState(data.currency);
            }
          }
        } catch (error) {
          console.error('Failed to load currency preference:', error);
          // Fallback to localStorage
          const savedCurrency = localStorage.getItem('preferred-currency') as Currency;
          if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'PHP')) {
            setCurrencyState(savedCurrency);
          }
        }
      } else {
        // Load from localStorage when not authenticated
        const savedCurrency = localStorage.getItem('preferred-currency') as Currency;
        if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'PHP')) {
          setCurrencyState(savedCurrency);
        }
      }

      setIsLoaded(true);
    };

    loadCurrency();
  }, [isAuthenticated, authLoading]);

  // Save currency preference to localStorage and database when it changes
  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);

    // Save to database if authenticated
    if (isAuthenticated) {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currency: newCurrency }),
        });
      } catch (error) {
        console.error('Failed to save currency preference:', error);
      }
    }
  };

  // Convert USD price to selected currency
  const convertPrice = (usdPrice: number): number => {
    if (currency === 'PHP') {
      return usdPrice * exchangeRate;
    }
    return usdPrice;
  };

  // Format price with currency symbol
  const formatPrice = (usdPrice: number): string => {
    const price = convertPrice(usdPrice);
    if (currency === 'PHP') {
      return `₱${price.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        exchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
