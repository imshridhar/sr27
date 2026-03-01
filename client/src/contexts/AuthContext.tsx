import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  medicalConditions?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  
  // Check if user is already logged in
  const { data, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with email:", email);
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const userData = await response.json();
      console.log("Login successful, user data:", userData);
      setUser(userData);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  // Register function
  const register = async (userData: any) => {
    try {
      console.log("Attempting registration with data:", { ...userData, password: "REDACTED" });
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      
      const newUser = await response.json();
      console.log("Registration successful, user data:", newUser);
      setUser(newUser);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      setUser(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function getQueryFn({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: unknown[] }) => {
    try {
      const response = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (on401 === "returnNull" && response.status === 401) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}
