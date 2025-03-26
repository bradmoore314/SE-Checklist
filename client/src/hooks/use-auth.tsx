import { createContext, ReactNode, useContext } from "react";
import { 
  useQuery, 
  useMutation, 
  UseMutationResult 
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          return await response.json();
        }
        if (response.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch user data");
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      return data.user;
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/me"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }
      return data.user;
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/me"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}