import crypto from "crypto";
import { env } from "../config/env.js";

export interface WebhookVerificationOptions {
  signature: string;
  payload: string | Buffer;
  secret: string;
  algorithm?: string;
}

export class WebhookVerificationService {
  /**
   * Verify webhook signature
   */
  verifySignature(options: WebhookVerificationOptions): boolean {
    const { signature, payload, secret, algorithm = "sha256" } = options;

    if (!signature || !payload || !secret) {
      return false;
    }

    try {
      // Extract signature from header (format: "sha256=hash")
      const expectedSignature = signature.replace(/^sha256=/, "");

      // Calculate expected signature
      const calculatedSignature = crypto
        .createHmac(algorithm, secret)
        .update(payload)
        .digest("hex");

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(calculatedSignature, "hex")
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  }

  /**
   * Verify PayPal webhook signature
   */
  verifyPayPalWebhook(signature: string, payload: string): boolean {
    const secret = env.PAYPAL_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("PayPal webhook secret not configured");
      return false;
    }

    return this.verifySignature({
      signature,
      payload,
      secret,
    });
  }

  /**
   * Verify APS webhook signature
   */
  verifyAPSWebhook(signature: string, payload: string): boolean {
    const secret = env.APS_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("APS webhook secret not configured");
      return false;
    }

    return this.verifySignature({
      signature,
      payload,
      secret,
    });
  }

  /**
   * Verify HyperPay webhook signature
   */
  verifyHyperPayWebhook(signature: string, payload: string): boolean {
    const secret = env.HYPERPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("HyperPay webhook secret not configured");
      return false;
    }

    return this.verifySignature({
      signature,
      payload,
      secret,
    });
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  /**
   * Verify idempotency key format
   */
  isValidIdempotencyKey(key: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
  }
}

export const webhookVerificationService = new WebhookVerificationService();
