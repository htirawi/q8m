/**
 * URL Service Types
 *
 * Type definitions for signed URL operations
 */

export interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 1 hour
  userId?: string;
  resource?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SignedUrlData {
  url: string;
  expiresAt: Date;
  signature: string;
}
