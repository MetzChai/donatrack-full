"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, setToken, setUser, getUser, logout as logoutUtil } from "@/utils/auth";
import { getCurrentUser } from "@/lib/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "CREATOR" | "ADMIN";
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUserState(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser(token);
      setUserState(userData);
      setUser(userData);
    } catch (err) {
      console.error("Failed to refresh user:", err);
      // Don't clear token immediately - might be a network error
      // Only clear if we're sure the token is invalid (401)
      const error = err as any;
      if (error?.response?.status === 401) {
        logoutUtil();
        setUserState(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user exists in localStorage first (for faster initial load)
    const storedUser = getUser();
    if (storedUser) {
      setUserState(storedUser);
    }

    // Then verify with backend
    refreshUser();
  }, []);

  const login = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
    setLoading(false); // Set loading to false immediately after login
  };

  const logout = () => {
    logoutUtil();
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

