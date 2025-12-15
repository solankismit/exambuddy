import { prisma } from "@/lib/prisma/client";

/**
 * Update user streak after a quiz attempt
 */
export async function updateUserStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get or create user streak
  let userStreak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!userStreak) {
    // Create new streak record
    userStreak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastQuizDate: today,
      },
    });
    return userStreak;
  }

  // Check if last quiz date exists
  if (!userStreak.lastQuizDate) {
    // First quiz ever
    userStreak = await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: 1,
        lastQuizDate: today,
      },
    });
    return userStreak;
  }

  const lastQuizDate = new Date(userStreak.lastQuizDate);
  lastQuizDate.setHours(0, 0, 0, 0);

  let newCurrentStreak = userStreak.currentStreak;
  let newLongestStreak = userStreak.longestStreak;

  // Check if last quiz was yesterday
  if (lastQuizDate.getTime() === yesterday.getTime()) {
    // Continue streak
    newCurrentStreak = userStreak.currentStreak + 1;
  } else if (lastQuizDate.getTime() === today.getTime()) {
    // Already quizzed today, no change to streak
    newCurrentStreak = userStreak.currentStreak;
  } else {
    // Streak broken, reset to 1
    newCurrentStreak = 1;
  }

  // Update longest streak if current exceeds it
  if (newCurrentStreak > newLongestStreak) {
    newLongestStreak = newCurrentStreak;
  }

  userStreak = await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastQuizDate: today,
    },
  });

  return userStreak;
}
