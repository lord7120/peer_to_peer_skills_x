import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type SessionContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

// Helper function to make API requests
async function apiRequest(url: string, method: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Handle HTTP errors
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If can't parse JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  // Check if there's content to parse
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const userData = await apiRequest('/api/user', 'GET');
        setUser(userData);
      } catch (error) {
        // If 401 unauthorized, just set user to null without showing error
        if (error instanceof Error && error.message.includes('401')) {
          setUser(null);
        } else {
          setError(error instanceof Error ? error : new Error(String(error)));
          toast({
            title: "Authentication Error",
            description: error instanceof Error ? error.message : String(error),
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [toast]);

  // Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await apiRequest('/api/login', 'POST', credentials);
      setUser(userData);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name || userData.username}!`,
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newUser = await apiRequest('/api/register', 'POST', userData);
      setUser(newUser);
      toast({
        title: "Registration Successful",
        description: `Welcome, ${newUser.name || newUser.username}!`,
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await apiRequest('/api/logout', 'POST');
      setUser(null);
      toast({
        title: "Logout Successful",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SessionContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}