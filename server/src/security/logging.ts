/**
 * Structured logging utilities for preventing log injection attacks
 */

import { createHash, randomUUID } from "crypto";

const CONTROL_CHARS = /[\r\n\t\u2028\u2029]/g;
const MAX_LEN = 2048;

/**
 * Sanitize input for logging to prevent log injection
 * @param input - The input to sanitize
 * @returns Sanitized string safe for logging
 */
export function sanitizeForLog(input: unknown): string {
  const s = String(input ?? "");
  return s.replace(CONTROL_CHARS, " ").slice(0, MAX_LEN);
}

/**
 * Create safe log fields object with sanitized values
 * @param fields - Object containing fields to log
 * @returns Object with sanitized field values
 */
export function safeLogFields(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === "string") {
      out[k] = sanitizeForLog(v);
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (v == null) {
      out[k] = v;
    } else if (typeof v === "object" && !Array.isArray(v)) {
      // Recursively sanitize nested objects
      out[k] = safeLogFields(v as Record<string, unknown>);
    } else {
      out[k] = sanitizeForLog(JSON.stringify(v));
    }
  }
  return out;
}

/**
 * Create a short hash of input for logging (to avoid PII)
 * @param input - The input to hash
 * @returns Short hash string
 */
export function shortHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 8);
}

/**
 * Mask sensitive data for logging
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked string
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return "*".repeat(value.length);
  }
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/**
 * Mask email for logging
 * @param email - The email to mask
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return maskSensitive(email, 2);

  const maskedLocal = maskSensitive(localPart || "", 2);

  // Preserve dot structure in domain while masking
  const domainParts = domain.split(".");
  if (domainParts.length > 1) {
    const tld = domainParts[domainParts.length - 1] || "";
    const maskedDomainBase = "*".repeat(domain.length - tld.length - 1);
    return `${maskedLocal}@${maskedDomainBase}.${tld}`;
  }

  const maskedDomain = maskSensitive(domain, 3);
  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Create a correlation ID for request tracking
 * @returns Unique correlation ID
 */
export function createCorrelationId(): string {
  return randomUUID();
}

/**
 * Log payment events safely
 * @param logger - Fastify logger instance
 * @param event - Event name
 * @param data - Event data
 */
export function logPaymentEvent(
  logger: { info: (data: unknown) => void },
  event: string,
  data: Record<string, unknown>
): void {
  const safeData = safeLogFields({
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });

  logger.info(safeData);
}

/**
 * Log authentication events safely
 * @param logger - Fastify logger instance
 * @param event - Event name
 * @param data - Event data
 */
export function logAuthEvent(
  logger: { info: (data: unknown) => void },
  event: string,
  data: Record<string, unknown>
): void {
  const safeData = safeLogFields({
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });

  logger.info(safeData);
}

/**
 * Log error events safely
 * @param logger - Fastify logger instance
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(
  logger: { error: (data: unknown) => void },
  error: Error,
  context: Record<string, unknown> = {}
): void {
  const safeData = safeLogFields({
    event: "error",
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });

  logger.error(safeData);
}
