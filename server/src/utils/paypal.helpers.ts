/**
 * PayPal Helper Utilities
 * Shared utilities for PayPal operations
 */

import { paymentRepository } from "@repositories/payment.repository.js";
import type { FastifyRequest } from "fastify";

/**
 * Handle errors with structured logging
 */
export function handlePayPalError(
  request: FastifyRequest,
  error: unknown,
  operation: string
): void {
  request.log.error({
    event: `paypal_${operation}_error`,
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });
}

/**
 * Handle capture errors with database update
 */
export async function handleCaptureError(
  request: FastifyRequest,
  orderID: string,
  error: unknown
): Promise<void> {
  handlePayPalError(request, error, "capture_order");

  try {
    await paymentRepository.markAsFailed(
      orderID,
      error instanceof Error ? error.message : "Unknown error"
    );
  } catch (dbError) {
    request.log.error({
      event: "paypal_capture_db_error",
      error: dbError instanceof Error ? dbError.message : "Unknown error",
    });
  }
}
