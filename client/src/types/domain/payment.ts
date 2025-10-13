/**
 * Payment Domain Types
 *
 * Types related to payments, subscriptions, pricing, and entitlements.
 * These types are shared across the application and should be imported
 * from this centralized location.
 */

// Re-export shared payment types for convenience
export type {
  PricingTier,
  CurrencyRate,
  Purchase,
  Entitlement,
  PriceSnapshot,
  CurrencyConversion,
  PricingResponse,
} from "@shared/types/pricing";

/**
 * Pricing information for a specific currency
 */
export interface PricingInfo {
  currency: string;
  amount: number;
  formatted: string;
  exchangeRate?: number;
  isEstimated: boolean;
}

/**
 * Plan pricing structure
 */
export interface PlanPricing {
  planId: string;
  name: string;
  description: string;
  features: string[];
  usdPrice: number;
  pricing: Record<string, PricingInfo>;
  popular?: boolean;
  recommended?: boolean;
}

/**
 * Subscription information
 */
export interface Subscription {
  id: string;
  planType: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  billingCycle: string;
  price: {
    currency: string;
    amount: string;
  };
  entitlements: string[];
  isActive: boolean;
  daysRemaining: number;
  isInTrial: boolean;
}

/**
 * Payment request structure
 */
export interface PaymentRequest {
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  currency: "USD" | "JOD" | "SAR";
  billingCycle: "monthly" | "annual";
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Payment response structure
 */
export interface PaymentResponse {
  success: boolean;
  paymentGateway: string;
  paymentId: string;
  checkoutUrl: string;
  orderId: string;
  amount: number;
  currency: string;
  planType: string;
  billingCycle: string;
  isEstimated: boolean;
}

/**
 * Currency exchange rates
 */
export interface CurrencyRates {
  USD: number;
  JOD: number;
  SAR: number;
  lastUpdated: string;
}

/**
 * User entitlements
 */
export interface UserEntitlements {
  userId: string;
  entitlements: string[];
  activeSubscription: {
    planType: string;
    status: string;
    expiresAt: string;
    isInTrial: boolean;
  } | null;
  isActive: boolean;
  lastChecked: string;
}

/**
 * Entitlement check result
 */
export interface EntitlementCheck {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  subscriptionExpired?: boolean;
  trialExpired?: boolean;
}

/**
 * Content access information
 */
export interface ContentAccess {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
}

/**
 * Signed download URL
 */
export interface SignedDownloadUrl {
  downloadUrl: string;
  expiresAt: string;
  filePath: string;
  category: string;
  requiredLevel: string;
}

/**
 * Content category information
 */
export interface ContentCategory {
  category: string;
  level: string;
  description: string;
}

/**
 * Billing form data
 */
export interface BillingFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "paypal" | "apple_pay" | "google_pay";
  icon: string;
  isDefault?: boolean;
}

/**
 * Currency information
 */
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
}

/**
 * Geographic location information
 */
export interface GeoLocationInfo {
  country: string;
  currency: string;
  timezone: string;
}

/**
 * Payment callback data
 */
export interface PaymentCallbackData {
  paymentId?: string;
  payerId?: string;
  orderId?: string;
  status?: string;
  amount?: number;
  currency?: string;
}

/**
 * Entitlement guard options
 */
export interface EntitlementGuardOptions {
  requiredEntitlement?: string;
  requiredContentLevel?: string;
  allowTrial?: boolean;
  showUpgradePrompt?: boolean;
}
