/**
 * PayPal Controller
 * Handles PayPal Orders v2 API integration
 * - Create orders
 * - Capture payments
 * - Webhook verification and handling
 */

import * as crypto from "crypto";


import { env } from "@config/env.js";
import { buildPayPalRequestId } from "@lib/idempotency.js";
import { paypalClient } from "@lib/paypalClient.js";
import type { IPurchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { WebhookEvent } from "@models/WebhookEvent.js";
import { orders as paypalOrders } from "@paypal/checkout-server-sdk";
import { paymentRepository } from "@repositories/payment.repository.js";
import type {
  CreateOrderRequest,
  CaptureOrderRequest,
  PayPalWebhookEvent,
  WebhookHeaders,
} from "@schemas/paypal.schemas.js";
import { paypalWebhookVerificationService } from "@services/paypal-webhook-verification.service.js";
import { pricingService } from "@services/pricing.service.js";
import type { FastifyRequest } from "fastify";
import type { FastifyReply } from "fastify/types/reply.js";

export class PayPalController {
  /**
   * Create PayPal Order
   * POST /api/payments/paypal/create-order
   */
  async createOrder(
    request: FastifyRequest<{ Body: CreateOrderRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId, cartId, items, currency_code, planType, billingCycle } = request.body;

      request.log.info({
        event: "paypal_create_order_start",
        userId,
        cartId,
        currency: currency_code,
        planType,
      });

      // Compute server-side total - NEVER trust client amounts
      let orderItems: Array<{ name: string; unit_amount: { currency_code: string; value: string }; quantity: string }> = [];
      let totalAmount = 0;

      if (planType) {
        // Fetch pricing from server
        const planPricing = await pricingService.getPlanPricing(planType, currency_code);
        if (!planPricing) {
          reply.status(400).send({
            success: false,
            error: "Invalid plan type",
          });
          return;
        }

        const priceInfo = planPricing.pricing[currency_code];
        if (!priceInfo) {
          reply.status(400).send({
            success: false,
            error: "Pricing not available for selected currency",
          });
          return;
        }

        totalAmount = priceInfo.amount;
        orderItems = [
          {
            name: `${planType} Plan - ${billingCycle}`,
            unit_amount: {
              currency_code,
              value: priceInfo.amount.toFixed(2),
            },
            quantity: "1",
          },
        ];
      } else if (items && items.length > 0) {
        // Recompute total from items (fetch from DB if needed)
        for (const item of items) {
          totalAmount += item.unit_amount * item.qty;
          orderItems.push({
            name: item.name,
            unit_amount: {
              currency_code,
              value: item.unit_amount.toFixed(2),
            },
            quantity: item.qty.toString(),
          });
        }
      } else {
        reply.status(400).send({
          success: false,
          error: "Either planType or items must be provided",
        });
        return;
      }

      // Build PayPal order request
      const orderRequest = new paypalOrders.OrdersCreateRequest();

      // Add idempotency key
      const requestId = buildPayPalRequestId(cartId || `plan-${planType}-${Date.now()}`, userId);
      orderRequest.headers["PayPal-Request-Id"] = requestId;

      orderRequest.prefer("return=representation");
      orderRequest.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code,
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code,
                  value: totalAmount.toFixed(2),
                },
              },
            },
            items: orderItems,
            custom_id: userId, // Store userId for webhook processing
          },
        ],
        application_context: {
          brand_name: "Q8M Quiz Platform",
          landing_page: "NO_PREFERENCE",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${env.CLIENT_URL}/payment/success`,
          cancel_url: `${env.CLIENT_URL}/payment/cancel`,
        },
      });

      // Call PayPal API
      const response = await paypalClient.execute(orderRequest);
      const order = response.result;

      request.log.info({
        event: "paypal_order_created",
        orderID: order.id,
        status: order.status,
        userId,
      });

      // Save payment record to database
      const internalOrderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      const user = await User.findById(userId);
      await paymentRepository.create({
        userId,
        orderId: internalOrderId,
        paymentId: order.id, // Store PayPal order ID
        gateway: "paypal",
        status: "pending",
        amount: {
          currency: currency_code,
          value: totalAmount.toFixed(2),
        },
        items: orderItems.map((item, idx) => ({
          type: planType || items?.[idx]?.id || "ITEM",
          name: item.name,
          price: {
            currency: currency_code,
            value: item.unit_amount.value,
          },
        })),
        customer: {
          email: user?.email || "",
          name: user?.name || "",
        },
        metadata: {
          planType: planType || "",
          billingCycle: billingCycle || "",
          requestId,
        },
      });

      reply.send({
        success: true,
        orderID: order.id,
      });
    } catch (error: unknown) {
      request.log.error({
        event: "paypal_create_order_error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      reply.status(500).send({
        success: false,
        error: "Failed to create PayPal order",
      });
    }
  }

  /**
   * Capture PayPal Order
   * POST /api/payments/paypal/capture-order
   */
  async captureOrder(
    request: FastifyRequest<{ Body: CaptureOrderRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderID } = request.body;

      request.log.info({
        event: "paypal_capture_order_start",
        orderID,
      });

      // Find payment record
      const payment = await paymentRepository.findByOrderId(orderID);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: "Payment record not found",
        });
        return;
      }

      // Check if already captured (idempotency)
      if (payment.status === "completed") {
        request.log.info({
          event: "paypal_capture_duplicate",
          orderID,
          status: payment.status,
        });

        reply.send({
          success: true,
          status: "completed",
          captureID: payment.paymentId,
          message: "Order already captured",
        });
        return;
      }

      // Capture the order
      const captureRequest = new paypalOrders.OrdersCaptureRequest(orderID);
      captureRequest.prefer("return=representation");

      const response = await paypalClient.execute(captureRequest);
      const captureData = response.result;

      // Extract capture details
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      if (!capture) {
        throw new Error("No capture found in PayPal response");
      }

      const captureStatus = capture.status;
      const captureID = capture.id;
      const payerEmail = captureData.payer?.email_address;

      request.log.info({
        event: "paypal_order_captured",
        orderID,
        captureID,
        status: captureStatus,
      });

      // Update payment record
      await paymentRepository.updateCapture(orderID, {
        captureId: captureID,
        status: captureStatus === "COMPLETED" ? "completed" : "pending",
        payerEmail,
        gatewayResponse: captureData,
      });

      // Mark as completed if capture successful
      if (captureStatus === "COMPLETED") {
        await paymentRepository.markAsCompleted(orderID, captureData);

        // Create subscription (pass request for logging)
        await this.createSubscription(payment, request);
      }

      reply.send({
        success: true,
        status: captureStatus === "COMPLETED" ? "completed" : "pending",
        captureID,
        payerEmail,
      });
    } catch (error: unknown) {
      request.log.error({
        event: "paypal_capture_order_error",
        orderID: request.body.orderID,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Try to mark payment as failed
      try {
        await paymentRepository.markAsFailed(
          request.body.orderID,
          error instanceof Error ? error.message : "Unknown error"
        );
      } catch (dbError) {
        request.log.error({
          event: "paypal_capture_db_error",
          error: dbError instanceof Error ? dbError.message : "Unknown error",
        });
      }

      reply.status(500).send({
        success: false,
        error: "Failed to capture PayPal order",
      });
    }
  }

  /**
   * Handle PayPal Webhook
   * POST /api/payments/paypal/webhook
   *
   * SECURITY: Now uses PayPal SDK verification (SEC-001 fix)
   * SECURITY: Implements webhook event deduplication (SEC-003 fix)
   */
  async handleWebhook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const webhookEvent = request.body as PayPalWebhookEvent;
      const headers = request.headers as unknown as WebhookHeaders;

      request.log.info({
        event: "paypal_webhook_received",
        eventType: webhookEvent.event_type,
        eventId: webhookEvent.id,
      });

      // ✅ SECURITY FIX (SEC-001): Use PayPal SDK verification
      const verificationResult = await paypalWebhookVerificationService.verifyWebhookSignature(
        webhookEvent,
        headers
      );

      if (!verificationResult.isValid) {
        request.log.warn({
          event: "paypal_webhook_invalid_signature",
          eventId: webhookEvent.id,
          error: verificationResult.error,
        });

        return reply.status(400).send({
          success: false,
          error: "Invalid webhook signature",
        });
      }

      // ✅ SECURITY FIX (SEC-003): Check for duplicate events
      const existingEvent = await WebhookEvent.findOne({ eventId: webhookEvent.id });
      if (existingEvent) {
        request.log.info({
          event: "paypal_webhook_duplicate",
          eventId: webhookEvent.id,
          existingStatus: existingEvent.status,
        });
        return reply.send({ success: true });
      }

      // Store webhook event for audit trail and deduplication
      await WebhookEvent.create({
        eventId: webhookEvent.id,
        eventType: webhookEvent.event_type,
        gateway: "paypal",
        rawPayload: webhookEvent,
        receivedAt: new Date(),
        status: "pending",
      });

      // Handle webhook events
      switch (webhookEvent.event_type) {
        case "PAYMENT.CAPTURE.COMPLETED":
          await this.handleCaptureCompleted(webhookEvent, request);
          break;

        case "CHECKOUT.ORDER.COMPLETED":
          await this.handleOrderCompleted(webhookEvent, request);
          break;

        case "PAYMENT.CAPTURE.DENIED":
          await this.handleCaptureDenied(webhookEvent, request);
          break;

        case "PAYMENT.CAPTURE.REFUNDED":
          await this.handleCaptureRefunded(webhookEvent, request);
          break;

        default:
          request.log.info({
            event: "paypal_webhook_unhandled",
            eventType: webhookEvent.event_type,
          });
      }

      // Mark event as processed
      await WebhookEvent.updateOne(
        { eventId: webhookEvent.id },
        { processedAt: new Date(), status: "processed" }
      );

      return reply.send({ success: true });
    } catch (error: unknown) {
      request.log.error({
        event: "paypal_webhook_error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Mark event as failed if it was created
      if (request.body && (request.body as PayPalWebhookEvent).id) {
        await WebhookEvent.updateOne(
          { eventId: (request.body as PayPalWebhookEvent).id },
          {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
          }
        ).catch(() => {
          // Ignore errors in error handler
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Webhook processing failed",
      });
    }
  }

  /**
   * DEPRECATED: Old verification method removed
   * Now using PayPal SDK verification via paypalWebhookVerificationService
   * See handleWebhook() method for updated implementation
   */

  /**
   * Handle PAYMENT.CAPTURE.COMPLETED webhook
   */
  private async handleCaptureCompleted(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    try {
      const resource = webhookEvent.resource as {
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
        custom_id?: string;
      };

      const captureId = resource.id;

      // Find payment by capture ID
      const payment = await paymentRepository.findByCaptureId(captureId);
      if (!payment) {
        request.log.warn({
          event: "paypal_webhook_payment_not_found",
          captureId,
        });
        return;
      }

      // Check if already processed (idempotency)
      if (payment.status === "completed") {
        request.log.info({
          event: "paypal_webhook_duplicate",
          captureId,
        });
        return;
      }

      // Mark as completed (webhookEvent includes the full payload)
      await paymentRepository.markAsCompleted(payment.paymentId, undefined);

      // Create subscription (pass request for logging)
      await this.createSubscription(payment, request);

      request.log.info({
        event: "paypal_webhook_capture_completed_processed",
        captureId,
        userId: payment.userId,
      });
    } catch (error) {
      request.log.error({
        event: "paypal_webhook_capture_completed_error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handle CHECKOUT.ORDER.COMPLETED webhook
   */
  private async handleOrderCompleted(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    try {
      const resource = webhookEvent.resource as {
        id: string;
        status: string;
        purchase_units?: Array<{ payments?: { captures?: Array<{ id: string }> } }>;
      };

      const orderId = resource.id;

      request.log.info({
        event: "paypal_webhook_order_completed",
        orderId,
      });

      // Order completed webhook is informational
      // Actual payment completion is handled in PAYMENT.CAPTURE.COMPLETED
    } catch (error) {
      request.log.error({
        event: "paypal_webhook_order_completed_error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handle PAYMENT.CAPTURE.DENIED webhook
   */
  private async handleCaptureDenied(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    try {
      const resource = webhookEvent.resource as { id: string };
      const captureId = resource.id;

      const payment = await paymentRepository.findByCaptureId(captureId);
      if (payment) {
        await paymentRepository.markAsFailed(payment.paymentId, "Payment capture denied by PayPal");
      }

      request.log.info({
        event: "paypal_webhook_capture_denied",
        captureId,
      });
    } catch (error) {
      request.log.error({
        event: "paypal_webhook_capture_denied_error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handle PAYMENT.CAPTURE.REFUNDED webhook
   */
  private async handleCaptureRefunded(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    try {
      const resource = webhookEvent.resource as {
        id: string;
        amount: { currency_code: string; value: string };
        links?: Array<{ href: string; rel: string }>;
      };

      const refundId = resource.id;

      // Find the original capture from links
      const captureLink = resource.links?.find((link) => link.rel === "up");
      if (!captureLink) {
        request.log.warn({
          event: "paypal_webhook_refund_no_capture_link",
          refundId,
        });
        return;
      }

      // Extract capture ID from URL
      const captureId = captureLink.href.split("/").pop();
      if (!captureId) {
        return;
      }

      const payment = await paymentRepository.findByCaptureId(captureId);
      if (payment) {
        // Mark as refunded
        payment.status = "refunded";
        await payment.save();

        // Cancel subscription
        const subscription = await Subscription.findOne({ purchaseId: payment._id });
        if (subscription) {
          await subscription.cancel("refund");
        }
      }

      request.log.info({
        event: "paypal_webhook_capture_refunded",
        refundId,
        captureId,
      });
    } catch (error) {
      request.log.error({
        event: "paypal_webhook_capture_refunded_error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create subscription after successful payment
   *
   * NOTE: Now requires request parameter for proper structured logging
   */
  private async createSubscription(payment: IPurchase, request?: FastifyRequest): Promise<void> {
    try {
      const user = await User.findById(payment.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if subscription already exists
      const existingSubscription = await Subscription.findOne({
        purchaseId: payment._id,
        status: "active",
      });

      if (existingSubscription) {
        // ✅ SECURITY FIX (SEC-004): Use structured logging
        if (request) {
          request.log.info({
            event: "subscription_already_exists",
            purchaseId: payment._id,
            subscriptionId: existingSubscription._id,
          });
        }
        return;
      }

      const planType = payment.metadata?.planType || payment.items[0]?.type || "INTERMEDIATE";
      const billingCycle = payment.metadata?.billingCycle || "monthly";

      const now = new Date();
      const periodEnd =
        billingCycle === "yearly"
          ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
          : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const subscription = new Subscription({
        userId: payment.userId,
        purchaseId: payment._id,
        planType,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        billingCycle,
        price: payment.amount,
        metadata: {
          originalPurchaseCurrency: payment.amount.currency,
        },
      });

      await subscription.save();

      // Update user entitlements
      user.entitlements = subscription.entitlements;
      await user.save();

      // ✅ SECURITY FIX (SEC-004): Use structured logging
      if (request) {
        request.log.info({
          event: "subscription_created",
          userId: user._id,
          subscriptionId: subscription._id,
          planType: subscription.planType,
        });
      }
    } catch (error) {
      // ✅ SECURITY FIX (SEC-004): Use structured logging
      if (request) {
        request.log.error({
          event: "subscription_creation_error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const paypalController = new PayPalController();
