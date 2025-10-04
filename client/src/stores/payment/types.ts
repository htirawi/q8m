/**
 * Payment Store Types
 *
 * Types specific to the payment Pinia store.
 * These types define the store's state, actions, and internal contracts.
 */

import type {
  PricingInfo,
  PlanPricing,
  Purchase,
  Subscription,
  PaymentRequest,
  PaymentResponse,
  CurrencyRates,
  UserEntitlements,
  EntitlementCheck,
  ContentAccess,
  SignedDownloadUrl,
  // ContentCategory
} from "@/types/domain/payment";

/**
 * Payment store state interface
 */
export interface PaymentStoreState {
  // Pricing data
  pricingTiers: PlanPricing[];
  currencyRates: CurrencyRates;
  selectedCurrency: string;

  // User entitlements
  userEntitlements: UserEntitlements | null;

  // Purchase history
  purchases: Purchase[];
  subscriptions: Subscription[];

  // Loading states
  isLoadingPricing: boolean;
  isLoadingEntitlements: boolean;
  isLoadingPurchases: boolean;

  // Error states
  error: string | null;
}

/**
 * Payment store actions interface
 */
export interface PaymentStoreActions {
  // Pricing actions
  fetchPricingTiers(): Promise<void>;
  updateCurrencyRates(): Promise<void>;
  setSelectedCurrency(currency: string): void;

  // Entitlement actions
  fetchUserEntitlements(): Promise<void>;
  checkEntitlement(entitlement: string): Promise<EntitlementCheck>;
  checkContentAccess(category: string, level: string): Promise<ContentAccess>;

  // Purchase actions
  fetchPurchases(): Promise<void>;
  fetchSubscriptions(): Promise<void>;
  createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse>;

  // Download actions
  getSignedDownloadUrl(category: string, filename: string): Promise<SignedDownloadUrl>;

  // Utility actions
  clearError(): void;
  reset(): void;
}

/**
 * Payment store getters interface
 */
export interface PaymentStoreGetters {
  // Computed pricing
  formattedPricing: Record<string, Record<string, PricingInfo>>;
  currentPricing: Record<string, PricingInfo>;

  // Computed entitlements
  hasEntitlement: (entitlement: string) => boolean;
  userTier: string | null;
  isEntitled: boolean;

  // Computed purchases
  activeSubscriptions: Subscription[];
  totalSpent: number;
  lastPurchase: Purchase | null;
}
