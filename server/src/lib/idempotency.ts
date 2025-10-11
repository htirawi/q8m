/**
 * Idempotency Utilities for PayPal
 * Generates deterministic request IDs to prevent duplicate order creation
 */

import * as crypto from "crypto";

/**
 * Build a deterministic PayPal-Request-Id from cart/user identifiers
 * This ensures the same cart/user combination always generates the same request ID
 * PayPal will reject duplicate requests with the same ID within a time window
 *
 * @param cartId - Shopping cart or order identifier
 * @param userId - User identifier
 * @returns Deterministic request ID (max 36 chars as per PayPal spec)
 */
export function buildPayPalRequestId(cartId: string, userId: string): string {
  const input = `${cartId}:${userId}`;
  const hash = crypto.createHash("sha256").update(input).digest("hex");

  // PayPal-Request-Id should be max 36 characters
  // Use first 36 chars of hash for deterministic ID
  return hash.substring(0, 36);
}

/**
 * Generate a unique request ID for non-idempotent operations
 * Use this for operations that should never be deduplicated
 *
 * @returns Unique UUID v4
 */
export function generateUniqueRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Validate request ID format
 * PayPal requires: alphanumeric, hyphens, max 36 chars
 *
 * @param requestId - Request ID to validate
 * @returns True if valid format
 */
export function isValidRequestId(requestId: string): boolean {
  if (!requestId || requestId.length > 36) {
    return false;
  }

  // Only alphanumeric and hyphens allowed
  return /^[a-zA-Z0-9-]+$/.test(requestId);
}
