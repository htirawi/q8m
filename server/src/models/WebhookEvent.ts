/**
 * WebhookEvent Model
 * Stores webhook events for audit trail and deduplication
 * 
 * SECURITY: Prevents replay attacks and provides idempotency (SEC-003 fix)
 */

import mongoose, { Schema, type Document } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string; // Unique event ID from payment gateway
  eventType: string; // E.g., PAYMENT.CAPTURE.COMPLETED
  gateway: "paypal" | "aps" | "hyperpay";
  rawPayload: Record<string, unknown>;
  receivedAt: Date;
  processedAt?: Date;
  status: "pending" | "processed" | "failed";
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ["paypal", "aps", "hyperpay"],
      required: true,
      index: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true,
    },
    error: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
WebhookEventSchema.index({ gateway: 1, eventType: 1, receivedAt: -1 });

// TTL index to auto-delete old events after 90 days (7776000 seconds)
WebhookEventSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 7776000 });

export const WebhookEvent = mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
