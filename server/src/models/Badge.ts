/**
 * Badge Model
 * Defines achievement badges with criteria and rewards
 */

import type { BadgeTier, BadgeCriteriaType } from "@shared/types/gamification";
import type { Document, ObjectId } from "mongoose";
import { Schema, model } from "mongoose";

/**
 * Badge criteria sub-document
 */
export interface IBadgeCriteriaDoc {
  type: BadgeCriteriaType;
  threshold: number;
  metadata?: Record<string, unknown>;
}

/**
 * Badge Document interface
 */
export interface IBadgeDoc extends Document {
  name: string;
  description: string;
  icon: string;
  tier?: BadgeTier;
  criteria: IBadgeCriteriaDoc;
  xpReward: number;
  isSecret: boolean;
  category: "study" | "quiz" | "streak" | "social" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
  createdAt: Date;
  updatedAt: Date;
}

// Badge criteria sub-schema
const badgeCriteriaSchema = new Schema<IBadgeCriteriaDoc>(
  {
    type: {
      type: String,
      enum: [
        "streak",
        "mastery",
        "quiz_score",
        "quiz_count",
        "study_time",
        "xp",
        "speed",
        "perfect_quiz",
        "custom",
      ],
      required: true,
    },
    threshold: { type: Number, required: true, min: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

// Main Badge schema
const badgeSchema = new Schema<IBadgeDoc>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
    },
    criteria: { type: badgeCriteriaSchema, required: true },
    xpReward: { type: Number, required: true, min: 0 },
    isSecret: { type: Boolean, required: true, default: false },
    category: {
      type: String,
      enum: ["study", "quiz", "streak", "social", "milestone"],
      required: true,
      index: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      required: true,
      default: "common",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ "criteria.type": 1 });

// Static method: Get all badges (with option to hide secret badges)
badgeSchema.statics.getAllBadges = function (options: { includeSecret?: boolean } = {}) {
  const { includeSecret = false } = options;

  const query = includeSecret ? {} : { isSecret: false };

  return this.find(query).sort({ rarity: 1, xpReward: 1 });
};

// Static method: Get badges by category
badgeSchema.statics.getBadgesByCategory = function (category: string) {
  return this.find({ category }).sort({ rarity: 1, xpReward: 1 });
};

// Static method: Check if badge criteria is met
badgeSchema.statics.checkCriteria = async function (
  badgeId: string | ObjectId,
  userProgress: {
    xp: number;
    streaks: { currentStreak: number };
    totalStudyTimeMinutes: number;
    quizzesTaken: number;
    perfectQuizzes: number;
    questions: Map<string, { masteryLevel: string }>;
  }
) {
  const badge = await this.findById(badgeId);
  if (!badge) return false;

  const { criteria } = badge;

  switch (criteria.type) {
    case "xp":
      return userProgress.xp >= criteria.threshold;

    case "streak":
      return userProgress.streaks.currentStreak >= criteria.threshold;

    case "study_time":
      return userProgress.totalStudyTimeMinutes >= criteria.threshold;

    case "quiz_count": {
      const minScore = criteria.metadata?.minScore as number | undefined;
      if (minScore) {
        // Count only quizzes above minScore (would need to query QuizResult)
        return false; // Placeholder - implement in service layer
      }
      return userProgress.quizzesTaken >= criteria.threshold;
    }

    case "perfect_quiz":
      return userProgress.perfectQuizzes >= criteria.threshold;

    case "mastery": {
      const masteredCount = Array.from(userProgress.questions.values()).filter(
        (q) => q.masteryLevel === "mastered"
      ).length;
      return masteredCount >= criteria.threshold;
    }

    case "speed":
    case "quiz_score":
    case "custom":
      // These require more complex logic - implement in service layer
      return false;

    default:
      return false;
  }
};

export const Badge = model<IBadgeDoc>("Badge", badgeSchema);
