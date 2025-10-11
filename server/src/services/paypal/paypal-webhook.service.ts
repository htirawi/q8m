/**
 * PayPal Webhook Service
 * Handles webhook event processing with security verification
 */

import { Subscription } from "@models/Subscription.js";
import { WebhookEvent } from "@models/WebhookEvent.js";
import { paymentRepository } from "@repositories/payment.repository.js";
import type { PayPalWebhookEvent, WebhookHeaders } from "@schemas/paypal.schemas.js";
import { paypalWebhookVerificationService } from "@services/paypal-webhook-verification.service.js";
import { paypalSubscriptionService } from "@services/paypal/paypal-subscription.service.js";
import type { FastifyRequest } from "fastify";

export class PayPalWebhookService {
  /**
   * Process incoming webhook event
   */
  async processWebhook(
    webhookEvent: PayPalWebhookEvent,
    headers: WebhookHeaders,
    request: FastifyRequest
  ): Promise<{ success: boolean; error?: string }> {
    // Verify webhook signature
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
      return { success: false, error: "Invalid webhook signature" };
    }

    // Check for duplicate events
    const isDuplicate = await this.checkDuplicateEvent(webhookEvent.id);
    if (isDuplicate) {
      request.log.info({ event: "paypal_webhook_duplicate", eventId: webhookEvent.id });
      return { success: true };
    }

    // Store webhook event
    await this.storeWebhookEvent(webhookEvent);

    // Process the event
    await this.handleWebhookEvent(webhookEvent, request);

    // Mark as processed
    await this.markEventProcessed(webhookEvent.id);

    return { success: true };
  }

  /**
   * Handle webhook event based on type
   */
  private async handleWebhookEvent(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    switch (webhookEvent.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await this.handleCaptureCompleted(webhookEvent, request);
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
  }

  /**
   * Handle PAYMENT.CAPTURE.COMPLETED event
   */
  private async handleCaptureCompleted(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    const captureId = (webhookEvent.resource as { id: string }).id;
    const payment = await paymentRepository.findByCaptureId(captureId);

    if (!payment) {
      request.log.warn({ event: "paypal_webhook_payment_not_found", captureId });
      return;
    }

    if (payment.status === "completed") {
      request.log.info({ event: "paypal_webhook_already_completed", captureId });
      return;
    }

    // Mark as completed
    await paymentRepository.markAsCompleted(payment.paymentId, undefined);

    // Create subscription
    await paypalSubscriptionService.createSubscription(payment, request);

    request.log.info({
      event: "paypal_webhook_capture_completed_processed",
      captureId,
      userId: payment.userId,
    });
  }

  /**
   * Handle PAYMENT.CAPTURE.DENIED event
   */
  private async handleCaptureDenied(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    const captureId = (webhookEvent.resource as { id: string }).id;
    const payment = await paymentRepository.findByCaptureId(captureId);

    if (payment) {
      await paymentRepository.markAsFailed(payment.paymentId, "Payment capture denied by PayPal");
      request.log.info({ event: "paypal_webhook_capture_denied", captureId });
    }
  }

  /**
   * Handle PAYMENT.CAPTURE.REFUNDED event
   */
  private async handleCaptureRefunded(
    webhookEvent: PayPalWebhookEvent,
    request: FastifyRequest
  ): Promise<void> {
    const resource = webhookEvent.resource as {
      id: string;
      links?: Array<{ href: string; rel: string }>;
    };

    const captureId = resource.links?.find((link) => link.rel === "up")?.href.split("/").pop();
    if (!captureId) {
      request.log.warn({
        event: "paypal_webhook_refund_no_capture_link",
        refundId: resource.id,
      });
      return;
    }

    const payment = await paymentRepository.findByCaptureId(captureId);
    if (payment) {
      payment.status = "refunded";
      await payment.save();

      // Cancel subscription
      const subscription = await Subscription.findOne({ purchaseId: payment._id });
      if (subscription) {
        await subscription.cancel("refund");
      }

      request.log.info({
        event: "paypal_webhook_capture_refunded",
        refundId: resource.id,
        captureId,
      });
    }
  }

  /**
   * Check if event was already processed
   */
  private async checkDuplicateEvent(eventId: string): Promise<boolean> {
    const existingEvent = await WebhookEvent.findOne({ eventId });
    return !!existingEvent;
  }

  /**
   * Store webhook event for audit trail
   */
  private async storeWebhookEvent(webhookEvent: PayPalWebhookEvent): Promise<void> {
    await WebhookEvent.create({
      eventId: webhookEvent.id,
      eventType: webhookEvent.event_type,
      gateway: "paypal",
      rawPayload: webhookEvent,
      receivedAt: new Date(),
      status: "pending",
    });
  }

  /**
   * Mark event as processed
   */
  private async markEventProcessed(eventId: string): Promise<void> {
    await WebhookEvent.updateOne(
      { eventId },
      { processedAt: new Date(), status: "processed" }
    );
  }

  /**
   * Mark event as failed
   */
  async markEventFailed(eventId: string, error: string): Promise<void> {
    await WebhookEvent.updateOne({ eventId }, { status: "failed", error }).catch(() => {});
  }
}

export const paypalWebhookService = new PayPalWebhookService();
