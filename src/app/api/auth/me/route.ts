import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAuth(request);

    return NextResponse.json(
      {
        user: authContext.user,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
