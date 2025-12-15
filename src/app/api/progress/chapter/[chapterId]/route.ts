import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/progress/chapter/[chapterId]
 * Get user's progress for a chapter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const authContext = await requireAuth(request);
    const { chapterId } = await params;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new AppError(404, "Chapter not found", "CHAPTER_NOT_FOUND");
    }

    const chapterProgress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: authContext.user.id,
          chapterId,
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
    });

    const quizProgress = await prisma.userQuizProgress.findMany({
      where: {
        userId: authContext.user.id,
        quiz: {
          chapterId,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        quiz: {
          order: "asc",
        },
      },
    });

    return NextResponse.json(
      {
        chapterProgress: chapterProgress || {
          userId: authContext.user.id,
          chapterId,
          totalQuizzes: 0,
          completedQuizzes: 0,
          progress: 0,
        },
        quizProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
