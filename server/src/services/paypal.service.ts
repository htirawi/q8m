import paypal from "paypal-rest-sdk";
import { features } from "../config/appConfig.js";
import { Purchase } from "../models/Purchase.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { currencyService } from "./currency.service.js";
import { logPaymentEvent } from "../security/logging.js";
import * as crypto from "crypto";

export interface PayPalPaymentRequest {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  userId: string;
  userEmail: string;
  userName: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalPaymentResponse {
  paymentId: string;
  approvalUrl: string;
  orderId: string;
}

export interface PayPalWebhookData {
  event_type: string;
  resource: unknown;
  id: string;
  create_time: string;
  event_version: string;
}

export class PayPalService {
  private static instance: PayPalService;
  private isConfigured: boolean = false;
  private hasLoggedWarning: boolean = false;

  private constructor() {
    this.configurePayPal();
  }

  static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  private configurePayPal(): void {
    if (!features.paypal) {
      if (!this.hasLoggedWarning) {
        console.warn("PayPal credentials not configured");
        this.hasLoggedWarning = true;
      }
      return;
    }

    paypal.configure({
      mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
      client_id: process.env.PAYPAL_CLIENT_ID!,
      client_secret: process.env.PAYPAL_CLIENT_SECRET!,
    });

    this.isConfigured = true;
  }

  /**
   * Create PayPal payment
   */
  async createPayment(
    request: PayPalPaymentRequest
  ): Promise<PayPalPaymentResponse | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      // Convert currency if needed
      let finalAmount = request.amount;
      let finalCurrency = request.currency;

      if (request.currency !== "USD") {
        const conversion = await currencyService.convertToUSD(
          request.amount,
          request.currency as "JOD" | "SAR"
        );
        finalAmount = conversion.convertedAmount;
        finalCurrency = "USD";
      }

      const paymentRequest = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
        },
        transactions: [
          {
            amount: {
              total: finalAmount.toFixed(2),
              currency: finalCurrency,
            },
            description: `Quiz Platform - ${request.planType} Plan`,
            item_list: {
              items: [
                {
                  name: `${request.planType} Plan`,
                  sku: request.planType,
                  price: finalAmount.toFixed(2),
                  currency: finalCurrency,
                  quantity: 1,
                },
              ],
            },
            custom: JSON.stringify({
              userId: request.userId,
              planType: request.planType,
              originalCurrency: request.currency,
              originalAmount: request.amount,
            }),
          },
        ],
      };

      return new Promise((resolve, reject) => {
        paypal.payment.create(paymentRequest, async (error: unknown, payment: unknown) => {
          if (error) {
            console.error("PayPal payment creation error:", error);
            reject(new Error(`PayPal payment creation failed: ${(error as any).message}`));
            return;
          }

          if (!payment || !(payment as any).id) {
            reject(new Error("Invalid PayPal payment response"));
            return;
          }

          try {
            // Create purchase record
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const purchase = new Purchase({
              userId: request.userId,
              orderId,
              paymentId: (payment as any).id,
              paymentGateway: "paypal",
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
              metadata: {
                originalCurrency: request.currency,
                originalAmount: request.amount.toString(),
                exchangeRate:
                  request.currency !== "USD"
                    ? (finalAmount / request.amount).toString()
                    : undefined,
              },
            });

            await purchase.save();

            // Find approval URL
            const approvalUrl = (payment as any).links?.find(
              (link: any) => link.rel === "approval_url"
            )?.href;

            if (!approvalUrl) {
              throw new Error("PayPal approval URL not found");
            }

            resolve({
              paymentId: (payment as any).id,
              approvalUrl,
              orderId,
            });
          } catch (dbError) {
            console.error("Database error during PayPal payment creation:", dbError);
            reject(new Error("Failed to save payment record"));
          }
        });
      });
    } catch (error) {
      console.error("PayPal payment creation error:", error);
      throw error;
    }
  }

  /**
   * Execute PayPal payment
   */
  async executePayment(
    paymentId: string,
    payerId: string
  ): Promise<
    | { success: boolean; purchaseId?: string; error?: string }
    | { ok: false; code: "NOT_CONFIGURED" }
  > {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      // Find the purchase record
      const purchase = await Purchase.findByPaymentId(paymentId);
      if (!purchase) {
        throw new Error("Purchase record not found");
      }

      const executeRequest = {
        payer_id: payerId,
      };

      return new Promise((resolve) => {
        paypal.payment.execute(
          paymentId,
          executeRequest,
          async (error: unknown, payment: unknown) => {
            if (error) {
              console.error("PayPal payment execution error:", error);
              await purchase.markAsFailed(`Execution failed: ${(error as any).message}`);
              resolve({ success: false, error: (error as any).message });
              return;
            }

            try {
              // Check if payment was successful
              if ((payment as any).state !== "approved") {
                await purchase.markAsFailed(`Payment state: ${(payment as any).state}`);
                resolve({
                  success: false,
                  error: `Payment not approved. State: ${(payment as any).state}`,
                });
                return;
              }

              // Mark purchase as completed
              purchase.gatewayResponse = payment;
              await purchase.markAsCompleted(payment);

              // Create subscription
              await this.createSubscription(purchase);

              resolve({ success: true, purchaseId: purchase._id.toString() });
            } catch (dbError) {
              console.error("Database error during PayPal payment execution:", dbError);
              resolve({ success: false, error: "Failed to process payment completion" });
            }
          }
        );
      });
    } catch (error) {
      console.error("PayPal payment execution error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Create subscription after successful payment
   */
  private async createSubscription(purchase: unknown): Promise<void> {
    try {
      const user = await User.findById((purchase as any).userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Determine billing cycle (default to monthly for now)
      const billingCycle = "monthly";
      const now = new Date();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      // Create subscription
      const subscription = new Subscription({
        userId: (purchase as any).userId,
        purchaseId: (purchase as any)._id,
        planType: (purchase as any).items[0].type,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        billingCycle,
        price: (purchase as any).amount,
        metadata: {
          originalPurchaseCurrency: (purchase as any).metadata?.originalCurrency,
          fxRateUsed: (purchase as any).metadata?.exchangeRate
            ? parseFloat((purchase as any).metadata.exchangeRate)
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
   * Handle PayPal webhook
   */
  async handleWebhook(
    webhookData: PayPalWebhookData,
    signature: string
  ): Promise<{ success: boolean; error?: string } | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    try {
      // Verify webhook signature (implement based on PayPal's webhook verification)
      const isValidSignature = await this.verifyWebhookSignature(webhookData, signature);
      if (!isValidSignature) {
        return { success: false, error: "Invalid webhook signature" };
      }

      // Handle different webhook event types
      switch (webhookData.event_type) {
        case "PAYMENT.SALE.COMPLETED":
          await this.handlePaymentCompleted(webhookData.resource);
          break;
        case "PAYMENT.SALE.DENIED":
          await this.handlePaymentDenied(webhookData.resource);
          break;
        case "PAYMENT.SALE.REFUNDED":
          await this.handlePaymentRefunded(webhookData.resource);
          break;
        default:
          logPaymentEvent(console, "paypal_webhook_unhandled", {
            eventType: webhookData.event_type,
            service: "paypal",
          });
      }

      return { success: true };
    } catch (error) {
      console.error("PayPal webhook handling error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhookSignature(
    webhookData: PayPalWebhookData,
    signature: string
  ): Promise<boolean> {
    // Implement PayPal webhook signature verification
    // This is a simplified version - implement proper verification based on PayPal's documentation
    try {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.PAYPAL_WEBHOOK_SECRET || "")
        .update(JSON.stringify(webhookData))
        .digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  /**
   * Handle payment completed webhook
   */
  private async handlePaymentCompleted(resource: unknown): Promise<void> {
    try {
      const paymentId = (resource as any).parent_payment;
      const purchase = await Purchase.findByPaymentId(paymentId);

      if (purchase && purchase.status === "pending") {
        await purchase.markAsCompleted(resource);
        await this.createSubscription(purchase);
      }
    } catch (error) {
      console.error("Error handling payment completed webhook:", error);
    }
  }

  /**
   * Handle payment denied webhook
   */
  private async handlePaymentDenied(resource: unknown): Promise<void> {
    try {
      const paymentId = (resource as any).parent_payment;
      const purchase = await Purchase.findByPaymentId(paymentId);

      if (purchase && purchase.status === "pending") {
        await purchase.markAsFailed("Payment denied by PayPal");
      }
    } catch (error) {
      console.error("Error handling payment denied webhook:", error);
    }
  }

  /**
   * Handle payment refunded webhook
   */
  private async handlePaymentRefunded(resource: unknown): Promise<void> {
    try {
      const paymentId = (resource as any).parent_payment;
      const purchase = await Purchase.findByPaymentId(paymentId);

      if (purchase) {
        await purchase.processRefund(
          (resource as any).amount.total,
          (resource as any).amount.currency,
          "requested_by_customer",
          (resource as any).id
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
   * Get payment details
   */
  async getPaymentDetails(
    paymentId: string
  ): Promise<unknown | { ok: false; code: "NOT_CONFIGURED" }> {
    if (!this.isConfigured) {
      return { ok: false, code: "NOT_CONFIGURED" };
    }

    return new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error: unknown, payment: unknown) => {
        if (error) {
          reject(new Error(`Failed to get payment details: ${(error as any).message}`));
          return;
        }
        resolve(payment);
      });
    });
  }

  /**
   * Check if PayPal service is configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get PayPal configuration status
   */
  getConfigurationStatus(): {
    configured: boolean;
    mode: string;
    clientId: string | null;
  } {
    return {
      configured: this.isConfigured,
      mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
      clientId: this.isConfigured ? process.env.PAYPAL_CLIENT_ID || null : null,
    };
  }
}

// Export singleton instance
export const paypalService = PayPalService.getInstance();
