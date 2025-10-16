/**
 * Constants Types
 */

export interface ICountry {
  code: string;
  name: string;
  currency: string;
  flag?: string;
}

export interface IPaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  supportedCurrencies: string[];
  processingFee?: number;
}

export interface ICancelReason {
  id: string;
  label: string;
  requiresFeedback?: boolean;
}

export type IPlanTier = "free" | "intermediate" | "advanced" | "pro";
export type IBillingCycle = "monthly" | "yearly";
