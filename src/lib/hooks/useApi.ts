"use client";

import { useState, useCallback } from "react";
import { getAccessToken } from "@/lib/auth/storage";
import { buildApiUrl } from "@/lib/utils/api";

interface UseApiOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T = any>(
      url: string,
      options: RequestInit = {},
      apiOptions?: UseApiOptions
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        if (!token) {
          window.location.href = "/login";
          return null;
        }

        const fullUrl = url.startsWith("http") ? url : buildApiUrl(url);
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error?.message || `Request failed: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json().catch(() => null);
        apiOptions?.onSuccess?.(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        apiOptions?.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    <T = any>(url: string, apiOptions?: UseApiOptions) =>
      request<T>(url, { method: "GET" }, apiOptions),
    [request]
  );

  const post = useCallback(
    <T = any>(url: string, body: any, apiOptions?: UseApiOptions) =>
      request<T>(
        url,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        apiOptions
      ),
    [request]
  );

  const put = useCallback(
    <T = any>(url: string, body: any, apiOptions?: UseApiOptions) =>
      request<T>(
        url,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
        apiOptions
      ),
    [request]
  );

  const del = useCallback(
    <T = any>(url: string, apiOptions?: UseApiOptions) =>
      request<T>(url, { method: "DELETE" }, apiOptions),
    [request]
  );

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
  };
}

