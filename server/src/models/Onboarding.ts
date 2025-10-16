import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IOnboarding extends Document {
  userId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  currentStep: number;
  steps: {
    selectGoal: {
      completed: boolean;
      goal?: "get-job" | "learn-framework" | "interview-prep" | "upskill" | "certification";
    };
    selectExperience: {
      completed: boolean;
      experience?: "junior" | "intermediate" | "senior";
    };
    selectFrameworks: {
      completed: boolean;
      frameworks?: string[]; // ["react", "vue", "angular"]
    };
    selectTopics: {
      completed: boolean;
      topics?: string[]; // Specific categories they're interested in
    };
    takePlacementQuiz: {
      completed: boolean;
      score?: number;
      recommendedLevel?: "junior" | "intermediate" | "senior";
    };
  };
  recommendedPaths?: mongoose.Types.ObjectId[]; // Learning paths suggested based on onboarding
  completedAt?: Date;
  skipped: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const onboardingSchema = new Schema<IOnboarding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    currentStep: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    steps: {
      selectGoal: {
        completed: { type: Boolean, default: false },
        goal: {
          type: String,
          enum: ["get-job", "learn-framework", "interview-prep", "upskill", "certification"],
        },
      },
      selectExperience: {
        completed: { type: Boolean, default: false },
        experience: {
          type: String,
          enum: ["junior", "intermediate", "senior"],
        },
      },
      selectFrameworks: {
        completed: { type: Boolean, default: false },
        frameworks: [String],
      },
      selectTopics: {
        completed: { type: Boolean, default: false },
        topics: [String],
      },
      takePlacementQuiz: {
        completed: { type: Boolean, default: false },
        score: Number,
        recommendedLevel: {
          type: String,
          enum: ["junior", "intermediate", "senior"],
        },
      },
    },
    recommendedPaths: [
      {
        type: Schema.Types.ObjectId,
        ref: "LearningPath",
      },
    ],
    completedAt: Date,
    skipped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Onboarding = mongoose.model<IOnboarding>("Onboarding", onboardingSchema);
