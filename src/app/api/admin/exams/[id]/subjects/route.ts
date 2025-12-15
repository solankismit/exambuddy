import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { createSubjectSchema } from "@/lib/utils/validation";

/**
 * POST /api/admin/exams/[examId]/subjects
 * Create subject under exam
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
    const data = createSubjectSchema.parse(body);

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new AppError(404, "Exam not found", "EXAM_NOT_FOUND");
    }

    const subject = await prisma.subject.create({
      data: {
        ...data,
        examId: id,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
