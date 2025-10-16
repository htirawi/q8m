import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IChallenge {
  challengerId: mongoose.Types.ObjectId;
  challengedUserId: mongoose.Types.ObjectId;

  // Quiz configuration
  difficulty: "easy" | "medium" | "hard";
  framework?: "angular" | "react" | "nextjs" | "redux" | "random";
  questionCount: number;
  timeLimit: number; // in seconds
  questions: mongoose.Types.ObjectId[]; // Actual questions selected for this challenge

  // Challenger results
  challengerScore?: number;
  challengerTime?: number; // in seconds
  challengerAnswers?: Array<{
    questionId: mongoose.Types.ObjectId;
    answer: string | string[];
    correct: boolean;
    timeSpent: number;
  }>;
  challengerCompletedAt?: Date;

  // Challenged user results
  challengedScore?: number;
  challengedTime?: number;
  challengedAnswers?: Array<{
    questionId: mongoose.Types.ObjectId;
    answer: string | string[];
    correct: boolean;
    timeSpent: number;
  }>;
  challengedCompletedAt?: Date;

  status: "pending" | "accepted" | "rejected" | "completed" | "expired";
  winnerId?: mongoose.Types.ObjectId;
  isTie?: boolean;
  message?: string;
  expiresAt?: Date;
  completedAt?: Date;

  // Methods
  determineWinner(): void;
}

export type IChallengeDoc = IChallenge & Document;

const challengeSchema = new Schema(
  {
    challengerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    challengedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Quiz configuration
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    framework: {
      type: String,
      enum: ["angular", "react", "nextjs", "redux", "random"],
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 10,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 60,
      max: 3600,
      default: 600, // 10 minutes
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    // Challenger results
    challengerScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    challengerTime: {
      type: Number,
      min: 0,
    },
    challengerAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: Schema.Types.Mixed,
        correct: {
          type: Boolean,
          required: true,
        },
        timeSpent: {
          type: Number,
          required: true,
        },
      },
    ],
    challengerCompletedAt: {
      type: Date,
    },

    // Challenged user results
    challengedScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    challengedTime: {
      type: Number,
      min: 0,
    },
    challengedAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: Schema.Types.Mixed,
        correct: {
          type: Boolean,
          required: true,
        },
        timeSpent: {
          type: Number,
          required: true,
        },
      },
    ],
    challengedCompletedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "expired"],
      default: "pending",
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isTie: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      maxlength: 200,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
challengeSchema.index({ challengedUserId: 1, status: 1 });
challengeSchema.index({ challengerId: 1, status: 1 });

// Instance method to determine winner
challengeSchema.methods.determineWinner = function (): void {
  // Only determine winner if challenge is completed and both users have submitted
  if (
    this.status !== "completed" ||
    this.challengerScore === undefined ||
    this.challengedScore === undefined
  ) {
    return;
  }

  // Check for tie first
  if (
    this.challengerScore === this.challengedScore &&
    this.challengerTime === this.challengedTime
  ) {
    this.isTie = true;
    this.winnerId = undefined;
    return;
  }

  // Winner has higher score
  if (this.challengerScore > this.challengedScore) {
    this.winnerId = this.challengerId;
    this.isTie = false;
    return;
  }

  if (this.challengedScore > this.challengerScore) {
    this.winnerId = this.challengedUserId;
    this.isTie = false;
    return;
  }

  // If scores are equal, winner is faster
  if (
    this.challengerScore === this.challengedScore &&
    this.challengerTime !== undefined &&
    this.challengedTime !== undefined
  ) {
    if (this.challengerTime < this.challengedTime) {
      this.winnerId = this.challengerId;
      this.isTie = false;
    } else {
      this.winnerId = this.challengedUserId;
      this.isTie = false;
    }
  }
};

// Static method to expire pending challenges
challengeSchema.statics.expirePendingChallenges = async function () {
  const now = new Date();

  const result = await this.updateMany(
    {
      status: { $in: ["pending", "accepted"] },
      expiresAt: { $lt: now },
    },
    {
      $set: { status: "expired" },
    }
  );

  return result;
};

export const Challenge = mongoose.model<IChallenge>("Challenge", challengeSchema);
