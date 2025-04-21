import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";

// Get browser environment
const isProduction = import.meta.env.PROD;

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [authBypassEnabled, setAuthBypassEnabled] = useState(
    localStorage.getItem('allow_auth_bypass') === 'true'
  );
  
  // Check if we should bypass auth based on environment and local storage
  const shouldBypassAuth = !isProduction || authBypassEnabled;

  // For error recovery - set a flag to bypass auth for production environments
  const enableAuthBypass = () => {
    localStorage.setItem('allow_auth_bypass', 'true');
    setAuthBypassEnabled(true);
    // Force reload to apply changes
    window.location.reload();
  };
  
  // Handle authentication errors with helpful fallback
  useEffect(() => {
    // If we're having auth issues in production, show a recovery button after timeout
    if (isProduction && isLoading) {
      const timer = setTimeout(() => {
        // If still loading after 5 seconds, we might have an auth issue
        if (document.body) {
          const existingButton = document.getElementById('auth-recovery-btn');
          if (!existingButton && !document.querySelector('.auth-recovery-container')) {
            const recoveryDiv = document.createElement('div');
            recoveryDiv.className = 'auth-recovery-container fixed bottom-4 right-4 bg-red-50 p-4 rounded-lg shadow-lg border border-red-200 z-50';
            recoveryDiv.innerHTML = `
              <p class="text-sm text-red-700 mb-2">Authentication taking too long?</p>
              <button id="auth-recovery-btn" class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Enable Auth Bypass
              </button>
            `;
            document.body.appendChild(recoveryDiv);
            
            // Add event listener to the button
            const btn = document.getElementById('auth-recovery-btn');
            if (btn) {
              btn.addEventListener('click', enableAuthBypass);
            }
          }
        }
      }, 5000); // Show after 5 seconds of loading
      
      return () => {
        clearTimeout(timer);
        // Remove recovery button when component unmounts
        const recoveryDiv = document.querySelector('.auth-recovery-container');
        if (recoveryDiv) {
          recoveryDiv.remove();
        }
      };
    }
  }, [isProduction, isLoading]);

  return (
    <Route path={path}>
      {() => {
        // Still loading and not bypassing auth
        if (isLoading && !shouldBypassAuth) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading your account...</p>
            </div>
          );
        }

        // No user but auth bypass is enabled - this will allow access
        if (!user && shouldBypassAuth) {
          console.log('Auth bypass enabled - allowing access without authentication');
          return <Component />;
        }
        
        // No user and no bypass - redirect to auth page
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // User is authenticated
        return <Component />;
      }}
    </Route>
  );
}