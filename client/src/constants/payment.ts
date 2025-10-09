/**
 * Payment Constants
 *
 * Payment gateway configurations and constants.
 */

export interface PaymentMethodConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  availableForCurrencies: string[];
  isDefault?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay securely with PayPal",
    icon: "/icons/paypal.svg",
    availableForCurrencies: ["USD", "SAR", "JOD"],
    isDefault: true,
  },
  {
    id: "aps",
    name: "Amazon Payment Services",
    description: "Pay with credit/debit card via APS",
    icon: "/icons/aps.svg",
    availableForCurrencies: ["SAR", "JOD"],
  },
  {
    id: "hyperpay",
    name: "HyperPay",
    description: "Pay with credit/debit card via HyperPay",
    icon: "/icons/hyperpay.svg",
    availableForCurrencies: ["SAR", "JOD"],
  },
];

export const getAvailablePaymentMethods = (currency: string): PaymentMethodConfig[] => {
  return PAYMENT_METHODS.filter((method) =>
    method.availableForCurrencies.includes(currency)
  );
};

export const getDefaultPaymentMethod = (currency: string): PaymentMethodConfig | undefined => {
  const available = getAvailablePaymentMethods(currency);
  return available.find((method) => method.isDefault) || available[0];
};

/**
 * Billing cycle discount percentage
 */
export const YEARLY_DISCOUNT_PERCENTAGE = 17;

/**
 * Calculate yearly discount multiplier (e.g., 0.83 for 17% discount)
 */
export const YEARLY_DISCOUNT_MULTIPLIER = 1 - YEARLY_DISCOUNT_PERCENTAGE / 100;
