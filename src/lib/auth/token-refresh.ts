/**
 * Centralized token refresh logic
 * Single source of truth for token refresh operations
 */

import {
  clearAuthAndRedirect,
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
} from "./storage";

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh access token using refresh token
 * Returns new tokens or throws error
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthAndRedirect();
    throw new Error("Token refresh failed");
  }

  const data: RefreshTokenResponse = await response.json();

  // Update storage
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);

  return data;
}

/**
 * Handle 401 error by attempting token refresh
 * Returns new access token if refresh succeeds, null otherwise
 */
export async function handle401Error(): Promise<string | null> {
  try {
    const data = await refreshAccessToken();
    return data.accessToken;
  } catch (error) {
    // Refresh failed, auth will be cleared and redirected
    return null;
  }
}
