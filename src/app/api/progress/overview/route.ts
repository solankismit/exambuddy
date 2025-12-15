import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/progress/overview
 * Get overall user progress across all exams
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAuth(request);

    const [examProgress, totalQuizzes, completedQuizzes] = await Promise.all([
      prisma.userExamProgress.findMany({
        where: { userId: authContext.user.id },
        include: {
          exam: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.userQuizProgress.count({
        where: { userId: authContext.user.id },
      }),
      prisma.userQuizProgress.count({
        where: {
          userId: authContext.user.id,
          isCompleted: true,
        },
      }),
    ]);

    const overallProgress =
      totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

    return NextResponse.json(
      {
        overview: {
          totalExams: examProgress.length,
          totalQuizzes,
          completedQuizzes,
          overallProgress,
        },
        examProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

