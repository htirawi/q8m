/**
 * PayPal Request/Response Validation Schemas
 * Uses Zod for strong runtime validation
 */

import { z } from "zod";

/**
 * Item schema for PayPal order
 */
export const PayPalItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  name: z.string().min(1, "Item name is required").max(127),
  qty: z.number().int().positive("Quantity must be positive"),
  unit_amount: z.number().positive("Unit amount must be positive"),
  description: z.string().max(127).optional(),
  sku: z.string().max(127).optional(),
});

/**
 * Create Order Request Schema
 */
export const CreateOrderRequestSchema = z.object({
  cartId: z.string().optional(), // Optional cart identifier
  items: z.array(PayPalItemSchema).min(1, "At least one item is required").optional(),
  currency_code: z
    .enum(["USD", "JOD", "SAR"], {
      errorMap: () => ({ message: "Currency must be USD, JOD, or SAR" }),
    })
    .default("USD"),
  userId: z.string().min(1, "User ID is required"),
  planType: z.enum(["INTERMEDIATE", "SENIOR", "BUNDLE"]).optional(),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * Capture Order Request Schema
 */
export const CaptureOrderRequestSchema = z.object({
  orderID: z.string().min(1, "Order ID is required").max(255),
});

/**
 * PayPal Webhook Event Schema
 */
export const PayPalWebhookEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  create_time: z.string(),
  resource_type: z.string().optional(),
  resource: z.record(z.unknown()),
  summary: z.string().optional(),
  links: z
    .array(
      z.object({
        href: z.string().url(),
        rel: z.string(),
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
      })
    )
    .optional(),
});

/**
 * Webhook verification headers schema
 */
export const WebhookHeadersSchema = z.object({
  "paypal-transmission-id": z.string(),
  "paypal-transmission-time": z.string(),
  "paypal-transmission-sig": z.string(),
  "paypal-cert-url": z.string().url(),
  "paypal-auth-algo": z.string(),
});

/**
 * Export TypeScript types from schemas
 */
export type PayPalItem = z.infer<typeof PayPalItemSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type CaptureOrderRequest = z.infer<typeof CaptureOrderRequestSchema>;
export type PayPalWebhookEvent = z.infer<typeof PayPalWebhookEventSchema>;
export type WebhookHeaders = z.infer<typeof WebhookHeadersSchema>;
