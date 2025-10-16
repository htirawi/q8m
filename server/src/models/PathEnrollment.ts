import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IModuleProgress {
  moduleId: string;
  isCompleted: boolean;
  completedAt?: Date;
  questionsCompleted: number;
  totalQuestions: number;
  score?: number; // Average score in this module
}

export interface IPathEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  pathId: mongoose.Types.ObjectId;
  status: "in-progress" | "completed" | "abandoned";
  progress: number; // 0-100
  moduleProgress: IModuleProgress[];
  currentModuleId?: string;
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  totalTimeSpent: number; // in minutes
  certificateIssued: boolean;
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const moduleProgressSchema = new Schema<IModuleProgress>({
  moduleId: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  questionsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
});

const pathEnrollmentSchema = new Schema<IPathEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pathId: {
      type: Schema.Types.ObjectId,
      ref: "LearningPath",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    moduleProgress: [moduleProgressSchema],
    currentModuleId: String,
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateId: String,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
pathEnrollmentSchema.index({ userId: 1, pathId: 1 }, { unique: true });
pathEnrollmentSchema.index({ userId: 1, status: 1 });

export const PathEnrollment = mongoose.model<IPathEnrollment>("PathEnrollment", pathEnrollmentSchema);
