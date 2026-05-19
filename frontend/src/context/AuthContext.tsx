import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/index.js";
import apiClient from "../api/client.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "Admin" | "Sales User") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("smart_crm_token");
      const storedUser = localStorage.getItem("smart_crm_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally verify session validity with /me endpoint
        try {
          const res = await apiClient.get("/auth/me");
          if (res.data && res.data.data.user) {
            setUser(res.data.data.user);
            localStorage.setItem("smart_crm_user", JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          // If token expired, clear session
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("smart_crm_token", receivedToken);
    localStorage.setItem("smart_crm_user", JSON.stringify(receivedUser));
  };

  const register = async (name: string, email: string, password: string, role: "Admin" | "Sales User") => {
    const res = await apiClient.post("/auth/register", { name, email, password, role });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("smart_crm_token", receivedToken);
    localStorage.setItem("smart_crm_user", JSON.stringify(receivedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smart_crm_token");
    localStorage.removeItem("smart_crm_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;
