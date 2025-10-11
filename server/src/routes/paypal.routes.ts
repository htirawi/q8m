/**
 * PayPal Routes
 * Handles PayPal payment endpoints with rate limiting and validation
 */



import { paypalController } from "@controllers/paypal.controller.js";
import { authenticate } from "@middlewares/auth.middleware.js";
import type {
  CaptureOrderRequest,
  CreateOrderRequest,
} from "@schemas/paypal.schemas.js";
import {
  CaptureOrderRequestSchema,
  CreateOrderRequestSchema,
  PayPalWebhookEventSchema,
} from "@schemas/paypal.schemas.js";
import { comboKey, ipKey } from "@server/security/rateLimit.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";

export default async function paypalRoutes(fastify: FastifyInstance) {
  /**
   * Create PayPal Order
   * POST /api/payments/paypal/create-order
   *
   * Rate Limited: 20 requests per 15 minutes per user+IP
   * Authentication: Required
   */
  fastify.post(
    "/create-order",
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
        description: "Create a PayPal order for payment",
        tags: ["PayPal"],
        body: zodToJsonSchema(CreateOrderRequestSchema),
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              orderID: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateOrderRequest }>, reply) => {
      await paypalController.createOrder(request, reply);
    }
  );

  /**
   * Capture PayPal Order
   * POST /api/payments/paypal/capture-order
   *
   * Rate Limited: 30 requests per 15 minutes per user+IP
   * Authentication: Required
   */
  fastify.post(
    "/capture-order",
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
        description: "Capture a PayPal order after user approval",
        tags: ["PayPal"],
        body: zodToJsonSchema(CaptureOrderRequestSchema),
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              status: { type: "string" },
              captureID: { type: "string" },
              payerEmail: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CaptureOrderRequest }>, reply) => {
      await paypalController.captureOrder(request, reply);
    }
  );

  /**
   * PayPal Webhook Endpoint
   * POST /api/payments/paypal/webhook
   *
   * Rate Limited: 100 requests per 15 minutes per IP
   * Authentication: Not required (verified via webhook signature)
   */
  fastify.post(
    "/webhook",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 100,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      schema: {
        description: "PayPal webhook endpoint for payment events",
        tags: ["PayPal"],
        body: zodToJsonSchema(PayPalWebhookEventSchema),
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      await paypalController.handleWebhook(request, reply);
    }
  );
}
