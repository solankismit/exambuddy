import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/exams/[id]
 * Get exam details with subjects
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subjects: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!exam) {
      throw new AppError(404, "Exam not found", "EXAM_NOT_FOUND");
    }

    return NextResponse.json({ exam }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

