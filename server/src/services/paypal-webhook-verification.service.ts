/**
 * PayPal Webhook Verification Service
 * Implements PayPal SDK's official webhook signature verification
 *
 * SECURITY: This replaces the insecure HMAC-based verification (SEC-001 fix)
 */

import { env } from "@config/env.js";
import { paypalClient } from "@lib/paypalClient.js";
import { core } from "@paypal/checkout-server-sdk";
import type { PayPalWebhookEvent, WebhookHeaders } from "@schemas/paypal.schemas.js";

import type { PayPalWebhookVerificationResult as WebhookVerificationResult } from "../types/services/webhook";

export class PayPalWebhookVerificationService {
  /**
   * Verify PayPal webhook signature using PayPal's official SDK verification API
   *
   * @param webhookEvent - The complete webhook event payload from PayPal
   * @param headers - Webhook transmission headers containing signature data
   * @returns Verification result with status
   */
  async verifyWebhookSignature(
    webhookEvent: PayPalWebhookEvent,
    headers: WebhookHeaders
  ): Promise<WebhookVerificationResult> {
    try {
      const webhookId = env.PAYPAL_WEBHOOK_ID;

      if (!webhookId) {
        return {
          isValid: false,
          error: "PAYPAL_WEBHOOK_ID not configured - cannot verify webhook signature",
        };
      }

      // Extract required PayPal transmission headers
      const authAlgo = headers["paypal-auth-algo"];
      const certUrl = headers["paypal-cert-url"];
      const transmissionId = headers["paypal-transmission-id"];
      const transmissionSig = headers["paypal-transmission-sig"];
      const transmissionTime = headers["paypal-transmission-time"];

      // Validate all required headers are present
      if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
        return {
          isValid: false,
          error: "Missing required PayPal webhook headers",
        };
      }

      // Build PayPal verification API request
      const verifyRequest = this.buildVerificationRequest({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent,
      });

      // Call PayPal's verification endpoint
      const response = await paypalClient.execute(verifyRequest);
      const verificationStatus = response.result.verification_status;

      return {
        isValid: verificationStatus === "SUCCESS",
        verificationStatus,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown verification error";

      return {
        isValid: false,
        error: `Webhook verification failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Build PayPal webhook signature verification request
   * PayPal API: POST /v1/notifications/verify-webhook-signature
   */
  private buildVerificationRequest(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookId: string;
    webhookEvent: PayPalWebhookEvent;
  }): core.PayPalHttpRequest {
    const request = new core.PayPalHttpRequest("/v1/notifications/verify-webhook-signature");
    request.verb = "POST";
    request.headers["Content-Type"] = "application/json";

    request.requestBody({
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: params.webhookId,
      webhook_event: params.webhookEvent,
    });

    return request;
  }
}

/**
 * Export singleton instance
 */
export const paypalWebhookVerificationService = new PayPalWebhookVerificationService();
