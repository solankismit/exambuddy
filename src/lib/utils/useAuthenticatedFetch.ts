"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { mergeHeadersWithAuth } from "./api";

/**
 * React hook for authenticated fetch requests
 * Automatically adds authorization token and handles token refresh
 *
 * Example:
 * ```tsx
 * const authFetch = useAuthenticatedFetch();
 * const response = await authFetch('/api/users');
 * const data = await response.json();
 * ```
 */
export function useAuthenticatedFetch() {
  const { token, refreshAccessToken, logout } = useAuth();

  return useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = mergeHeadersWithAuth(options.headers, token);

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        try {
          const data = await refreshAccessToken();
          if (data) {
            // Retry with new token
            headers.set("Authorization", `Bearer ${data.accessToken}`);
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (error) {
          await logout();
          throw new Error("Authentication failed");
        }
      }

      return response;
    },
    [token, refreshAccessToken, logout]
  );
}
