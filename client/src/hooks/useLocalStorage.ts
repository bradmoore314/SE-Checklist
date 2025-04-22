import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * @param key The key to store the data under in localStorage
 * @param initialValue The initial value to use if no value exists in localStorage
 * @returns A tuple containing the current value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Set to localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = typeof storedValue === 'function' 
        ? storedValue(storedValue as any) 
        : storedValue;
        
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}