import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get browser environment
const isProduction = import.meta.env.PROD;

// Log the auth state
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Disable auth bypass - use proper Supabase authentication
const bypassAuth = false;

// Custom error handler to make error messages more user-friendly
async function handleApiError(res: Response): Promise<void> {
  if (res.ok) return;
  
  try {
    // Try to parse the error as JSON first
    const errorData = await res.json();
    throw new Error(errorData.message || `HTTP Error ${res.status}: ${res.statusText}`);
  } catch (e) {
    // If JSON parsing fails, use text
    if (e instanceof Error && e.message) {
      throw e;
    }
    
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP Error ${res.status}: ${text || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  customHeaders?: Record<string, string>,
): Promise<Response> {
  console.log(`Fetch ${method} ${url}${data ? ' with data' : ''}`);
  
  // Get Supabase auth token if available
  let authToken = null;
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    authToken = session?.access_token;
  } catch (error) {
    console.log('No Supabase session found');
  }
  
  // Base headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    // Add Supabase auth token if available
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    // Add auth bypass header for development
    ...(bypassAuth ? { "X-Bypass-Auth": "true" } : {}),
    // Include any custom headers
    ...(customHeaders || {})
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`Fetch finished loading: ${method} ${url}`);
    
    // For requests other than GET, we want to throw on error
    if (method !== 'GET') {
      await handleApiError(res);
    }
    
    return res;
  } catch (error) {
    console.log(`Fetch failed loading: ${method} ${url}`);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Get Supabase auth token if available
    let authToken = null;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      authToken = session?.access_token;
    } catch (error) {
      console.log('No Supabase session found');
    }
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
          ...(bypassAuth ? { "X-Bypass-Auth": "true" } : {})
        }
      });
      
      // Special handling for 401 Unauthorized
      if (res.status === 401) {
        console.log(`Auth required for ${url}`);
        
        // Handle according to the options
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        
        // Otherwise throw as normal
        throw new Error('Authentication required. Please log in.');
      }
      
      // For non-401 errors, use our standard error handler
      await handleApiError(res);
      
      // Parse and return the response data
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${url}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, 
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // Retry once
    },
    mutations: {
      retry: 1, // Retry once
    },
  },
});
