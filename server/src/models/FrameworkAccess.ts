/**
 * Framework Access Configuration Model
 * Stores framework access rules in MongoDB for dynamic configuration
 */

import type { FrameworkType } from "@shared/config/framework-access";
import type { PlanTier } from "@shared/types/plan";
import mongoose, { Schema, type Document } from "mongoose";

export interface IFrameworkAccess {
  framework: FrameworkType;
  requiredPlanTier: PlanTier;
  displayName: string;
  description: string;
  isActive: boolean;
  metadata: {
    icon: string;
    color: string;
    order: number;
  };
}

export type IFrameworkAccessDoc = IFrameworkAccess & Document;

const FrameworkAccessSchema = new Schema(
  {
    framework: {
      type: String,
      required: true,
      unique: true,
      enum: ["angular", "react", "nextjs", "redux", "vue", "random"],
      index: true,
    },
    requiredPlanTier: {
      type: String,
      required: true,
      enum: ["free", "intermediate", "advanced", "pro"],
      default: "free",
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      icon: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
        enum: ["red", "black", "blue", "purple", "gray", "gradient"],
      },
      order: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "framework_access",
  }
);

// Indexes for performance
FrameworkAccessSchema.index({ framework: 1, isActive: 1 });
FrameworkAccessSchema.index({ requiredPlanTier: 1 });

// Static method to get all active framework access rules
FrameworkAccessSchema.statics.getActiveRules = async function () {
  return this.find({ isActive: true }).sort({ "metadata.order": 1 }).lean();
};

// Static method to check if a plan can access a framework
FrameworkAccessSchema.statics.canAccess = async function (
  userTier: PlanTier,
  framework: FrameworkType
) {
  const rule = await this.findOne({ framework, isActive: true });

  if (!rule?.requiredPlanTier) {
    return false;
  }

  const tierHierarchy: Record<PlanTier, number> = {
    free: 0,
    intermediate: 1,
    advanced: 2,
    pro: 3,
  };

  const requiredTier = rule.requiredPlanTier as PlanTier;
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
};

// Static method to get accessible frameworks for a user
FrameworkAccessSchema.statics.getAccessibleFrameworks = async function (userTier: PlanTier) {
  const tierHierarchy: Record<PlanTier, number> = {
    free: 0,
    intermediate: 1,
    advanced: 2,
    pro: 3,
  };

  const userLevel = tierHierarchy[userTier];

  return this.find({
    isActive: true,
    $expr: {
      $lte: [
        {
          $indexOfArray: [["free", "intermediate", "advanced", "pro"], "$requiredPlanTier"],
        },
        userLevel,
      ],
    },
  })
    .sort({ "metadata.order": 1 })
    .lean();
};

// Static method to initialize default framework access rules
FrameworkAccessSchema.statics.initializeDefaults = async function () {
  const defaultRules = [
    {
      framework: "react",
      requiredPlanTier: "free",
      displayName: "React",
      description: "Available to all users",
      isActive: true,
      metadata: {
        icon: "⚛️",
        color: "blue",
        order: 3,
      },
    },
    {
      framework: "angular",
      requiredPlanTier: "intermediate",
      displayName: "Angular",
      description: "Requires Intermediate plan or higher",
      isActive: true,
      metadata: {
        icon: "🅰️",
        color: "red",
        order: 1,
      },
    },
    {
      framework: "nextjs",
      requiredPlanTier: "advanced",
      displayName: "Next.js",
      description: "Requires Advanced plan or higher",
      isActive: true,
      metadata: {
        icon: "▲",
        color: "black",
        order: 2,
      },
    },
    {
      framework: "redux",
      requiredPlanTier: "advanced",
      displayName: "Redux",
      description: "Requires Advanced plan or higher",
      isActive: true,
      metadata: {
        icon: "🔄",
        color: "purple",
        order: 4,
      },
    },
    {
      framework: "vue",
      requiredPlanTier: "pro",
      displayName: "Vue",
      description: "Requires Pro plan",
      isActive: true,
      metadata: {
        icon: "💚",
        color: "gray",
        order: 5,
      },
    },
    {
      framework: "random",
      requiredPlanTier: "free",
      displayName: "Random Mix",
      description: "Available to all users (limited to accessible frameworks)",
      isActive: true,
      metadata: {
        icon: "🎲",
        color: "gradient",
        order: 6,
      },
    },
  ];

  for (const rule of defaultRules) {
    await this.findOneAndUpdate({ framework: rule.framework }, rule, { upsert: true, new: true });
  }

  console.log("✅ Framework access rules initialized");
};

export const FrameworkAccess = mongoose.model<IFrameworkAccess>(
  "FrameworkAccess",
  FrameworkAccessSchema
);
