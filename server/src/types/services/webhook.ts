/**
 * Webhook Service Types
 *
 * Type definitions for webhook verification operations
 */

export interface WebhookVerificationOptions {
  signature: string;
  payload: string | Buffer;
  secret: string;
  algorithm?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  message?: string;
  error?: string;
}

export interface PayPalWebhookVerificationResult {
  isValid: boolean;
  verificationStatus?: string;
  error?: string;
}
