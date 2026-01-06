import { NextRequest } from "next/server";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";
import { AuthContext, AuthUser } from "@/lib/types/auth";
import { AppError } from "@/lib/utils/errors";
import { mapPrismaUserToAuthUser } from "./user-mapper";

// Cache for Supabase client per request
const requestCache = new WeakMap<NextRequest, any>();

/**
 * Get or create Supabase client for a request (cached per request)
 * This reduces multiple createClient calls in the same request
 */
async function getSupabaseClient(request: NextRequest) {
  if (requestCache.has(request)) {
    return requestCache.get(request);
  }

  const { createClient } = await import("@/lib/supabase/server");
  const client = await createClient();
  requestCache.set(request, client);
  return client;
}

/**
 * Authenticate request using JWT token only (optimized)
 * This reduces Supabase API calls by relying primarily on JWT verification
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthContext> {
  // Extract custom JWT token from header
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new AppError(401, "No token provided", "NO_TOKEN");
  }

  // Verify custom JWT token first (faster than Supabase call)
  let jwtPayload;
  try {
    jwtPayload = verifyToken(token);
  } catch (error) {
    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }

  // Fetch user from database (single source of truth)
  const user = await prisma.user.findUnique({
    where: { id: jwtPayload.userId },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  // Verify user still exists in Supabase (optional check, can be removed for better performance)
  // Only verify if you need to ensure Supabase session is still valid
  try {
    const supabase = await getSupabaseClient(request);
    const {
      data: { user: supabaseUser },
      error: supabaseError,
    } = await supabase.auth.getUser();

    // If Supabase user doesn't exist or doesn't match, invalidate
    if (supabaseError || !supabaseUser || supabaseUser.id !== user.id) {
      console.log(
        "Supabase session invalid",
        supabaseError,
        supabaseUser,
        user
      );
      throw new AppError(
        401,
        "Supabase session invalid",
        "SUPABASE_SESSION_INVALID"
      );
    }
  } catch (error) {
    // If it's already an AppError, rethrow
    if (error instanceof AppError) {
      throw error;
    }
    // Otherwise, treat as unauthorized
    throw new AppError(401, "Authentication failed", "AUTH_FAILED");
  }

  return {
    user: mapPrismaUserToAuthUser(user),
    token,
  };
}

/**
 * Optional authentication - returns null if not authenticated
 * Handles logout automatically if token is invalid
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    return await authenticateRequest(request);
  } catch (error) {
    // If authentication fails, return null
    // The caller should handle logout if needed
    return null;
  }
}

/**
 * Authenticate request and handle logout if not authenticated
 * Use this for routes that require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  try {
    return await authenticateRequest(request);
  } catch (error) {
    // If it's an authentication error, we should handle logout
    if (error instanceof AppError && error.statusCode === 401) {
      // Clear any existing sessions
      const authHeader = request.headers.get("authorization");
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        try {
          const jwtPayload = verifyToken(token);
          // Delete all sessions for this user
          await prisma.session.deleteMany({
            where: { userId: jwtPayload.userId },
          });
        } catch {
          // Token is invalid, ignore
        }
      }
    }
    throw error;
  }
}
