import { useSimpleAuth } from './useSimpleAuth';

export function useAuth() {
  // Use simple auth for immediate testing
  // This can be switched back to Supabase when fully configured
  return useSimpleAuth();
}