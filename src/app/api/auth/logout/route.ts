import { NextRequest, NextResponse } from "next/server";
import { optionalAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth/jwt";

/**
 * POST /api/auth/logout
 * Logout user and invalidate tokens
 * Works even if request is not authenticated (handles logout for expired tokens)
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get auth context, but don't fail if not authenticated
    const authContext = await optionalAuth(request);

    if (authContext) {
      // User is authenticated, sign out from Supabase
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      await supabase.auth.signOut().catch(() => {
        // Ignore Supabase errors during logout
      });

      // Delete all sessions for this user
      await prisma.session.deleteMany({
        where: { userId: authContext.user.id },
      });
    } else {
      // Not authenticated, but try to clean up based on token if present
      const authHeader = request.headers.get("authorization");
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        try {
          const jwtPayload = verifyToken(token);
          // Delete sessions for this user even if token is expired
          await prisma.session.deleteMany({
            where: { userId: jwtPayload.userId },
          });
        } catch {
          // Token is invalid, nothing to clean up
        }
      }
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Even if there's an error, return success to allow client-side cleanup
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  }
}
