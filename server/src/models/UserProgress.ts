/**
 * UserProgress Model
 * Tracks user's mastery levels, spaced repetition, and learning analytics
 */

import type { MasteryLevel } from "@shared/types/progress";
import type { Document, ObjectId } from "mongoose";
import { Schema, model } from "mongoose";

/**
 * Question progress sub-document
 */
export interface IQuestionProgressDoc {
  questionId: string;
  masteryLevel: MasteryLevel;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  lastAttemptDate: Date;
  nextReviewDate: Date;
  averageTimeSeconds: number;
  struggledOn: string[];
  firstAttemptDate?: Date;
  lastCorrectDate?: Date;
  isBookmarked?: boolean;
}

/**
 * Difficulty progress sub-document
 */
export interface IDifficultyProgressDoc {
  mastered: number;
  familiar: number;
  learning: number;
  new: number;
  total: number;
  accuracy: number;
}

/**
 * Streak data sub-document
 */
export interface IStreakDataDoc {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakStartDate?: Date;
  missedDays: number;
  freezesUsed: number;
  freezesAvailable: number;
}

/**
 * Coins data sub-document
 */
export interface ICoinsDataDoc {
  balance: number;
  earned: number;
  spent: number;
}

/**
 * Badge earned sub-document
 */
export interface IEarnedBadgeDoc {
  badgeId: string;
  earnedAt: Date;
  progress?: number;
}

/**
 * Conversion surface interaction sub-document
 */
export interface IConversionInteractionDoc {
  surfaceId: string;
  shownAt: Date;
  action?: "clicked" | "dismissed";
}

/**
 * UserProgress Document interface
 */
export interface IUserProgressDoc extends Document {
  userId: ObjectId;
  questions: Map<string, IQuestionProgressDoc>;
  xp: number;
  level: number;
  badges: IEarnedBadgeDoc[];
  streaks: IStreakDataDoc;
  coins: ICoinsDataDoc;
  totalStudyTimeMinutes: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalStudySessions: number;
  averageSessionDurationMinutes: number;
  quizzesTaken: number;
  averageQuizScore: number;
  bestQuizScore: number;
  totalQuizTimeMinutes: number;
  perfectQuizzes: number;
  difficultyProgress: {
    easy: IDifficultyProgressDoc;
    medium: IDifficultyProgressDoc;
    hard: IDifficultyProgressDoc;
  };
  lastUpgradePromptShown?: Date;
  upgradePromptsShown: number;
  paywallHits: number;
  conversionSurfaceInteractions: IConversionInteractionDoc[];
  lastSessionStart?: Date;
  lastSessionEnd?: Date;
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

// Question progress sub-schema
const questionProgressSchema = new Schema<IQuestionProgressDoc>(
  {
    questionId: { type: String, required: true },
    masteryLevel: {
      type: String,
      enum: ["new", "learning", "familiar", "mastered"],
      required: true,
      default: "new",
    },
    attempts: { type: Number, required: true, default: 0, min: 0 },
    correctCount: { type: Number, required: true, default: 0, min: 0 },
    wrongCount: { type: Number, required: true, default: 0, min: 0 },
    lastAttemptDate: { type: Date, required: true, default: Date.now },
    nextReviewDate: { type: Date, required: true, default: Date.now },
    averageTimeSeconds: { type: Number, required: true, default: 0, min: 0 },
    struggledOn: { type: [String], default: [] },
    firstAttemptDate: { type: Date },
    lastCorrectDate: { type: Date },
    isBookmarked: { type: Boolean, default: false },
  },
  { _id: false }
);

// Difficulty progress sub-schema
const difficultyProgressSchema = new Schema<IDifficultyProgressDoc>(
  {
    mastered: { type: Number, required: true, default: 0, min: 0 },
    familiar: { type: Number, required: true, default: 0, min: 0 },
    learning: { type: Number, required: true, default: 0, min: 0 },
    new: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0, min: 0 },
    accuracy: { type: Number, required: true, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

// Streak data sub-schema
const streakDataSchema = new Schema<IStreakDataDoc>(
  {
    currentStreak: { type: Number, required: true, default: 0, min: 0 },
    longestStreak: { type: Number, required: true, default: 0, min: 0 },
    lastActivityDate: { type: Date, required: true, default: Date.now },
    streakStartDate: { type: Date },
    missedDays: { type: Number, required: true, default: 0, min: 0 },
    freezesUsed: { type: Number, required: true, default: 0, min: 0 },
    freezesAvailable: { type: Number, required: true, default: 2, min: 0 },
  },
  { _id: false }
);

// Coins data sub-schema
const coinsDataSchema = new Schema<ICoinsDataDoc>(
  {
    balance: { type: Number, required: true, default: 0, min: 0 },
    earned: { type: Number, required: true, default: 0, min: 0 },
    spent: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

// Badge earned sub-schema
const earnedBadgeSchema = new Schema<IEarnedBadgeDoc>(
  {
    badgeId: { type: String, required: true },
    earnedAt: { type: Date, required: true, default: Date.now },
    progress: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

// Conversion interaction sub-schema
const conversionInteractionSchema = new Schema<IConversionInteractionDoc>(
  {
    surfaceId: { type: String, required: true },
    shownAt: { type: Date, required: true, default: Date.now },
    action: { type: String, enum: ["clicked", "dismissed"] },
  },
  { _id: false }
);

// Main UserProgress schema
const userProgressSchema = new Schema<IUserProgressDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    questions: {
      type: Map,
      of: questionProgressSchema,
      default: () => new Map(),
    },
    xp: { type: Number, required: true, default: 0, min: 0, index: true },
    level: { type: Number, required: true, default: 1, min: 1 },
    badges: { type: [earnedBadgeSchema], default: [] },
    streaks: { type: streakDataSchema, required: true, default: () => ({}) },
    coins: { type: coinsDataSchema, required: true, default: () => ({}) },
    totalStudyTimeMinutes: { type: Number, required: true, default: 0, min: 0 },
    totalQuestionsAttempted: { type: Number, required: true, default: 0, min: 0 },
    totalQuestionsCorrect: { type: Number, required: true, default: 0, min: 0 },
    totalStudySessions: { type: Number, required: true, default: 0, min: 0 },
    averageSessionDurationMinutes: { type: Number, required: true, default: 0, min: 0 },
    quizzesTaken: { type: Number, required: true, default: 0, min: 0 },
    averageQuizScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
    bestQuizScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
    totalQuizTimeMinutes: { type: Number, required: true, default: 0, min: 0 },
    perfectQuizzes: { type: Number, required: true, default: 0, min: 0 },
    difficultyProgress: {
      easy: { type: difficultyProgressSchema, required: true, default: () => ({}) },
      medium: { type: difficultyProgressSchema, required: true, default: () => ({}) },
      hard: { type: difficultyProgressSchema, required: true, default: () => ({}) },
    },
    lastUpgradePromptShown: { type: Date },
    upgradePromptsShown: { type: Number, required: true, default: 0, min: 0 },
    paywallHits: { type: Number, required: true, default: 0, min: 0 },
    conversionSurfaceInteractions: { type: [conversionInteractionSchema], default: [] },
    lastSessionStart: { type: Date },
    lastSessionEnd: { type: Date },
    totalSessions: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        ret.userId = (ret.userId as ObjectId).toString();
        delete ret._id;
        delete ret.__v;

        // Convert Map to object for JSON serialization
        if (ret.questions instanceof Map) {
          ret.questions = Object.fromEntries(ret.questions);
        }

        return ret;
      },
    },
  }
);

// Indexes for efficient querying
userProgressSchema.index({ xp: -1 }); // Leaderboard queries
userProgressSchema.index({ level: -1 }); // Level-based queries
userProgressSchema.index({ "streaks.currentStreak": -1 }); // Streak leaderboard
userProgressSchema.index({ updatedAt: -1 }); // Recent activity
userProgressSchema.index({ "badges.badgeId": 1 }); // Badge queries

// Static method: Find user progress or create if doesn't exist
userProgressSchema.statics.findOrCreate = async function (userId: string | ObjectId) {
  let progress = await this.findOne({ userId });

  if (!progress) {
    progress = await this.create({
      userId,
      questions: new Map(),
      xp: 0,
      level: 1,
      badges: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        missedDays: 0,
        freezesUsed: 0,
        freezesAvailable: 2,
      },
      coins: {
        balance: 0,
        earned: 0,
        spent: 0,
      },
      totalStudyTimeMinutes: 0,
      totalQuestionsAttempted: 0,
      totalQuestionsCorrect: 0,
      totalStudySessions: 0,
      averageSessionDurationMinutes: 0,
      quizzesTaken: 0,
      averageQuizScore: 0,
      bestQuizScore: 0,
      totalQuizTimeMinutes: 0,
      perfectQuizzes: 0,
      difficultyProgress: {
        easy: { mastered: 0, familiar: 0, learning: 0, new: 0, total: 0, accuracy: 0 },
        medium: { mastered: 0, familiar: 0, learning: 0, new: 0, total: 0, accuracy: 0 },
        hard: { mastered: 0, familiar: 0, learning: 0, new: 0, total: 0, accuracy: 0 },
      },
      upgradePromptsShown: 0,
      paywallHits: 0,
      conversionSurfaceInteractions: [],
      totalSessions: 0,
    });
  }

  return progress;
};

// Static method: Get leaderboard (top N users by XP)
userProgressSchema.statics.getLeaderboard = function (options: {
  limit?: number;
  offset?: number;
  timeFrame?: "weekly" | "monthly" | "all_time";
}) {
  const { limit = 100, offset = 0 } = options;

  // For now, return all-time leaderboard
  // TODO: Add weekly/monthly tracking with separate collection
  return this.find()
    .sort({ xp: -1 })
    .skip(offset)
    .limit(limit)
    .select("userId xp level streaks.currentStreak badges")
    .populate("userId", "displayName email");
};

// Static method: Get user rank
userProgressSchema.statics.getUserRank = async function (userId: string | ObjectId) {
  const userProgress = await this.findOne({ userId });
  if (!userProgress) return null;

  const rank = await this.countDocuments({ xp: { $gt: userProgress.xp } });
  return rank + 1;
};

// Instance method: Calculate mastery stats
userProgressSchema.methods.getMasteryStats = function () {
  const stats = {
    totalQuestions: 0,
    mastered: 0,
    familiar: 0,
    learning: 0,
    new: 0,
    accuracy: 0,
    dueForReview: 0,
    overdueReviews: 0,
  };

  const now = new Date();

  for (const [, progress] of this.questions) {
    stats.totalQuestions++;

    switch (progress.masteryLevel) {
      case "mastered":
        stats.mastered++;
        break;
      case "familiar":
        stats.familiar++;
        break;
      case "learning":
        stats.learning++;
        break;
      case "new":
        stats.new++;
        break;
    }

    if (progress.nextReviewDate <= now) {
      stats.dueForReview++;

      // Overdue if more than 1 day late
      const daysSinceReview =
        (now.getTime() - progress.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReview > 1) {
        stats.overdueReviews++;
      }
    }
  }

  // Calculate accuracy based on mastery levels instead of non-existent properties
  stats.accuracy =
    stats.totalQuestions > 0
      ? Math.round(((stats.mastered + stats.familiar) / stats.totalQuestions) * 100)
      : 0;

  return stats;
};

// Bookmark management methods
userProgressSchema.methods.toggleBookmark = async function (questionId: string) {
  const progress = this.questions.get(questionId);

  if (progress) {
    // Question progress exists, toggle bookmark
    progress.isBookmarked = !progress.isBookmarked;
    this.questions.set(questionId, progress);
  } else {
    // No progress exists, create new with bookmark
    this.questions.set(questionId, {
      questionId,
      masteryLevel: "new" as MasteryLevel,
      attempts: 0,
      correctCount: 0,
      wrongCount: 0,
      lastAttemptDate: new Date(),
      nextReviewDate: new Date(),
      averageTimeSeconds: 0,
      struggledOn: [],
      isBookmarked: true,
    });
  }

  return await this.save();
};

userProgressSchema.methods.getBookmarkedQuestionIds = function () {
  const bookmarkedIds: string[] = [];
  for (const [questionId, progress] of this.questions) {
    if (progress.isBookmarked) {
      bookmarkedIds.push(questionId);
    }
  }
  return bookmarkedIds;
};

userProgressSchema.methods.isQuestionBookmarked = function (questionId: string) {
  const progress = this.questions.get(questionId);
  return progress?.isBookmarked || false;
};

export const UserProgress = model<IUserProgressDoc>("UserProgress", userProgressSchema);
