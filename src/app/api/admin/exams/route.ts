import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";
import { createExamSchema } from "@/lib/utils/validation";

/**
 * POST /api/admin/exams
 * Create new exam
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const body = await request.json();
    const data = createExamSchema.parse(body);

    const exam = await prisma.exam.create({
      data,
    });

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

