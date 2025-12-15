import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { updateQuestionSchema } from "@/lib/utils/validation";

/**
 * PUT /api/admin/questions/[id]
 * Update question
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
    const data = updateQuestionSchema.parse(body);

    const question = await prisma.question.update({
      where: { id },
      data,
    });

    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new AppError(404, "Question not found", "QUESTION_NOT_FOUND");
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * Delete question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new AppError(404, "Question not found", "QUESTION_NOT_FOUND");
    }
    return handleError(error);
  }
}

