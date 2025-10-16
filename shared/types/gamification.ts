/**
 * Gamification Types
 * XP system, badges, achievements, leaderboards, and rewards
 */

/**
 * Badge tiers for multi-level achievements
 */
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Badge criteria types
 */
export type BadgeCriteriaType =
  | 'streak' // Consecutive days
  | 'mastery' // Questions mastered
  | 'quiz_score' // Quiz score threshold
  | 'quiz_count' // Number of quizzes completed
  | 'study_time' // Total study time
  | 'xp' // Total XP milestone
  | 'speed' // Fast correct answers
  | 'perfect_quiz' // Perfect quiz scores
  | 'custom'; // Custom logic

/**
 * Badge criteria definition
 */
export interface IBadgeCriteria {
  type: BadgeCriteriaType;
  threshold: number;
  metadata?: {
    minScore?: number; // For quiz_score type
    maxTime?: number; // For speed type
    difficulty?: 'easy' | 'medium' | 'hard'; // For mastery type
    all_difficulties?: boolean; // Must complete all difficulties
    [key: string]: unknown;
  };
}

/**
 * Badge definition
 */
export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon URL
  tier?: BadgeTier;
  criteria: IBadgeCriteria;
  xpReward: number;
  isSecret?: boolean; // Hidden until earned
  category: 'study' | 'quiz' | 'streak' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: Date;
}

/**
 * User's badge progress (for multi-tier badges)
 */
export interface IBadgeProgress {
  badgeId: string;
  currentProgress: number;
  threshold: number;
  earnedTiers: BadgeTier[];
  lastUpdated: Date;
}

/**
 * Badge earned by user
 */
export interface IEarnedBadge {
  badgeId: string;
  earnedAt: Date;
  tier?: BadgeTier;
  xpRewarded: number;
  notificationShown: boolean;
}

/**
 * XP sources for tracking
 */
export type XPSource =
  | 'study_correct_first_try'
  | 'study_correct_retry'
  | 'study_complete_session'
  | 'study_master_question'
  | 'quiz_question_correct'
  | 'quiz_complete'
  | 'quiz_perfect'
  | 'quiz_bonus_fast'
  | 'streak_milestone'
  | 'badge_earned'
  | 'referral'
  | 'daily_login'
  | 'milestone_achievement';

/**
 * XP reward configuration
 */
export interface IXPReward {
  source: XPSource;
  amount: number;
  description: string;
  conditions?: {
    minScore?: number;
    maxTime?: number;
    streakDays?: number;
    [key: string]: unknown;
  };
}

/**
 * XP transaction record
 */
export interface IXPTransaction {
  userId: string;
  amount: number;
  source: XPSource;
  context: Record<string, unknown>;
  timestamp: Date;
  balanceAfter: number;
}

/**
 * Level configuration
 */
export interface ILevelConfig {
  level: number;
  xpRequired: number; // Cumulative XP to reach this level
  title: string; // e.g., "Beginner", "Intermediate", "Expert"
  icon: string;
  perks?: string[]; // Special perks at this level
}

/**
 * Leaderboard scope and time period
 */
export type LeaderboardType = 'weekly' | 'monthly' | 'all_time';
export type LeaderboardScope = 'global' | 'plan_tier';

/**
 * Leaderboard entry
 */
export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar?: string;
  score: number; // XP gained in time period
  level: number;
  streak: number;
  badges: string[]; // Badge IDs (show top 3)
  planTier?: 'free' | 'intermediate' | 'advanced' | 'pro';
}

/**
 * Complete leaderboard
 */
export interface ILeaderboard {
  id: string;
  type: LeaderboardType;
  scope: LeaderboardScope;
  planTier?: 'free' | 'intermediate' | 'advanced' | 'pro'; // If scope is plan_tier
  entries: ILeaderboardEntry[];
  totalEntries: number;
  userRank?: number; // Current user's rank (if not in top 100)
  userScore?: number;
  startDate: Date;
  endDate: Date;
  updatedAt: Date;
}

/**
 * Milestone definition
 */
export interface IMilestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'quiz' | 'mastery' | 'streak' | 'social';
  threshold: number;
  xpReward: number;
  badgeId?: string; // Optional badge earned with milestone
}

/**
 * Achievement notification payload
 */
export interface IAchievementNotification {
  type: 'badge' | 'level_up' | 'milestone' | 'streak';
  title: string;
  description: string;
  icon: string;
  xpEarned?: number;
  badgeId?: string;
  newLevel?: number;
  streakDays?: number;
  timestamp: Date;
}

/**
 * Gamification stats summary
 */
export interface IGamificationStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number; // Percentage to next level
  totalBadges: number;
  rareBadges: number;
  currentStreak: number;
  longestStreak: number;
  leaderboardRank?: number;
  leaderboardPercentile?: number;
}

/**
 * Daily activity tracking
 */
export interface IDailyActivity {
  userId: string;
  date: Date; // Date only (no time)
  studyQuestionsCompleted: number;
  quizzesTaken: number;
  xpEarned: number;
  timeSpentMinutes: number;
  streakDay: number; // Which day of current streak
}

/**
 * Referral tracking
 */
export interface IReferral {
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  signupDate: Date;
  rewardClaimed: boolean;
  rewardXP: number;
  rewardTier?: 'bronze' | 'silver' | 'gold'; // Based on referred user activity
}

/**
 * Streak information
 */
export interface IStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakStartDate: Date | null;
  missedDays?: number;
  freezesUsed?: number;
  freezesAvailable?: number;
}

/**
 * Streak freeze record
 */
export interface IStreakFreeze {
  id: string;
  userId: string;
  usedAt: Date;
  expiresAt: Date;
  type: 'manual' | 'grace_period';
  costInCoins?: number;
  costInXP?: number;
}

/**
 * Coin balance and transactions
 */
export interface ICoinBalance {
  total: number;
  earned: number;
  spent: number;
}

export interface ICoinTransaction {
  id: string;
  userId: string;
  amount: number; // Positive for earn, negative for spend
  type: 'earn' | 'spend';
  source: CoinSource | CoinSpend;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type CoinSource =
  | 'quiz_completion'
  | 'quiz_perfect'
  | 'daily_login'
  | 'streak_milestone'
  | 'achievement'
  | 'level_up'
  | 'referral'
  | 'admin';

export type CoinSpend =
  | 'streak_freeze'
  | 'hint'
  | 'unlock_content'
  | 'profile_customization'
  | 'admin';

/**
 * Streak saver configuration constants
 */
export const STREAK_SAVER_CONFIG = {
  COST_IN_COINS: 100,
  COST_IN_XP: 100,
  GRACE_PERIOD_HOURS: 2,
  MAX_FREEZES_PER_WEEK: 2,
} as const;

/**
 * Coin earning rates
 */
export const COIN_RATES = {
  QUIZ_COMPLETION_BASE: 10,
  QUIZ_COMPLETION_PERFECT: 25,
  DAILY_LOGIN: 5,
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_14: 100,
  STREAK_MILESTONE_30: 200,
  STREAK_MILESTONE_60: 400,
  STREAK_MILESTONE_90: 600,
  STREAK_MILESTONE_180: 1000,
  STREAK_MILESTONE_365: 2500,
} as const;

/**
 * Quiz milestones
 */
export const QUIZ_MILESTONES = [10, 25, 50, 100, 250, 500, 1000] as const;
export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365] as const;

export type QuizMilestone = typeof QUIZ_MILESTONES[number];
export type StreakMilestone = typeof STREAK_MILESTONES[number];

/**
 * Onboarding wizard types
 */
export type OnboardingStepType =
  | 'welcome'
  | 'experience_level'
  | 'goals'
  | 'study_preferences'
  | 'notifications'
  | 'complete';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type StudyGoal =
  | 'exam_prep'
  | 'skill_building'
  | 'career_advancement'
  | 'personal_interest'
  | 'certification'
  | 'other';

export type StudyPreference = {
  preferredDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionsPerSession: 5 | 10 | 15 | 20;
  studyReminders: boolean;
  dailyGoalMinutes: number;
};

export interface IOnboardingStep {
  type: OnboardingStepType;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  isOptional?: boolean;
}

export interface IOnboardingData {
  userId: string;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  steps: IOnboardingStep[];
  responses: {
    experienceLevel?: ExperienceLevel;
    goals?: StudyGoal[];
    studyPreferences?: StudyPreference;
    notificationsEnabled?: boolean;
  };
  startedAt: Date;
  completedAt?: Date;
  lastUpdatedAt: Date;
}

export interface IOnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  canGoBack: boolean;
  canSkip: boolean;
}

/**
 * Onboarding rewards configuration
 */
export const ONBOARDING_REWARDS = {
  COMPLETION_XP: 100,
  COMPLETION_COINS: 50,
  FIRST_QUIZ_BONUS_XP: 50,
  PROFILE_SETUP_BONUS_XP: 25,
} as const;
