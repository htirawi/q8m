import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: "user" | "admin" | "intermediate" | "senior";
  entitlements: string[];
  permissions: string[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: any; // Mongoose Date type
  passwordResetToken?: string;
  passwordResetExpires?: any; // Mongoose Date type
  lastLogin?: any;
  loginAttempts: number;
  lockUntil?: any; // Mongoose Date type
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  acceptTerms: boolean;
  acceptTermsAt?: Date;
  acceptTermsVersion?: string;
  preferences: {
    language: "en" | "ar";
    theme: any;
    notifications: {
      email: boolean;
      quizReminders: boolean;
      newFeatures: boolean;
    };
  };
  subscription: {
    status: "active" | "canceled" | "past_due" | "incomplete";
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
  };
  stats: any;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isActive: boolean;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthTokens(): { accessToken: string; refreshToken: string };
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required(this: any) {
        return !this.googleId && !this.facebookId;
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "intermediate", "senior"],
      default: "user",
    },
    entitlements: {
      type: [String],
      enum: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      default: ["JUNIOR"],
    },
    permissions: {
      type: [String],
      default: [],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // OAuth fields
    googleId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    // Profile fields
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, "Website must be a valid URL"],
    },
    acceptTerms: {
      type: Boolean,
      default: false,
      required: true,
    },
    acceptTermsAt: {
      type: Date,
    },
    acceptTermsVersion: {
      type: String,
      default: "1.0",
    },
    // Preferences
    preferences: {
      language: {
        type: String,
        enum: ["en", "ar"],
        default: "en",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        quizReminders: {
          type: Boolean,
          default: true,
        },
        newFeatures: {
          type: Boolean,
          default: true,
        },
      },
    },
    // Subscription and billing
    subscription: {
      status: {
        type: String,
        enum: ["active", "canceled", "past_due", "incomplete"],
        default: "active",
      },
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
    },
    // Analytics and tracking
    stats: {
      totalQuizzes: {
        type: Number,
        default: 0,
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      streak: {
        type: Number,
        default: 0,
      },
      lastQuizDate: Date,
    },
    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as any).toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.twoFactorSecret;
        return ret;
      },
    },
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true, name: "uniq_email" });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true, name: "uniq_google_id" });
userSchema.index({ facebookId: 1 }, { unique: true, sparse: true, name: "uniq_facebook_id" });
userSchema.index({ role: 1 }, { name: "idx_role" });
userSchema.index({ entitlements: 1 }, { name: "idx_entitlements" });
userSchema.index({ permissions: 1 }, { name: "idx_permissions" });
userSchema.index({ acceptTerms: 1 }, { name: "idx_accept_terms" });
userSchema.index({ acceptTermsAt: 1 }, { name: "idx_accept_terms_at" });
userSchema.index({ isActive: 1 }, { name: "idx_is_active" });
userSchema.index({ createdAt: -1 }, { name: "idx_created_at" });

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && (this.lockUntil as any) > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth tokens
userSchema.methods.generateAuthTokens = function () {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jwt = require("jsonwebtoken");
  const secret = process.env.JWT_SECRET || "fallback-secret";

  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
    permissions: this.permissions,
  };

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: "15m",
    issuer: "q8m-api",
    audience: "q8m-client",
  });

  const refreshToken = jwt.sign({ userId: this._id.toString(), type: "refresh" }, secret, {
    expiresIn: "7d",
    issuer: "q8m-api",
    audience: "q8m-client",
  });

  return {
    accessToken,
    refreshToken,
  };
};

// Static method to find user by email (including password)
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email, isActive: true }).select("+password");
};

// Static method to find user by email verification token
userSchema.statics.findByEmailVerificationToken = function (token: string) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
    isActive: true,
  });
};

// Static method to find user by password reset token
userSchema.statics.findByPasswordResetToken = function (token: string) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
    isActive: true,
  });
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: unknown = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    (updates as any).$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

export const User = mongoose.model<IUser>("User", userSchema);
