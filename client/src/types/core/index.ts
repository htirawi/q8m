/**
 * Core Types
 * 
 * Fundamental types used across the application.
 * These are utility types, primitives, and common patterns.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing in next PR */

/**
 * Toast notification structure
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  createdAt: Date;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

/**
 * PWA install prompt
 */
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
}

/**
 * Resource timing information
 */
export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

/**
 * SEO data structure
 */
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
}

/**
 * Error state for error handling
 */
export interface ErrorState {
  message: string | null;
  code: string | null;
  details?: any;
}

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

/**
 * Webhook verification options
 */
export interface WebhookVerificationOptions {
  signature: string;
  payload: string | Buffer;
  secret: string;
}

/**
 * Secure cookie options
 */
export interface SecureCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  domain?: string;
  path?: string;
}

/**
 * Signed URL options
 */
export interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 1 hour
  userId?: string;
  permissions?: string[];
}

/**
 * Signed URL data
 */
export interface SignedUrlData {
  url: string;
  expiresAt: Date;
  permissions?: string[];
}

/**
 * Email template structure
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email options
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Middleware options
 */
export interface AuthOptions {
  requireEmailVerification?: boolean;
  requiredRole?: string[];
}

/**
 * Entitlement middleware options
 */
export interface EntitlementOptions {
  requiredEntitlement: string;
  allowTrial?: boolean;
}
