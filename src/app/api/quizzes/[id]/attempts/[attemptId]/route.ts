import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/quizzes/[id]/attempts/[attemptId]
 * Get detailed attempt results
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; attemptId: string }>;
  }
) {
  try {
    const authContext = await requireAuth(request);
    const { id: quizId, attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                explanation: true,
              },
            },
          },
          orderBy: {
            question: {
              order: "asc",
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError(404, "Attempt not found", "ATTEMPT_NOT_FOUND");
    }

    if (attempt.userId !== authContext.user.id) {
      throw new AppError(403, "Forbidden", "FORBIDDEN");
    }

    if (attempt.quizId !== quizId) {
      throw new AppError(400, "Attempt does not belong to this quiz", "INVALID_ATTEMPT");
    }

    return NextResponse.json({ attempt }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

