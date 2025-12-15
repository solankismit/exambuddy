import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/streak
 * Get user's daily streak information
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAuth(request);

    let streak = await prisma.userStreak.findUnique({
      where: { userId: authContext.user.id },
    });

    if (!streak) {
      // Create default streak if doesn't exist
      streak = await prisma.userStreak.create({
        data: {
          userId: authContext.user.id,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return NextResponse.json(
      {
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastQuizDate: streak.lastQuizDate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

