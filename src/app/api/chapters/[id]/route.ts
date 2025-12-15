import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/chapters/[id]
 * Get chapter details with quizzes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            exam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        quizzes: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new AppError(404, "Chapter not found", "CHAPTER_NOT_FOUND");
    }

    return NextResponse.json({ chapter }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

