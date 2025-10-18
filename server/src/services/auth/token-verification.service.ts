/**
 * Token Verification Service
 * Handles JWT token extraction and verification
 */

import type { JWTPayload } from "@server/types/common";
import { jwtService } from "@services/jwt.js";
import type { FastifyRequest } from "fastify";

export interface TokenExtractionResult {
  token: string;
  payload: JWTPayload;
}

export class TokenVerificationService {
  /**
   * Extract token from Authorization header or cookies
   * Checks Bearer token first, then falls back to accessToken cookie
   */
  extractToken(request: FastifyRequest): string | null {
    // First, try to get token from Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Fall back to accessToken cookie (used by OAuth)
    const cookieToken = request.cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  /**
   * Verify access token and return payload
   */
  verifyToken(token: string, allowExpired: boolean = false): JWTPayload {
    try {
      return jwtService.verifyAccessToken(token);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;

      // If token is expired but we allow expired tokens, decode without verification
      if (errorMessage === "Access token expired" && allowExpired) {
        const payload = jwtService.decodeToken(token);
        if (!payload) {
          throw new Error("Invalid token");
        }
        return payload as JWTPayload;
      }

      // Re-throw the error with the original message
      throw error;
    }
  }

  /**
   * Extract and verify token in one step
   */
  extractAndVerify(request: FastifyRequest, allowExpired: boolean = false): TokenExtractionResult {
    const token = this.extractToken(request);
    if (!token) {
      throw new Error("Missing or invalid authorization header");
    }

    const payload = this.verifyToken(token, allowExpired);
    return { token, payload };
  }

  /**
   * Optional token extraction and verification
   * Returns null if no token or invalid, doesn't throw
   */
  extractAndVerifyOptional(request: FastifyRequest): TokenExtractionResult | null {
    try {
      const token = this.extractToken(request);
      if (!token) {
        return null;
      }

      const payload = this.verifyToken(token, false);
      return { token, payload };
    } catch (error) {
      request.log.debug(
        { error: error instanceof Error ? error.message : String(error) },
        "Optional token verification failed"
      );
      return null;
    }
  }
}

export const tokenVerificationService = new TokenVerificationService();
