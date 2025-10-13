/**
 * QuizResult Model
 * Stores quiz attempts with detailed analytics and performance tracking
 */

import type { ExperienceLevel } from '@shared/types/plan';
import type { QuizType } from '@shared/types/quiz-result';
import type { Document, ObjectId } from 'mongoose';
import { Schema, model } from 'mongoose';

/**
 * Individual question answer sub-document
 */
export interface IQuizAnswerDoc {
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
 * Category performance sub-document
 */
export interface ICategoryPerformanceDoc {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
  isWeak: boolean;
  isStrong: boolean;
}

/**
 * Difficulty performance sub-document
 */
export interface IDifficultyPerformanceDoc {
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
}

/**
 * QuizResult Document interface
 */
export interface IQuizResultDoc extends Document {
  userId: ObjectId;
  quizType: QuizType;
  level: ExperienceLevel;
  framework?: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  pointsEarned: number;
  startTime: Date;
  endTime: Date;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
  answers: IQuizAnswerDoc[];
  categoryPerformance: ICategoryPerformanceDoc[];
  difficultyPerformance: IDifficultyPerformanceDoc[];
  weakCategories: string[];
  strongCategories: string[];
  xpEarned: number;
  badgesEarned: string[];
  streakMaintained: boolean;
  isPerfect: boolean;
  isFast: boolean;
  originalQuizId?: ObjectId;
  previousAttempts?: number;
  improvementPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Answer sub-schema
const quizAnswerSchema = new Schema<IQuizAnswerDoc>(
  {
    questionId: { type: String, required: true, index: true },
    userAnswer: { type: Schema.Types.Mixed, required: true },
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpentSeconds: { type: Number, required: true, min: 0 },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    points: { type: Number, required: true, min: 0 },
    pointsEarned: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Category performance sub-schema
const categoryPerformanceSchema = new Schema<ICategoryPerformanceDoc>(
  {
    category: { type: String, required: true },
    totalQuestions: { type: Number, required: true, min: 0 },
    correctAnswers: { type: Number, required: true, min: 0 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    averageTimeSeconds: { type: Number, required: true, min: 0 },
    isWeak: { type: Boolean, required: true, default: false },
    isStrong: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

// Difficulty performance sub-schema
const difficultyPerformanceSchema = new Schema<IDifficultyPerformanceDoc>(
  {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    totalQuestions: { type: Number, required: true, min: 0 },
    correctAnswers: { type: Number, required: true, min: 0 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    averageTimeSeconds: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Main QuizResult schema
const quizResultSchema = new Schema<IQuizResultDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizType: {
      type: String,
      enum: ['practice', 'exam', 'retry_wrong', 'review'],
      required: true,
      default: 'practice',
    },
    level: {
      type: String,
      enum: ['junior', 'intermediate', 'senior'],
      required: true,
      index: true,
    },
    framework: {
      type: String,
      enum: ['vue', 'react', 'angular', 'nextjs'],
      index: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    correctAnswers: { type: Number, required: true, min: 0 },
    incorrectAnswers: { type: Number, required: true, min: 0 },
    skippedAnswers: { type: Number, required: true, default: 0, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalPoints: { type: Number, required: true, min: 0 },
    pointsEarned: { type: Number, required: true, min: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalTimeSeconds: { type: Number, required: true, min: 0 },
    averageTimePerQuestion: { type: Number, required: true, min: 0 },
    answers: { type: [quizAnswerSchema], required: true },
    categoryPerformance: { type: [categoryPerformanceSchema], default: [] },
    difficultyPerformance: { type: [difficultyPerformanceSchema], default: [] },
    weakCategories: { type: [String], default: [], index: true },
    strongCategories: { type: [String], default: [] },
    xpEarned: { type: Number, required: true, default: 0, min: 0 },
    badgesEarned: { type: [String], default: [] },
    streakMaintained: { type: Boolean, required: true, default: false },
    isPerfect: { type: Boolean, required: true, default: false },
    isFast: { type: Boolean, required: true, default: false },
    originalQuizId: { type: Schema.Types.ObjectId, ref: 'QuizResult' },
    previousAttempts: { type: Number, min: 0 },
    improvementPercentage: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        ret.userId = (ret.userId as ObjectId).toString();
        if (ret.originalQuizId) {
          ret.originalQuizId = (ret.originalQuizId as ObjectId).toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient querying
quizResultSchema.index({ userId: 1, createdAt: -1 }); // User's quiz history
quizResultSchema.index({ userId: 1, level: 1, createdAt: -1 }); // User's quizzes by level
quizResultSchema.index({ userId: 1, score: -1 }); // User's best scores
quizResultSchema.index({ level: 1, score: -1 }); // Leaderboard by level
quizResultSchema.index({ isPerfect: 1, userId: 1 }); // Perfect scores
quizResultSchema.index({ 'answers.category': 1 }); // Category analysis

// Static method: Get user's quiz history
quizResultSchema.statics.getUserHistory = function (
  userId: string | ObjectId,
  options: {
    level?: ExperienceLevel;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { level, limit = 10, offset = 0 } = options;

  const query: Record<string, unknown> = { userId };
  if (level) query.level = level;

  return this.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
};

// Static method: Get weak areas for a user
quizResultSchema.statics.getWeakAreas = async function (
  userId: string | ObjectId,
  level?: ExperienceLevel
) {
  const query: Record<string, unknown> = { userId };
  if (level) query.level = level;

  const results = await this.find(query).sort({ createdAt: -1 }).limit(10);

  // Aggregate category performance across recent quizzes
  const categoryMap = new Map<
    string,
    { totalQuestions: number; correctAnswers: number; lastAttemptDate: Date }
  >();

  for (const result of results) {
    for (const catPerf of result.categoryPerformance) {
      const existing = categoryMap.get(catPerf.category);
      if (existing) {
        existing.totalQuestions += catPerf.totalQuestions;
        existing.correctAnswers += catPerf.correctAnswers;
        if (result.createdAt > existing.lastAttemptDate) {
          existing.lastAttemptDate = result.createdAt;
        }
      } else {
        categoryMap.set(catPerf.category, {
          totalQuestions: catPerf.totalQuestions,
          correctAnswers: catPerf.correctAnswers,
          lastAttemptDate: result.createdAt,
        });
      }
    }
  }

  // Calculate weak areas (<70% accuracy)
  const weakAreas = [];
  for (const [category, stats] of categoryMap.entries()) {
    const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
    if (accuracy < 70) {
      weakAreas.push({
        category,
        accuracy,
        questionsAttempted: stats.totalQuestions,
        questionsCorrect: stats.correctAnswers,
        lastAttemptDate: stats.lastAttemptDate,
      });
    }
  }

  return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
};

// Static method: Get quiz statistics for a user
quizResultSchema.statics.getUserStats = async function (
  userId: string | ObjectId,
  level?: ExperienceLevel
) {
  const query: Record<string, unknown> = { userId };
  if (level) query.level = level;

  const results = await this.find(query);

  const stats = {
    totalQuizzes: results.length,
    totalQuestions: 0,
    totalCorrect: 0,
    overallAccuracy: 0,
    totalTimeMinutes: 0,
    averageQuizDuration: 0,
    fastestQuiz: Infinity,
    slowestQuiz: 0,
    perfectQuizzes: 0,
    excellentQuizzes: 0,
    goodQuizzes: 0,
    passingQuizzes: 0,
    failingQuizzes: 0,
    recentAccuracy: 0,
    totalXP: 0,
  };

  if (results.length === 0) return stats;

  for (const result of results) {
    stats.totalQuestions += result.totalQuestions;
    stats.totalCorrect += result.correctAnswers;
    stats.totalTimeMinutes += result.totalTimeSeconds / 60;
    stats.totalXP += result.xpEarned;

    if (result.totalTimeSeconds < stats.fastestQuiz) {
      stats.fastestQuiz = result.totalTimeSeconds;
    }
    if (result.totalTimeSeconds > stats.slowestQuiz) {
      stats.slowestQuiz = result.totalTimeSeconds;
    }

    if (result.score === 100) stats.perfectQuizzes++;
    else if (result.score >= 90) stats.excellentQuizzes++;
    else if (result.score >= 80) stats.goodQuizzes++;
    else if (result.score >= 70) stats.passingQuizzes++;
    else stats.failingQuizzes++;
  }

  stats.overallAccuracy = Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
  stats.averageQuizDuration = Math.round(stats.totalTimeMinutes / stats.totalQuizzes);

  // Recent accuracy (last 10 quizzes)
  const recentResults = results.slice(0, 10);
  if (recentResults.length > 0) {
    const recentCorrect = recentResults.reduce(
      (sum: number, r: IQuizResultDoc) => sum + r.correctAnswers,
      0
    );
    const recentTotal = recentResults.reduce(
      (sum: number, r: IQuizResultDoc) => sum + r.totalQuestions,
      0
    );
    stats.recentAccuracy = Math.round((recentCorrect / recentTotal) * 100);
  }

  return stats;
};

// Static method: Get wrong questions from a quiz for retry
quizResultSchema.statics.getWrongQuestions = function (quizId: string | ObjectId) {
  return this.findById(quizId).then((result: IQuizResultDoc | null) => {
    if (!result) return [];
    return result.answers.filter((a) => !a.isCorrect).map((a) => a.questionId);
  });
};

export const QuizResult = model<IQuizResultDoc>('QuizResult', quizResultSchema);
