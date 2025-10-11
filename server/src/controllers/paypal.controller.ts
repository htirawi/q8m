/**
 * PayPal Controller
 * Slim controller that delegates to specialized services
 */

import type {
  CreateOrderRequest,
  CaptureOrderRequest,
  PayPalWebhookEvent,
  WebhookHeaders,
} from "@schemas/paypal.schemas.js";
import { paypalOrderService } from "@services/paypal/paypal-order.service.js";
import { paypalSubscriptionService } from "@services/paypal/paypal-subscription.service.js";
import { paypalWebhookService } from "@services/paypal/paypal-webhook.service.js";
import { handleCaptureError, handlePayPalError } from "@utils/paypal.helpers.js";
import type { FastifyRequest, FastifyReply } from "fastify";

export class PayPalController {
  /**
   * Create PayPal Order
   * POST /api/payments/paypal/create-order
   */
  async createOrder(
    request: FastifyRequest<{ Body: CreateOrderRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    request.log.info({
      event: "paypal_create_order_start",
      userId: request.body.userId,
      planType: request.body.planType,
      currency: request.body.currency_code,
    });

    try {
      const result = await paypalOrderService.createOrder(request.body);

      request.log.info({
        event: "paypal_order_created",
        orderID: result.orderID,
        userId: request.body.userId,
      });

      reply.send({ success: true, orderID: result.orderID });
    } catch (error: unknown) {
      handlePayPalError(request, error, "create_order");
      reply.status(500).send({ success: false, error: "Failed to create PayPal order" });
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
    const { orderID } = request.body;

    request.log.info({ event: "paypal_capture_order_start", orderID });

    try {
      const result = await paypalOrderService.captureOrder(orderID);

      // Check if already captured
      if (result.message) {
        return reply.send({
          success: true,
          status: result.status,
          captureID: result.captureID,
          message: result.message,
        });
      }

      // Create subscription if capture was successful
      if (result.status === "completed" && result.payment) {
        await paypalSubscriptionService.createSubscription(result.payment, request);
      }

      request.log.info({
        event: "paypal_order_captured",
        orderID,
        captureID: result.captureID,
        status: result.status,
      });

      reply.send({
        success: true,
        status: result.status,
        captureID: result.captureID,
        payerEmail: result.payerEmail,
      });
    } catch (error: unknown) {
      await handleCaptureError(request, orderID, error);
      reply.status(500).send({ success: false, error: "Failed to capture PayPal order" });
    }
  }

  /**
   * Handle PayPal Webhook
   * POST /api/payments/paypal/webhook
   */
  async handleWebhook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const webhookEvent = request.body as PayPalWebhookEvent;
    const headers = request.headers as unknown as WebhookHeaders;

    request.log.info({
      event: "paypal_webhook_received",
      eventType: webhookEvent.event_type,
      eventId: webhookEvent.id,
    });

    try {
      const result = await paypalWebhookService.processWebhook(webhookEvent, headers, request);

      if (!result.success) {
        return reply.status(400).send({ success: false, error: result.error });
      }

      return reply.send({ success: true });
    } catch (error: unknown) {
      handlePayPalError(request, error, "webhook");
      await paypalWebhookService.markEventFailed(
        webhookEvent.id,
        error instanceof Error ? error.message : "Unknown error"
      );
      return reply.status(500).send({ success: false, error: "Webhook processing failed" });
    }
  }
}

/**
 * Export singleton instance
 */
export const paypalController = new PayPalController();
