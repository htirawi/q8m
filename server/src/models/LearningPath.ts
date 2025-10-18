import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IModule {
  moduleId: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  order: number;
  estimatedMinutes: number;
  questionIds: mongoose.Types.ObjectId[];
  prerequisites: string[]; // moduleIds that must be completed first
  isLocked: boolean;
}

export interface ILearningPath extends Document {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  slug: string;
  category:
    | "frontend"
    | "backend"
    | "fullstack"
    | "interview"
    | "framework-specific"
    | "role-based";
  difficulty: "beginner" | "intermediate" | "advanced" | "mixed";
  frameworks: string[]; // e.g., ["react", "redux", "typescript"]
  modules: IModule[];
  totalQuestions: number;
  estimatedHours: number;
  prerequisites: string[]; // Other learning path slugs
  tags: string[];
  thumbnail?: string;
  isPremium: boolean;
  isPublished: boolean;
  enrollmentCount: number;
  completionCount: number;
  rating?: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  moduleId: {
    type: String,
    required: true,
  },
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  order: {
    type: Number,
    required: true,
  },
  estimatedMinutes: {
    type: Number,
    required: true,
    min: 5,
  },
  questionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  prerequisites: [String],
  isLocked: {
    type: Boolean,
    default: false,
  },
});

const learningPathSchema = new Schema<ILearningPath>(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["frontend", "backend", "fullstack", "interview", "framework-specific", "role-based"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mixed"],
      required: true,
    },
    frameworks: [String],
    modules: [moduleSchema],
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0,
    },
    prerequisites: [String],
    tags: [String],
    thumbnail: String,
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
learningPathSchema.index({ category: 1, difficulty: 1 });
learningPathSchema.index({ isPublished: 1, isPremium: 1 });

export const LearningPath = mongoose.model<ILearningPath>("LearningPath", learningPathSchema);
