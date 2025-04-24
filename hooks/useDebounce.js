import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value by the specified delay
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500);

    // Clean up the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Also export as default for backward compatibility
export default useDebounce; 