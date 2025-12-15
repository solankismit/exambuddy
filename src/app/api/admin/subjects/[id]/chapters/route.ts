import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { createChapterSchema } from "@/lib/utils/validation";

/**
 * POST /api/admin/subjects/[subjectId]/chapters
 * Create chapter under subject
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
    const data = createChapterSchema.parse(body);

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }

    const chapter = await prisma.chapter.create({
      data: {
        ...data,
        subjectId: id,
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
