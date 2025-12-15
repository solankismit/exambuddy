import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { updateChapterSchema } from "@/lib/utils/validation";

/**
 * PUT /api/admin/chapters/[id]
 * Update chapter
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
    const data = updateChapterSchema.parse(body);

    const chapter = await prisma.chapter.update({
      where: { id },
      data,
    });

    return NextResponse.json({ chapter }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      throw new AppError(404, "Chapter not found", "CHAPTER_NOT_FOUND");
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/chapters/[id]
 * Delete chapter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    await prisma.chapter.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Chapter deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      throw new AppError(404, "Chapter not found", "CHAPTER_NOT_FOUND");
    }
    return handleError(error);
  }
}

