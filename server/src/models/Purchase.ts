import mongoose, { Document, Schema } from "mongoose";

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId: string;
  paymentGateway: "paypal" | "aps" | "hyperpay";
  amount: {
    currency: string;
    value: string;
  };
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  items: Array<{
    type: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
    name: string;
    price: {
      currency: string;
      value: string;
    };
  }>;
  customer: {
    email: string;
    name: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentDetails?: {
    method: string;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  gatewayResponse?: Record<string, unknown>;
  refundDetails?: {
    amount: string;
    currency: string;
    reason: string;
    refundedAt: Date;
    gatewayRefundId?: string;
  };
  planType?: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  billingCycle?: "monthly" | "yearly";
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    campaign?: string;
    originalCurrency?: string;
    exchangeRate?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["paypal", "aps", "hyperpay"],
      required: true,
    },
    amount: {
      currency: {
        type: String,
        required: true,
        enum: ["USD", "JOD", "SAR"],
        default: "USD",
      },
      value: {
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
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    items: [
      {
        type: {
          type: String,
          enum: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          currency: {
            type: String,
            required: true,
            enum: ["USD", "JOD", "SAR"],
          },
          value: {
            type: String,
            required: true,
            validate: {
              validator(v: string) {
                return /^\d+(\.\d{2})?$/.test(v);
              },
              message: "Price must be a valid decimal number",
            },
          },
        },
      },
    ],
    customer: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        enum: ["US", "JO", "SA", "AE", "KW", "QA", "BH", "OM", "EG", "LB", "SY", "IQ", "YE"],
      },
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["card", "paypal", "bank_transfer", "wallet"],
      },
      last4: {
        type: String,
        maxlength: 4,
      },
      brand: {
        type: String,
        enum: ["visa", "mastercard", "amex", "discover", "jcb", "diners"],
      },
      expiryMonth: {
        type: Number,
        min: 1,
        max: 12,
      },
      expiryYear: {
        type: Number,
        min: new Date().getFullYear(),
      },
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    refundDetails: {
      amount: String,
      currency: {
        type: String,
        enum: ["USD", "JOD", "SAR"],
      },
      reason: {
        type: String,
        enum: ["requested_by_customer", "duplicate", "fraudulent", "other"],
      },
      refundedAt: Date,
      gatewayRefundId: String,
    },
    planType: {
      type: String,
      enum: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    metadata: {
      userAgent: {
        type: String,
        maxlength: 500,
      },
      ipAddress: {
        type: String,
        match: [
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
          "Invalid IP address",
        ],
      },
      referrer: String,
      campaign: String,
      originalCurrency: String,
      exchangeRate: String,
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
purchaseSchema.index({ orderId: 1 }, { unique: true, name: "uniq_order_id" });
purchaseSchema.index({ paymentId: 1 }, { unique: true, name: "uniq_payment_id" });
purchaseSchema.index({ userId: 1, createdAt: -1 }, { name: "idx_user_created" });
purchaseSchema.index({ status: 1, createdAt: -1 }, { name: "idx_status_created" });
purchaseSchema.index({ paymentGateway: 1, status: 1 }, { name: "idx_gateway_status" });
purchaseSchema.index({ "customer.email": 1 }, { name: "idx_customer_email" });

// Virtual for formatted amount
purchaseSchema.virtual("formattedAmount").get(function () {
  return `${this.amount.value} ${this.amount.currency}`;
});

// Instance method to mark as completed
purchaseSchema.methods.markAsCompleted = function (gatewayResponse?: Record<string, unknown>) {
  this.status = "completed";
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Instance method to mark as failed
purchaseSchema.methods.markAsFailed = function (reason?: string) {
  this.status = "failed";
  if (reason) {
    this.gatewayResponse = { ...this.gatewayResponse, failureReason: reason };
  }
  return this.save();
};

// Instance method to process refund
purchaseSchema.methods.processRefund = function (
  amount: string,
  currency: string,
  reason: string,
  gatewayRefundId?: string
) {
  this.status = "refunded";
  this.refundDetails = {
    amount,
    currency,
    reason,
    refundedAt: new Date(),
    gatewayRefundId,
  };
  return this.save();
};

// Static method to find by order ID
purchaseSchema.statics.findByOrderId = function (orderId: string) {
  return this.findOne({ orderId });
};

// Static method to find by payment ID
purchaseSchema.statics.findByPaymentId = function (paymentId: string) {
  return this.findOne({ paymentId });
};

// Static method to get user purchases
purchaseSchema.statics.getUserPurchases = function (
  userId: string,
  limit: number = 10,
  skip: number = 0
) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("userId", "email name");
};

// Static method to get revenue statistics
purchaseSchema.statics.getRevenueStats = function (startDate?: Date, endDate?: Date) {
  const match: unknown = { status: "completed" };

  if (startDate || endDate) {
    (match as any).createdAt = {};
    if (startDate) (match as any).createdAt.$gte = startDate;
    if (endDate) (match as any).createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$amount.currency",
        totalRevenue: { $sum: { $toDouble: "$amount.value" } },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: { $toDouble: "$amount.value" } },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ]);
};

// Pre-save middleware to generate order ID if not provided
purchaseSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
