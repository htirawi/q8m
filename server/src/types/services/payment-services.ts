/**
 * Payment Services Types
 *
 * Type definitions for payment service implementations (PayPal, HyperPay, Mock, APS)
 */

import type { Plan } from "@shared/types/pricing";

// ============================================================================
// PayPal Service Types
// ============================================================================

export interface PayPalPaymentRequest {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  userId: string;
  userEmail: string;
  userName: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalPaymentResponse {
  id: string;
  state: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  paymentId: string;
  approvalUrl: string;
  orderId: string;
}

export interface PayPalWebhookData {
  id: string;
  event_type: string;
  resource: Record<string, string | number | boolean>;
  create_time: string;
}

// ============================================================================
// HyperPay Service Types
// ============================================================================

export interface HyperPayPaymentRequest {
  planType: Plan;
  currency: "USD" | "JOD" | "SAR";
  amount: number;
  billingCycle: "monthly" | "yearly";
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  ipAddress?: string;
  userAgent?: string;
  customerEmail: string;
  customerName: string;
}

export interface HyperPayPaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  paymentId: string;
  purchaseId: string;
  error?: string;
}

export interface HyperPayWebhookData {
  id: string;
  entity: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    notes: {
      planType?: string;
      billingCycle?: string;
      userId?: string;
    };
    payment_id: string;
    created_at: number;
    updated_at: number;
  };
  event: string;
}

// ============================================================================
// Mock Payment Service Types
// ============================================================================

export interface MockPaymentRequest {
  planType: Plan;
  currency: "USD" | "JOD" | "SAR";
  amount: number;
  billingCycle: "monthly" | "yearly";
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  customerEmail: string;
  customerName: string;
}

export interface MockPaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  paymentId: string;
  purchaseId: string;
  error?: string;
}

export interface MockPayment {
  id: string;
  purchaseId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  amount: number;
  currency: string;
  planType: Plan;
  billingCycle: "monthly" | "yearly";
  userId: string;
  customerEmail: string;
  customerName: string;
}

export interface MockWebhookData {
  id: string;
  event: string;
  data: Record<string, string | number | boolean>;
}

// ============================================================================
// APS Service Types
// ============================================================================

export interface APSPaymentRequest {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  userId: string;
  userEmail: string;
  userName: string;
  returnUrl: string;
  cancelUrl: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface APSPaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  orderId: string;
}

export interface APSWebhookData {
  event: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
  };
  signature: string;
  timestamp: string;
}
