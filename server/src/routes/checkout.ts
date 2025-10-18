/**
 * Checkout Routes
 * Handles Convert Modal checkout flow with provider-agnostic architecture
 */

import { randomBytes } from "crypto";

import { env } from "@config/env.js";
import { authenticate } from "@middlewares/auth.middleware.js";
import { Coupon } from "@models/Coupon.js";
import { safeLogFields } from "@server/security/logging.js";
import { comboKey, ipKey } from "@server/security/rateLimit.js";
import { pricingService } from "@services/pricing.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Map client plan tiers to server plan types
const TIER_MAP: Record<string, "INTERMEDIATE" | "SENIOR" | "BUNDLE"> = {
  intermediate: "INTERMEDIATE",
  advanced: "SENIOR",
  pro: "BUNDLE",
};

// Validation schemas
const createCheckoutSessionSchema = z.object({
  tier: z.enum(["intermediate", "advanced", "pro"]),
  cycle: z.enum(["monthly", "annual"]),
  couponCode: z.string().optional(),
  currency: z.enum(["USD", "JOD", "SAR"]).default("USD"),
  embedUrl: z.boolean().default(false), // Request embedded checkout vs redirect
  source: z.string().default("convert_modal"), // Analytics tracking
});

const oneClickCheckoutSchema = z.object({
  tier: z.enum(["intermediate", "advanced", "pro"]),
  cycle: z.enum(["monthly", "annual"]),
  couponCode: z.string().optional(),
  currency: z.enum(["USD", "JOD", "SAR"]).default("USD"),
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
  source: z.string().default("convert_modal"),
});

export default async function checkoutRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/checkout/create
   * Create a checkout session for Convert Modal
   */
  fastify.post(
    "/create",
    {
      preHandler: [authenticate],
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 30,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(createCheckoutSessionSchema),
      },
    },
    async (request, reply) => {
      try {
        const { body, authUser } = request;
        const { tier, cycle, couponCode, currency, embedUrl, source } = body as z.infer<
          typeof createCheckoutSessionSchema
        >;
        const user = authUser!;

        // Map client tier to server plan type
        const planType = TIER_MAP[tier];
        if (!planType) {
          return reply.status(400).send({
            success: false,
            error: "Invalid plan tier",
          });
        }

        // Convert cycle format (annual -> yearly)
        const billingCycle = cycle === "annual" ? "yearly" : "monthly";

        // Get pricing for the plan
        const planPricing = await pricingService.getPlanPricing(planType, currency);
        if (!planPricing) {
          return reply.status(400).send({
            success: false,
            error: "Pricing not available for selected plan",
          });
        }

        const priceInfo = planPricing.pricing[currency];
        if (!priceInfo) {
          return reply.status(400).send({
            success: false,
            error: "Pricing not available for selected currency",
          });
        }

        let finalAmount = priceInfo.amount;
        let discountAmount = 0;
        let appliedCoupon = null;

        // Apply coupon if provided
        if (couponCode) {
          const coupon = await Coupon.findValidByCode(couponCode);
          if (!coupon) {
            return reply.status(400).send({
              success: false,
              error: "Invalid or expired coupon code",
            });
          }

          // Validate coupon applicability
          const applicability = coupon.isApplicable(planType, billingCycle, priceInfo.amount);
          if (!applicability.valid) {
            return reply.status(400).send({
              success: false,
              error: applicability.reason || "Coupon not applicable",
            });
          }

          // Calculate discount
          try {
            const { discountAmount: calculatedDiscount, finalAmount: calculatedFinal } =
              coupon.calculateDiscount(priceInfo.amount, currency);
            discountAmount = calculatedDiscount;
            finalAmount = calculatedFinal;
            appliedCoupon = {
              code: coupon.code,
              type: coupon.type,
              value: coupon.value,
              discountAmount,
            };
          } catch (error) {
            request.log.warn(
              safeLogFields({
                event: "coupon_calculation_error",
                couponCode,
                error: error instanceof Error ? error.message : "Unknown error",
              })
            );
            return reply.status(400).send({
              success: false,
              error: error instanceof Error ? error.message : "Failed to apply coupon",
            });
          }
        }

        // Create checkout session data
        // Use cryptographically secure random bytes for session ID
        const randomSuffix = randomBytes(6).toString("base64url");
        const checkoutSession = {
          sessionId: `cs_${Date.now()}_${randomSuffix}`,
          userId: user.id,
          planTier: tier,
          planType,
          cycle,
          billingCycle,
          amount: finalAmount,
          originalAmount: priceInfo.amount,
          discountAmount,
          currency,
          coupon: appliedCoupon,
          source,
          embedUrl: embedUrl
            ? `${env.CLIENT_URL}/embed/checkout/${planType.toLowerCase()}/${billingCycle}`
            : undefined,
          redirectUrl: `${env.CLIENT_URL}/subscribe?plan=${tier}&cycle=${cycle}${couponCode ? `&coupon=${couponCode}` : ""}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        };

        request.log.info(
          safeLogFields({
            event: "checkout_session_created",
            userId: user.id,
            tier,
            cycle,
            amount: finalAmount,
            currency,
            hasCoupon: !!couponCode,
            source,
          })
        );

        reply.send({
          success: true,
          session: checkoutSession,
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "create_checkout_session_error",
            userId: request.authUser?.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to create checkout session",
        });
      }
    }
  );

  /**
   * POST /api/checkout/one-click
   * Process checkout with saved payment method (1-click checkout)
   */
  fastify.post(
    "/one-click",
    {
      preHandler: [authenticate],
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 20,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(oneClickCheckoutSchema),
      },
    },
    async (request, reply) => {
      try {
        const { body, authUser } = request;
        const { tier, cycle, couponCode, currency, paymentMethodId, source } = body as z.infer<
          typeof oneClickCheckoutSchema
        >;
        const user = authUser!;

        // Map client tier to server plan type
        const planType = TIER_MAP[tier];
        if (!planType) {
          return reply.status(400).send({
            success: false,
            error: "Invalid plan tier",
          });
        }

        // Convert cycle format (annual -> yearly)
        const billingCycle = cycle === "annual" ? "yearly" : "monthly";

        // Get pricing for the plan
        const planPricing = await pricingService.getPlanPricing(planType, currency);
        if (!planPricing) {
          return reply.status(400).send({
            success: false,
            error: "Pricing not available for selected plan",
          });
        }

        const priceInfo = planPricing.pricing[currency];
        if (!priceInfo) {
          return reply.status(400).send({
            success: false,
            error: "Pricing not available for selected currency",
          });
        }

        let finalAmount = priceInfo.amount;
        let discountAmount = 0;
        let appliedCoupon = null;

        // Apply coupon if provided
        if (couponCode) {
          const coupon = await Coupon.findValidByCode(couponCode);
          if (!coupon) {
            return reply.status(400).send({
              success: false,
              error: "Invalid or expired coupon code",
            });
          }

          const applicability = coupon.isApplicable(planType, billingCycle, priceInfo.amount);
          if (!applicability.valid) {
            return reply.status(400).send({
              success: false,
              error: applicability.reason || "Coupon not applicable",
            });
          }

          try {
            const { discountAmount: calculatedDiscount, finalAmount: calculatedFinal } =
              coupon.calculateDiscount(priceInfo.amount, currency);
            discountAmount = calculatedDiscount;
            finalAmount = calculatedFinal;
            appliedCoupon = {
              code: coupon.code,
              type: coupon.type,
              value: coupon.value,
              discountAmount,
            };

            // Increment coupon usage
            await coupon.incrementUsage();
          } catch (error) {
            request.log.warn(
              safeLogFields({
                event: "coupon_calculation_error",
                couponCode,
                error: error instanceof Error ? error.message : "Unknown error",
              })
            );
            return reply.status(400).send({
              success: false,
              error: error instanceof Error ? error.message : "Failed to apply coupon",
            });
          }
        }

        // TODO: Integrate with payment provider to charge saved payment method
        // This is a placeholder - implement actual payment processing based on provider
        // For now, simulate successful payment
        request.log.info(
          safeLogFields({
            event: "one_click_payment_simulated",
            userId: user.id,
            tier,
            cycle,
            amount: finalAmount,
            currency,
            paymentMethodId,
            source,
          })
        );

        // In production, you would:
        // 1. Retrieve saved payment method from provider
        // 2. Create payment intent/order
        // 3. Charge the payment method
        // 4. Create Purchase and Subscription records
        // 5. Grant entitlements

        // Simulate delay for payment processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        reply.send({
          success: true,
          message: "Payment processed successfully",
          subscription: {
            id: `sub_${Date.now()}`,
            planType,
            tier,
            cycle: billingCycle,
            amount: finalAmount,
            currency,
            status: "active",
            coupon: appliedCoupon,
          },
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "one_click_checkout_error",
            userId: request.authUser?.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to process one-click checkout",
        });
      }
    }
  );

  /**
   * GET /api/checkout/session/:sessionId
   * Retrieve checkout session details
   */
  fastify.get(
    "/session/:sessionId",
    {
      preHandler: [authenticate],
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 50,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 50,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      schema: {
        params: zodToJsonSchema(
          z.object({
            sessionId: z.string().min(1),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };

        // TODO: Implement session storage (Redis, DB, etc.)
        // For now, return error as sessions are ephemeral
        request.log.warn(
          safeLogFields({
            event: "checkout_session_retrieval_not_implemented",
            sessionId,
          })
        );

        reply.status(501).send({
          success: false,
          error: "Session storage not yet implemented",
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_checkout_session_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to retrieve checkout session",
        });
      }
    }
  );

  /**
   * POST /api/checkout/abandon
   * Track checkout abandonment for analytics
   */
  fastify.post(
    "/abandon",
    {
      preHandler: [authenticate],
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 50,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 50,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      schema: {
        body: zodToJsonSchema(
          z.object({
            sessionId: z.string().optional(),
            tier: z.enum(["intermediate", "advanced", "pro"]),
            cycle: z.enum(["monthly", "annual"]),
            step: z.string(),
            reason: z.string().optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { body, authUser } = request;
        const { sessionId, tier, cycle, step, reason } = body as {
          sessionId?: string;
          tier: "intermediate" | "advanced" | "pro";
          cycle: "monthly" | "annual";
          step: string;
          reason?: string;
        };

        request.log.info(
          safeLogFields({
            event: "checkout_abandoned",
            userId: authUser!.id,
            sessionId,
            tier,
            cycle,
            step,
            reason,
          })
        );

        reply.send({
          success: true,
          message: "Abandonment tracked",
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "track_abandonment_error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
        // Don't fail the request for analytics tracking errors
        reply.send({
          success: true,
          message: "Abandonment tracking failed silently",
        });
      }
    }
  );
}
