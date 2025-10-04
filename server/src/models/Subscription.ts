import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  purchaseId: mongoose.Types.ObjectId;
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  status: "active" | "cancelled" | "expired" | "suspended" | "pending";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  cancelReason?: string;
  trialStart?: Date;
  trialEnd?: Date;
  billingCycle: "monthly" | "yearly";
  price: {
    currency: string;
    amount: string;
  };
  entitlements: string[];
  metadata?: {
    originalPurchaseCurrency?: string;
    fxRateUsed?: number;
    promotionCode?: string;
    affiliateId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "suspended", "pending"],
      default: "pending",
      index: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      index: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: Date,
    cancelReason: {
      type: String,
      enum: ["user_request", "payment_failed", "admin_action", "fraud", "other"],
    },
    trialStart: Date,
    trialEnd: Date,
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    price: {
      currency: {
        type: String,
        required: true,
        enum: ["USD", "JOD", "SAR"],
        default: "USD",
      },
      amount: {
        type: String,
        required: true,
        validate: {
          validator(v: string) {
            return /^\d+(\.\d{2})?$/.test(v);
          },
          message: "Amount must be a valid decimal number",
        },
      },
    },
    entitlements: {
      type: [String],
      enum: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      required: true,
    },
    metadata: {
      originalPurchaseCurrency: {
        type: String,
        enum: ["USD", "JOD", "SAR"],
      },
      fxRateUsed: Number,
      promotionCode: String,
      affiliateId: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as any).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ planType: 1, status: 1 });
subscriptionSchema.index({ cancelAtPeriodEnd: 1, currentPeriodEnd: 1 });

// Virtual for subscription validity
subscriptionSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    (this as any).status === "active" &&
    (this as any).currentPeriodStart <= now &&
    (this as any).currentPeriodEnd > now
  );
});

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const diffTime = (this as any).currentPeriodEnd.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is in trial
subscriptionSchema.virtual("isInTrial").get(function () {
  const now = new Date();
  return (
    (this as any).trialStart &&
    (this as any).trialEnd &&
    (this as any).trialStart <= now &&
    (this as any).trialEnd > now
  );
});

// Instance method to activate subscription
subscriptionSchema.methods.activate = function () {
  this.status = "active";
  this.currentPeriodStart = new Date();
  return this.save();
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function (reason: string = "user_request") {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.cancelAtPeriodEnd = true;
  return this.save();
};

// Instance method to suspend subscription
subscriptionSchema.methods.suspend = function (reason?: string) {
  this.status = "suspended";
  if (reason) {
    this.cancelReason = reason;
  }
  return this.save();
};

// Instance method to renew subscription
subscriptionSchema.methods.renew = function (billingCycle: "monthly" | "yearly") {
  const now = new Date();
  this.currentPeriodStart = now;

  if (billingCycle === "yearly") {
    this.currentPeriodEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  } else {
    this.currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  this.billingCycle = billingCycle;
  this.status = "active";
  this.cancelAtPeriodEnd = false;
  this.cancelledAt = undefined;
  this.cancelReason = undefined;

  return this.save();
};

// Instance method to extend trial
subscriptionSchema.methods.extendTrial = function (days: number) {
  if (this.trialEnd) {
    this.trialEnd = new Date(this.trialEnd.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    const now = new Date();
    this.trialStart = now;
    this.trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  return this.save();
};

// Static method to find active subscription for user
subscriptionSchema.statics.findActiveForUser = function (userId: string) {
  const now = new Date();
  return this.findOne({
    userId,
    status: "active",
    currentPeriodStart: { $lte: now },
    currentPeriodEnd: { $gt: now },
  });
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiringSoon = function (days: number = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: "active",
    currentPeriodEnd: { $lte: futureDate },
    cancelAtPeriodEnd: false,
  }).populate("userId", "email name");
};

// Static method to find cancelled subscriptions
subscriptionSchema.statics.findCancelled = function (limit: number = 50) {
  return this.find({
    status: "cancelled",
  })
    .sort({ cancelledAt: -1 })
    .limit(limit)
    .populate("userId", "email name");
};

// Static method to get subscription statistics
subscriptionSchema.statics.getSubscriptionStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: {
          planType: "$planType",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.planType",
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        total: { $sum: "$count" },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);
};

// Static method to get revenue by plan
subscriptionSchema.statics.getRevenueByPlan = function (startDate?: Date, endDate?: Date) {
  const match: unknown = { status: "active" };

  if (startDate || endDate) {
    (match as any).currentPeriodStart = {};
    if (startDate) (match as any).currentPeriodStart.$gte = startDate;
    if (endDate) (match as any).currentPeriodStart.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$planType",
        totalRevenue: { $sum: { $toDouble: "$price.amount" } },
        subscriptionCount: { $sum: 1 },
        averagePrice: { $avg: { $toDouble: "$price.amount" } },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ]);
};

// Pre-save middleware to set entitlements based on plan type
subscriptionSchema.pre("save", function (next) {
  if ((this as any).isModified("planType")) {
    switch ((this as any).planType) {
      case "INTERMEDIATE":
        (this as any).entitlements = ["JUNIOR", "INTERMEDIATE"];
        break;
      case "SENIOR":
        (this as any).entitlements = ["JUNIOR", "SENIOR"];
        break;
      case "BUNDLE":
        (this as any).entitlements = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
        break;
      default:
        (this as any).entitlements = ["JUNIOR"];
    }
  }
  next();
});

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
