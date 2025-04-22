import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in sessionStorage
 * Similar to useLocalStorage but data is cleared when the browser session ends
 * @param key The key to store the data under in sessionStorage
 * @param initialValue The initial value to use if no value exists in sessionStorage
 * @returns A tuple containing the current value and a function to update it
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from session storage by key
      const item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Set to sessionStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = typeof storedValue === 'function' 
        ? storedValue(storedValue as any) 
        : storedValue;
        
      // Save to session storage
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}