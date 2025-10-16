import { secureCookieService } from "@services/secure-cookie.js";
import type { FastifyRequest, FastifyReply } from "fastify";


/**
 * CSRF protection middleware
 * Validates CSRF tokens for state-changing operations
 */
export function csrfMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return;
    }

    // Skip CSRF for public endpoints
    const publicPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/verify-email",
    ];

    if (publicPaths.some((path) => request.url.startsWith(path))) {
      return;
    }

    // Get CSRF token from header
    const csrfToken = request.headers["x-csrf-token"] as string;

    // Get CSRF token from cookie
    const cookieToken = request.cookies?.csrfToken;

    // Verify CSRF token
    if (
      !csrfToken ||
      !cookieToken ||
      !secureCookieService.verifyCSRFToken(csrfToken, cookieToken)
    ) {
      return reply.status(403).send({
        code: 403,
        error: "Forbidden",
        message: "Invalid CSRF token",
      });
    }
  };
}

/**
 * Generate and set CSRF token for authenticated users
 */
export function generateCSRFToken() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Only generate CSRF token for authenticated users
    if (!request.user) {
      return;
    }

    const csrfToken = secureCookieService.generateCSRFToken();
    secureCookieService.setCSRFTokenCookie(reply, csrfToken);

    // Add CSRF token to response headers for client access
    reply.header("X-CSRF-Token", csrfToken);
  };
}
