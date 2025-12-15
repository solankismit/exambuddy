import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";
import { AuthContext } from "@/lib/types/auth";
import { AppError } from "@/lib/utils/errors";

/**
 * Authenticate request and return user context
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthContext> {
  // First, check Supabase session
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
    error: supabaseError,
  } = await supabase.auth.getUser();

  if (supabaseError || !supabaseUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }

  // Extract custom JWT token from header
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new AppError(401, "No token provided", "NO_TOKEN");
  }

  // Verify custom JWT token
  let jwtPayload;
  try {
    jwtPayload = verifyToken(token);
  } catch (error) {
    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }

  // Verify Supabase user matches JWT user
  if (supabaseUser.id !== jwtPayload.userId) {
    throw new AppError(401, "Token user mismatch", "TOKEN_MISMATCH");
  }

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: jwtPayload.userId },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}

/**
 * Optional authentication - returns null if not authenticated
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
