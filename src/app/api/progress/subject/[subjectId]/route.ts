import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/progress/subject/[subjectId]
 * Get user's progress for a subject
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const authContext = await requireAuth(request);
    const { subjectId } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }

    const subjectProgress = await prisma.userSubjectProgress.findUnique({
      where: {
        userId_subjectId: {
          userId: authContext.user.id,
          subjectId,
        },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const chapterProgress = await prisma.userChapterProgress.findMany({
      where: {
        userId: authContext.user.id,
        chapter: {
          subjectId,
        },
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        chapter: {
          order: "asc",
        },
      },
    });

    return NextResponse.json(
      {
        subjectProgress: subjectProgress || {
          userId: authContext.user.id,
          subjectId,
          totalChapters: 0,
          completedChapters: 0,
          progress: 0,
        },
        chapterProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

