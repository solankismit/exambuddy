import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/auth/logout
 * Logout user and invalidate tokens
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);

    // Sign out from Supabase
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: authContext.user.id },
    });

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
