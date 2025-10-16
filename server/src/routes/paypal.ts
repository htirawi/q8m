/**
 * PayPal Routes
 * Handles PayPal payment endpoints with rate limiting and validation
 */

import { authenticate } from "@middlewares/auth.middleware.js";
import type { CaptureOrderRequest, CreateOrderRequest } from "@schemas/paypal.schemas.js";
import {
  CaptureOrderRequestSchema,
  CreateOrderRequestSchema,
  PayPalWebhookEventSchema,
} from "@schemas/paypal.schemas.js";
import { comboKey, ipKey } from "@server/security/rateLimit.js";
import { PayPalOrderService } from "@services/paypal/paypal-order.service.js";
import { PayPalWebhookService } from "@services/paypal/paypal-webhook.service.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";

export default async function paypalRoutes(fastify: FastifyInstance) {
  const orderService = new PayPalOrderService();
  const webhookService = new PayPalWebhookService();
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
      try {
        const result = await orderService.createOrder(request.body);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Failed to create order",
        });
      }
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
      try {
        const result = await orderService.captureOrder(request.body.orderID);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Failed to capture order",
        });
      }
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
      try {
        const webhookEvent = request.body as {
          id: string;
          event_type: string;
          create_time: string;
          resource: Record<string, unknown>;
          summary?: string;
          links?: Array<{
            method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            href: string;
            rel: string;
          }>;
          resource_type?: string;
        };
        const headers = {
          "paypal-transmission-id": request.headers["paypal-transmission-id"] as string,
          "paypal-transmission-time": request.headers["paypal-transmission-time"] as string,
          "paypal-transmission-sig": request.headers["paypal-transmission-sig"] as string,
          "paypal-cert-url": request.headers["paypal-cert-url"] as string,
          "paypal-auth-algo": request.headers["paypal-auth-algo"] as string,
        };
        await webhookService.processWebhook(webhookEvent, headers, request);
        return reply.send({ success: true, received: true });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Webhook processing failed",
        });
      }
    }
  );
}
