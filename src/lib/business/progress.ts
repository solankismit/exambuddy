import { prisma } from "@/lib/prisma/client";

/**
 * Calculate and update quiz progress for a user
 */
export async function updateQuizProgress(
  userId: string,
  quizId: string,
  isCompleted: boolean
) {
  const quizProgress = await prisma.userQuizProgress.upsert({
    where: {
      userId_quizId: {
        userId,
        quizId,
      },
    },
    create: {
      userId,
      quizId,
      isCompleted,
      attemptCount: 1,
      lastAttemptAt: new Date(),
    },
    update: {
      isCompleted: true,
      attemptCount: {
        increment: 1,
      },
      lastAttemptAt: new Date(),
    },
  });

  return quizProgress;
}

/**
 * Calculate and update chapter progress
 */
export async function updateChapterProgress(userId: string, chapterId: string) {
  // Get all quizzes in the chapter
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      quizzes: {
        where: { isActive: true },
      },
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  const totalQuizzes = chapter.quizzes.length;

  // Count completed quizzes for this user in this chapter
  const quizIds = chapter.quizzes.map((q) => q.id);
  const completedQuizzes = await prisma.userQuizProgress.count({
    where: {
      userId,
      quizId: {
        in: quizIds,
      },
      isCompleted: true,
    },
  });

  const progress =
    totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

  const chapterProgress = await prisma.userChapterProgress.upsert({
    where: {
      userId_chapterId: {
        userId,
        chapterId,
      },
    },
    create: {
      userId,
      chapterId,
      totalQuizzes,
      completedQuizzes,
      progress,
    },
    update: {
      totalQuizzes,
      completedQuizzes,
      progress,
    },
  });

  return chapterProgress;
}

/**
 * Calculate and update subject progress
 */
export async function updateSubjectProgress(userId: string, subjectId: string) {
  // Get all chapters in the subject
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        where: { isActive: true },
      },
    },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const totalChapters = subject.chapters.length;

  // Count completed chapters (chapters with progress >= 100)
  const chapterIds = subject.chapters.map((c) => c.id);
  const completedChapters = await prisma.userChapterProgress.count({
    where: {
      userId,
      chapterId: {
        in: chapterIds,
      },
      progress: {
        gte: 100,
      },
    },
  });

  const progress =
    totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  const subjectProgress = await prisma.userSubjectProgress.upsert({
    where: {
      userId_subjectId: {
        userId,
        subjectId,
      },
    },
    create: {
      userId,
      subjectId,
      totalChapters,
      completedChapters,
      progress,
    },
    update: {
      totalChapters,
      completedChapters,
      progress,
    },
  });

  return subjectProgress;
}

/**
 * Calculate and update exam progress
 */
export async function updateExamProgress(userId: string, examId: string) {
  // Get all subjects in the exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjects: {
        where: { isActive: true },
      },
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const totalSubjects = exam.subjects.length;

  // Count completed subjects (subjects with progress >= 100)
  const subjectIds = exam.subjects.map((s) => s.id);
  const completedSubjects = await prisma.userSubjectProgress.count({
    where: {
      userId,
      subjectId: {
        in: subjectIds,
      },
      progress: {
        gte: 100,
      },
    },
  });

  const progress =
    totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

  const examProgress = await prisma.userExamProgress.upsert({
    where: {
      userId_examId: {
        userId,
        examId,
      },
    },
    create: {
      userId,
      examId,
      totalSubjects,
      completedSubjects,
      progress,
    },
    update: {
      totalSubjects,
      completedSubjects,
      progress,
    },
  });

  return examProgress;
}

/**
 * Recalculate all progress levels after a quiz attempt
 */
export async function recalculateProgressAfterAttempt(
  userId: string,
  quizId: string
) {
  // Get quiz to find parent chapter, subject, and exam
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      chapter: {
        include: {
          subject: {
            include: {
              exam: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Update all levels
  await updateChapterProgress(userId, quiz.chapterId);
  await updateSubjectProgress(userId, quiz.chapter.subjectId);
  await updateExamProgress(userId, quiz.chapter.subject.examId);
}
