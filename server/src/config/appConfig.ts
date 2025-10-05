import { env } from "./env";

export const features = {
  paypal: Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET),
  aps: Boolean(env.APS_ACCESS_KEY && env.APS_MERCHANT_IDENTIFIER),
  hyperpay: Boolean(env.HYPERPAY_API_KEY && env.HYPERPAY_MERCHANT_ID),
} as const;
