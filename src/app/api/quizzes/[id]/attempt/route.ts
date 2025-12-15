import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { handleError, AppError } from "@/lib/utils/errors";
import { submitQuizAttemptSchema } from "@/lib/utils/validation";
import { evaluateQuizAttempt } from "@/lib/business/quiz-evaluation";

/**
 * POST /api/quizzes/[id]/attempt
 * Submit quiz attempt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAuth(request);
    const { id: quizId } = await params;

    const body = await request.json();
    const { responses } = submitQuizAttemptSchema.parse(body);

    const result = await evaluateQuizAttempt(
      authContext.user.id,
      quizId,
      responses
    );

    return NextResponse.json(
      {
        attempt: {
          id: result.attemptId,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          responses: result.responses,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

