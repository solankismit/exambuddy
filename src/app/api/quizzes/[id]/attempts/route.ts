import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/quizzes/[id]/attempts
 * Get user's quiz attempt history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAuth(request);
    const { id: quizId } = await params;

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found", "QUIZ_NOT_FOUND");
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: authContext.user.id,
        quizId,
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        completedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ attempts }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

