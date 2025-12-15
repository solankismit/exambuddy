import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/middleware";
import { requireAdmin, requireResourceAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { updateUserSchema } from "@/lib/utils/validation";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * GET /api/users/[id]
 * Get user by ID (admin or self)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    const { id } = await params;

    requireResourceAccess(authContext, id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]
 * Update user (admin or self)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    const { id } = await params;

    requireResourceAccess(authContext, id);

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Non-admins can't update certain fields
    if (authContext.user.role !== "ADMIN") {
      // Regular users can only update their name
      if (data.email) {
        throw new AppError(403, "Cannot update email", "FORBIDDEN");
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
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

/**
 * DELETE /api/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const { id } = await params;

    // Prevent self-deletion
    if (authContext.user.id === id) {
      throw new AppError(400, "Cannot delete yourself", "CANNOT_DELETE_SELF");
    }

    const user = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json(
      { message: "User deleted successfully", user },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
