import { prisma } from "@/lib/prisma/client";
import { updateQuizProgress } from "./progress";
import { updateUserStreak } from "./streak";
import { recalculateProgressAfterAttempt } from "./progress";

export interface QuizResponse {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D";
}

export interface EvaluationResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  responses: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

/**
 * Evaluate quiz attempt and create records
 */
export async function evaluateQuizAttempt(
  userId: string,
  quizId: string,
  responses: QuizResponse[]
): Promise<EvaluationResult> {
  // Get quiz with all questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;

  if (responses.length !== totalQuestions) {
    throw new Error(
      `Expected ${totalQuestions} responses, got ${responses.length}`
    );
  }

  // Evaluate responses
  let correctAnswers = 0;
  const evaluatedResponses: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }> = [];

  for (const response of responses) {
    const question = questions.find((q) => q.id === response.questionId);
    if (!question) {
      throw new Error(`Question ${response.questionId} not found`);
    }

    const isCorrect = question.correctAnswer === response.selectedAnswer;
    if (isCorrect) {
      correctAnswers++;
    }

    evaluatedResponses.push({
      questionId: question.id,
      selectedAnswer: response.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    });
  }

  const score =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Create quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
    },
  });

  // Create question responses
  await prisma.questionResponse.createMany({
    data: evaluatedResponses.map((r) => ({
      attemptId: attempt.id,
      questionId: r.questionId,
      selectedAnswer: r.selectedAnswer,
      isCorrect: r.isCorrect,
    })),
  });

  // Update quiz progress
  const quizProgress = await updateQuizProgress(userId, quizId, true);

  // Update best score if current is higher
  if (!quizProgress.bestScore || score > quizProgress.bestScore) {
    await prisma.userQuizProgress.update({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
      data: {
        bestScore: score,
      },
    });
  }

  // Update streak
  await updateUserStreak(userId);

  // Recalculate progress at all levels
  await recalculateProgressAfterAttempt(userId, quizId);

  return {
    attemptId: attempt.id,
    score,
    totalQuestions,
    correctAnswers,
    responses: evaluatedResponses,
  };
}
