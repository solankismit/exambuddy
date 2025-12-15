import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/exams
 * Get all active exams
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const exams = await prisma.exam.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ exams }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

