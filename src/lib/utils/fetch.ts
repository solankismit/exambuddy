/**
 * Fetch wrapper that automatically adds authorization token
 * Use this instead of native fetch for authenticated requests
 *
 * This function:
 * - Automatically adds Authorization header with token from localStorage
 * - Handles token refresh on 401 errors
 * - Redirects to login if authentication fails
 */
import { getAccessToken } from "@/lib/auth/storage";
import { handle401Error } from "@/lib/auth/token-refresh";
import { mergeHeadersWithAuth } from "./api";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from storage
  const token = getAccessToken();

  // Merge headers with auth
  const headers = mergeHeadersWithAuth(options.headers, token);

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    const newToken = await handle401Error();

    if (newToken) {
      // Retry original request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      throw new Error("Authentication failed");
    }
  }

  return response;
}

/**
 * Re-export useAuthenticatedFetch hook for convenience
 * Use the hook from @/lib/utils/useAuthenticatedFetch in client components
 */
export { useAuthenticatedFetch } from "./useAuthenticatedFetch";
