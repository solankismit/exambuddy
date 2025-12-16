import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
    const parsed = registerSchema.parse(body);

    // Normalize email: trim whitespace and convert to lowercase
    let email = parsed.email.trim().toLowerCase();
    const password = parsed.password;
    const name = parsed.name;

    // Validate normalized email format
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email || !emailRegex.test(email)) {
      throw new AppError(
        400,
        "Invalid email address format",
        "VALIDATION_ERROR"
      );
    }

    // Ensure email is not empty after normalization
    if (!email || email.length === 0) {
      throw new AppError(400, "Email cannot be empty", "VALIDATION_ERROR");
    }

    // Create Supabase client with anon key for signUp
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new AppError(
        500,
        "Supabase configuration is missing",
        "CONFIGURATION_ERROR"
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists (using normalized email)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, "User already exists", "USER_EXISTS");
    }

    // Create user in Supabase with normalized email
    const {
      data: { user: supabaseUser },
      error: signUpError,
    } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        name: name || null,
      },
      email_confirm: true, // Auto-confirm email
    });

    if (signUpError) {
      // Log the error for debugging
      console.error("Supabase signUp error:", {
        message: signUpError.message,
        status: signUpError.status,
        email: email,
      });
      throw new AppError(
        400,
        signUpError.message || "Registration failed",
        "REGISTRATION_FAILED"
      );
    }

    if (!supabaseUser) {
      throw new AppError(
        400,
        "Registration failed: No user returned",
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
