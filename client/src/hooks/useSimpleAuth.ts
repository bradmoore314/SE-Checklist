/**
 * Simple authentication hook for immediate testing
 * This provides a temporary auth system while Supabase is being configured
 */

import { useState, useEffect } from 'react';

interface SimpleUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export function useSimpleAuth() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('simple-auth-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple validation for demo purposes
    if (email && password) {
      const user: SimpleUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        user_metadata: {
          full_name: email.split('@')[0]
        }
      };
      
      localStorage.setItem('simple-auth-user', JSON.stringify(user));
      setUser(user);
      return { user };
    }
    throw new Error('Invalid credentials');
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Simple signup for demo purposes
    if (email && password) {
      const user: SimpleUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        user_metadata: {
          full_name: fullName || email.split('@')[0]
        }
      };
      
      localStorage.setItem('simple-auth-user', JSON.stringify(user));
      setUser(user);
      return { user };
    }
    throw new Error('Invalid signup data');
  };

  const signOut = async () => {
    localStorage.removeItem('simple-auth-user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };
}