/**
 * Payment Repository
 * Handles database operations for payments
 * Uses MongoDB/Mongoose models
 */

import type { IPurchase } from "@models/Purchase.js";
import { Purchase } from "@models/Purchase.js";
import type { Types } from "mongoose";

import type { PaymentGatewayResponse } from "../types/payment-gateway";
import type { CaptureData, PaymentRecord } from "../types/repositories/payment";

export class PaymentRepository {
  /**
   * Create a new payment record
   */
  async create(data: PaymentRecord): Promise<IPurchase> {
    const purchase = new Purchase(data);
    await purchase.save();
    return purchase;
  }

  /**
   * Find payment by PayPal order ID
   */
  async findByOrderId(orderId: string): Promise<IPurchase | null> {
    return Purchase.findOne({ paymentId: orderId });
  }

  /**
   * Find payment by internal order ID
   */
  async findByInternalOrderId(orderId: string): Promise<IPurchase | null> {
    return Purchase.findOne({ orderId });
  }

  /**
   * Find payment by ID
   */
  async findById(id: string | Types.ObjectId): Promise<IPurchase | null> {
    return Purchase.findById(id);
  }

  /**
   * Update payment with capture details
   */
  async updateCapture(orderId: string, captureData: CaptureData): Promise<IPurchase | null> {
    const purchase = await this.findByOrderId(orderId);
    if (!purchase) {
      return null;
    }

    purchase.gatewayPaymentId = captureData.captureId;
    purchase.status = captureData.status as "completed" | "pending" | "failed";
    if (captureData.gatewayResponse) {
      purchase.gatewayResponse = captureData.gatewayResponse as unknown as Record<string, unknown>;
    }

    if (captureData.payerEmail && purchase.customer) {
      purchase.customer.email = captureData.payerEmail;
    }

    await purchase.save();
    return purchase;
  }

  /**
   * Mark payment as completed
   */
  async markAsCompleted(
    orderId: string,
    gatewayResponse?: PaymentGatewayResponse
  ): Promise<IPurchase | null> {
    const purchase = await this.findByOrderId(orderId);
    if (!purchase) {
      return null;
    }

    purchase.status = "completed";
    if (gatewayResponse) {
      purchase.gatewayResponse = gatewayResponse as unknown as Record<string, unknown>;
    }
    await purchase.save();
    return purchase;
  }

  /**
   * Mark payment as failed
   */
  async markAsFailed(orderId: string, reason: string): Promise<IPurchase | null> {
    const purchase = await this.findByOrderId(orderId);
    if (!purchase) {
      return null;
    }

    purchase.status = "failed";
    if (reason) {
      purchase.gatewayResponse = {
        ...(purchase.gatewayResponse || {}),
        failureReason: reason,
      };
    }
    await purchase.save();
    return purchase;
  }

  /**
   * Find payment by capture ID (for webhook processing)
   */
  async findByCaptureId(captureId: string): Promise<IPurchase | null> {
    return Purchase.findOne({ gatewayPaymentId: captureId });
  }

  /**
   * Check if payment already processed (idempotency check)
   */
  async isPaymentProcessed(orderId: string): Promise<boolean> {
    const purchase = await this.findByOrderId(orderId);
    return purchase?.status === "completed";
  }

  /**
   * Get user payments
   */
  async getUserPayments(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPurchase[]> {
    return Purchase.find({ userId }).sort({ createdAt: -1 }).limit(limit).skip(skip).exec();
  }
}

/**
 * Export singleton instance
 */
export const paymentRepository = new PaymentRepository();
