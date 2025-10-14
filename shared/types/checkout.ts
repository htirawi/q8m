/**
 * Checkout Types
 * Shared types for payment and checkout functionality
 */

import type { PlanTier } from "./plan";

export type BillingCycle = "monthly" | "annual";

export type CheckoutStep = "plan_selection" | "checkout" | "processing" | "success" | "error";

export type PaymentProvider = "stripe" | "paypal" | "aps" | "hyperpay";

export interface PlanOption {
  tier: PlanTier;
  cycle: BillingCycle;
  price: number;
  currency: string;
  discountPercent?: number;
  isRecommended?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  provider: PaymentProvider;
  last4: string;
  type: "card" | "paypal";
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CheckoutSession {
  sessionId: string;
  planTier: PlanTier;
  cycle: BillingCycle;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  embedUrl?: string; // For iframe checkout
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank_transfer";
  provider: PaymentProvider;
  isDefault: boolean;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export interface CheckoutFormData {
  planTier: PlanTier;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod | null;
  useExistingPayment: boolean;
  savePaymentMethod: boolean;
}

export interface CheckoutError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}
