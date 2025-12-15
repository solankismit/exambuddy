/**
 * Centralized API utilities
 * Single source of truth for API configuration and helpers
 */

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Build API URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Create authorization header
 */
export function createAuthHeader(token: string | null): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Merge headers with authorization
 */
export function mergeHeadersWithAuth(
  existingHeaders: HeadersInit | undefined,
  token: string | null
): Headers {
  const headers = new Headers(existingHeaders);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}
