import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IDiscussion extends Document {
  questionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId; // For nested replies
  likes: mongoose.Types.ObjectId[]; // Users who liked
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  isReported: boolean;
  reportCount: number;
  isBestAnswer: boolean; // Marked by question creator or admin
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Discussion",
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isBestAnswer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
discussionSchema.index({ questionId: 1, createdAt: -1 });
discussionSchema.index({ userId: 1, createdAt: -1 });
discussionSchema.index({ parentId: 1 });

export const Discussion = mongoose.model<IDiscussion>("Discussion", discussionSchema);
