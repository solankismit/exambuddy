import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/middleware";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);
    requireAdmin(authContext);

    const [
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers,
      usersThisMonth,
      usersLastMonth,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // Admin users
      prisma.user.count({ where: { role: "ADMIN" } }),
      // Regular users
      prisma.user.count({ where: { role: "USER" } }),
      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      // Users created this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Users created last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1
            ),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const growthRate =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : usersThisMonth > 0
        ? 100
        : 0;

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          adminUsers,
          regularUsers,
          usersThisMonth,
          usersLastMonth,
          growthRate: Math.round(growthRate * 100) / 100,
        },
        recentUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
