"use client";

import { useState, useEffect } from "react";
import { getAccessToken } from "@/lib/auth/storage";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getAccessToken();
    if (!t && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    setToken(t);
  }, []);

  return token;
}

