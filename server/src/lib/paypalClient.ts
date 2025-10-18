/**
 * PayPal Client Configuration
 * Configures and exports a singleton PayPal HTTP client for Orders v2 API
 */

import { env } from "@config/env.js";
import * as paypal from "@paypal/checkout-server-sdk";

/**
 * Get PayPal environment based on configuration
 * @returns PayPal Environment (Sandbox or Live)
 */
function getPayPalEnvironment(): paypal.core.PayPalEnvironment {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;
  const paypalEnv = env.PAYPAL_ENV || "sandbox";

  if (paypalEnv === "live") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * Singleton PayPal HTTP Client
 * Used for all PayPal Orders v2 API calls
 */
class PayPalClientSingleton {
  private static instance: paypal.core.PayPalHttpClient | null = null;

  static getClient(): paypal.core.PayPalHttpClient {
    if (!PayPalClientSingleton.instance) {
      const environment = getPayPalEnvironment();
      PayPalClientSingleton.instance = new paypal.core.PayPalHttpClient(environment);
    }
    return PayPalClientSingleton.instance;
  }

  /**
   * Reset client (useful for testing or config changes)
   */
  static reset(): void {
    PayPalClientSingleton.instance = null;
  }
}

/**
 * Export configured PayPal client
 */
export const paypalClient = PayPalClientSingleton.getClient();

/**
 * Export client getter for testing
 */
export const getPayPalClient = (): paypal.core.PayPalHttpClient => {
  return PayPalClientSingleton.getClient();
};

/**
 * Export reset for testing
 */
export const resetPayPalClient = (): void => {
  PayPalClientSingleton.reset();
};

/**
 * Export PayPal types and orders for convenience
 */
export const { orders } = paypal;
export type PayPalHttpClient = paypal.core.PayPalHttpClient;
