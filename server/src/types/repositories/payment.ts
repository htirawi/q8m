/**
 * Payment Repository Types
 *
 * Type definitions for payment repository operations
 */

import type { PaymentGatewayResponse } from "../payment-gateway";

export interface PaymentRecord {
  userId: string;
  orderId: string;
  paymentId: string;
  captureId?: string;
  gateway: "paypal" | "aps" | "hyperpay";
  status: "pending" | "completed" | "failed" | "refunded";
  amount: {
    currency: string;
    value: string;
  };
  items: Array<{
    type: string;
    name: string;
    price: {
      currency: string;
      value: string;
    };
  }>;
  customer: {
    email: string;
    name: string;
  };
  payerEmail?: string;
  gatewayResponse?: PaymentGatewayResponse;
  metadata?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CaptureData {
  captureId: string;
  status: string;
  payerEmail?: string;
  gatewayResponse?: PaymentGatewayResponse;
}
