import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DebugLoginPage() {
  const { user, bypassAuth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If already logged in, redirect to home
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      const success = await bypassAuth();
      if (success) {
        toast({
          title: "Debug login successful",
          description: "You have been logged in with development credentials"
        });
        setLocation("/");
      } else {
        toast({
          title: "Debug login failed",
          description: "Failed to authenticate with development credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Debug login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during debug login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularLogin = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login", {
        username: "dev-admin",
        password: "password123"
      });
      
      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Login successful",
          description: "You have been logged in with regular credentials"
        });
        setLocation("/");
      } else {
        toast({
          title: "Login failed",
          description: "Failed to authenticate with regular credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Regular login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Developer Debug Login</CardTitle>
          <CardDescription>
            This page is for development purposes only. It bypasses regular authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={handleDevLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Debug Login (Bypass Auth)"
              )}
            </Button>
            
            <Button 
              className="w-full"
              variant="outline"
              onClick={handleRegularLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Regular Login (dev-admin / password123)"
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground mt-6 text-center">
              This page automatically attempts to authenticate for dev purposes.
              <br />
              <span className="font-medium">Do not use in production.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}