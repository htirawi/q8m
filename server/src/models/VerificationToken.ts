import * as crypto from "crypto";

import type { Document, ObjectId } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IVerificationToken
  extends Omit<Document, "expiresAt" | "usedAt"> {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: "email_verification" | "password_reset" | "two_factor";
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  isValid?: boolean;
  markAsUsed(ipAddress?: string, userAgent?: string): Promise<IVerificationToken>;
}

const verificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email_verification", "password_reset", "two_factor"],
      required: true,
    },
    expiresAt: {
      type: Schema.Types.Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: Schema.Types.Date,
    ipAddress: {
      type: String,
      match: [
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
        "Invalid IP address",
      ],
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        delete ret.token; // Don't expose the actual token
        return ret;
      },
    },
  }
);

// Indexes for performance and cleanup
verificationTokenSchema.index({ userId: 1, type: 1, used: 1 }, { name: "idx_user_type_used" });
verificationTokenSchema.index({ token: 1 }, { unique: true, name: "uniq_token" });
verificationTokenSchema.index({ token: 1, type: 1 }, { name: "idx_token_type" });
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expires_at" }); // TTL index
verificationTokenSchema.index({ used: 1, createdAt: -1 }, { name: "idx_used_created" });

// Virtual for token validity
verificationTokenSchema.virtual("isValid").get(function (this: IVerificationToken) {
  return !this.used && this.expiresAt > new Date();
});

// Instance method to mark token as used
verificationTokenSchema.methods.markAsUsed = function (
  this: IVerificationToken,
  ipAddress?: string,
  userAgent?: string
) {
  this.used = true;
  this.usedAt = new Date();
  if (ipAddress) this.ipAddress = ipAddress;
  if (userAgent) this.userAgent = userAgent;
  return this.save();
};

// Static method to create verification token
verificationTokenSchema.statics.createToken = async function (
  userId: mongoose.Types.ObjectId,
  type: "email_verification" | "password_reset" | "two_factor",
  expirationHours: number = 24
) {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString("hex");

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  // Invalidate any existing tokens of the same type for this user
  await this.updateMany(
    { userId, type, used: false },
    { $set: { used: true, usedAt: new Date() } }
  );

  // Create new token
  const verificationToken = new this({
    userId,
    token,
    type,
    expiresAt,
  });

  return verificationToken.save();
};

// Static method to verify token
verificationTokenSchema.statics.verifyToken = async function (
  token: string,
  type: "email_verification" | "password_reset" | "two_factor"
) {
  const verificationToken = await this.findOne({
    token,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
  }).populate("userId");

  if (!verificationToken) {
    throw new Error("Invalid or expired token");
  }

  return verificationToken;
};

// Static method to clean up expired tokens
verificationTokenSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Clean up used tokens older than 7 days
    ],
  });
};

// Static method to get active tokens for user
verificationTokenSchema.statics.getActiveTokensForUser = function (
  userId: mongoose.Types.ObjectId,
  type?: "email_verification" | "password_reset" | "two_factor"
) {
  const query: Record<string, unknown> = {
    userId,
    used: false,
    expiresAt: { $gt: new Date() },
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).select("type expiresAt createdAt");
};

export const VerificationToken = mongoose.model<IVerificationToken>(
  "VerificationToken",
  verificationTokenSchema
);
