import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { updateRoleSchema } from "@/lib/utils/validation";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * PATCH /api/users/[id]/roles
 * Update user role (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;
    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    // Prevent changing own role
    if (authContext.user.id === id) {
      throw new AppError(
        400,
        "Cannot change your own role",
        "CANNOT_CHANGE_OWN_ROLE"
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
