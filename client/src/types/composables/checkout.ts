/**
 * Checkout Composable Types
 */

export interface BillingFormData {
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutFormErrors {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  paymentMethod?: string;
  terms?: string;
}
