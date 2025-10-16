import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ITransaction {
  amount: number;
  type: "earn" | "spend";
  source:
    | "quiz"
    | "streak"
    | "achievement"
    | "purchase"
    | "referral"
    | "daily-bonus"
    | "streak-saver"
    | "hint"
    | "power-up";
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IVirtualCurrency extends Document {
  userId: mongoose.Types.ObjectId;
  coins: number; // Current balance
  totalEarned: number;
  totalSpent: number;
  transactions: ITransaction[];
  lastDailyBonusAt?: Date;
  streakMultiplier: number; // Earn more coins with longer streaks
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["earn", "spend"],
    required: true,
  },
  source: {
    type: String,
    enum: [
      "quiz",
      "streak",
      "achievement",
      "purchase",
      "referral",
      "daily-bonus",
      "streak-saver",
      "hint",
      "power-up",
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const virtualCurrencySchema = new Schema<IVirtualCurrency>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    coins: {
      type: Number,
      default: 100, // Starting bonus
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 100, // Includes starting bonus
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [transactionSchema],
    lastDailyBonusAt: Date,
    streakMultiplier: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const VirtualCurrency = mongoose.model<IVirtualCurrency>(
  "VirtualCurrency",
  virtualCurrencySchema
);
