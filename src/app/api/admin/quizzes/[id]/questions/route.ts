import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { createQuestionSchema } from "@/lib/utils/validation";

/**
 * POST /api/admin/quizzes/[quizId]/questions
 * Create question under quiz
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;
    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found", "QUIZ_NOT_FOUND");
    }

    const question = await prisma.question.create({
      data: {
        ...data,
        quizId: id,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
