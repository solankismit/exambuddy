import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/server-auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { paginationSchema } from "@/lib/utils/validation";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/users
 * List users (admin only, paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, search } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
    });

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users
 * Create user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const body = await request.json();
    const { email, name, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: { message: "Email is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: "User already exists", code: "USER_EXISTS" } },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: role || "USER",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
