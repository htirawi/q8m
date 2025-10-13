import * as crypto from "crypto";

import { features } from "@config/appConfig.js";
import { Purchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { logPaymentEvent } from "@server/security/logging.js";
import { currencyService } from "@services/currency.service.js";
import type { ObjectId } from "mongoose";

import type {
  APSPaymentRequest,
  APSPaymentResponse,
  APSWebhookData,
} from "../types/services/payment-services";

export type { APSPaymentRequest, APSPaymentResponse, APSWebhookData };

export class APSService {
  private static instance: APSService;
  private isConfigured: boolean = false;
  private hasLoggedWarning: boolean = false;
  private baseUrl!: string;
  private apiKey!: string;
  private merchantId!: string;
  private webhookSecret!: string;

  private constructor() {
    this.configureAPS();
  }

  static getInstance(): APSService {
    if (!APSService.instance) {
      APSService.instance = new APSService();
    }
    return APSService.instance;
  }

  private configureAPS(): void {
    if (!features.aps) {
      if (!this.hasLoggedWarning) {
        console.warn("APS credentials not configured");
        this.hasLoggedWarning = true;
      }
      return;
    }

    this.apiKey = process.env.APS_ACCESS_KEY!;
    this.merchantId = process.env.APS_MERCHANT_IDENTIFIER!;
    this.webhookSecret = process.env.APS_WEBHOOK_SECRET || "";
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.aps.com.sa"
        : "https://api-sandbox.aps.com.sa";

    this.isConfigured = true;
  }

  /**
   * Create APS payment
   */
  async createPayment(
    request: APSPaymentRequest
  ): Promise<APSPaymentResponse | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      // Convert currency if needed (APS primarily works with SAR and JOD)
      let finalAmount = request.amount;
      let finalCurrency = request.currency;

      // APS prefers SAR for Saudi Arabia and JOD for Jordan
      if (request.currency === "USD") {
        // Convert USD to SAR by default, or JOD if billing address is Jordan
        const targetCurrency = request.billingAddress?.country === "JO" ? "JOD" : "SAR";
        const conversion = await currencyService.convertFromUSD(request.amount, targetCurrency);
        finalAmount = conversion.convertedAmount;
        finalCurrency = targetCurrency;
      }

      const orderId = `ORD-${Date.now()}-${crypto.randomBytes(6).toString("base64url").toUpperCase()}`;

      // Create purchase record first
      const purchase = new Purchase({
        userId: request.userId,
        orderId,
        paymentId: `APS-${orderId}`, // Temporary ID, will be updated with real payment ID
        paymentGateway: "aps",
        amount: {
          currency: finalCurrency,
          value: finalAmount.toFixed(2),
        },
        status: "pending",
        items: [
          {
            type: request.planType,
            name: `${request.planType} Plan`,
            price: {
              currency: finalCurrency,
              value: finalAmount.toFixed(2),
            },
          },
        ],
        customer: {
          email: request.userEmail,
          name: request.userName,
        },
        billingAddress: request.billingAddress,
        metadata: {
          originalCurrency: request.currency,
          originalAmount: request.amount.toString(),
          exchangeRate:
            request.currency !== finalCurrency
              ? (finalAmount / request.amount).toString()
              : undefined,
        },
      });

      await purchase.save();

      // Prepare APS payment request
      const paymentData = {
        merchant_id: this.merchantId,
        order_id: orderId,
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: finalCurrency,
        description: `Quiz Platform - ${request.planType} Plan`,
        customer_email: request.userEmail,
        customer_name: request.userName,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: `${process.env.API_BASE_URL}/api/payments/aps/webhook`,
        metadata: {
          user_id: request.userId,
          plan_type: request.planType,
          original_currency: request.currency,
          original_amount: request.amount,
        },
      };

      // Create payment with APS
      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "Quiz-Platform/1.0",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`APS payment creation failed: ${errorData.message || response.statusText}`);
      }

      const apsResponse = await response.json();

      if (!apsResponse.success || !apsResponse.data?.checkout_url) {
        throw new Error(
          `APS payment creation failed: ${apsResponse.message || "Invalid response"}`
        );
      }

      // Update purchase with real payment ID
      purchase.paymentId = apsResponse.data.id;
      await purchase.save();

      return {
        paymentId: apsResponse.data.id,
        checkoutUrl: apsResponse.data.checkout_url,
        orderId,
      };
    } catch (error) {
      console.error("APS payment creation error:", error);
      throw error;
    }
  }

  /**
   * Verify APS payment status
   */
  async verifyPayment(
    paymentId: string
  ): Promise<
    | { success: boolean; status: string; purchaseId?: string; error?: string }
    | { ok: false; code: "NOT_CONFIGURED" }
  > {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    // Validate paymentId to prevent SSRF
    if (!paymentId || !/^[a-zA-Z0-9_-]+$/.test(paymentId)) {
      throw new Error("Invalid payment ID format");
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${encodeURIComponent(paymentId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify payment: ${response.statusText}`);
      }

      const paymentData = await response.json();

      if (!paymentData.success) {
        throw new Error(`Payment verification failed: ${paymentData.message}`);
      }

      const purchase = await Purchase.findByPaymentId(paymentId);
      if (!purchase) {
        throw new Error("Purchase record not found");
      }

      // Update purchase status based on APS response
      switch (paymentData.data.status) {
        case "completed":
        case "captured":
          await purchase.markAsCompleted(paymentData.data);
          await this.createSubscription(purchase);
          return { success: true, status: "completed", purchaseId: purchase._id.toString() };

        case "failed":
        case "declined":
          await purchase.markAsFailed(`APS status: ${paymentData.data.status}`);
          return { success: false, status: "failed", error: "Payment failed" };

        case "pending":
        case "processing":
          return { success: true, status: "pending" };

        default:
          return {
            success: false,
            status: "unknown",
            error: `Unknown status: ${paymentData.data.status}`,
          };
      }
    } catch (error) {
      console.error("APS payment verification error:", error);
      return {
        success: false,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create subscription after successful payment
   */
  private async createSubscription(purchase: {
    userId: ObjectId;
    _id: ObjectId;
    items: Array<{ type: string }>;
    amount: number;
    metadata?: { originalCurrency?: string; exchangeRate?: string };
  }): Promise<void> {
    try {
      const user = await User.findById((purchase.userId as ObjectId).toString());
      if (!user) {
        throw new Error("User not found");
      }

      // Determine billing cycle (default to monthly for now)
      const billingCycle = "monthly";
      const now = new Date();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      // Create subscription
      const subscription = new Subscription({
        userId: (purchase.userId as ObjectId).toString(),
        purchaseId: (purchase._id as ObjectId).toString(),
        planType: purchase.items[0]?.type || "INTERMEDIATE",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        billingCycle,
        price: purchase.amount,
        metadata: {
          originalPurchaseCurrency: purchase.metadata?.originalCurrency,
          fxRateUsed: purchase.metadata?.exchangeRate
            ? parseFloat(purchase.metadata.exchangeRate)
            : undefined,
        },
      });

      await subscription.save();

      // Update user entitlements
      user.entitlements = subscription.entitlements;
      await user.save();

      console.warn(`Subscription created for user ${user.email}: ${subscription.planType}`);
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  /**
   * Handle APS webhook
   */
  async handleWebhook(
    webhookData: APSWebhookData
  ): Promise<{ success: boolean; error?: string } | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      // Verify webhook signature
      const isValidSignature = this.verifyWebhookSignature(webhookData);
      if (!isValidSignature) {
        return { success: false, error: "Invalid webhook signature" };
      }

      // Handle different webhook event types
      switch (webhookData.event) {
        case "payment.completed":
          await this.handlePaymentCompleted(webhookData.data);
          break;
        case "payment.failed":
          await this.handlePaymentFailed(webhookData.data);
          break;
        case "payment.refunded":
          await this.handlePaymentRefunded(webhookData.data);
          break;
        default:
          logPaymentEvent(console, "aps_webhook_unhandled", {
            event: webhookData.event,
            service: "aps",
          });
      }

      return { success: true };
    } catch (error) {
      console.error("APS webhook handling error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(webhookData: APSWebhookData): boolean {
    try {
      const payload = JSON.stringify(webhookData.data);
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      return webhookData.signature === expectedSignature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  /**
   * Handle payment completed webhook
   */
  private async handlePaymentCompleted(data: { id: string }): Promise<void> {
    try {
      const purchase = await Purchase.findByPaymentId(data.id);

      if (purchase?.status === "pending") {
        await purchase.markAsCompleted(data);
        await this.createSubscription(purchase);
      }
    } catch (error) {
      console.error("Error handling payment completed webhook:", error);
    }
  }

  /**
   * Handle payment failed webhook
   */
  private async handlePaymentFailed(data: { id: string; status: string }): Promise<void> {
    try {
      const purchase = await Purchase.findByPaymentId(data.id);

      if (purchase?.status === "pending") {
        await purchase.markAsFailed(`APS status: ${data.status}`);
      }
    } catch (error) {
      console.error("Error handling payment failed webhook:", error);
    }
  }

  /**
   * Handle payment refunded webhook
   */
  private async handlePaymentRefunded(data: {
    id: string;
    amount: number;
    currency: string;
  }): Promise<void> {
    try {
      const purchase = await Purchase.findByPaymentId(data.id);

      if (purchase) {
        await purchase.processRefund(
          (data.amount / 100).toFixed(2), // Convert from cents
          data.currency,
          "requested_by_customer",
          data.id
        );

        // Cancel associated subscription
        const subscription = await Subscription.findOne({ purchaseId: purchase._id });
        if (subscription) {
          await subscription.cancel("payment_failed");
        }
      }
    } catch (error) {
      console.error("Error handling payment refunded webhook:", error);
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    amount: number,
    reason: string = "requested_by_customer"
  ): Promise<
    { success: boolean; refundId?: string; error?: string } | { ok: false; code: "NOT_CONFIGURED" }
  > {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      const purchase = await Purchase.findByPaymentId(paymentId);
      if (!purchase) {
        throw new Error("Purchase not found");
      }

      const refundData = {
        payment_id: paymentId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: purchase.amount.currency,
        reason,
      };

      const response = await fetch(`${this.baseUrl}/v1/refunds`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Refund failed: ${errorData.message || response.statusText}`);
      }

      const refundResponse = await response.json();

      if (!refundResponse.success) {
        throw new Error(`Refund failed: ${refundResponse.message}`);
      }

      // Update purchase record
      await purchase.processRefund(
        amount.toFixed(2),
        purchase.amount.currency,
        reason,
        refundResponse.data.id
      );

      return { success: true, refundId: refundResponse.data.id };
    } catch (error) {
      console.error("APS refund error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ["SAR", "JOD", "AED", "KWD", "QAR", "BHD", "OMR"];
  }

  /**
   * Check if APS service is configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get APS configuration status
   */
  getConfigurationStatus(): {
    configured: boolean;
    mode: string;
    merchantId: string | null;
    supportedCurrencies: string[];
  } {
    return {
      configured: this.isConfigured,
      mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
      merchantId: this.isConfigured ? this.merchantId : null,
      supportedCurrencies: this.getSupportedCurrencies(),
    };
  }
}

// Export singleton instance
export const apsService = APSService.getInstance();
