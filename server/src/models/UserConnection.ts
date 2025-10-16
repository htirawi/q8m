import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IUserConnection extends Document {
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "blocked";
  initiatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userConnectionSchema = new Schema<IUserConnection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connections
userConnectionSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const UserConnection = mongoose.model<IUserConnection>("UserConnection", userConnectionSchema);
