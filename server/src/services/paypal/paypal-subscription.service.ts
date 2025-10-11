/**
 * PayPal Subscription Service
 * Handles subscription creation after successful payments
 */

import type { IPurchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import type { FastifyRequest } from "fastify";

export class PayPalSubscriptionService {
  /**
   * Create subscription after successful payment
   */
  async createSubscription(payment: IPurchase, request?: FastifyRequest): Promise<void> {
    const user = await User.findById(payment.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      purchaseId: payment._id,
      status: "active",
    });

    if (existingSubscription) {
      request?.log.info({
        event: "subscription_already_exists",
        purchaseId: payment._id,
        subscriptionId: existingSubscription._id,
      });
      return;
    }

    // Determine plan details
    const planType = payment.metadata?.planType || payment.items[0]?.type || "INTERMEDIATE";
    const billingCycle = payment.metadata?.billingCycle || "monthly";

    // Calculate subscription period
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now, billingCycle);

    // Create subscription
    const subscription = new Subscription({
      userId: payment.userId,
      purchaseId: payment._id,
      planType,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingCycle,
      price: payment.amount,
      metadata: { originalPurchaseCurrency: payment.amount.currency },
    });

    await subscription.save();

    // Update user entitlements
    user.entitlements = subscription.entitlements;
    await user.save();

    request?.log.info({
      event: "subscription_created",
      userId: user._id,
      subscriptionId: subscription._id,
      planType: subscription.planType,
    });
  }

  /**
   * Calculate subscription period end date
   */
  private calculatePeriodEnd(startDate: Date, billingCycle: string): Date {
    if (billingCycle === "yearly") {
      return new Date(
        startDate.getFullYear() + 1,
        startDate.getMonth(),
        startDate.getDate()
      );
    }

    return new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate()
    );
  }
}

export const paypalSubscriptionService = new PayPalSubscriptionService();
