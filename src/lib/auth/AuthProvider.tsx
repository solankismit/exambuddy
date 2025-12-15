"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthUser } from "@/lib/types/auth";
import {
  getAuthStorage,
  setAuthStorage,
  clearAuthStorage,
  redirectToLogin,
} from "./storage";
import {
  refreshAccessToken as refreshTokenUtil,
  RefreshTokenResponse,
} from "./token-refresh";
import { API_ENDPOINTS, TOKEN_REFRESH_INTERVAL } from "./constants";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<RefreshTokenResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window === "undefined") return;

      try {
        const stored = getAuthStorage();

        if (stored.accessToken && stored.user) {
          setToken(stored.accessToken);
          setRefreshToken(stored.refreshToken || null);
          setUser(stored.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(() => {
      refreshAccessToken().catch(() => {
        // If refresh fails, logout
        logout();
      });
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [token]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    clearAuthStorage();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();

        setUser(data.user);
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        setAuthStorage({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [clearAuth]
  );

  const logout = useCallback(async () => {
    try {
      // Try to logout on server if we have a token
      if (token) {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore errors during logout
        });
      }
    } finally {
      clearAuth();
      redirectToLogin();
    }
  }, [token, clearAuth]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const data = await refreshTokenUtil();
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth]);

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
