import type { Document, ObjectId } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number; // Percentage (0-100) or fixed amount
  currency?: string; // Required for fixed coupons
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil?: Date;
  usageLimit?: number;
  usedCount: number;
  applicablePlans: ("INTERMEDIATE" | "SENIOR" | "BUNDLE")[];
  applicableCycles: ("monthly" | "yearly")[];
  isActive: boolean;
  metadata?: {
    campaign?: string;
    affiliateId?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator (this: ICoupon, v: number) {
          if (this.type === "percentage") {
            return v >= 0 && v <= 100;
          }
          return v >= 0;
        },
        message: "Value must be between 0-100 for percentage coupons, and >= 0 for fixed coupons",
      },
    },
    currency: {
      type: String,
      enum: ["USD", "JOD", "SAR"],
      required (this: ICoupon) {
        return this.type === "fixed";
      },
    },
    minPurchaseAmount: {
      type: Number,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicablePlans: {
      type: [String],
      enum: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
      default: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
    },
    applicableCycles: {
      type: [String],
      enum: ["monthly", "yearly"],
      default: ["monthly", "yearly"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      campaign: String,
      affiliateId: String,
      notes: String,
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

// Indexes for performance
couponSchema.index({ code: 1, isActive: 1 }, { name: "idx_code_active" });
couponSchema.index({ validFrom: 1, validUntil: 1 }, { name: "idx_validity_period" });
couponSchema.index({ isActive: 1, usageLimit: 1, usedCount: 1 }, { name: "idx_usage" });

// Virtual for remaining uses
couponSchema.virtual("remainingUses").get(function (this: ICoupon) {
  if (!this.usageLimit) return Infinity;
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for is valid
couponSchema.virtual("isValid").get(function (this: ICoupon) {
  const now = new Date();
  const isInValidityPeriod =
    this.validFrom <= now && (!this.validUntil || this.validUntil > now);
  const hasUsesRemaining = !this.usageLimit || this.usedCount < this.usageLimit;
  return this.isActive && isInValidityPeriod && hasUsesRemaining;
});

// Instance method to calculate discount
couponSchema.methods.calculateDiscount = function (
  amount: number,
  currency: string
): { discountAmount: number; finalAmount: number } {
  let discountAmount = 0;

  if (this.type === "percentage") {
    discountAmount = (amount * this.value) / 100;
    if (this.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else if (this.type === "fixed") {
    if (this.currency === currency) {
      discountAmount = this.value;
    } else {
      // Currency mismatch - cannot apply fixed discount
      throw new Error(`Coupon currency (${this.currency}) does not match purchase currency (${currency})`);
    }
  }

  const finalAmount = Math.max(0, amount - discountAmount);
  return { discountAmount, finalAmount };
};

// Instance method to validate for plan and cycle
couponSchema.methods.isApplicable = function (
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE",
  billingCycle: "monthly" | "yearly",
  amount: number
): { valid: boolean; reason?: string } {
  const now = new Date();

  if (!this.isActive) {
    return { valid: false, reason: "Coupon is inactive" };
  }

  if (this.validFrom > now) {
    return { valid: false, reason: "Coupon is not yet valid" };
  }

  if (this.validUntil && this.validUntil < now) {
    return { valid: false, reason: "Coupon has expired" };
  }

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }

  if (!this.applicablePlans.includes(planType)) {
    return { valid: false, reason: `Coupon not applicable to ${planType} plan` };
  }

  if (!this.applicableCycles.includes(billingCycle)) {
    return { valid: false, reason: `Coupon not applicable to ${billingCycle} billing` };
  }

  if (this.minPurchaseAmount && amount < this.minPurchaseAmount) {
    return {
      valid: false,
      reason: `Minimum purchase amount of ${this.minPurchaseAmount} not met`,
    };
  }

  return { valid: true };
};

// Instance method to increment usage
couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

// Static method to find valid coupon by code
couponSchema.statics.findValidByCode = function (code: string) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    $or: [{ validUntil: { $gt: now } }, { validUntil: null }],
    $expr: { $or: [{ $eq: ["$usageLimit", null] }, { $lt: ["$usedCount", "$usageLimit"] }] },
  });
};

// Static method to get active coupons
couponSchema.statics.getActiveCoupons = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    $or: [{ validUntil: { $gt: now } }, { validUntil: null }],
  }).sort({ createdAt: -1 });
};

// Static method to get coupon statistics
couponSchema.statics.getCouponStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalUsed: { $sum: "$usedCount" },
        averageValue: { $avg: "$value" },
      },
    },
  ]);
};

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
