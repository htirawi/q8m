/**
 * Billing Domain Types
 */

export type BillingCycle = "monthly" | "annual";

export interface BillingFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
}
