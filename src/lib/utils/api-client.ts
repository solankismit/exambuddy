import { getAccessToken } from "@/lib/auth/storage";

/**
 * Get authorization header with token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = getAccessToken();
  if (!token) {
    // Redirect to login if no token
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("No access token");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Fetch with automatic auth header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}
