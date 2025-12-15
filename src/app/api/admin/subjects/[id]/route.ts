import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { updateSubjectSchema } from "@/lib/utils/validation";

/**
 * PUT /api/admin/subjects/[id]
 * Update subject
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
    const data = updateSubjectSchema.parse(body);

    const subject = await prisma.subject.update({
      where: { id },
      data,
    });

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/subjects/[id]
 * Delete subject
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }
    return handleError(error);
  }
}

