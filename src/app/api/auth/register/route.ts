import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTokens } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";
import { registerSchema } from "@/lib/utils/validation";
import { handleError, AppError } from "@/lib/utils/errors";
import { mapPrismaUserToAuthUser } from "@/lib/auth/user-mapper";
import { REFRESH_TOKEN_EXPIRATION } from "@/lib/auth/constants";

/**
 * POST /api/auth/register
 * Register new user with Supabase and create Prisma record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const supabase = await createClient();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, "User already exists", "USER_EXISTS");
    }

    // Create user in Supabase
    const {
      data: { user: supabaseUser },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
      },
    });

    if (signUpError || !supabaseUser) {
      throw new AppError(
        400,
        signUpError?.message || "Registration failed",
        "REGISTRATION_FAILED"
      );
    }

    // Create user in Prisma database
    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: name || null,
        role: "USER", // Default role
      },
    });

    // Generate custom JWT tokens
    const { accessToken, refreshToken } = generateTokens(
      mapPrismaUserToAuthUser(user)
    );

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
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
