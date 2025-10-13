/**
 * User Progress Types
 * Tracks mastery levels, spaced repetition, and learning analytics
 */

/**
 * Mastery level progression for individual questions
 * - new: Never attempted
 * - learning: 1-2 correct attempts
 * - familiar: 3-4 correct attempts
 * - mastered: 5+ correct attempts OR 90%+ accuracy
 */
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

/**
 * Individual question progress tracking
 */
export interface IQuestionProgress {
  questionId: string;
  masteryLevel: MasteryLevel;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  lastAttemptDate: Date;
  nextReviewDate: Date; // Spaced repetition scheduling
  averageTimeSeconds: number;
  struggledOn: string[]; // Specific concepts within question
  firstAttemptDate?: Date;
  lastCorrectDate?: Date;
}

/**
 * Difficulty-level progress summary
 */
export interface IDifficultyProgress {
  mastered: number;
  familiar: number;
  learning: number;
  new: number;
  total: number;
  accuracy: number; // Percentage
}

/**
 * Streak tracking
 */
export interface IStreakData {
  currentStreak: number; // Consecutive days with activity
  longestStreak: number;
  lastActivityDate: Date;
  streakStartDate?: Date;
  missedDays: number; // Grace period tracking
}

/**
 * Complete user progress document
 */
export interface IUserProgress {
  userId: string;

  // Question-level mastery tracking
  questions: Record<string, IQuestionProgress>;

  // Gamification
  xp: number;
  level: number; // Derived from XP
  badges: {
    badgeId: string;
    earnedAt: Date;
    progress?: number; // For multi-tier badges
  }[];
  streaks: IStreakData;

  // Study statistics
  totalStudyTimeMinutes: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalStudySessions: number;
  averageSessionDurationMinutes: number;

  // Quiz statistics
  quizzesTaken: number;
  averageQuizScore: number;
  bestQuizScore: number;
  totalQuizTimeMinutes: number;
  perfectQuizzes: number; // 100% score count

  // Progress by difficulty
  difficultyProgress: {
    easy: IDifficultyProgress;
    medium: IDifficultyProgress;
    hard: IDifficultyProgress;
  };

  // Conversion tracking
  lastUpgradePromptShown?: Date;
  upgradePromptsShown: number;
  paywallHits: number;
  conversionSurfaceInteractions: {
    surfaceId: string;
    shownAt: Date;
    action?: 'clicked' | 'dismissed';
  }[];

  // Session tracking
  lastSessionStart?: Date;
  lastSessionEnd?: Date;
  totalSessions: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mastery statistics summary (for API responses)
 */
export interface IMasteryStats {
  totalQuestions: number;
  mastered: number;
  familiar: number;
  learning: number;
  new: number;
  accuracy: number;
  averageTimePerQuestion: number;
  dueForReview: number;
  overdueReviews: number;
}

/**
 * Study session summary (returned after session completion)
 */
export interface IStudySessionSummary {
  sessionId: string;
  questionsCompleted: number;
  correctAnswers: number;
  wrongAnswers: number;
  xpEarned: number;
  badgesEarned: string[];
  newMasteryAchievements: {
    questionId: string;
    newLevel: MasteryLevel;
  }[];
  nextReviewCount: number; // Questions due for review in next session
  sessionDurationMinutes: number;
  streakMaintained: boolean;
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Recommended study path based on performance
 */
export interface IRecommendedPath {
  difficulty: 'easy' | 'medium' | 'hard';
  reason: 'beginner' | 'progressing' | 'mastered_previous' | 'weak_areas' | 'custom';
  confidence: number; // 0-1
  details: string;
  estimatedQuestionsRemaining: number;
}

/**
 * Spaced repetition schedule configuration
 */
export interface ISpacedRepetitionConfig {
  newInterval: number; // Days until first review (default: 1)
  learningInterval: number; // Days until second review (default: 3)
  familiarInterval: number; // Days until third review (default: 7)
  masteredInterval: number; // Days until mastered review (default: 21)
  maxInterval: number; // Maximum interval (default: 90 days)
}
