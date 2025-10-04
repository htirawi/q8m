import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  accessToken: string;
  expiresAt: any; // Mongoose Date type
  userAgent?: string;
  ipAddress?: string;
  device?: {
    type: "desktop" | "mobile" | "tablet" | "unknown";
    os?: string;
    browser?: string;
  };
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  isActive: boolean;
  lastUsed: any; // Mongoose Date type
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?:
    | "user_logout"
    | "password_change"
    | "suspicious_activity"
    | "admin_revoke"
    | "expired";
  isValid(): boolean;
  refresh(): Promise<void>;
}

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Schema.Types.Date,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    ipAddress: {
      type: String,
      match: [
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
        "Invalid IP address",
      ],
    },
    device: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      os: String,
      browser: String,
    },
    location: {
      country: String,
      city: String,
      timezone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    // Security flags
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: Schema.Types.Date,
    revokedReason: {
      type: String,
      enum: ["user_logout", "password_change", "suspicious_activity", "admin_revoke", "expired"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.refreshToken; // Don't expose refresh token
        delete ret.accessToken; // Don't expose access token
        return ret;
      },
    },
  }
);

// Indexes for performance and cleanup
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ accessToken: 1 });
sessionSchema.index({ isActive: 1, isRevoked: 1 });
sessionSchema.index({ lastUsed: -1 });

// Virtual for session validity
sessionSchema.virtual("isValid").get(function () {
  return this.isActive && !this.isRevoked && (this.expiresAt as any) > new Date();
});

// Instance method to check if session is valid
sessionSchema.methods.isValid = function (): boolean {
  return this.isActive && !this.isRevoked && (this.expiresAt as any) > new Date();
};

// Instance method to refresh session
sessionSchema.methods.refresh = async function () {
  this.lastUsed = new Date();
  return this.save();
};

// Instance method to revoke session
sessionSchema.methods.revoke = async function (reason: string = "user_logout") {
  this.isActive = false;
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to clean up expired sessions
sessionSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, updatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Clean up inactive sessions older than 30 days
    ],
  });
};

// Static method to revoke all sessions for a user
sessionSchema.statics.revokeAllForUser = function (
  userId: string,
  reason: string = "password_change"
) {
  return this.updateMany(
    { userId, isActive: true },
    {
      $set: {
        isActive: false,
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    }
  );
};

// Static method to find active session by refresh token
sessionSchema.statics.findActiveByRefreshToken = function (refreshToken: string) {
  return this.findOne({
    refreshToken,
    isActive: true,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate("userId", "email name role entitlements isEmailVerified");
};

// Static method to find active session by access token
sessionSchema.statics.findActiveByAccessToken = function (accessToken: string) {
  return this.findOne({
    accessToken,
    isActive: true,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate("userId", "email name role entitlements isEmailVerified");
};

// Pre-save middleware to update lastUsed
sessionSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastUsed = new Date() as any;
  }
  next();
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);
