import type { Document, ObjectId } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ISession
  extends Omit<Document, "expiresAt" | "lastUsed" | "revokedAt" | "revoke"> {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
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
  lastUsed: Date;
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
  revoke(
    reason?: "user_logout" | "password_change" | "suspicious_activity" | "admin_revoke" | "expired"
  ): Promise<void>;
}

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Schema.Types.Date,
      required: true,
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    ipAddress: {
      type: String,
      validate: {
        validator: function (ip: string) {
          // IPv4 validation
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

          // IPv6 validation (supports compressed notation like ::1, 2001:db8::1, etc.)
          const ipv6Regex =
            /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

          return ipv4Regex.test(ip) || ipv6Regex.test(ip);
        },
        message: "Invalid IP address",
      },
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
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
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
sessionSchema.index({ userId: 1, isActive: 1 }, { name: "idx_user_active" });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expires_at" }); // TTL index
sessionSchema.index({ refreshToken: 1 }, { unique: true, name: "uniq_refresh_token" });
sessionSchema.index({ accessToken: 1 }, { name: "idx_access_token" });
sessionSchema.index({ isActive: 1, isRevoked: 1 }, { name: "idx_active_revoked" });
sessionSchema.index({ lastUsed: -1 }, { name: "idx_last_used" });

// Virtual for session validity
sessionSchema.virtual("isValid").get(function (this: ISession) {
  return this.isActive && !this.isRevoked && this.expiresAt > new Date();
});

// Instance method to refresh session
sessionSchema.methods.refresh = async function (this: ISession) {
  this.lastUsed = new Date();
  return this.save();
};

// Instance method to revoke session
sessionSchema.methods.revoke = async function (
  this: ISession,
  reason:
    | "user_logout"
    | "password_change"
    | "suspicious_activity"
    | "admin_revoke"
    | "expired" = "user_logout"
) {
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
sessionSchema.pre("save", function (this: ISession, next) {
  if (this.isModified() && !this.isNew) {
    this.lastUsed = new Date();
  }
  next();
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);
