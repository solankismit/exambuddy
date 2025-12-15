import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/progress/exam/[examId]
 * Get user's progress for an exam
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const authContext = await requireAuth(request);
    const { examId } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new AppError(404, "Exam not found", "EXAM_NOT_FOUND");
    }

    const examProgress = await prisma.userExamProgress.findUnique({
      where: {
        userId_examId: {
          userId: authContext.user.id,
          examId,
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const subjectProgress = await prisma.userSubjectProgress.findMany({
      where: {
        userId: authContext.user.id,
        subject: {
          examId,
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
      orderBy: {
        subject: {
          order: "asc",
        },
      },
    });

    return NextResponse.json(
      {
        examProgress: examProgress || {
          userId: authContext.user.id,
          examId,
          totalSubjects: 0,
          completedSubjects: 0,
          progress: 0,
        },
        subjectProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

