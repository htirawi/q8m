/**
 * Permissions-Policy Middleware
 *
 * Custom implementation of Permissions-Policy header
 * (not yet supported in current @fastify/helmet version)
 *
 * Restricts access to powerful browser features:
 * - camera, microphone, geolocation (blocked)
 * - payment (allowed for PayPal)
 * - fullscreen (allowed for app)
 */

import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Permissions-Policy configuration
 */
export const PERMISSIONS_POLICY_CONFIG = {
  camera: [], // No access
  microphone: [], // No access
  geolocation: [], // No access
  payment: ["self"], // Allow for PayPal
  usb: [], // No access
  magnetometer: [], // No access
  accelerometer: [], // No access
  gyroscope: [], // No access
  fullscreen: ["self"], // Allow for app
  "display-capture": [], // No access
  "document-domain": [], // No access
  "encrypted-media": ["self"], // Allow for app
  "picture-in-picture": ["self"], // Allow for app
  "publickey-credentials-get": [], // No access (use credentials API sparingly)
  "screen-wake-lock": [], // No access
  "web-share": ["self"], // Allow for app
  "xr-spatial-tracking": [], // No access
};

/**
 * Build Permissions-Policy header value
 */
function buildPermissionsPolicyHeader(
  config: Record<string, string[]> = PERMISSIONS_POLICY_CONFIG
): string {
  return Object.entries(config)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.join(" ")})`;
    })
    .join(", ");
}

/**
 * Permissions-Policy middleware
 *
 * Adds Permissions-Policy header to all responses
 */
export async function permissionsPolicyMiddleware(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const headerValue = buildPermissionsPolicyHeader();
  reply.header("Permissions-Policy", headerValue);
}

/**
 * Get current Permissions-Policy configuration
 */
export function getPermissionsPolicyConfig(): Record<string, string[]> {
  return { ...PERMISSIONS_POLICY_CONFIG };
}

/**
 * Export header value for testing
 */
export const PERMISSIONS_POLICY_HEADER = buildPermissionsPolicyHeader();
