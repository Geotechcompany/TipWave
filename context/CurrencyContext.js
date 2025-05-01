"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Currency context
const CurrencyContext = createContext();

// Export the context so it can be imported directly
export { CurrencyContext };

// Create a custom hook for easier usage
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([]);
  const [currency, setCurrency] = useState({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1
  });
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch currencies and exchange rates from the database
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/currencies');
        
        if (!response.ok) {
          throw new Error('Failed to fetch currencies');
        }
        
        const data = await response.json();
        setCurrencies(data.currencies || []);
        
        // Set user's preferred currency or default from database
        if (data.userCurrency) {
          setCurrency(data.userCurrency);
        } else if (data.defaultCurrency) {
          setCurrency(data.defaultCurrency);
        }

        // Create exchange rates object
        const rates = {};
        data.currencies.forEach(curr => {
          rates[curr.code] = curr.exchangeRate;
        });
        setExchangeRates(rates);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Format currency based on locale and currency code
  const formatCurrency = (amount, currencyCode) => {
    // Ensure amount is a number
    const numericAmount = Number(amount) || 0;
    
    // Get currency by code or use default
    const currToUse = currencyCode 
      ? currencies.find(c => c.code === currencyCode) 
      : currency;
    
    if (!currToUse) return `$${numericAmount.toFixed(2)}`;
    
    return `${currToUse.symbol}${numericAmount.toFixed(2)}`;
  };

  // Convert an amount from one currency to another
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    // Ensure amount is a number
    const numericAmount = Number(amount) || 0;
    
    // Get source and target currencies
    const from = fromCurrency 
      ? currencies.find(c => c.code === fromCurrency) 
      : currency;
      
    const to = toCurrency 
      ? currencies.find(c => c.code === toCurrency) 
      : currency;
    
    if (!from || !to) return numericAmount;
    
    // Simple conversion using exchange rates
    return (numericAmount / from.exchangeRate) * to.exchangeRate;
  };

  // Set user preferred currency
  const setUserCurrency = async (currencyCode) => {
    try {
      const currency = currencies.find(c => c.code === currencyCode);
      if (!currency) {
        throw new Error('Invalid currency code');
      }
      
      // Update in database (could add an API endpoint for this)
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          preferredCurrency: currencyCode 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update currency preference');
      }
      
      setCurrency(currency);
      return true;
    } catch (error) {
      console.error('Error setting currency:', error);
      return false;
    }
  };

  const value = {
    currencies,
    currency,
    exchangeRates,
    isLoading,
    error,
    formatCurrency,
    convertCurrency,
    setUserCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
} 