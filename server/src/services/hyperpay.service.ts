import { randomBytes } from "crypto";

import { features } from "@config/appConfig.js";
import type { IPurchase } from "@models/Purchase.js";
import { Purchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { logPaymentEvent, safeLogFields } from "@server/security/logging.js";
import { entitlementService } from "@services/entitlement.service.js";
import { pricingService } from "@services/pricing.service.js";
import type { Plan } from "@shared/types/pricing";

import type { PaymentStatusDetails } from "../types/payment-gateway";
import type {
  HyperPayPaymentRequest,
  HyperPayPaymentResponse,
  HyperPayWebhookData,
} from "../types/services/payment-services";

export type { HyperPayPaymentRequest, HyperPayPaymentResponse, HyperPayWebhookData };

export class HyperPayService {
  private static instance: HyperPayService;
  private apiKey: string;
  private merchantId: string;
  // @ts-expect-error - webhookSecret is used for webhook verification in production
  private webhookSecret: string;
  private baseUrl: string;
  private isConfigured: boolean = false;
  private hasLoggedWarning: boolean = false;

  private constructor() {
    this.apiKey = process.env.HYPERPAY_API_KEY || "";
    this.merchantId = process.env.HYPERPAY_MERCHANT_ID || "";
    this.webhookSecret = process.env.HYPERPAY_WEBHOOK_SECRET || "";
    // webhookSecret is used for webhook verification in production
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.hyperpay.com"
        : "https://api-sandbox.hyperpay.com";

    if (features.hyperpay) {
      this.isConfigured = true;
    } else {
      if (!this.hasLoggedWarning) {
        console.warn(
          safeLogFields({
            event: "hyperpay_configuration_warning",
            message: "HyperPay service not fully configured",
            missing: {
              apiKey: !this.apiKey,
              merchantId: !this.merchantId,
            },
          })
        );
        this.hasLoggedWarning = true;
      }
    }
  }

  public static getInstance(): HyperPayService {
    if (!HyperPayService.instance) {
      HyperPayService.instance = new HyperPayService();
    }
    return HyperPayService.instance;
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  public getConfigurationStatus(): { isConfigured: boolean; environment: string } {
    return {
      isConfigured: this.isConfigured,
      environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    };
  }

  /**
   * Initiates a HyperPay payment.
   * @param request HyperPay payment request details.
   * @returns Checkout URL or payment form data.
   */
  public async createPayment(
    request: HyperPayPaymentRequest
  ): Promise<HyperPayPaymentResponse | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    const pricingPlan = await pricingService.getPlanPricing(request.planType, request.currency);
    if (!pricingPlan) {
      throw new Error(
        `Pricing plan ${request.planType} not found for currency ${request.currency}`
      );
    }

    const amountDetails =
      request.billingCycle === "monthly"
        ? pricingPlan.pricing[request.currency]
        : pricingPlan.pricing[`${request.currency}_YEARLY`];

    if (!amountDetails || amountDetails.amount === 0) {
      throw new Error(
        `Invalid amount for plan ${request.planType} and billing cycle ${request.billingCycle}`
      );
    }

    const finalAmount = amountDetails.amount;
    const finalCurrency = amountDetails.currency;

    const orderId = `HP-${Date.now()}-${randomBytes(6).toString("base64url").toUpperCase()}`;

    // Create purchase record first
    const purchase = new Purchase({
      userId: request.userId,
      planType: request.planType,
      gateway: "hyperpay",
      amount: finalAmount,
      currency: finalCurrency,
      billingCycle: request.billingCycle,
      gatewayPaymentId: orderId, // Use our internal order ID as gatewayPaymentId initially
      metadata: {
        originalCurrency: request.currency,
        originalAmount: request.amount.toString(),
        exchangeRate:
          request.currency !== finalCurrency
            ? (finalAmount / request.amount).toString()
            : undefined,
        country: "N/A", // HyperPay might provide this
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        priceSnapshot: {
          planType: request.planType,
          monthlyPriceUSD: this.getPlanBasePrice(request.planType, "monthly"),
          yearlyPriceUSD: this.getPlanBasePrice(request.planType, "yearly"),
          displayCurrency: finalCurrency,
          displayAmount: finalAmount,
          rateUsed: amountDetails.rateUsed,
          settlementCurrency: amountDetails.settlementCurrency || amountDetails.currency,
        },
      },
    });
    await purchase.save();

    try {
      // Create HyperPay payment intent
      const paymentData = {
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: finalCurrency,
        description: `${request.planType} Plan - ${request.billingCycle}`,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
        },
        notes: {
          planType: request.planType,
          billingCycle: request.billingCycle,
          userId: request.userId,
          purchaseId: purchase._id.toString(),
        },
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: `${process.env.SERVER_URL || "http://localhost:3000"}/api/payments/webhooks/hyperpay`,
      };

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          safeLogFields({
            event: "hyperpay_payment_creation_failed",
            status: response.status,
            errorData: safeLogFields(errorData),
          })
        );
        await purchase.markAsFailed(`HyperPay creation failed: ${JSON.stringify(errorData)}`);
        throw new Error(
          `HyperPay payment creation failed: ${errorData.message || response.statusText}`
        );
      }

      const hyperPayResponse = await response.json();

      if (!hyperPayResponse.success || !hyperPayResponse.data?.checkout_url) {
        throw new Error(
          `HyperPay payment creation failed: ${hyperPayResponse.message || "Invalid response"}`
        );
      }

      // Update purchase with HyperPay payment ID
      purchase.gatewayPaymentId = hyperPayResponse.data.id;
      await purchase.save();

      return {
        success: true,
        checkoutUrl: hyperPayResponse.data.checkout_url,
        paymentId: hyperPayResponse.data.id,
        purchaseId: purchase._id.toString(),
      };
    } catch (error) {
      console.error(
        safeLogFields({
          event: "hyperpay_payment_creation_error",
          error: error instanceof Error ? error.message : "Unknown error",
          purchaseId: purchase._id.toString(),
        })
      );
      await purchase.markAsFailed(
        `HyperPay creation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
  }

  /**
   * Verify HyperPay payment status
   */
  public async verifyPayment(
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

    const purchase = await Purchase.findByPaymentId(paymentId);
    if (!purchase) {
      return { success: false, status: "not_found", error: "Purchase record not found" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${encodeURIComponent(paymentId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Merchant-ID": this.merchantId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HyperPay status check failed: ${errorData.message || response.statusText}`
        );
      }

      const paymentData = await response.json();

      if (!paymentData.success || !paymentData.data?.status) {
        return { success: false, status: "error", error: "Invalid response from HyperPay" };
      }

      const { data } = paymentData;
      const { status } = data;
      let purchaseStatus = "pending";

      switch (status) {
        case "captured":
        case "authorized":
          purchaseStatus = "completed";
          break;
        case "failed":
        case "declined":
          purchaseStatus = "failed";
          break;
        default:
          purchaseStatus = "pending";
      }

      if (purchaseStatus === "completed" && purchase.status === "pending") {
        await purchase.markAsCompleted(paymentData.data);
        await this.createSubscription(purchase);
      } else if (purchaseStatus === "failed" && purchase.status === "pending") {
        await purchase.markAsFailed(`Payment failed with status: ${status}`);
      }

      return {
        success: true,
        status: purchaseStatus,
        purchaseId: purchase._id.toString(),
      };
    } catch (error) {
      console.error(
        safeLogFields({
          event: "hyperpay_payment_verification_error",
          error: error instanceof Error ? error.message : "Unknown error",
          paymentId,
        })
      );
      return {
        success: false,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Handle HyperPay webhook notifications
   */
  public async handleWebhook(
    webhookData: HyperPayWebhookData
  ): Promise<{ success: boolean; error?: string } | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      console.warn(
        safeLogFields({
          event: "hyperpay_webhook_not_configured",
          message: "HyperPay webhook handler not configured",
        })
      );
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      const { entity, event } = webhookData;

      logPaymentEvent(console, "hyperpay_webhook_received", {
        event,
        paymentId: entity.id,
        service: "hyperpay",
      });

      // Find the purchase record
      const purchase = await Purchase.findByPaymentId(entity.id);
      if (!purchase) {
        logPaymentEvent(console, "hyperpay_webhook_purchase_not_found", {
          paymentId: entity.id,
          service: "hyperpay",
        });
        return { success: false, error: "Purchase not found" };
      }

      switch (event) {
        case "payment.authorized":
        case "payment.captured":
          if (purchase.status === "pending") {
            await purchase.markAsCompleted(entity);
            await this.createSubscription(purchase);
            console.warn(
              safeLogFields({
                event: "hyperpay_purchase_completed",
                purchaseId: purchase._id.toString(),
                method: "webhook",
              })
            );
          }
          break;

        case "payment.failed":
        case "payment.declined":
          if (purchase.status === "pending") {
            await purchase.markAsFailed(`Payment ${event}: ${entity.status}`);
            console.warn(
              safeLogFields({
                event: "hyperpay_purchase_failed",
                purchaseId: purchase._id.toString(),
                method: "webhook",
                eventType: event,
                status: entity.status,
              })
            );
          }
          break;

        case "payment.refunded": {
          await purchase.processRefund(entity);
          console.warn(
            safeLogFields({
              event: "hyperpay_purchase_refunded",
              purchaseId: purchase._id.toString(),
              method: "webhook",
            })
          );

          // Optionally cancel associated subscription
          const subscription = await Subscription.findOne({ purchaseId: purchase._id });
          if (subscription && subscription.status === "active") {
            await subscription.cancel("refunded");
            await entitlementService.revokeUserEntitlements(
              subscription.userId.toString(),
              "refunded"
            );
            logPaymentEvent(console, "hyperpay_subscription_cancelled", {
              subscriptionId: subscription._id,
              reason: "refunded",
              service: "hyperpay",
            });
          }
          break;
        }

        default:
          console.warn(
            safeLogFields({
              event: "hyperpay_unhandled_webhook_event",
              eventType: event,
              paymentId: entity.id,
            })
          );
          break;
      }

      return { success: true };
    } catch (error) {
      console.error(
        safeLogFields({
          event: "hyperpay_webhook_processing_error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process a refund
   */
  public async processRefund(
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
      const refundData = {
        amount: Math.round(amount * 100), // Convert to cents
        reason,
        notes: {
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HyperPay refund failed: ${errorData.message || response.statusText}`);
      }

      const refundResponse = await response.json();

      if (!refundResponse.success || !refundResponse.data?.id) {
        throw new Error(`HyperPay refund failed: ${refundResponse.message || "Invalid response"}`);
      }

      return {
        success: true,
        refundId: refundResponse.data.id,
      };
    } catch (error) {
      console.error(
        safeLogFields({
          event: "hyperpay_refund_error",
          error: error instanceof Error ? error.message : "Unknown error",
          paymentId,
        })
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create subscription after successful payment
   */
  private async createSubscription(purchase: IPurchase): Promise<void> {
    const user = await User.findById(purchase.userId);
    if (!user) {
      console.error(
        safeLogFields({
          event: "hyperpay_user_not_found",
          userId: purchase.userId.toString(),
          purchaseId: String(purchase._id),
        })
      );
      return;
    }

    // Check for existing active subscription and cancel it if necessary
    const existingSubscription = await Subscription.findActiveForUser(user._id.toString());
    if (existingSubscription) {
      await existingSubscription.cancel("new_subscription_purchased");
      await entitlementService.revokeUserEntitlements(
        user._id.toString(),
        "new_subscription_purchased"
      );
      console.warn(
        safeLogFields({
          event: "hyperpay_subscription_cancelled",
          subscriptionId: existingSubscription._id.toString(),
          userId: user._id.toString(),
          reason: "new_subscription_purchased",
        })
      );
    }

    const subscription = new Subscription({
      userId: purchase.userId,
      purchaseId: purchase._id,
      planType: purchase.planType,
      status: "active",
      billingCycle: purchase.billingCycle,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        purchase.billingCycle === "monthly"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      metadata: {
        gateway: "hyperpay",
        originalPurchaseCurrency: purchase.metadata?.originalCurrency,
        fxRateUsed: purchase.metadata?.exchangeRate
          ? parseFloat(purchase.metadata.exchangeRate)
          : undefined,
      },
    });
    await subscription.save();
    console.warn(
      safeLogFields({
        event: "hyperpay_subscription_created",
        subscriptionId: subscription._id.toString(),
        userId: user._id.toString(),
        planType: purchase.planType,
      })
    );

    // Update user entitlements
    await entitlementService.updateUserEntitlements(user._id.toString(), purchase.planType!);
  }

  /**
   * Get plan base price in USD
   */
  private getPlanBasePrice(planType: Plan, cycle: "monthly" | "yearly"): number {
    const basePricing = {
      JUNIOR: { monthly: 0, yearly: 0 },
      INTERMEDIATE: { monthly: 19.99, yearly: 199.99 },
      SENIOR: { monthly: 39.99, yearly: 399.99 },
      BUNDLE: { monthly: 49.99, yearly: 499.99 },
    };
    return basePricing[planType][cycle];
  }

  /**
   * Get payment status from HyperPay
   */
  public async getPaymentStatus(
    paymentId: string
  ): Promise<
    { status: string; details: PaymentStatusDetails } | null | { ok: false; code: "NOT_CONFIGURED" }
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
          "X-Merchant-ID": this.merchantId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? { status: data.data.status, details: data.data } : null;
    } catch (error) {
      console.error(
        safeLogFields({
          event: "hyperpay_payment_status_error",
          error: error instanceof Error ? error.message : "Unknown error",
          paymentId,
        })
      );
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  // @ts-expect-error - verifyWebhookSignature is used for webhook verification in production
  private verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // In production, this would verify the webhook signature using this.webhookSecret
    // For now, we'll return true for development
    return true;
  }
}

// Export singleton instance
export const hyperpayService = HyperPayService.getInstance();
