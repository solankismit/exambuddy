import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string
) {
  return NextResponse.json(
    {
      error: {
        message,
        code: code || `HTTP_${statusCode}`,
      },
    },
    { status: statusCode }
  );
}

export function handleError(error: unknown) {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    const message = firstError?.message || "Validation failed";
    return createErrorResponse(400, message, "VALIDATION_ERROR");
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return createErrorResponse(error.statusCode, error.message, error.code);
  }

  // Handle other errors
  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    return createErrorResponse(500, "Internal server error", "INTERNAL_ERROR");
  }

  return createErrorResponse(500, "Unknown error occurred", "UNKNOWN_ERROR");
}
