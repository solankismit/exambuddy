import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { updateQuizSchema } from "@/lib/utils/validation";

/**
 * PUT /api/admin/quizzes/[id]
 * Update quiz
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;
    const body = await request.json();
    const data = updateQuizSchema.parse(body);

    const quiz = await prisma.quiz.update({
      where: { id },
      data,
    });

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new AppError(404, "Quiz not found", "QUIZ_NOT_FOUND");
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/quizzes/[id]
 * Delete quiz
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new AppError(404, "Quiz not found", "QUIZ_NOT_FOUND");
    }
    return handleError(error);
  }
}

