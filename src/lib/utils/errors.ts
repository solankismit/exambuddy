import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
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
  )
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return createErrorResponse(error.statusCode, error.message, error.code)
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR')
  }

  return createErrorResponse(500, 'Unknown error occurred', 'UNKNOWN_ERROR')
}

