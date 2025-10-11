/**
 * PayPal Controller
 * Handles PayPal payment operations with security best practices
 */

import * as crypto from "crypto";

import { env } from "@config/env.js";
import { buildPayPalRequestId } from "@lib/idempotency.js";
import type { IPurchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { WebhookEvent } from "@models/WebhookEvent.js";
import { paymentRepository } from "@repositories/payment.repository.js";
import type {
  CreateOrderRequest,
  CaptureOrderRequest,
  PayPalWebhookEvent,
  WebhookHeaders,
} from "@schemas/paypal.schemas.js";
import { paypalService } from "@services/paypal.service.js";
import { paypalWebhookVerificationService } from "@services/paypal-webhook-verification.service.js";
import { pricingService } from "@services/pricing.service.js";
import type { FastifyRequest, FastifyReply } from "fastify";

export class PayPalController {
  /**
   * Create PayPal Order
   */
  async createOrder(
    request: FastifyRequest<{ Body: CreateOrderRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { userId, cartId, items, currency_code, planType, billingCycle } = request.body;

    request.log.info({
      event: "paypal_create_order_start",
      userId,
      planType,
      currency: currency_code,
    });

    try {
      const { orderItems, totalAmount } = await this.buildOrderItems(
        planType,
        items,
        currency_code,
        billingCycle
      );

      const requestId = buildPayPalRequestId(cartId || `plan-${planType}-${Date.now()}`, userId);
      const paypalOrder = await paypalService.createOrder({
        userId,
        orderItems,
        totalAmount,
        currency_code,
        requestId,
      });

      await this.savePaymentRecord({
        userId,
        paypalOrderId: paypalOrder.id,
        totalAmount,
        currency_code,
        orderItems,
        planType,
        billingCycle,
        requestId,
        items,
      });

      request.log.info({
        event: "paypal_order_created",
        orderID: paypalOrder.id,
        userId,
      });

      reply.send({ success: true, orderID: paypalOrder.id });
    } catch (error: unknown) {
      this.handleError(request, error, "create_order");
      reply.status(500).send({ success: false, error: "Failed to create PayPal order" });
    }
  }

  /**
   * Capture PayPal Order
   */
  async captureOrder(
    request: FastifyRequest<{ Body: CaptureOrderRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { orderID } = request.body;

    request.log.info({ event: "paypal_capture_order_start", orderID });

    try {
      const payment = await paymentRepository.findByOrderId(orderID);
      if (!payment) {
        return reply.status(404).send({ success: false, error: "Payment record not found" });
      }

      if (payment.status === "completed") {
        request.log.info({ event: "paypal_capture_duplicate", orderID });
        return reply.send({
          success: true,
          status: "completed",
          captureID: payment.paymentId,
          message: "Order already captured",
        });
      }

      const captureData = await paypalService.captureOrder(orderID);
      const { captureID, captureStatus, payerEmail } = this.extractCaptureDetails(captureData);

      await paymentRepository.updateCapture(orderID, {
        captureId: captureID,
        status: captureStatus === "COMPLETED" ? "completed" : "pending",
        payerEmail,
        gatewayResponse: captureData,
      });

      if (captureStatus === "COMPLETED") {
        await paymentRepository.markAsCompleted(orderID, captureData);
        await this.createSubscription(payment, request);
      }

      request.log.info({ event: "paypal_order_captured", orderID, captureID, status: captureStatus });

      reply.send({
        success: true,
        status: captureStatus === "COMPLETED" ? "completed" : "pending",
        captureID,
        payerEmail,
      });
    } catch (error: unknown) {
      await this.handleCaptureError(request, orderID, error);
      reply.status(500).send({ success: false, error: "Failed to capture PayPal order" });
    }
  }

  /**
   * Handle PayPal Webhook
   * SECURITY: Uses PayPal SDK verification and event deduplication
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
        return reply.status(400).send({ success: false, error: "Invalid webhook signature" });
      }

      const isDuplicate = await this.checkDuplicateWebhook(webhookEvent.id);
      if (isDuplicate) {
        request.log.info({ event: "paypal_webhook_duplicate", eventId: webhookEvent.id });
        return reply.send({ success: true });
      }

      await this.storeWebhookEvent(webhookEvent);
      await this.processWebhookEvent(webhookEvent, request);
      await this.markWebhookProcessed(webhookEvent.id);

      return reply.send({ success: true });
    } catch (error: unknown) {
      await this.handleWebhookError(request, webhookEvent.id, error);
      return reply.status(500).send({ success: false, error: "Webhook processing failed" });
    }
  }

  /**
   * Webhook Event Handlers
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

    await paymentRepository.markAsCompleted(payment.paymentId, undefined);
    await this.createSubscription(payment, request);

    request.log.info({
      event: "paypal_webhook_capture_completed_processed",
      captureId,
      userId: payment.userId,
    });
  }

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
      request.log.warn({ event: "paypal_webhook_refund_no_capture_link", refundId: resource.id });
      return;
    }

    const payment = await paymentRepository.findByCaptureId(captureId);
    if (payment) {
      payment.status = "refunded";
      await payment.save();

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
   * Create subscription after successful payment
   */
  private async createSubscription(payment: IPurchase, request?: FastifyRequest): Promise<void> {
    const user = await User.findById(payment.userId);
    if (!user) throw new Error("User not found");

    const existingSubscription = await Subscription.findOne({
      purchaseId: payment._id,
      status: "active",
    });

    if (existingSubscription) {
      request?.log.info({
        event: "subscription_already_exists",
        purchaseId: payment._id,
        subscriptionId: existingSubscription._id,
      });
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
      metadata: { originalPurchaseCurrency: payment.amount.currency },
    });

    await subscription.save();

    user.entitlements = subscription.entitlements;
    await user.save();

    request?.log.info({
      event: "subscription_created",
      userId: user._id,
      subscriptionId: subscription._id,
      planType: subscription.planType,
    });
  }

  /**
   * Helper Methods
   */
  private async buildOrderItems(
    planType?: string,
    items?: Array<{ id: string; name: string; qty: number; unit_amount: number }>,
    currency_code?: string,
    billingCycle?: string
  ): Promise<{
    orderItems: Array<{
      name: string;
      unit_amount: { currency_code: string; value: string };
      quantity: string;
    }>;
    totalAmount: number;
  }> {
    if (planType && currency_code) {
      const planPricing = await pricingService.getPlanPricing(
        planType as "INTERMEDIATE" | "SENIOR" | "BUNDLE",
        currency_code as "USD" | "JOD" | "SAR"
      );

      if (!planPricing || !planPricing.pricing[currency_code]) {
        throw new Error("Invalid plan type or currency");
      }

      const priceInfo = planPricing.pricing[currency_code];
      return {
        orderItems: [
          {
            name: `${planType} Plan - ${billingCycle}`,
            unit_amount: { currency_code, value: priceInfo.amount.toFixed(2) },
            quantity: "1",
          },
        ],
        totalAmount: priceInfo.amount,
      };
    }

    if (items && items.length > 0 && currency_code) {
      const orderItems = items.map((item) => ({
        name: item.name,
        unit_amount: { currency_code, value: item.unit_amount.toFixed(2) },
        quantity: item.qty.toString(),
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.unit_amount * item.qty, 0);
      return { orderItems, totalAmount };
    }

    throw new Error("Either planType or items must be provided");
  }

  private async savePaymentRecord(params: {
    userId: string;
    paypalOrderId: string;
    totalAmount: number;
    currency_code: string;
    orderItems: Array<{
      name: string;
      unit_amount: { currency_code: string; value: string };
      quantity: string;
    }>;
    planType?: string;
    billingCycle?: string;
    requestId: string;
    items?: Array<{ id: string; name: string; qty: number; unit_amount: number }>;
  }): Promise<void> {
    const user = await User.findById(params.userId);
    const internalOrderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await paymentRepository.create({
      userId: params.userId,
      orderId: internalOrderId,
      paymentId: params.paypalOrderId,
      gateway: "paypal",
      status: "pending",
      amount: { currency: params.currency_code, value: params.totalAmount.toFixed(2) },
      items: params.orderItems.map((item, idx) => ({
        type: (params.planType as "INTERMEDIATE" | "SENIOR" | "BUNDLE") || params.items?.[idx]?.id || "ITEM",
        name: item.name,
        price: { currency: params.currency_code, value: item.unit_amount.value },
      })),
      customer: { email: user?.email || "", name: user?.name || "" },
      metadata: {
        planType: params.planType || "",
        billingCycle: params.billingCycle || "",
        requestId: params.requestId,
      },
    });
  }

  private extractCaptureDetails(captureData: {
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string; status: string }> };
    }>;
    payer?: { email_address?: string };
  }): { captureID: string; captureStatus: string; payerEmail?: string } {
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      throw new Error("No capture found in PayPal response");
    }

    return {
      captureID: capture.id,
      captureStatus: capture.status,
      payerEmail: captureData.payer?.email_address,
    };
  }

  private async checkDuplicateWebhook(eventId: string): Promise<boolean> {
    const existingEvent = await WebhookEvent.findOne({ eventId });
    return !!existingEvent;
  }

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

  private async processWebhookEvent(
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
        request.log.info({ event: "paypal_webhook_unhandled", eventType: webhookEvent.event_type });
    }
  }

  private async markWebhookProcessed(eventId: string): Promise<void> {
    await WebhookEvent.updateOne(
      { eventId },
      { processedAt: new Date(), status: "processed" }
    );
  }

  private handleError(request: FastifyRequest, error: unknown, operation: string): void {
    request.log.error({
      event: `paypal_${operation}_error`,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  private async handleCaptureError(
    request: FastifyRequest,
    orderID: string,
    error: unknown
  ): Promise<void> {
    this.handleError(request, error, "capture_order");
    try {
      await paymentRepository.markAsFailed(
        orderID,
        error instanceof Error ? error.message : "Unknown error"
      );
    } catch (dbError) {
      request.log.error({
        event: "paypal_capture_db_error",
        error: dbError instanceof Error ? dbError.message : "Unknown error",
      });
    }
  }

  private async handleWebhookError(
    request: FastifyRequest,
    eventId: string,
    error: unknown
  ): Promise<void> {
    this.handleError(request, error, "webhook");
    await WebhookEvent.updateOne(
      { eventId },
      { status: "failed", error: error instanceof Error ? error.message : "Unknown error" }
    ).catch(() => {});
  }
}

/**
 * Export singleton instance
 */
export const paypalController = new PayPalController();
