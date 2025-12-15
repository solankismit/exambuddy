import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { updateExamSchema } from "@/lib/utils/validation";

/**
 * PUT /api/admin/exams/[id]
 * Update exam
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
    const data = updateExamSchema.parse(body);

    const exam = await prisma.exam.update({
      where: { id },
      data,
    });

    return NextResponse.json({ exam }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new AppError(404, "Exam not found", "EXAM_NOT_FOUND");
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/exams/[id]
 * Delete exam (cascades to subjects, chapters, quizzes, questions)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exam deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new AppError(404, "Exam not found", "EXAM_NOT_FOUND");
    }
    return handleError(error);
  }
}

