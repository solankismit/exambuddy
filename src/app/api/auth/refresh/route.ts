import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateTokens } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";
import { handleError, AppError } from "@/lib/utils/errors";

/**
 * POST /api/auth/refresh
 * Refresh JWT access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new AppError(400, "Refresh token is required", "NO_REFRESH_TOKEN");
    }

    // Verify refresh token
    const { userId } = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const session = await prisma.session.findFirst({
      where: {
        userId,
        token: refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new AppError(
        401,
        "Invalid or expired refresh token",
        "INVALID_REFRESH_TOKEN"
      );
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    });

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Delete old refresh token
    await prisma.session.delete({
      where: { id: session.id },
    });

    // Create new session
    await prisma.session.create({
      data: {
        userId: session.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(
      {
        accessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
