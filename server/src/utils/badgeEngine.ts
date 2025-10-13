/**
 * Badge Checking Engine
 * Automatically detects when users meet badge criteria
 * Awards badges and triggers notifications
 */

import type { IBadgeDoc } from '../models/Badge';
import { Badge } from '../models/Badge';
import { QuizResult } from '../models/QuizResult';
import type { IUserProgressDoc } from '../models/UserProgress';

/**
 * Check all badges for a user and award any newly earned ones
 * @param userProgress User's progress document
 * @returns Array of newly earned badge IDs
 */
export async function checkAndAwardBadges(userProgress: IUserProgressDoc): Promise<string[]> {
  const allBadges = await Badge.find({ isSecret: false });
  const earnedBadgeIds = userProgress.badges.map((b) => b.badgeId);
  const newlyEarnedBadges: string[] = [];

  for (const badge of allBadges) {
    // Skip if already earned
    if (earnedBadgeIds.includes(badge.id)) continue;

    const meetsRequirements = await checkBadgeRequirements(badge, userProgress);

    if (meetsRequirements) {
      // Award badge
      userProgress.badges.push({
        badgeId: badge.id,
        earnedAt: new Date(),
      });

      // Award XP
      userProgress.xp += badge.xpReward;

      newlyEarnedBadges.push(badge.id);
    }
  }

  if (newlyEarnedBadges.length > 0) {
    await userProgress.save();
  }

  return newlyEarnedBadges;
}

/**
 * Check if user meets requirements for a specific badge
 * @param badge Badge to check
 * @param userProgress User's progress
 * @returns True if requirements met
 */
export async function checkBadgeRequirements(
  badge: IBadgeDoc,
  userProgress: IUserProgressDoc
): Promise<boolean> {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'xp':
      return checkXPBadge(criteria.threshold, userProgress);

    case 'streak':
      return checkStreakBadge(criteria.threshold, userProgress);

    case 'study_time':
      return checkStudyTimeBadge(criteria.threshold, userProgress);

    case 'quiz_count':
      return await checkQuizCountBadge(
        criteria.threshold,
        criteria.metadata,
        userProgress
      );

    case 'quiz_score':
      return await checkQuizScoreBadge(
        criteria.threshold,
        criteria.metadata,
        userProgress
      );

    case 'perfect_quiz':
      return checkPerfectQuizBadge(criteria.threshold, userProgress);

    case 'mastery':
      return checkMasteryBadge(
        criteria.threshold,
        criteria.metadata,
        userProgress
      );

    case 'speed':
      return await checkSpeedBadge(
        criteria.threshold,
        criteria.metadata,
        userProgress
      );

    case 'custom':
      // Custom badges require special logic
      return await checkCustomBadge(badge.id, criteria, userProgress);

    default:
      return false;
  }
}

/**
 * Check XP milestone badge
 */
function checkXPBadge(threshold: number, userProgress: IUserProgressDoc): boolean {
  return userProgress.xp >= threshold;
}

/**
 * Check streak badge
 */
function checkStreakBadge(threshold: number, userProgress: IUserProgressDoc): boolean {
  return userProgress.streaks.currentStreak >= threshold;
}

/**
 * Check study time badge
 */
function checkStudyTimeBadge(threshold: number, userProgress: IUserProgressDoc): boolean {
  return userProgress.totalStudyTimeMinutes >= threshold;
}

/**
 * Check quiz count badge
 */
async function checkQuizCountBadge(
  threshold: number,
  metadata: Record<string, unknown> | undefined,
  userProgress: IUserProgressDoc
): Promise<boolean> {
  const minScore = metadata?.minScore as number | undefined;

  if (minScore) {
    // Count only quizzes with score >= minScore
    const count = await QuizResult.countDocuments({
      userId: userProgress.userId,
      score: { $gte: minScore },
    });
    return count >= threshold;
  }

  // Count all quizzes
  return userProgress.quizzesTaken >= threshold;
}

/**
 * Check quiz score badge (e.g., "Score 100% on any quiz")
 */
async function checkQuizScoreBadge(
  threshold: number,
  metadata: Record<string, unknown> | undefined,
  userProgress: IUserProgressDoc
): Promise<boolean> {
  const level = metadata?.level as string | undefined;

  const query: Record<string, unknown> = {
    userId: userProgress.userId,
    score: { $gte: threshold },
  };

  if (level) {
    query.level = level;
  }

  const count = await QuizResult.countDocuments(query);
  return count > 0;
}

/**
 * Check perfect quiz badge
 */
function checkPerfectQuizBadge(threshold: number, userProgress: IUserProgressDoc): boolean {
  return userProgress.perfectQuizzes >= threshold;
}

/**
 * Check mastery badge (e.g., "Master 50 questions")
 */
function checkMasteryBadge(
  threshold: number,
  metadata: Record<string, unknown> | undefined,
  userProgress: IUserProgressDoc
): boolean {
  const difficulty = metadata?.difficulty as 'easy' | 'medium' | 'hard' | undefined;
  const allDifficulties = metadata?.all_difficulties as boolean | undefined;

  if (allDifficulties) {
    // Must master threshold questions in EACH difficulty
    const easyMastered = userProgress.difficultyProgress.easy.mastered;
    const mediumMastered = userProgress.difficultyProgress.medium.mastered;
    const hardMastered = userProgress.difficultyProgress.hard.mastered;

    return (
      easyMastered >= threshold &&
      mediumMastered >= threshold &&
      hardMastered >= threshold
    );
  }

  if (difficulty) {
    // Count mastered in specific difficulty
    return userProgress.difficultyProgress[difficulty].mastered >= threshold;
  }

  // Count all mastered questions
  const masteredCount = Array.from(userProgress.questions.values()).filter(
    (q) => q.masteryLevel === 'mastered'
  ).length;

  return masteredCount >= threshold;
}

/**
 * Check speed badge (e.g., "Answer 50 questions correctly in under 5 seconds each")
 */
async function checkSpeedBadge(
  threshold: number,
  metadata: Record<string, unknown> | undefined,
  userProgress: IUserProgressDoc
): Promise<boolean> {
  const maxTime = (metadata?.maxTime as number) || 5;

  // Count questions in progress with correct answer and time < maxTime
  let fastCorrectCount = 0;

  for (const [, progress] of userProgress.questions) {
    if (progress.correctCount > 0 && progress.averageTimeSeconds < maxTime) {
      fastCorrectCount++;
    }
  }

  return fastCorrectCount >= threshold;
}

/**
 * Check custom badge logic
 * Requires badge-specific implementation
 */
async function checkCustomBadge(
  badgeId: string,
  _criteria: { threshold: number; metadata?: Record<string, unknown> },
  userProgress: IUserProgressDoc
): Promise<boolean> {
  // Implement custom badge logic here based on badge ID
  // Examples:
  // - "Study every day for a week"
  // - "Complete quiz at 3am" (night owl badge)
  // - "Answer 100 questions on mobile" (would need device tracking)

  switch (badgeId) {
    case 'completionist':
      // Master all questions in all difficulties
      return (
        userProgress.difficultyProgress.easy.mastered >= 50 &&
        userProgress.difficultyProgress.medium.mastered >= 150 &&
        userProgress.difficultyProgress.hard.mastered >= 250
      );

    case 'early_bird':
      // Complete activity before 6am (would need timestamp tracking)
      // Placeholder - implement with session timestamp tracking
      return false;

    case 'night_owl':
      // Complete activity after 11pm
      // Placeholder - implement with session timestamp tracking
      return false;

    case 'consistency_king':
      // Study every day for 30 days (would need daily activity tracking)
      return userProgress.streaks.currentStreak >= 30;

    default:
      return false;
  }
}

/**
 * Get badge progress for a user (for multi-tier badges)
 * @param badgeId Badge ID
 * @param userProgress User's progress
 * @returns Progress percentage (0-100)
 */
export async function getBadgeProgress(
  badgeId: string,
  userProgress: IUserProgressDoc
): Promise<number> {
  const badge = await Badge.findById(badgeId);
  if (!badge) return 0;

  // If already earned, return 100%
  if (userProgress.badges.some((b) => b.badgeId === badgeId)) {
    return 100;
  }

  const { criteria } = badge;

  switch (criteria.type) {
    case 'xp':
      return Math.min((userProgress.xp / criteria.threshold) * 100, 100);

    case 'streak':
      return Math.min(
        (userProgress.streaks.currentStreak / criteria.threshold) * 100,
        100
      );

    case 'study_time':
      return Math.min(
        (userProgress.totalStudyTimeMinutes / criteria.threshold) * 100,
        100
      );

    case 'quiz_count': {
      const minScore = criteria.metadata?.minScore as number | undefined;
      let count: number;

      if (minScore) {
        count = await QuizResult.countDocuments({
          userId: userProgress.userId,
          score: { $gte: minScore },
        });
      } else {
        count = userProgress.quizzesTaken;
      }

      return Math.min((count / criteria.threshold) * 100, 100);
    }

    case 'perfect_quiz':
      return Math.min(
        (userProgress.perfectQuizzes / criteria.threshold) * 100,
        100
      );

    case 'mastery': {
      const masteredCount = Array.from(userProgress.questions.values()).filter(
        (q) => q.masteryLevel === 'mastered'
      ).length;
      return Math.min((masteredCount / criteria.threshold) * 100, 100);
    }

    default:
      return 0;
  }
}

/**
 * Get all badges with user progress
 * @param userProgress User's progress
 * @returns Array of badges with earned status and progress
 */
export async function getUserBadgesWithProgress(
  userProgress: IUserProgressDoc
): Promise<
  Array<{
    badge: IBadgeDoc;
    earned: boolean;
    earnedAt?: Date;
    progress: number;
  }>
> {
  const allBadges = await Badge.find({ isSecret: false }).sort({ rarity: 1, xpReward: 1 });
  const earnedBadgeIds = userProgress.badges.map((b) => b.badgeId);

  const badgesWithProgress = [];

  for (const badge of allBadges) {
    const earned = earnedBadgeIds.includes(badge.id);
    const earnedBadge = userProgress.badges.find((b) => b.badgeId === badge.id);
    const progress = earned ? 100 : await getBadgeProgress(badge.id, userProgress);

    badgesWithProgress.push({
      badge,
      earned,
      earnedAt: earnedBadge?.earnedAt,
      progress,
    });
  }

  return badgesWithProgress;
}

/**
 * Get secret badges that user has unlocked
 * @param userProgress User's progress
 * @returns Array of secret badges earned
 */
export async function getUnlockedSecretBadges(
  userProgress: IUserProgressDoc
): Promise<IBadgeDoc[]> {
  const earnedBadgeIds = userProgress.badges.map((b) => b.badgeId);
  const secretBadges = await Badge.find({
    _id: { $in: earnedBadgeIds },
    isSecret: true,
  });

  return secretBadges;
}
