/**
 * Coupon Routes
 * Handles coupon validation and management
 */

import { authenticate } from "@middlewares/auth.middleware.js";
import { Coupon, type ICoupon } from "@models/Coupon.js";
import { safeLogFields } from "@server/security/logging.js";
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
const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  tier: z.enum(["intermediate", "advanced", "pro"]),
  cycle: z.enum(["monthly", "annual"]),
  amount: z.number().positive(),
  currency: z.enum(["USD", "JOD", "SAR"]).default("USD"),
});

export default async function couponRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/coupons/validate
   * Validate a coupon code for specific plan and cycle
   */
  fastify.post(
    "/validate",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(validateCouponSchema),
      },
    },
    async (request, reply) => {
      try {
        const { body, authUser } = request;
        const { code, tier, cycle, amount, currency } = body as z.infer<
          typeof validateCouponSchema
        >;

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

        // Find coupon by code
        const coupon = await Coupon.findValidByCode(code);
        if (!coupon) {
          request.log.info(
            safeLogFields({
              event: "coupon_validation_failed",
              userId: authUser!.id,
              code,
              reason: "not_found",
            })
          );
          return reply.status(404).send({
            success: false,
            error: "Invalid or expired coupon code",
            valid: false,
          });
        }

        // Check applicability
        const applicability = coupon.isApplicable(planType, billingCycle, amount);
        if (!applicability.valid) {
          request.log.info(
            safeLogFields({
              event: "coupon_validation_failed",
              userId: authUser!.id,
              code,
              reason: applicability.reason,
            })
          );
          return reply.status(400).send({
            success: false,
            error: applicability.reason || "Coupon not applicable",
            valid: false,
          });
        }

        // Calculate discount
        let discount;
        try {
          discount = coupon.calculateDiscount(amount, currency);
        } catch (error) {
          request.log.warn(
            safeLogFields({
              event: "coupon_calculation_error",
              userId: authUser!.id,
              code,
              error: error instanceof Error ? error.message : "Unknown error",
            })
          );
          return reply.status(400).send({
            success: false,
            error: error instanceof Error ? error.message : "Failed to calculate discount",
            valid: false,
          });
        }

        request.log.info(
          safeLogFields({
            event: "coupon_validated",
            userId: authUser!.id,
            code,
            discountAmount: discount.discountAmount,
          })
        );

        reply.send({
          success: true,
          valid: true,
          coupon: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount: discount.discountAmount,
            finalAmount: discount.finalAmount,
            description:
              coupon.type === "percentage"
                ? `${coupon.value}% off`
                : `${currency} ${coupon.value} off`,
          },
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "validate_coupon_error",
            userId: request.authUser?.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to validate coupon",
          valid: false,
        });
      }
    }
  );

  /**
   * GET /api/coupons/active
   * Get list of active coupons (admin only)
   */
  fastify.get(
    "/active",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        // TODO: Add admin role check
        // if (request.authUser!.role !== 'admin') {
        //   return reply.status(403).send({ success: false, error: 'Access denied' });
        // }

        const coupons = await Coupon.getActiveCoupons();

        reply.send({
          success: true,
          coupons: coupons.map((coupon: ICoupon) => ({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            usedCount: coupon.usedCount,
            usageLimit: coupon.usageLimit,
            applicablePlans: coupon.applicablePlans,
            applicableCycles: coupon.applicableCycles,
          })),
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_active_coupons_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to retrieve coupons",
        });
      }
    }
  );

  /**
   * POST /api/coupons/create
   * Create a new coupon (admin only)
   */
  fastify.post(
    "/create",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(
          z.object({
            code: z.string().min(1).max(50),
            type: z.enum(["percentage", "fixed"]),
            value: z.number().positive(),
            currency: z.enum(["USD", "JOD", "SAR"]).optional(),
            minPurchaseAmount: z.number().positive().optional(),
            maxDiscountAmount: z.number().positive().optional(),
            validFrom: z.string().datetime().optional(),
            validUntil: z.string().datetime().optional(),
            usageLimit: z.number().positive().optional(),
            applicablePlans: z
              .array(z.enum(["INTERMEDIATE", "SENIOR", "BUNDLE"]))
              .default(["INTERMEDIATE", "SENIOR", "BUNDLE"]),
            applicableCycles: z.array(z.enum(["monthly", "yearly"])).default(["monthly", "yearly"]),
            metadata: z
              .object({
                campaign: z.string().optional(),
                affiliateId: z.string().optional(),
                notes: z.string().optional(),
              })
              .optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        // TODO: Add admin role check
        // if (request.authUser!.role !== 'admin') {
        //   return reply.status(403).send({ success: false, error: 'Access denied' });
        // }

        const { body } = request;
        const couponData = body as {
          code: string;
          type: "percentage" | "fixed";
          value: number;
          currency?: string;
          minPurchaseAmount?: number;
          maxDiscountAmount?: number;
          validFrom?: string;
          validUntil?: string;
          usageLimit?: number;
          applicablePlans?: ("INTERMEDIATE" | "SENIOR" | "BUNDLE")[];
          applicableCycles?: ("monthly" | "yearly")[];
          metadata?: { campaign?: string; affiliateId?: string; notes?: string };
        };

        // Check if coupon code already exists
        const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
        if (existing) {
          return reply.status(409).send({
            success: false,
            error: "Coupon code already exists",
          });
        }

        // Create coupon
        const coupon = new Coupon({
          ...couponData,
          code: couponData.code.toUpperCase(),
          validFrom: couponData.validFrom ? new Date(couponData.validFrom) : new Date(),
          validUntil: couponData.validUntil ? new Date(couponData.validUntil) : undefined,
        });

        await coupon.save();

        request.log.info(
          safeLogFields({
            event: "coupon_created",
            userId: request.authUser!.id,
            code: coupon.code,
          })
        );

        reply.send({
          success: true,
          coupon: {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
          },
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "create_coupon_error",
            userId: request.authUser?.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to create coupon",
        });
      }
    }
  );

  /**
   * GET /api/coupons/stats
   * Get coupon statistics (admin only)
   */
  fastify.get(
    "/stats",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        // TODO: Add admin role check

        const stats = await Coupon.getCouponStats();

        reply.send({
          success: true,
          stats,
        });
      } catch (error: unknown) {
        request.log.error(
          safeLogFields({
            event: "get_coupon_stats_error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          })
        );
        reply.status(500).send({
          success: false,
          error: "Failed to retrieve coupon statistics",
        });
      }
    }
  );
}
