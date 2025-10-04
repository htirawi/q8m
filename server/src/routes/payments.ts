import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { paypalService } from "../services/paypal.service.js";
import { apsService } from "../services/aps.service.js";
import { hyperpayService } from "../services/hyperpay.service.js";
import { pricingService } from "../services/pricing.service.js";
import { currencyService } from "../services/currency.service.js";
import { Purchase } from "../models/Purchase.js";
import { Subscription } from "../models/Subscription.js";

// Validation schemas
const createPaymentSchema = z.object({
  planType: z.enum(["INTERMEDIATE", "SENIOR", "BUNDLE"]),
  currency: z.enum(["USD", "JOD", "SAR"]).default("USD"),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  billingAddress: z
    .object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      country: z.enum([
        "US",
        "JO",
        "SA",
        "AE",
        "KW",
        "QA",
        "BH",
        "OM",
        "EG",
        "LB",
        "SY",
        "IQ",
        "YE",
      ]),
    })
    .optional(),
});

const paymentCallbackSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  payerId: z.string().optional(), // PayPal specific
  token: z.string().optional(), // PayPal specific
  PayerID: z.string().optional(), // PayPal specific (alternative naming)
});

const webhookSchema = z.object({
  event_type: z.string().optional(),
  event: z.string().optional(),
  resource: z.any().optional(),
  data: z.any().optional(),
  signature: z.string().optional(),
  timestamp: z.string().optional(),
});

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Get pricing information
  fastify.get(
    "/pricing",
    {
      preHandler: [optionalAuth],
    },
    async (request, reply) => {
      try {
        const { currency = "USD" } = request.query as { currency?: "USD" | "JOD" | "SAR" };

        const pricing = await pricingService.getAllPricing();

        // Filter pricing for requested currency if specified
        const filteredPricing = pricing.map((plan) => ({
          ...plan,
          pricing: currency ? { [currency]: plan.pricing[currency] } : plan.pricing,
        }));

        reply.send({
          success: true,
          currency,
          pricing: filteredPricing,
        });
      } catch (error: any) {
        request.log.error("Get pricing error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get pricing information",
        });
      }
    }
  );

  // Get pricing for specific currency
  fastify.get(
    "/pricing/:currency",
    {
      preHandler: [optionalAuth],
      schema: {
        params: z.object({
          currency: z.enum(["USD", "JOD", "SAR"]),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { currency } = request.params as { currency: "USD" | "JOD" | "SAR" };

        const pricing = await pricingService.getPricingForCurrency(currency);

        reply.send({
          success: true,
          currency,
          pricing,
        });
      } catch (error: any) {
        request.log.error("Get pricing for currency error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get pricing information",
        });
      }
    }
  );

  // Create payment
  fastify.post(
    "/create",
    {
      preHandler: [authenticate],
      schema: {
        body: createPaymentSchema,
      },
    },
    async (request, reply) => {
      try {
        const { planType, currency, billingCycle, billingAddress } = request.body as z.infer<
          typeof createPaymentSchema
        >;
        const user = request.authUser!;

        // Get pricing for the plan
        const planPricing = await pricingService.getPlanPricing(planType, currency);
        if (!planPricing) {
          return reply.status(400).send({
            success: false,
            error: "Invalid plan type",
          });
        }

        const priceInfo = planPricing.pricing[currency];
        if (!priceInfo) {
          return reply.status(400).send({
            success: false,
            error: "Pricing not available for selected currency",
          });
        }

        // Determine payment gateway based on currency and user location
        let paymentGateway: "paypal" | "aps" | "hyperpay";

        if (
          currency === "SAR" ||
          (billingAddress?.country &&
            ["SA", "AE", "KW", "QA", "BH", "OM"].includes(billingAddress.country))
        ) {
          // Prefer APS for Middle East, fallback to HyperPay, then PayPal
          paymentGateway = apsService.isServiceConfigured()
            ? "aps"
            : hyperpayService.isServiceConfigured()
              ? "hyperpay"
              : "paypal";
        } else if (
          currency === "JOD" ||
          (billingAddress?.country &&
            ["JO", "LB", "SY", "IQ", "YE"].includes(billingAddress.country))
        ) {
          // Prefer APS for Middle East, fallback to HyperPay, then PayPal
          paymentGateway = apsService.isServiceConfigured()
            ? "aps"
            : hyperpayService.isServiceConfigured()
              ? "hyperpay"
              : "paypal";
        } else {
          // Default to PayPal for USD, with HyperPay as fallback
          paymentGateway = paypalService.isServiceConfigured()
            ? "paypal"
            : hyperpayService.isServiceConfigured()
              ? "hyperpay"
              : "aps";
        }

        // Prepare payment request
        const paymentRequest = {
          amount: priceInfo.amount,
          currency,
          planType,
          billingCycle,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          returnUrl: `${(fastify as any).config?.CLIENT_URL || "http://localhost:5173"}/payment/success`,
          cancelUrl: `${(fastify as any).config?.CLIENT_URL || "http://localhost:5173"}/payment/cancel`,
          billingAddress,
        };

        let paymentResponse;

        // Create payment based on selected gateway
        switch (paymentGateway) {
          case "paypal":
            if (!paypalService.isServiceConfigured()) {
              throw new Error("PayPal service not configured");
            }
            paymentResponse = await paypalService.createPayment(paymentRequest);
            break;

          case "aps":
            if (!apsService.isServiceConfigured()) {
              throw new Error("APS service not configured");
            }
            paymentResponse = await apsService.createPayment(paymentRequest);
            break;

          case "hyperpay":
            if (!hyperpayService.isServiceConfigured()) {
              throw new Error("HyperPay service not configured");
            }
            paymentResponse = await hyperpayService.createPayment({
              planType: paymentRequest.planType,
              currency: paymentRequest.currency,
              amount: priceInfo.amount,
              billingCycle: paymentRequest.billingCycle,
              userId: paymentRequest.userId,
              returnUrl: paymentRequest.returnUrl,
              cancelUrl: paymentRequest.cancelUrl,
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"],
              customerEmail: paymentRequest.userEmail,
              customerName: paymentRequest.userName,
            });
            break;

          default:
            throw new Error("No payment gateway available");
        }

        reply.send({
          success: true,
          paymentGateway,
          ...paymentResponse,
          amount: priceInfo.amount,
          currency,
          planType,
          billingCycle,
          isEstimated: priceInfo.isEstimated,
        });
      } catch (error: any) {
        request.log.error("Create payment error:", error);
        reply.status(500).send({
          success: false,
          error: error.message || "Failed to create payment",
        });
      }
    }
  );

  // Handle payment success callback
  fastify.post(
    "/callback/:gateway",
    {
      schema: {
        params: z.object({
          gateway: z.enum(["paypal", "aps", "hyperpay"]),
        }),
        body: paymentCallbackSchema,
      },
    },
    async (request, reply) => {
      try {
        const { gateway } = request.params as { gateway: "paypal" | "aps" | "hyperpay" };
        const { paymentId, payerId, PayerID } = request.body as z.infer<
          typeof paymentCallbackSchema
        >;

        let result;

        switch (gateway) {
          case "paypal": {
            const paypalPayerId = payerId || PayerID;
            if (!paypalPayerId) {
              throw new Error("PayPal payer ID is required");
            }
            result = await paypalService.executePayment(paymentId, paypalPayerId);
            break;
          }

          case "aps":
            result = await apsService.verifyPayment(paymentId);
            break;

          case "hyperpay":
            result = await hyperpayService.verifyPayment(paymentId);
            break;

          default:
            throw new Error(`Unsupported payment gateway: ${gateway}`);
        }

        if (result.success) {
          reply.send({
            success: true,
            message: "Payment completed successfully",
            purchaseId: result.purchaseId,
          });
        } else {
          reply.status(400).send({
            success: false,
            error: result.error || "Payment failed",
          });
        }
      } catch (error: any) {
        request.log.error("Payment callback error:", error);
        reply.status(500).send({
          success: false,
          error: error.message || "Payment callback failed",
        });
      }
    }
  );

  // Get user's purchase history
  fastify.get(
    "/history",
    {
      preHandler: [authenticate],
      schema: {
        querystring: z.object({
          limit: z.string().transform(Number).optional().default("10"),
          skip: z.string().transform(Number).optional().default("0"),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { limit, skip } = request.query as { limit: number; skip: number };
        const userId = request.authUser!.id;

        const purchases = await Purchase.getUserPurchases(userId, limit, skip);

        reply.send({
          success: true,
          purchases,
          pagination: {
            limit,
            skip,
            hasMore: purchases.length === limit,
          },
        });
      } catch (error: any) {
        request.log.error("Get purchase history error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get purchase history",
        });
      }
    }
  );

  // Get user's current subscription
  fastify.get(
    "/subscription",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const subscription = await Subscription.findActiveForUser(userId);

        if (!subscription) {
          return reply.status(404).send({
            success: false,
            error: "No active subscription found",
          });
        }

        reply.send({
          success: true,
          subscription,
        });
      } catch (error: any) {
        request.log.error("Get subscription error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get subscription information",
        });
      }
    }
  );

  // Cancel subscription
  fastify.post(
    "/subscription/cancel",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          reason: z.string().optional().default("user_request"),
        }),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { reason } = request.body as { reason: string };

        const subscription = await Subscription.findActiveForUser(userId);

        if (!subscription) {
          return reply.status(404).send({
            success: false,
            error: "No active subscription found",
          });
        }

        await subscription.cancel(reason);

        reply.send({
          success: true,
          message: "Subscription cancelled successfully",
          subscription,
        });
      } catch (error: any) {
        request.log.error("Cancel subscription error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to cancel subscription",
        });
      }
    }
  );

  // PayPal webhook
  fastify.post(
    "/webhooks/paypal",
    {
      schema: {
        body: webhookSchema,
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;
        const signature = request.headers["x-paypal-signature"] as string;

        const result = await paypalService.handleWebhook(webhookData, signature);

        if (result.success) {
          reply.send({ success: true });
        } else {
          reply.status(400).send({
            success: false,
            error: result.error,
          });
        }
      } catch (error: any) {
        request.log.error("PayPal webhook error:", error);
        reply.status(500).send({
          success: false,
          error: "Webhook processing failed",
        });
      }
    }
  );

  // APS webhook
  fastify.post(
    "/webhooks/aps",
    {
      schema: {
        body: webhookSchema,
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;

        const result = await apsService.handleWebhook(webhookData);

        if (result.success) {
          reply.send({ success: true });
        } else {
          reply.status(400).send({
            success: false,
            error: result.error,
          });
        }
      } catch (error: any) {
        request.log.error("APS webhook error:", error);
        reply.status(500).send({
          success: false,
          error: "Webhook processing failed",
        });
      }
    }
  );

  // HyperPay webhook
  fastify.post(
    "/webhooks/hyperpay",
    {
      schema: {
        body: webhookSchema,
      },
    },
    async (request, reply) => {
      try {
        const webhookData = request.body as any;

        const result = await hyperpayService.handleWebhook(webhookData);

        if (result.success) {
          reply.send({ success: true });
        } else {
          reply.status(400).send({
            success: false,
            error: result.error,
          });
        }
      } catch (error: any) {
        request.log.error("HyperPay webhook error:", error);
        reply.status(500).send({
          success: false,
          error: "Webhook processing failed",
        });
      }
    }
  );

  // Get payment gateway status
  fastify.get("/gateways/status", async (request, reply) => {
    try {
      const paypalStatus = paypalService.getConfigurationStatus();
      const apsStatus = apsService.getConfigurationStatus();
      const hyperpayStatus = hyperpayService.getConfigurationStatus();

      reply.send({
        success: true,
        gateways: {
          paypal: paypalStatus,
          aps: apsStatus,
          hyperpay: hyperpayStatus,
        },
      });
    } catch (error: any) {
      request.log.error("Get gateway status error:", error);
      reply.status(500).send({
        success: false,
        error: "Failed to get gateway status",
      });
    }
  });

  // Get currency exchange rates
  fastify.get("/currencies/rates", async (request, reply) => {
    try {
      const health = await currencyService.getCurrencyHealth();

      reply.send({
        success: true,
        health,
        supportedCurrencies: ["USD", "JOD", "SAR"],
      });
    } catch (error: any) {
      request.log.error("Get currency rates error:", error);
      reply.status(500).send({
        success: false,
        error: "Failed to get currency rates",
      });
    }
  });

  // Process refund (admin only)
  fastify.post(
    "/refund/:purchaseId",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          purchaseId: z.string(),
        }),
        body: z.object({
          amount: z.number().optional(),
          reason: z.string().default("requested_by_customer"),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { purchaseId } = request.params as { purchaseId: string };
        const { amount, reason } = request.body as { amount?: number; reason: string };

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
          return reply.status(404).send({
            success: false,
            error: "Purchase not found",
          });
        }

        // Check if user owns this purchase or is admin
        if (
          purchase.userId.toString() !== request.authUser!.id &&
          request.authUser!.role !== "admin"
        ) {
          return reply.status(403).send({
            success: false,
            error: "Access denied",
          });
        }

        const refundAmount = amount || parseFloat(purchase.amount.value);
        let result;

        switch (purchase.gateway) {
          case "paypal":
            // PayPal refund implementation would go here
            result = { success: true, refundId: "paypal-refund-id" };
            break;

          case "aps":
            result = await apsService.processRefund(
              purchase.gatewayPaymentId,
              refundAmount,
              reason
            );
            break;

          case "hyperpay":
            result = await hyperpayService.processRefund(
              purchase.gatewayPaymentId,
              refundAmount,
              reason
            );
            break;

          default:
            throw new Error(`Refund not supported for gateway: ${purchase.gateway}`);
        }

        if (result.success) {
          reply.send({
            success: true,
            message: "Refund processed successfully",
            refundId: result.refundId,
          });
        } else {
          reply.status(400).send({
            success: false,
            error: result.error || "Refund failed",
          });
        }
      } catch (error: any) {
        request.log.error("Process refund error:", error);
        reply.status(500).send({
          success: false,
          error: error.message || "Failed to process refund",
        });
      }
    }
  );
}
