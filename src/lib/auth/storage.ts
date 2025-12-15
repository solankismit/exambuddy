/**
 * Centralized auth storage utilities
 * Single source of truth for localStorage keys and operations
 */

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

export interface AuthStorageData {
  accessToken: string;
  refreshToken: string;
  user: any;
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Get user from storage
 */
export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get all auth data from storage
 */
export function getAuthStorage(): Partial<AuthStorageData> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getStoredUser();

  return {
    ...(accessToken && { accessToken }),
    ...(refreshToken && { refreshToken }),
    ...(user && { user }),
  };
}

/**
 * Set access token in storage
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Set refresh token in storage
 */
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Set user in storage
 */
export function setStoredUser(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Set all auth data in storage
 */
export function setAuthStorage(data: AuthStorageData): void {
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  setStoredUser(data.user);
}

/**
 * Clear all auth data from storage
 */
export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
}

/**
 * Redirect to login page
 */
export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Clear auth and redirect to login
 */
export function clearAuthAndRedirect(): void {
  clearAuthStorage();
  redirectToLogin();
}
