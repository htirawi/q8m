/**
 * Auth Middleware Types
 *
 * Type definitions for authentication middleware
 */

export interface AuthOptions {
  requireEmailVerification?: boolean;
  requiredRole?: string[];
  requiredEntitlements?: string[];
  allowExpiredTokens?: boolean;
}
