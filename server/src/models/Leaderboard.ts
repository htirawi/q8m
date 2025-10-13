/**
 * Leaderboard Model
 * Stores weekly/monthly/all-time leaderboard snapshots
 */

import type { LeaderboardType, LeaderboardScope } from '@shared/types/gamification';
import type { PlanTier } from '@shared/types/plan';
import type { Document, ObjectId } from 'mongoose';
import { Schema, model } from 'mongoose';

/**
 * Leaderboard entry sub-document
 */
export interface ILeaderboardEntryDoc {
  rank: number;
  userId: ObjectId;
  displayName: string;
  avatar?: string;
  score: number;
  level: number;
  streak: number;
  badges: string[];
  planTier?: PlanTier;
}

/**
 * Leaderboard Document interface
 */
export interface ILeaderboardDoc extends Document {
  type: LeaderboardType;
  scope: LeaderboardScope;
  planTier?: PlanTier;
  entries: ILeaderboardEntryDoc[];
  totalEntries: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Leaderboard entry sub-schema
const leaderboardEntrySchema = new Schema<ILeaderboardEntryDoc>(
  {
    rank: { type: Number, required: true, min: 1 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
    score: { type: Number, required: true, min: 0 },
    level: { type: Number, required: true, min: 1 },
    streak: { type: Number, required: true, min: 0 },
    badges: { type: [String], default: [] },
    planTier: {
      type: String,
      enum: ['free', 'intermediate', 'advanced', 'pro'],
    },
  },
  { _id: false }
);

// Main Leaderboard schema
const leaderboardSchema = new Schema<ILeaderboardDoc>(
  {
    type: {
      type: String,
      enum: ['weekly', 'monthly', 'all_time'],
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ['global', 'plan_tier'],
      required: true,
      default: 'global',
    },
    planTier: {
      type: String,
      enum: ['free', 'intermediate', 'advanced', 'pro'],
    },
    entries: { type: [leaderboardEntrySchema], required: true, default: [] },
    totalEntries: { type: Number, required: true, default: 0, min: 0 },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        delete ret._id;
        delete ret.__v;

        // Transform userId in entries
        if (Array.isArray(ret.entries)) {
          ret.entries = ret.entries.map((entry: ILeaderboardEntryDoc) => ({
            ...entry,
            userId: (entry.userId as ObjectId).toString(),
          }));
        }

        return ret;
      },
    },
  }
);

// Compound indexes
leaderboardSchema.index({ type: 1, scope: 1, planTier: 1, startDate: -1 });
leaderboardSchema.index({ type: 1, endDate: -1 });

// Static method: Get current leaderboard
leaderboardSchema.statics.getCurrent = function (
  type: LeaderboardType,
  options: {
    scope?: LeaderboardScope;
    planTier?: PlanTier;
  } = {}
) {
  const { scope = 'global', planTier } = options;

  const query: Record<string, unknown> = {
    type,
    scope,
    endDate: { $gte: new Date() }, // Current or future leaderboard
  };

  if (scope === 'plan_tier' && planTier) {
    query.planTier = planTier;
  }

  return this.findOne(query).sort({ startDate: -1 });
};

// Static method: Get user rank from leaderboard
leaderboardSchema.statics.getUserRank = async function (
  type: LeaderboardType,
  userId: string | ObjectId,
  options: {
    scope?: LeaderboardScope;
    planTier?: PlanTier;
  } = {}
) {
  const leaderboard = await this.getCurrent(type, options);
  if (!leaderboard) return null;

  const entry = leaderboard.entries.find(
    (e: ILeaderboardEntryDoc) => e.userId.toString() === userId.toString()
  );

  return entry
    ? {
        rank: entry.rank,
        score: entry.score,
        totalEntries: leaderboard.totalEntries,
        percentile: Math.round((1 - entry.rank / leaderboard.totalEntries) * 100),
      }
    : null;
};

// Static method: Create new leaderboard snapshot
leaderboardSchema.statics.createSnapshot = async function (
  type: LeaderboardType,
  startDate: Date,
  endDate: Date,
  options: {
    scope?: LeaderboardScope;
    planTier?: PlanTier;
    limit?: number;
  } = {}
) {
  const { scope = 'global', planTier, limit = 100 } = options;

  // Import UserProgress model (avoid circular dependency)
  const { UserProgress } = await import('./UserProgress');

  // Build query for user progress
  const query: Record<string, unknown> = {};

  if (type === 'weekly') {
    // Get users active in the past week
    query.updatedAt = { $gte: startDate, $lte: endDate };
  } else if (type === 'monthly') {
    // Get users active in the past month
    query.updatedAt = { $gte: startDate, $lte: endDate };
  }
  // For all_time, no date filter

  // Fetch top users
  const topUsers = await UserProgress.find(query)
    .sort({ xp: -1 })
    .limit(limit)
    .populate('userId', 'displayName email planTier');

  // Build entries
  const entries: ILeaderboardEntryDoc[] = topUsers.map(
    (
      user: {
        userId: ObjectId | { displayName?: string; email: string; planTier?: PlanTier };
        xp: number;
        level: number;
        streaks: { currentStreak: number };
        badges: { badgeId: string; earnedAt: Date; progress?: number }[];
      },
      index: number
    ) => ({
      rank: index + 1,
      userId: user.userId as ObjectId,
      displayName:
        (user.userId as { displayName?: string }).displayName ||
        (user.userId as { email: string }).email.split('@')[0],
      avatar: undefined,
      score: user.xp,
      level: user.level,
      streak: user.streaks.currentStreak,
      badges: user.badges.slice(0, 3).map((b) => b.badgeId), // Top 3 badges
      planTier: (user.userId as { planTier?: PlanTier }).planTier,
    })
  );

  // Filter by plan tier if scope is plan_tier
  const filteredEntries =
    scope === 'plan_tier' && planTier
      ? entries.filter((e) => e.planTier === planTier)
      : entries;

  // Re-rank after filtering
  filteredEntries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Create leaderboard document
  const leaderboard = await this.create({
    type,
    scope,
    planTier: scope === 'plan_tier' ? planTier : undefined,
    entries: filteredEntries,
    totalEntries: filteredEntries.length,
    startDate,
    endDate,
  });

  return leaderboard;
};

export const Leaderboard = model<ILeaderboardDoc>('Leaderboard', leaderboardSchema);
