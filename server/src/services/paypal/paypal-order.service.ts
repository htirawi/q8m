/**
 * PayPal Order Service
 * Handles PayPal order creation and capture operations
 */

import * as crypto from "crypto";

import { buildPayPalRequestId } from "@lib/idempotency.js";
import { User } from "@models/User.js";
import { paymentRepository } from "@repositories/payment.repository.js";
import type { CreateOrderRequest } from "@schemas/paypal.schemas.js";
import { paypalService } from "@services/paypal.service.js";
import { pricingService } from "@services/pricing.service.js";

export class PayPalOrderService {
  /**
   * Create a new PayPal order
   */
  async createOrder(orderData: CreateOrderRequest) {
    const { userId, cartId, items, currency_code, planType, billingCycle } = orderData;

    // Build order items and calculate total
    const { orderItems, totalAmount } = await this.buildOrderItems(
      planType,
      items,
      currency_code,
      billingCycle
    );

    // Generate idempotency key
    const requestId = buildPayPalRequestId(cartId || `plan-${planType}-${Date.now()}`, userId);

    // Create PayPal order
    const paypalOrder = await paypalService.createOrder({
      userId,
      orderItems,
      totalAmount,
      currency_code,
      requestId,
    });

    // Save payment record to database
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

    return { orderID: paypalOrder.id };
  }

  /**
   * Capture a PayPal order
   */
  async captureOrder(orderID: string) {
    // Find payment record
    const payment = await paymentRepository.findByOrderId(orderID);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Check if already captured
    if (payment.status === "completed") {
      return {
        status: "completed",
        captureID: payment.paymentId,
        message: "Order already captured",
        payment,
      };
    }

    // Capture the order via PayPal
    const captureData = await paypalService.captureOrder(orderID);

    // Type cast to extract capture details
    const rawCaptureData = captureData as unknown as {
      purchase_units?: Array<{
        payments?: { captures?: Array<{ id: string; status: string }> };
      }>;
      payer?: { email?: string; email_address?: string };
    };

    const capture = rawCaptureData.purchase_units?.[0]?.payments?.captures?.[0];

    if (!capture) {
      throw new Error("No capture found in PayPal response");
    }

    const captureID = capture.id;
    const captureStatus = capture.status;
    const payerEmail = rawCaptureData.payer?.email_address || rawCaptureData.payer?.email;

    // Update payment record
    await paymentRepository.updateCapture(orderID, {
      captureId: captureID,
      status: captureStatus === "COMPLETED" ? "completed" : "pending",
      payerEmail,
      gatewayResponse: captureData,
    });

    // Mark as completed if successful
    if (captureStatus === "COMPLETED") {
      await paymentRepository.markAsCompleted(orderID, captureData);
    }

    return {
      status: captureStatus === "COMPLETED" ? "completed" : "pending",
      captureID,
      payerEmail,
      payment,
    };
  }

  /**
   * Build order items from plan type or custom items
   */
  private async buildOrderItems(
    planType?: string,
    items?: Array<{ id: string; name: string; qty: number; unit_amount: number }>,
    currency_code?: string,
    billingCycle?: string
  ) {
    if (planType && currency_code) {
      const planPricing = await pricingService.getPlanPricing(
        planType as "INTERMEDIATE" | "SENIOR" | "BUNDLE",
        currency_code as "USD" | "JOD" | "SAR"
      );

      if (!planPricing?.pricing[currency_code]) {
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

  /**
   * Save payment record to database
   */
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
  }) {
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
        type:
          (params.planType as "INTERMEDIATE" | "SENIOR" | "BUNDLE") ||
          params.items?.[idx]?.id ||
          "ITEM",
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
}

export const paypalOrderService = new PayPalOrderService();
