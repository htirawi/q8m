/**
 * Quiz Result Types
 * Enhanced quiz results with performance analytics and gamification
 */

import type { ExperienceLevel } from './plan';

/**
 * Quiz type classification
 */
export type QuizType = 'practice' | 'exam' | 'retry_wrong' | 'review';

/**
 * Individual question answer record
 */
export interface IQuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  points: number;
  pointsEarned: number;
}

/**
 * Performance by category
 */
export interface ICategoryPerformance {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // Percentage
  averageTimeSeconds: number;
  isWeak: boolean; // <70% accuracy
  isStrong: boolean; // >90% accuracy
}

/**
 * Performance by difficulty
 */
export interface IDifficultyPerformance {
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
}

/**
 * Complete quiz result
 */
export interface IQuizResult {
  id: string;
  userId: string;
  quizType: QuizType;
  level: ExperienceLevel;
  framework?: string; // Optional: filter by Vue/React/etc.

  // Performance metrics
  score: number; // Percentage (0-100)
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  pointsEarned: number;

  // Timing
  startTime: Date;
  endTime: Date;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;

  // Detailed results
  answers: IQuizAnswer[];

  // Performance analysis
  categoryPerformance: ICategoryPerformance[];
  difficultyPerformance: IDifficultyPerformance[];
  weakCategories: string[]; // Categories with <70% accuracy
  strongCategories: string[]; // Categories with >90% accuracy

  // Gamification
  xpEarned: number;
  badgesEarned: string[];
  streakMaintained: boolean;
  isPerfect: boolean; // 100% score
  isFast: boolean; // Avg <10s per question

  // Retry tracking (if this is a retry quiz)
  originalQuizId?: string;
  previousAttempts?: number;
  improvementPercentage?: number; // Compared to previous attempt

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quiz history summary (for selection page)
 */
export interface IQuizHistorySummary {
  userId: string;
  level: ExperienceLevel;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number; // Minutes
  recentQuizzes: IQuizResult[];
  improvementTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

/**
 * Weak areas report
 */
export interface IWeakAreasReport {
  userId: string;
  categories: {
    category: string;
    accuracy: number;
    questionsAttempted: number;
    questionsCorrect: number;
    lastAttemptDate: Date;
    recommendedStudyTime: number; // Minutes
    relatedQuestions: string[]; // Question IDs to review
  }[];
  overallWeakness: number; // 0-100, higher = more weak areas
  recommendedAction: 'study' | 'practice' | 'review_wrong';
  generatedAt: Date;
}

/**
 * Quiz statistics for analytics
 */
export interface IQuizStats {
  userId: string;
  level: ExperienceLevel;

  // Overall stats
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;

  // Time stats
  totalTimeMinutes: number;
  averageQuizDuration: number;
  fastestQuiz: number;
  slowestQuiz: number;

  // Score distribution
  perfectQuizzes: number; // 100%
  excellentQuizzes: number; // 90-99%
  goodQuizzes: number; // 80-89%
  passingQuizzes: number; // 70-79%
  failingQuizzes: number; // <70%

  // Category breakdown
  categoryStats: {
    category: string;
    totalQuestions: number;
    accuracy: number;
    rank: number; // 1 = best, N = worst
  }[];

  // Recent performance (last 10 quizzes)
  recentAccuracy: number;
  recentTrend: 'improving' | 'stable' | 'declining';

  // Gamification
  totalXPFromQuizzes: number;
  badgesFromQuizzes: number;

  updatedAt: Date;
}

/**
 * Quiz retry configuration
 */
export interface IQuizRetryConfig {
  originalQuizId: string;
  retryType: 'wrong_only' | 'all_questions';
  questionsToRetry: string[];
  retryAttempt: number;
  previousScore: number;
}

/**
 * Quiz comparison (compare two quiz results)
 */
export interface IQuizComparison {
  quizA: IQuizResult;
  quizB: IQuizResult;
  improvements: {
    category: string;
    previousAccuracy: number;
    currentAccuracy: number;
    change: number; // Percentage points
  }[];
  overallImprovement: number; // Percentage points
  timeImprovement: number; // Seconds saved
}

/**
 * Quiz recommendations based on performance
 */
export interface IQuizRecommendations {
  userId: string;
  recommendedLevel: ExperienceLevel;
  recommendedCategories: string[];
  recommendedQuizType: QuizType;
  reason: string;
  confidenceScore: number; // 0-1
  estimatedScore: number; // Predicted score if taken now
}
