/**
 * Usage Tracking Model
 * Tracks user's consumption of questions and AI features per framework
 * Used for enforcing plan-based quotas
 */

import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IUsageTracking extends Document {
  userId: mongoose.Types.ObjectId;
  framework: string;
  date: Date;
  period: "daily" | "monthly" | "yearly";
  studyQuestionsViewed: number;
  quizQuestionsTaken: number;
  aiHintsUsed: number;
  mockInterviewsCompleted: number;
  lastAccessedAt: Date;
  resetAt?: Date;
}

const UsageTrackingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    framework: {
      type: String,
      required: true,
      default: "other",
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    period: {
      type: String,
      enum: ["daily", "monthly", "yearly"],
      default: "daily",
      required: true,
    },
    studyQuestionsViewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizQuestionsTaken: {
      type: Number,
      default: 0,
      min: 0,
    },
    aiHintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    mockInterviewsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    resetAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UsageTrackingSchema.index(
  { userId: 1, framework: 1, date: 1, period: 1 },
  { unique: true, name: "unique_usage_tracking" }
);

// Static method to get or create usage record for today
UsageTrackingSchema.statics.getOrCreateDaily = async function (
  userId: string,
  framework: string = "other"
): Promise<IUsageTracking> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let usage = await this.findOne({
    userId,
    framework,
    date: today,
    period: "daily",
  });

  if (!usage) {
    usage = await this.create({
      userId,
      framework,
      date: today,
      period: "daily",
    });
  }

  return usage;
};

// Static method to increment study questions viewed
UsageTrackingSchema.statics.incrementStudyQuestions = async function (
  userId: string,
  framework: string,
  count: number = 1
): Promise<IUsageTracking> {
  const usage = await this.getOrCreateDaily(userId, framework);
  usage.studyQuestionsViewed += count;
  usage.lastAccessedAt = new Date();
  await usage.save();
  return usage;
};

// Static method to increment quiz questions taken
UsageTrackingSchema.statics.incrementQuizQuestions = async function (
  userId: string,
  framework: string,
  count: number = 1
): Promise<IUsageTracking> {
  const usage = await this.getOrCreateDaily(userId, framework);
  usage.quizQuestionsTaken += count;
  usage.lastAccessedAt = new Date();
  await usage.save();
  return usage;
};

// Static method to increment AI hints used
UsageTrackingSchema.statics.incrementAIHints = async function (
  userId: string,
  count: number = 1
): Promise<IUsageTracking> {
  const usage = await this.getOrCreateDaily(userId, "global");
  usage.aiHintsUsed += count;
  usage.lastAccessedAt = new Date();
  await usage.save();
  return usage;
};

// Static method to get usage stats for a user
UsageTrackingSchema.statics.getUserUsageStats = async function (
  userId: string,
  framework?: string,
  period: "daily" | "monthly" | "yearly" = "daily"
): Promise<{
  studyQuestionsUsed: number;
  quizQuestionsUsed: number;
  aiHintsUsed: number;
  mockInterviewsUsed: number;
}> {
  type UsageQuery = {
    userId: string;
    period: string;
    framework?: string;
    date?: { $gte: Date; $lte: Date };
  };

  const query: UsageQuery = { userId, period };

  if (framework) {
    query.framework = framework;
  }

  // Set date range based on period
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "daily":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  query.date = { $gte: startDate, $lte: now };

  const usageRecords = await this.find(query);

  // Aggregate the totals
  type UsageTotals = {
    studyQuestionsUsed: number;
    quizQuestionsUsed: number;
    aiHintsUsed: number;
    mockInterviewsUsed: number;
  };

  const totals = usageRecords.reduce(
    (acc: UsageTotals, record: IUsageTracking) => {
      acc.studyQuestionsUsed += record.studyQuestionsViewed;
      acc.quizQuestionsUsed += record.quizQuestionsTaken;
      acc.aiHintsUsed += record.aiHintsUsed;
      acc.mockInterviewsUsed += record.mockInterviewsCompleted;
      return acc;
    },
    {
      studyQuestionsUsed: 0,
      quizQuestionsUsed: 0,
      aiHintsUsed: 0,
      mockInterviewsUsed: 0,
    }
  );

  return totals;
};

// Static method to check if user has quota remaining
UsageTrackingSchema.statics.hasQuotaRemaining = async function (
  userId: string,
  framework: string,
  mode: "study" | "quiz",
  requestedCount: number,
  maxAllowed: number
): Promise<{ hasQuota: boolean; used: number; remaining: number }> {
  const stats = await this.getUserUsageStats(userId, framework, "daily");

  const used =
    mode === "study" ? stats.studyQuestionsUsed : stats.quizQuestionsUsed;
  const remaining = Math.max(0, maxAllowed - used);
  const hasQuota = used + requestedCount <= maxAllowed;

  return { hasQuota, used, remaining };
};

// Static method to reset daily usage
UsageTrackingSchema.statics.resetDailyUsage = async function (): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const result = await this.updateMany(
    {
      period: "daily",
      date: { $lte: yesterday },
      resetAt: null,
    },
    {
      $set: {
        resetAt: new Date(),
        studyQuestionsViewed: 0,
        quizQuestionsTaken: 0,
        aiHintsUsed: 0,
        mockInterviewsCompleted: 0,
      },
    }
  );

  return result.modifiedCount;
};

// Instance method to get percentage used
UsageTrackingSchema.methods.getUsagePercentage = function (
  limit: number,
  mode: "study" | "quiz"
): number {
  if (limit <= 0) return 0;

  const used =
    mode === "study" ? this.studyQuestionsViewed : this.quizQuestionsTaken;
  return Math.min(100, Math.round((used / limit) * 100));
};

export const UsageTracking = mongoose.model<IUsageTracking>(
  "UsageTracking",
  UsageTrackingSchema
);