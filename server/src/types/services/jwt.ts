/**
 * JWT Service Types
 *
 * Type definitions for JWT token operations
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  entitlements: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
