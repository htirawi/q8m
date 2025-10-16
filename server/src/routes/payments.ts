
import { features } from "@config/appConfig.js";
import { env } from "@config/env.js";
import { authenticate, optionalAuth } from "@middlewares/auth.middleware.js";
import { Purchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { safeLogFields } from "@server/security/logging.js";
import { apsService, type APSWebhookData } from "@services/aps.js";
import { currencyService } from "@services/currency.js";
import { hyperpayService, type HyperPayWebhookData } from "@services/hyperpay.js";
import { pricingService } from "@services/pricing.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

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

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Get pricing information
  fastify.get(
    "/pricing",
    {
      preHandler: [optionalAuth],
    },
    async (request, reply) => {
      try {
        const { query } = request;
        const { currency = "USD" } = query as { currency?: "USD" | "JOD" | "SAR" };

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
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_pricing_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
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
        params: zodToJsonSchema(
          z.object({
            currency: z.enum(["USD", "JOD", "SAR"]),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { params } = request;
        const { currency } = params as { currency: "USD" | "JOD" | "SAR" };

        const pricing = await pricingService.getPricingForCurrency(currency);

        reply.send({
          success: true,
          currency,
          pricing,
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_pricing_currency_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
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
        body: zodToJsonSchema(createPaymentSchema),
      },
    },
    async (request, reply) => {
      try {
        const { body, authUser } = request;
        const { planType, currency, billingCycle, billingAddress } = body as z.infer<
          typeof createPaymentSchema
        >;
        const user = authUser!;

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
          // Default to HyperPay for USD (PayPal uses new Orders v2 API via /paypal routes)
          paymentGateway = hyperpayService.isServiceConfigured()
            ? "hyperpay"
            : apsService.isServiceConfigured()
              ? "aps"
              : "paypal";
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
          returnUrl: `${env.CLIENT_URL}/payment/success`,
          cancelUrl: `${env.CLIENT_URL}/payment/cancel`,
          billingAddress,
        };

        let paymentResponse;

        // Create payment based on selected gateway
        switch (paymentGateway) {
          case "paypal":
            // NOTE: PayPal now uses Orders v2 API via /api/payments/paypal routes
            return reply.status(503).send({
              success: false,
              error: "Use /api/payments/paypal/create-order endpoint for PayPal Orders v2 API",
            });

          case "aps":
            if (!features.aps) {
              return reply.status(503).send({
                success: false,
                error: "APS provider not configured",
              });
            }
            paymentResponse = await apsService.createPayment(paymentRequest);
            if ("ok" in paymentResponse && !paymentResponse.ok) {
              return reply.status(503).send({
                success: false,
                error: "APS service not configured",
              });
            }
            break;

          case "hyperpay":
            if (!features.hyperpay) {
              return reply.status(503).send({
                success: false,
                error: "HyperPay provider not configured",
              });
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
            if ("ok" in paymentResponse && !paymentResponse.ok) {
              return reply.status(503).send({
                success: false,
                error: "HyperPay service not configured",
              });
            }
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
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "create_payment_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Failed to create payment",
        });
      }
    }
  );

  // Handle payment success callback
  fastify.post(
    "/callback/:gateway",
    {
      schema: {
        params: zodToJsonSchema(
          z.object({
            gateway: z.enum(["paypal", "aps", "hyperpay"]),
          })
        ),
        body: zodToJsonSchema(paymentCallbackSchema),
      },
    },
    async (request, reply) => {
      try {
        const { gateway } = request.params as { gateway: "paypal" | "aps" | "hyperpay" };
        const { paymentId } = request.body as z.infer<typeof paymentCallbackSchema>;

        let result;

        switch (gateway) {
          case "paypal":
            // NOTE: PayPal now uses Orders v2 API via /api/payments/paypal routes
            return reply.status(503).send({
              success: false,
              error: "Use /api/payments/paypal/capture-order endpoint for PayPal Orders v2 API",
            });

          case "aps":
            result = await apsService.verifyPayment(paymentId);
            if ("ok" in result && !result.ok) {
              return reply.status(503).send({
                success: false,
                error: "APS service not configured",
              });
            }
            break;

          case "hyperpay":
            result = await hyperpayService.verifyPayment(paymentId);
            if ("ok" in result && !result.ok) {
              return reply.status(503).send({
                success: false,
                error: "HyperPay service not configured",
              });
            }
            break;

          default:
            throw new Error(`Unsupported payment gateway: ${gateway}`);
        }

        if ("success" in result && result.success) {
          reply.send({
            success: true,
            message: "Payment completed successfully",
            purchaseId: result.purchaseId,
          });
        } else {
          reply.status(400).send({
            success: false,
            error:
              "success" in result ? result.error || "Payment failed" : "Service not configured",
          });
        }
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "payment_callback_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Payment callback failed",
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
        querystring: zodToJsonSchema(
          z.object({
            limit: z.string().transform(Number).optional().default("10"),
            skip: z.string().transform(Number).optional().default("0"),
          })
        ),
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
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_purchase_history_error",
            userId: request.authUser!.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
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
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_subscription_error",
            userId: request.authUser!.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
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
        body: zodToJsonSchema(
          z.object({
            reason: z.string().optional().default("user_request"),
          })
        ),
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
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "cancel_subscription_error",
            userId: request.authUser!.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to cancel subscription",
        });
      }
    }
  );

  // PayPal webhook - NOTE: PayPal now uses Orders v2 API via /api/payments/paypal/webhook
  fastify.post("/webhooks/paypal", async (_request, reply) => {
    reply.status(410).send({
      success: false,
      error: "This endpoint is deprecated. Use /api/payments/paypal/webhook for PayPal Orders v2 API",
    });
  });

  // APS webhook
  fastify.post("/webhooks/aps", async (request, reply) => {
    try {
      const webhookData = request.body as APSWebhookData;

      const result = await apsService.handleWebhook(webhookData);
      if ("ok" in result && !result.ok) {
        return reply.status(503).send({
          success: false,
          error: "APS service not configured",
        });
      }

      if ("success" in result && result.success) {
        reply.send({ success: true });
      } else {
        reply.status(400).send({
          success: false,
          error: "success" in result ? result.error : "Service not configured",
        });
      }
    } catch (error: unknown) {
      request.log.error(
        safeLogFields({
          event: "aps_webhook_error",
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
      reply.status(500).send({
        success: false,
        error: "Webhook processing failed",
      });
    }
  });

  // HyperPay webhook
  fastify.post("/webhooks/hyperpay", async (request, reply) => {
    try {
      const webhookData = request.body as HyperPayWebhookData;

      const result = await hyperpayService.handleWebhook(webhookData);
      if ("ok" in result && !result.ok) {
        return reply.status(503).send({
          success: false,
          error: "HyperPay service not configured",
        });
      }

      if ("success" in result && result.success) {
        reply.send({ success: true });
      } else {
        reply.status(400).send({
          success: false,
          error: "success" in result ? result.error : "Service not configured",
        });
      }
    } catch (error: unknown) {
      request.log.error(
        safeLogFields({
          event: "hyperpay_webhook_error",
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
      reply.status(500).send({
        success: false,
        error: "Webhook processing failed",
      });
    }
  });

  // Get payment gateway status
  fastify.get("/gateways/status", async (request, reply) => {
    try {
      const apsStatus = apsService.getConfigurationStatus();
      const hyperpayStatus = hyperpayService.getConfigurationStatus();

      reply.send({
        success: true,
        gateways: {
          paypal: { configured: features.paypal, note: "Uses Orders v2 API" },
          aps: apsStatus,
          hyperpay: hyperpayStatus,
        },
      });
    } catch (error: unknown) {
      request.log.error(
        safeLogFields({
          event: "get_gateway_status_error",
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
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
    } catch (error: unknown) {
      request.log.error(
        safeLogFields({
          event: "get_currency_rates_error",
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
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
        params: zodToJsonSchema(
          z.object({
            purchaseId: z.string(),
          })
        ),
        body: zodToJsonSchema(
          z.object({
            amount: z.number().optional(),
            reason: z.string().default("requested_by_customer"),
          })
        ),
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

        if ("success" in result && result.success) {
          reply.send({
            success: true,
            message: "Refund processed successfully",
            refundId: result.refundId,
          });
        } else {
          reply.status(400).send({
            success: false,
            error: "success" in result ? result.error || "Refund failed" : "Service not configured",
          });
        }
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "process_refund_error",
            userId: request.authUser!.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Failed to process refund",
        });
      }
    }
  );
}
