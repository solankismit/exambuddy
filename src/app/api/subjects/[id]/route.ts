import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/subjects/[id]
 * Get subject details with chapters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
        chapters: {
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

    if (!subject) {
      throw new AppError(404, "Subject not found", "SUBJECT_NOT_FOUND");
    }

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

