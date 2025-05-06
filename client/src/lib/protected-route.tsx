import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  // In production, we never allow auth bypass
  // This code has been completely removed for production readiness
  
  // No authentication recovery mechanism needed in production

  // In production, we NEVER bypass authentication
  return (
    <Route path={path}>
      {() => {
        // Still loading
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading your account...</p>
            </div>
          );
        }
        
        // No user - redirect to auth page
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // User is authenticated
        return <Component />;
      }}
    </Route>
  );
}