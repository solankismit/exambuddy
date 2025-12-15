import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { reorderSchema } from "@/lib/utils/validation";

/**
 * PATCH /api/admin/subjects/[id]/reorder
 * Reorder subjects within exam
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;
    const body = await request.json();
    const { order } = reorderSchema.parse(body);

    const subject = await prisma.subject.update({
      where: { id },
      data: { order },
    });

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }
    return handleError(error);
  }
}
