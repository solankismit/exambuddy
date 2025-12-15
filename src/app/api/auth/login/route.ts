import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTokens } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";
import { loginSchema } from "@/lib/utils/validation";
import { handleError, AppError } from "@/lib/utils/errors";
import { mapPrismaUserToAuthUser } from "@/lib/auth/user-mapper";
import { REFRESH_TOKEN_EXPIRATION } from "@/lib/auth/constants";

/**
 * POST /api/auth/login
 * Authenticate user with Supabase and generate custom JWT tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = await createClient();

    // Authenticate with Supabase
    const {
      data: { user: supabaseUser, session },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !supabaseUser) {
      throw new AppError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS"
      );
    }

    // Get or create user in Prisma database
    let user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
    });

    if (!user) {
      // Create user record if it doesn't exist
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || null,
        },
      });
    }

    // Generate custom JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      },
    });

    return NextResponse.json(
      {
        user: mapPrismaUserToAuthUser(user),
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
