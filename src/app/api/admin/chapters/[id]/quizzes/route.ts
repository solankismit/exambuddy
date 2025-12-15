import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { createQuizSchema } from "@/lib/utils/validation";

/**
 * POST /api/admin/chapters/[chapterId]/quizzes
 * Create quiz under chapter
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
    const data = createQuizSchema.parse(body);

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new AppError(404, "Chapter not found", "CHAPTER_NOT_FOUND");
    }

    const quiz = await prisma.quiz.create({
      data: {
        ...data,
        chapterId: id,
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
