import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/quizzes/[id]
 * Get quiz details with questions (without correct answers for taking quiz)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
                exam: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            order: true,
            // Note: correctAnswer and explanation are excluded for quiz taking
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found", "QUIZ_NOT_FOUND");
    }

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

