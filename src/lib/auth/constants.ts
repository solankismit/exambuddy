/**
 * Centralized auth constants
 * Single source of truth for all auth-related constants
 */

/**
 * Token refresh interval (6 hours)
 */
export const TOKEN_REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

/**
 * Refresh token expiration (30 days in milliseconds)
 */
export const REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",
  REGISTER: "/api/auth/register",
} as const;

