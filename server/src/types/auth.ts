/**
 * Authentication Service Types
 */

/**
 * Result of session validation
 */
export interface SessionValidationResult {
  valid: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Result of token extraction
 */
export interface TokenExtractionResult {
  token: string | null;
  source: "header" | "cookie" | "none";
}
