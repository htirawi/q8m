import { z } from "zod";

// Payment method schemas
export const paymentMethodSchema = z.enum(["paypal", "aps"]);

export const currencySchema = z.enum(["USD", "JOD", "SAR"]);

export const tierSchema = z.enum(["junior", "intermediate", "senior", "bundle"]);

// Purchase schemas
export const purchaseAmountSchema = z.object({
  displayCurrency: currencySchema,
  displayAmount: z.number().positive(),
  nativeCurrency: currencySchema,
  nativeAmount: z.number().positive(),
  fxRate: z.number().positive(),
  fxTimestamp: z.date(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: tierSchema,
  amount: purchaseAmountSchema,
  paymentMethod: paymentMethodSchema,
  paymentId: z.string().min(1),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  entitlements: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Payment creation schemas
export const createPaymentSchema = z.object({
  tierId: tierSchema,
  currency: currencySchema,
  paymentMethod: paymentMethodSchema,
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const paymentSuccessSchema = z.object({
  paymentId: z.string().min(1),
  payerId: z.string().optional(),
  token: z.string().optional(),
  signature: z.string().optional(),
});

export const paymentCancelSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().optional(),
});

// PayPal schemas
export const paypalWebhookSchema = z.object({
  event_type: z.string(),
  event_version: z.string(),
  create_time: z.string(),
  resource_type: z.string(),
  resource_version: z.string(),
  event_id: z.string(),
  summary: z.string().optional(),
  resource: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.object({
      total: z.string(),
      currency: z.string(),
    }),
    custom_id: z.string().optional(),
    description: z.string().optional(),
    payer: z
      .object({
        payer_info: z.object({
          email: z.string().email(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
        }),
      })
      .optional(),
  }),
  links: z
    .array(
      z.object({
        href: z.string(),
        rel: z.string(),
        method: z.string(),
      })
    )
    .optional(),
});

// APS schemas
export const apsWebhookSchema = z.object({
  merchant_reference: z.string(),
  fort_id: z.string(),
  response_message: z.string(),
  response_code: z.string(),
  amount: z.string(),
  currency: z.string(),
  customer_email: z.string().email().optional(),
  customer_name: z.string().optional(),
  command: z.string(),
  access_code: z.string(),
  merchant_identifier: z.string(),
  language: z.string(),
  signature: z.string(),
  payment_option: z.string().optional(),
  expiry_date: z.string().optional(),
  card_number: z.string().optional(),
  token_name: z.string().optional(),
  service_command: z.string().optional(),
  return_url: z.string().optional(),
  order_description: z.string().optional(),
  customer_ip: z.string().optional(),
  customer_name_ar: z.string().optional(),
  customer_name_en: z.string().optional(),
  merchant_extra: z.string().optional(),
  merchant_extra1: z.string().optional(),
  merchant_extra2: z.string().optional(),
  merchant_extra3: z.string().optional(),
  merchant_extra4: z.string().optional(),
  merchant_extra5: z.string().optional(),
  authorization_code: z.string().optional(),
  transaction_code: z.string().optional(),
  response_status: z.string(),
  created_date: z.string(),
  updated_date: z.string(),
});

// Entitlement schemas
export const entitlementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tier: tierSchema.transform((val) => val.toUpperCase()),
  expiresAt: z.date().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createEntitlementSchema = z.object({
  userId: z.string(),
  tier: tierSchema.transform((val) => val.toUpperCase()),
  expiresAt: z.date().optional(),
});

// Currency conversion schemas
export const currencyConversionSchema = z.object({
  originalAmount: z.number().positive(),
  originalCurrency: currencySchema,
  convertedAmount: z.number().positive(),
  convertedCurrency: currencySchema,
  rate: z.number().positive(),
  timestamp: z.date(),
});

export const currencyRateSchema = z.object({
  fromCurrency: currencySchema,
  toCurrency: currencySchema,
  rate: z.number().positive(),
  timestamp: z.date(),
  expiresAt: z.date(),
});

// Price snapshot schemas
export const priceSnapshotSchema = z.object({
  id: z.string(),
  tierId: tierSchema,
  displayCurrency: currencySchema,
  displayAmount: z.number().positive(),
  nativeCurrency: currencySchema,
  nativeAmount: z.number().positive(),
  fxRate: z.number().positive(),
  fxTimestamp: z.date(),
  createdAt: z.date(),
});

// Payment status schemas
export const paymentStatusSchema = z.object({
  paymentId: z.string(),
  status: z.enum(["pending", "completed", "failed", "refunded", "cancelled"]),
  amount: z.number().positive(),
  currency: currencySchema,
  paymentMethod: paymentMethodSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Payment history schemas
export const paymentHistorySchema = z.object({
  payments: z.array(purchaseSchema),
  total: z.number().nonnegative(),
  page: z.number().positive(),
  limit: z.number().positive(),
  hasMore: z.boolean(),
});

// Type exports
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type Tier = z.infer<typeof tierSchema>;
export type PurchaseAmount = z.infer<typeof purchaseAmountSchema>;
export type Purchase = z.infer<typeof purchaseSchema>;
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type PaymentSuccessRequest = z.infer<typeof paymentSuccessSchema>;
export type PaymentCancelRequest = z.infer<typeof paymentCancelSchema>;
export type PayPalWebhook = z.infer<typeof paypalWebhookSchema>;
export type APSWebhook = z.infer<typeof apsWebhookSchema>;
export type Entitlement = z.infer<typeof entitlementSchema>;
export type CreateEntitlementRequest = z.infer<typeof createEntitlementSchema>;
export type CurrencyConversion = z.infer<typeof currencyConversionSchema>;
export type CurrencyRate = z.infer<typeof currencyRateSchema>;
export type PriceSnapshot = z.infer<typeof priceSnapshotSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentHistory = z.infer<typeof paymentHistorySchema>;
