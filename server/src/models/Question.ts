import type { Document, ObjectId } from "mongoose";
import { Schema, model } from "mongoose";

export interface IQuestion extends Document {
  framework: "angular" | "react" | "vue" | "nextjs" | "redux" | "random" | "typescript" | "testing" | "svelte";
  level: "junior" | "intermediate" | "senior";
  type: "multiple-choice" | "true-false" | "fill-blank" | "multiple-checkbox" | "open-ended" | "debugging" | "interview";
  mode: "study" | "quiz" | "both"; // study = explanatory only, quiz = testing, both = can be used in either
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  points: number;
  content: {
    en: {
      question: string;
      options?: Array<{ id: string; text: string; isCorrect: boolean }>;
      explanation: string;
    };
    ar: {
      question: string;
      options?: Array<{ id: string; text: string; isCorrect: boolean }>;
      explanation: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    framework: {
      type: String,
      enum: ["angular", "react", "vue", "nextjs", "redux", "random", "typescript", "testing", "svelte"],
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["junior", "intermediate", "senior"],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "fill-blank", "multiple-checkbox", "open-ended", "debugging", "interview"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["study", "quiz", "both"],
      default: "quiz", // Default to quiz for backward compatibility
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    content: {
      en: {
        question: { type: String, required: true },
        options: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        explanation: { type: String, required: true },
      },
      ar: {
        question: { type: String, required: false }, // Optional for gradual i18n rollout
        options: [
          {
            id: { type: String, required: false },
            text: { type: String, required: false },
            isCorrect: { type: Boolean, required: false },
          },
        ],
        explanation: { type: String, required: false }, // Optional for gradual i18n rollout
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

// Compound indexes for efficient querying
questionSchema.index({ framework: 1, level: 1, isActive: 1 });
questionSchema.index({ framework: 1, category: 1, isActive: 1 });
questionSchema.index({ framework: 1, difficulty: 1, isActive: 1 });
questionSchema.index({ difficulty: 1, mode: 1, isActive: 1, createdAt: -1 }); // For study mode
questionSchema.index({ level: 1, mode: 1, isActive: 1, createdAt: -1 }); // For quiz mode
questionSchema.index({ tags: 1, isActive: 1 });
questionSchema.index({ mode: 1, isActive: 1 });

// Static method to find questions with filters
questionSchema.statics.findWithFilters = function (filters: {
  framework?: string;
  level?: string;
  category?: string;
  difficulty?: string;
  mode?: "study" | "quiz" | "both";
  limit?: number;
  offset?: number;
}) {
  const query: Record<string, unknown> = {};

  if (filters.framework) query.framework = filters.framework;
  if (filters.level) query.level = filters.level;
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;

  // Filter by mode: if mode is specified, get questions that match that mode or are "both"
  if (filters.mode) {
    query.mode = { $in: [filters.mode, "both"] };
  }

  return this.find({ ...query, isActive: true })
    .skip(filters.offset || 0)
    .limit(filters.limit || 20)
    .sort({ createdAt: -1 });
};

// Static method to get question statistics
questionSchema.statics.getStatistics = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byFramework: {
          $push: {
            framework: "$framework",
            level: "$level",
          },
        },
      },
    },
    {
      $project: {
        total: 1,
        byFramework: 1,
      },
    },
  ]);
};

export const Question = model<IQuestion>("Question", questionSchema);
