/**
 * Spaced Repetition Algorithm
 * Modified SM-2 algorithm for calculating next review dates
 * Based on SuperMemo algorithm with customizations for quiz platform
 */

import type { MasteryLevel, ISpacedRepetitionConfig } from '@shared/types/progress';

/**
 * Default spaced repetition configuration
 */
export const DEFAULT_SR_CONFIG: ISpacedRepetitionConfig = {
  newInterval: 1, // 1 day for new questions
  learningInterval: 3, // 3 days for learning questions
  familiarInterval: 7, // 7 days for familiar questions
  masteredInterval: 21, // 21 days for mastered questions
  maxInterval: 90, // Max 90 days between reviews
};

/**
 * Calculate next review date based on mastery level and correctness
 * @param masteryLevel Current mastery level
 * @param isCorrect Was the last attempt correct?
 * @param currentInterval Current interval in days (for calculating next interval)
 * @param config Configuration for intervals
 * @returns Next review date
 */
export function calculateNextReviewDate(
  masteryLevel: MasteryLevel,
  isCorrect: boolean,
  currentInterval: number = 0,
  config: ISpacedRepetitionConfig = DEFAULT_SR_CONFIG
): Date {
  let intervalDays: number;

  if (!isCorrect) {
    // If wrong, reset to 1 day (review tomorrow)
    intervalDays = 1;
  } else {
    // If correct, use interval based on mastery level
    switch (masteryLevel) {
      case 'new':
        intervalDays = config.newInterval;
        break;
      case 'learning':
        intervalDays = config.learningInterval;
        break;
      case 'familiar':
        intervalDays = config.familiarInterval;
        break;
      case 'mastered':
        // For mastered questions, exponentially increase interval
        intervalDays = currentInterval > 0 ? Math.min(currentInterval * 2, config.maxInterval) : config.masteredInterval;
        break;
      default:
        intervalDays = config.newInterval;
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);
  nextReview.setHours(0, 0, 0, 0); // Reset to start of day

  return nextReview;
}

/**
 * Calculate new mastery level based on performance
 * @param currentLevel Current mastery level
 * @param isCorrect Was the last attempt correct?
 * @param correctCount Total correct attempts
 * @param wrongCount Total wrong attempts
 * @returns New mastery level
 */
export function calculateMasteryLevel(
  currentLevel: MasteryLevel,
  isCorrect: boolean,
  correctCount: number,
  wrongCount: number
): MasteryLevel {
  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 0;

  // If wrong answer, potentially downgrade mastery
  if (!isCorrect) {
    if (currentLevel === 'mastered' && accuracy < 0.9) {
      return 'familiar';
    }
    if (currentLevel === 'familiar' && accuracy < 0.7) {
      return 'learning';
    }
    if (currentLevel === 'learning' && accuracy < 0.5) {
      return 'new';
    }
    // Don't downgrade if still above thresholds
    return currentLevel;
  }

  // If correct answer, potentially upgrade mastery
  // Progression thresholds:
  // new → learning: 1-2 correct
  // learning → familiar: 3-4 correct
  // familiar → mastered: 5+ correct OR 90%+ accuracy

  if (currentLevel === 'new' && correctCount >= 1) {
    return 'learning';
  }

  if (currentLevel === 'learning' && correctCount >= 3) {
    return 'familiar';
  }

  if (currentLevel === 'familiar' && (correctCount >= 5 || accuracy >= 0.9)) {
    return 'mastered';
  }

  // No level change
  return currentLevel;
}

/**
 * Check if a question is due for review
 * @param nextReviewDate Next scheduled review date
 * @returns True if due for review
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const now = new Date();
  return nextReviewDate <= now;
}

/**
 * Check if a question is overdue for review (more than 1 day late)
 * @param nextReviewDate Next scheduled review date
 * @returns True if overdue
 */
export function isOverdue(nextReviewDate: Date): boolean {
  const now = new Date();
  const daysSinceReview = (now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReview > 1;
}

/**
 * Get current interval in days (time between last attempt and next review)
 * @param lastAttemptDate Last attempt date
 * @param nextReviewDate Next review date
 * @returns Interval in days
 */
export function getCurrentInterval(lastAttemptDate: Date, nextReviewDate: Date): number {
  return Math.ceil(
    (nextReviewDate.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calculate difficulty factor based on mastery level
 * Used for adaptive question selection
 * @param masteryLevel Mastery level
 * @returns Difficulty factor (0-1, higher = harder)
 */
export function getDifficultyFactor(masteryLevel: MasteryLevel): number {
  switch (masteryLevel) {
    case 'new':
      return 0.2; // Low difficulty for new questions
    case 'learning':
      return 0.4;
    case 'familiar':
      return 0.6;
    case 'mastered':
      return 0.8; // Higher difficulty for mastered questions
    default:
      return 0.5;
  }
}

/**
 * Get priority score for question selection
 * Higher score = higher priority
 * @param nextReviewDate Next review date
 * @param masteryLevel Mastery level
 * @returns Priority score
 */
export function getQuestionPriority(nextReviewDate: Date, masteryLevel: MasteryLevel): number {
  const now = new Date();
  const daysSinceReview = (now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24);

  // Priority factors:
  // 1. Overdue reviews (highest priority)
  // 2. Due today
  // 3. Learning/Familiar questions (need reinforcement)
  // 4. New questions
  // 5. Mastered questions (lowest priority)

  let priority = 0;

  // Time-based priority
  if (daysSinceReview > 7) {
    priority += 100; // Very overdue
  } else if (daysSinceReview > 3) {
    priority += 50; // Moderately overdue
  } else if (daysSinceReview > 0) {
    priority += 20; // Due today
  }

  // Mastery-based priority
  switch (masteryLevel) {
    case 'learning':
      priority += 15;
      break;
    case 'familiar':
      priority += 10;
      break;
    case 'new':
      priority += 5;
      break;
    case 'mastered':
      priority += 1;
      break;
  }

  return priority;
}

/**
 * Bulk calculate review priorities for multiple questions
 * @param questions Array of questions with nextReviewDate and masteryLevel
 * @returns Array of questions with priority scores, sorted by priority
 */
export function prioritizeQuestions<
  T extends { nextReviewDate: Date; masteryLevel: MasteryLevel }
>(questions: T[]): (T & { priority: number })[] {
  const withPriorities = questions.map((q) => ({
    ...q,
    priority: getQuestionPriority(q.nextReviewDate, q.masteryLevel),
  }));

  return withPriorities.sort((a, b) => b.priority - a.priority);
}
