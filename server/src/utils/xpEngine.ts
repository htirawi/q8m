/**
 * XP Calculation Engine
 * Awards experience points for various user actions
 * Based on action type, performance, and context
 */

import type { XPSource } from '@shared/types/gamification';

/**
 * XP reward configuration
 * Maps actions to XP amounts
 */
export const XP_REWARDS: Record<XPSource, number> = {
  // Study Mode
  study_correct_first_try: 20,
  study_correct_retry: 10,
  study_complete_session: 50, // Bonus for completing 10+ questions
  study_master_question: 30, // Question reaches "mastered" status

  // Quiz Mode
  quiz_question_correct: 15,
  quiz_complete: 25, // Base completion bonus
  quiz_perfect: 100, // 100% score bonus
  quiz_bonus_fast: 5, // Answered in <10 seconds

  // Streaks
  streak_milestone: 0, // Calculated dynamically based on streak length

  // Badges
  badge_earned: 0, // Badge XP is defined in badge itself

  // Social
  referral: 100, // Friend signs up using referral code
  daily_login: 5, // Daily check-in bonus

  // Milestones
  milestone_achievement: 0, // Calculated based on milestone type
};

/**
 * Calculate XP for study question completion
 * @param isCorrect Was the answer correct?
 * @param isFirstTry First attempt on this question?
 * @param timeSpentSeconds Time spent on question
 * @returns XP earned
 */
export function calculateStudyQuestionXP(
  isCorrect: boolean,
  isFirstTry: boolean,
  timeSpentSeconds: number
): { xp: number; breakdown: { base: number; bonus?: number; reason?: string } } {
  if (!isCorrect) {
    return { xp: 0, breakdown: { base: 0 } };
  }

  const base = isFirstTry ? XP_REWARDS.study_correct_first_try : XP_REWARDS.study_correct_retry;

  // Speed bonus: answered in <30 seconds
  let bonus = 0;
  let reason: string | undefined;

  if (timeSpentSeconds < 30) {
    bonus = 5;
    reason = 'Speed bonus';
  }

  return {
    xp: base + bonus,
    breakdown: { base, bonus, reason },
  };
}

/**
 * Calculate XP for mastering a question
 * @param previousMasteryLevel Previous mastery level
 * @param newMasteryLevel New mastery level
 * @returns XP earned (only if upgraded to mastered)
 */
export function calculateMasteryXP(
  previousMasteryLevel: string,
  newMasteryLevel: string
): number {
  if (newMasteryLevel === 'mastered' && previousMasteryLevel !== 'mastered') {
    return XP_REWARDS.study_master_question;
  }
  return 0;
}

/**
 * Calculate XP for study session completion
 * @param questionsCompleted Number of questions completed
 * @param correctAnswers Number of correct answers
 * @param sessionDurationMinutes Session duration in minutes
 * @returns XP earned
 */
export function calculateStudySessionXP(
  questionsCompleted: number,
  correctAnswers: number,
  sessionDurationMinutes: number
): { xp: number; breakdown: { base: number; bonuses: { amount: number; reason: string }[] } } {
  const breakdown = {
    base: 0,
    bonuses: [] as { amount: number; reason: string }[],
  };

  // Base session completion bonus (if 10+ questions)
  if (questionsCompleted >= 10) {
    breakdown.base = XP_REWARDS.study_complete_session;
  }

  // Accuracy bonus: 90%+ correct
  const accuracy = questionsCompleted > 0 ? correctAnswers / questionsCompleted : 0;
  if (accuracy >= 0.9 && questionsCompleted >= 10) {
    breakdown.bonuses.push({
      amount: 25,
      reason: '90%+ accuracy',
    });
  }

  // Consistency bonus: 20+ questions in one session
  if (questionsCompleted >= 20) {
    breakdown.bonuses.push({
      amount: 30,
      reason: '20+ questions completed',
    });
  }

  // Marathon bonus: 60+ minutes
  if (sessionDurationMinutes >= 60) {
    breakdown.bonuses.push({
      amount: 50,
      reason: '60+ minute session',
    });
  }

  const totalBonuses = breakdown.bonuses.reduce((sum, b) => sum + b.amount, 0);

  return {
    xp: breakdown.base + totalBonuses,
    breakdown,
  };
}

/**
 * Calculate XP for quiz completion
 * @param score Score percentage (0-100)
 * @param totalQuestions Number of questions
 * @param totalTimeSeconds Time spent on quiz
 * @returns XP earned
 */
export function calculateQuizXP(
  score: number,
  totalQuestions: number,
  totalTimeSeconds: number
): { xp: number; breakdown: { base: number; bonuses: { amount: number; reason: string }[] } } {
  const breakdown = {
    base: XP_REWARDS.quiz_complete,
    bonuses: [] as { amount: number; reason: string }[],
  };

  // Perfect score bonus
  if (score === 100) {
    breakdown.bonuses.push({
      amount: XP_REWARDS.quiz_perfect,
      reason: 'Perfect score!',
    });
  }

  // High score bonus: 90%+
  else if (score >= 90) {
    breakdown.bonuses.push({
      amount: 50,
      reason: 'Excellent score (90%+)',
    });
  }

  // Good score bonus: 80%+
  else if (score >= 80) {
    breakdown.bonuses.push({
      amount: 25,
      reason: 'Good score (80%+)',
    });
  }

  // Speed bonus: average <10 seconds per question
  const averageTimePerQuestion = totalTimeSeconds / totalQuestions;
  if (averageTimePerQuestion < 10 && score >= 70) {
    breakdown.bonuses.push({
      amount: XP_REWARDS.quiz_bonus_fast * totalQuestions,
      reason: 'Speed bonus',
    });
  }

  // Completion bonus based on quiz length
  if (totalQuestions >= 50) {
    breakdown.bonuses.push({
      amount: 40,
      reason: 'Long quiz completed',
    });
  }

  const totalBonuses = breakdown.bonuses.reduce((sum, b) => sum + b.amount, 0);

  return {
    xp: breakdown.base + totalBonuses,
    breakdown,
  };
}

/**
 * Calculate XP for individual quiz question
 * @param isCorrect Was the answer correct?
 * @param timeSpentSeconds Time spent
 * @param points Question point value
 * @returns XP earned
 */
export function calculateQuizQuestionXP(
  isCorrect: boolean,
  timeSpentSeconds: number,
  points: number
): number {
  if (!isCorrect) return 0;

  let xp = XP_REWARDS.quiz_question_correct;

  // Scale XP by question point value (if higher than default)
  if (points > 1) {
    xp = xp * points;
  }

  // Fast answer bonus (< 10 seconds)
  if (timeSpentSeconds < 10) {
    xp += XP_REWARDS.quiz_bonus_fast;
  }

  return xp;
}

/**
 * Calculate XP for streak milestone
 * @param streakDays Current streak days
 * @returns XP earned
 */
export function calculateStreakXP(streakDays: number): number {
  // Milestones: 3, 7, 14, 30, 60, 90, 180, 365 days
  const milestones = [
    { days: 3, xp: 50 },
    { days: 7, xp: 150 },
    { days: 14, xp: 300 },
    { days: 30, xp: 1000 },
    { days: 60, xp: 2500 },
    { days: 90, xp: 5000 },
    { days: 180, xp: 10000 },
    { days: 365, xp: 25000 },
  ];

  const milestone = milestones.find((m) => m.days === streakDays);
  return milestone ? milestone.xp : 0;
}

/**
 * Calculate level from total XP
 * Uses exponential scaling: Level N requires (100 * N) XP cumulative
 * @param totalXP Total XP earned
 * @returns Current level
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1;

  let level = 1;
  let xpRequired = 0;
  let cumulativeXP = 0;

  while (cumulativeXP + xpRequired <= totalXP) {
    cumulativeXP += xpRequired;
    level++;
    xpRequired = 100 * level; // Exponential scaling
  }

  return level - 1;
}

/**
 * Calculate XP needed for next level
 * @param currentXP Current total XP
 * @returns XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = (100 * (currentLevel + 1) * (currentLevel + 2)) / 2;
  return nextLevelXP - currentXP;
}

/**
 * Calculate progress percentage to next level
 * @param currentXP Current total XP
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = (100 * currentLevel * (currentLevel + 1)) / 2;
  const nextLevelXP = (100 * (currentLevel + 1) * (currentLevel + 2)) / 2;
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpRequiredForLevel = nextLevelXP - currentLevelXP;

  return Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100);
}

/**
 * Award XP and check for level up
 * @param currentXP Current XP
 * @param xpToAdd XP to add
 * @returns Updated XP, new level, and whether leveled up
 */
export function awardXP(
  currentXP: number,
  xpToAdd: number
): { newXP: number; newLevel: number; leveledUp: boolean; previousLevel: number } {
  const previousLevel = calculateLevel(currentXP);
  const newXP = currentXP + xpToAdd;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > previousLevel;

  return {
    newXP,
    newLevel,
    leveledUp,
    previousLevel,
  };
}

/**
 * Get level title/name
 * @param level Level number
 * @returns Level title
 */
export function getLevelTitle(level: number): string {
  const titles = [
    { max: 5, title: 'Beginner' },
    { max: 10, title: 'Learner' },
    { max: 20, title: 'Apprentice' },
    { max: 30, title: 'Practitioner' },
    { max: 40, title: 'Skilled' },
    { max: 50, title: 'Expert' },
    { max: 75, title: 'Master' },
    { max: 100, title: 'Grandmaster' },
    { max: Infinity, title: 'Legend' },
  ];

  const titleObj = titles.find((t) => level <= t.max);
  return titleObj ? titleObj.title : 'Legend';
}

/**
 * Calculate referral XP reward
 * @param referredUserActivity Number of days referred user was active
 * @returns XP earned
 */
export function calculateReferralXP(referredUserActivity: number): number {
  // Base reward
  let xp = XP_REWARDS.referral;

  // Bonus if referred user stays active
  if (referredUserActivity >= 7) {
    xp += 50; // Bronze tier
  }
  if (referredUserActivity >= 30) {
    xp += 100; // Silver tier
  }
  if (referredUserActivity >= 90) {
    xp += 200; // Gold tier
  }

  return xp;
}
