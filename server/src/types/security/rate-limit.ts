/**
 * Rate Limit Types
 *
 * Type definitions for rate limiting operations
 */

export interface RateLimitOptions {
  max?: number;
  timeWindow?: string;
  keyMode?: "ip" | "combo";
}

export interface LoginFailureData {
  count: number;
  lastAttempt: number;
  blockUntil?: number;
}
