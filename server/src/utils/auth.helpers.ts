/**
 * Auth Helpers
 * Common utilities and error responses for authentication
 */

import type { FastifyReply, FastifyRequest } from "fastify";

import type { ISession } from "@models/Session";
import type { IUser } from "@models/User";

/**
 * Standard error responses for authentication
 */
export const AuthErrors = {
  MISSING_TOKEN: {
    code: 401,
    error: "Unauthorized",
    message: "Missing or invalid authorization header",
  },
  INVALID_TOKEN: {
    code: 401,
    error: "Unauthorized",
    message: "Invalid access token",
  },
  TOKEN_EXPIRED: {
    code: 401,
    error: "Unauthorized",
    message: "Access token expired",
    errorCode: "TOKEN_EXPIRED",
  },
  SESSION_NOT_FOUND: {
    code: 401,
    error: "Unauthorized",
    message: "Session not found or expired",
  },
  USER_NOT_FOUND: {
    code: 401,
    error: "Unauthorized",
    message: "User not found or inactive",
  },
  EMAIL_NOT_VERIFIED: {
    code: 403,
    error: "Forbidden",
    message: "Email verification required",
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 403,
    error: "Forbidden",
    message: "Insufficient permissions",
  },
  INSUFFICIENT_ENTITLEMENTS: {
    code: 403,
    error: "Forbidden",
    message: "Insufficient entitlements",
  },
  INTERNAL_ERROR: {
    code: 500,
    error: "Internal Server Error",
    message: "Authentication failed",
  },
} as const;

/**
 * Send authentication error response
 */
export function sendAuthError(
  reply: FastifyReply,
  error: (typeof AuthErrors)[keyof typeof AuthErrors]
): void {
  reply.status(error.code).send(error);
}

/**
 * Attach authenticated user to request
 */
export function attachAuthUser(
  request: FastifyRequest,
  user: IUser,
  session: ISession
): void {
  request.authUser = {
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    entitlements: user.entitlements,
    isEmailVerified: user.isEmailVerified,
  };
  request.sessionId = (session._id as { toString(): string }).toString();
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);

  request.log.error({ error: errorMessage }, "Authentication error");

  // Map known errors to appropriate responses
  if (errorMessage.includes("Missing or invalid authorization header")) {
    sendAuthError(reply, AuthErrors.MISSING_TOKEN);
  } else if (errorMessage.includes("Access token expired")) {
    sendAuthError(reply, AuthErrors.TOKEN_EXPIRED);
  } else if (errorMessage.includes("Invalid token")) {
    sendAuthError(reply, AuthErrors.INVALID_TOKEN);
  } else if (errorMessage.includes("Session not found")) {
    sendAuthError(reply, AuthErrors.SESSION_NOT_FOUND);
  } else if (errorMessage.includes("User not found")) {
    sendAuthError(reply, AuthErrors.USER_NOT_FOUND);
  } else {
    sendAuthError(reply, AuthErrors.INTERNAL_ERROR);
  }
}
