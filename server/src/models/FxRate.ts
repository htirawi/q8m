import mongoose, { Document, Schema } from "mongoose";

export interface IFxRate extends Document {
  baseCurrency: "USD";
  targetCurrency: "JOD" | "SAR";
  rate: number;
  source: "api" | "manual" | "fallback";
  provider?: string;
  fetchedAt: Date;
  expiresAt: any; // Mongoose Date type
  metadata?: {
    providerResponse?: Record<string, any>;
    errorMessage?: string;
  };
  createdAt: Date;
}

const fxRateSchema = new Schema<IFxRate>(
  {
    baseCurrency: {
      type: String,
      enum: ["USD"],
      default: "USD",
      required: true,
    },
    targetCurrency: {
      type: String,
      enum: ["JOD", "SAR"],
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(v: number) {
          return v > 0 && v < 1000; // Reasonable rate bounds
        },
        message: "Exchange rate must be between 0 and 1000",
      },
    },
    source: {
      type: String,
      enum: ["api", "manual", "fallback"],
      default: "api",
      required: true,
    },
    provider: {
      type: String,
      enum: ["exchangerate-api", "fixer", "currencylayer", "manual"],
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Schema.Types.Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
    metadata: {
      providerResponse: Schema.Types.Mixed,
      errorMessage: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
fxRateSchema.index({ baseCurrency: 1, targetCurrency: 1, expiresAt: -1 });
fxRateSchema.index({ targetCurrency: 1, expiresAt: -1 });
fxRateSchema.index({ fetchedAt: -1 });

// Virtual for currency pair
fxRateSchema.virtual("currencyPair").get(function () {
  return `${this.baseCurrency}/${this.targetCurrency}`;
});

// Virtual for is expired
fxRateSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

// Virtual for age in hours
fxRateSchema.virtual("ageInHours").get(function () {
  return Math.floor((Date.now() - this.fetchedAt.getTime()) / (1000 * 60 * 60));
});

// Instance method to check if rate is fresh (less than 24 hours old)
fxRateSchema.methods.isFresh = function (maxAgeHours: number = 24): boolean {
  const ageInHours = this.ageInHours;
  return ageInHours < maxAgeHours && !this.isExpired;
};

// Instance method to extend expiration
fxRateSchema.methods.extendExpiration = function (hours: number = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return this.save();
};

// Static method to get latest rate for currency pair
fxRateSchema.statics.getLatestRate = function (baseCurrency: "USD", targetCurrency: "JOD" | "SAR") {
  const now = new Date();
  return this.findOne({
    baseCurrency,
    targetCurrency,
    expiresAt: { $gt: now },
  }).sort({ fetchedAt: -1 });
};

// Static method to get fresh rate (less than 24 hours old)
fxRateSchema.statics.getFreshRate = function (
  baseCurrency: "USD",
  targetCurrency: "JOD" | "SAR",
  maxAgeHours: number = 24
) {
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  const now = new Date();

  return this.findOne({
    baseCurrency,
    targetCurrency,
    expiresAt: { $gt: now },
    fetchedAt: { $gt: cutoffTime },
  }).sort({ fetchedAt: -1 });
};

// Static method to get all active rates
fxRateSchema.statics.getActiveRates = function () {
  const now = new Date();
  return this.find({
    expiresAt: { $gt: now },
  }).sort({ targetCurrency: 1, fetchedAt: -1 });
};

// Static method to clean up expired rates
fxRateSchema.statics.cleanupExpired = function () {
  const now = new Date();
  return this.deleteMany({
    expiresAt: { $lte: now },
  });
};

// Static method to get rate history
fxRateSchema.statics.getRateHistory = function (
  baseCurrency: "USD",
  targetCurrency: "JOD" | "SAR",
  days: number = 30
) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    baseCurrency,
    targetCurrency,
    fetchedAt: { $gte: startDate },
  })
    .sort({ fetchedAt: -1 })
    .select("rate fetchedAt source provider")
    .limit(100);
};

// Static method to get average rate over period
fxRateSchema.statics.getAverageRate = function (
  baseCurrency: "USD",
  targetCurrency: "JOD" | "SAR",
  hours: number = 24
) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        baseCurrency,
        targetCurrency,
        fetchedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        averageRate: { $avg: "$rate" },
        minRate: { $min: "$rate" },
        maxRate: { $max: "$rate" },
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to create fallback rate
fxRateSchema.statics.createFallbackRate = function (
  targetCurrency: "JOD" | "SAR",
  rate: number,
  reason: string = "API unavailable"
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  return this.create({
    baseCurrency: "USD",
    targetCurrency,
    rate,
    source: "fallback",
    provider: "manual",
    fetchedAt: now,
    expiresAt,
    metadata: {
      errorMessage: reason,
    },
  });
};

// Static method to get rate statistics
fxRateSchema.statics.getRateStats = function (days: number = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        fetchedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          targetCurrency: "$targetCurrency",
          source: "$source",
        },
        count: { $sum: 1 },
        averageRate: { $avg: "$rate" },
        minRate: { $min: "$rate" },
        maxRate: { $max: "$rate" },
        latestRate: { $last: "$rate" },
      },
    },
    {
      $sort: { "_id.targetCurrency": 1, "_id.source": 1 },
    },
  ]);
};

// Pre-save middleware to set default expiration if not provided
fxRateSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    // Default to 24 hours from now
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) as any;
  }
  next();
});

export const FxRate = mongoose.model<IFxRate>("FxRate", fxRateSchema);
