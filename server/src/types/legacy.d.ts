// Legacy type declarations to reduce TypeScript errors
// These are temporary fixes for legacy code that will be refactored

import type {
  UserPreferences,
  UserStats,
  RefundData,
  SubscriptionData,
  UserMethodResult,
  TokenMethodResult,
  SessionMethodResult,
  PaymentMethodResult,
  SubscriptionMethodResult,
  FxRateMethodResult,
  LoggerMethods,
} from "@server/types/common.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;
      MONGODB_URI?: string;
      JWT_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      CLIENT_URL?: string;
      EMAIL_HOST?: string;
      EMAIL_PORT?: string;
      EMAIL_USER?: string;
      EMAIL_PASS?: string;
      REDIS_URL?: string;
      PAYPAL_CLIENT_ID?: string;
      PAYPAL_CLIENT_SECRET?: string;
      HYPERPAY_ENTITY_ID?: string;
      HYPERPAY_ACCESS_TOKEN?: string;
      HYPERPAY_WEBHOOK_SECRET?: string;
      APS_ENTITY_ID?: string;
      APS_ACCESS_TOKEN?: string;
      APS_WEBHOOK_SECRET?: string;
    }
  }
}

// Temporary type fixes for legacy Mongoose models
declare module "mongoose" {
  interface Document {
    _id: string;
    id: string;
    isActive?: boolean;
    entitlements?: string[];
    password?: string;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorSecret?: string;
    lockUntil?: Date;
    preferences?: UserPreferences;
    stats?: UserStats;
    isRevoked?: boolean;
    expiresAt?: Date;
    lastUsed?: Date;
    refreshToken?: string;
    accessToken?: string;
    revoke?(reason: string): Promise<void>;
    refresh?(): Promise<void>;
    markAsCompleted?(): Promise<void>;
    markAsFailed?(): Promise<void>;
    processRefund?(data: RefundData): Promise<void>;
    cancel?(): Promise<void>;
    comparePassword?(password: string): Promise<boolean>;
    incLoginAttempts?(): Promise<void>;
    resetLoginAttempts?(): Promise<void>;
  }

  interface Model<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _TQueryHelpers = Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _TMethods = Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _TVirtuals = Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _TSchema = unknown,
  > {
    findByEmailWithPassword?(email: string): UserMethodResult;
    createToken?(userId: string, type: string, hours: number): TokenMethodResult;
    verifyToken?(token: string, type: string): TokenMethodResult;
    findActiveByAccessToken?(token: string): SessionMethodResult;
    findActiveByRefreshToken?(token: string): SessionMethodResult;
    revokeAllForUser?(userId: string, reason: string): Promise<void>;
    findByPaymentId?(paymentId: string): PaymentMethodResult;
    findActiveForUser?(userId: string): SubscriptionMethodResult;
    findExpiringSoon?(): Promise<SubscriptionData[]>;
    getSubscriptionStats?(): Promise<{ active: number; expired: number; trial: number }>;
    getFreshRate?(from: string, to: string): FxRateMethodResult;
    getLatestRate?(from: string, to: string): FxRateMethodResult;
    createFallbackRate?(from: string, to: string, rate: number): FxRateMethodResult;
    cleanupExpired?(): Promise<void>;
  }
}

// Temporary fixes for legacy service methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyUserMethods {
  comparePassword?(password: string): Promise<boolean>;
  incLoginAttempts?(): Promise<void>;
  resetLoginAttempts?(): Promise<void>;
  isActive?: boolean;
  entitlements?: string[];
  password?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorSecret?: string;
  lockUntil?: Date;
  preferences?: UserPreferences;
  stats?: UserStats;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacySessionMethods {
  revoke?(reason: string): Promise<void>;
  refresh?(): Promise<void>;
  isActive?: boolean;
  isRevoked?: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  refreshToken?: string;
  accessToken?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyPurchaseMethods {
  markAsCompleted?(): Promise<void>;
  markAsFailed?(): Promise<void>;
  processRefund?(data: RefundData): Promise<void>;
  findByPaymentId?(paymentId: string): PaymentMethodResult;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacySubscriptionMethods {
  cancel?(): Promise<void>;
  findActiveForUser?(userId: string): SubscriptionMethodResult;
  findExpiringSoon?(): Promise<SubscriptionData[]>;
  getSubscriptionStats?(): Promise<{ active: number; expired: number; trial: number }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyVerificationTokenMethods {
  createToken?(userId: string, type: string, hours: number): TokenMethodResult;
  verifyToken?(token: string, type: string): TokenMethodResult;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyFxRateMethods {
  getFreshRate?(from: string, to: string): FxRateMethodResult;
  getLatestRate?(from: string, to: string): FxRateMethodResult;
  createFallbackRate?(from: string, to: string, rate: number): FxRateMethodResult;
  cleanupExpired?(): Promise<void>;
}

// Type assertion helpers for legacy code
declare global {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    entitlements: string[];
    isEmailVerified: boolean;
  }

  // Fix for logger method signatures
  interface FastifyBaseLogger extends LoggerMethods {
    // Additional methods can be added here if needed
    trace?: (message: string, ...args: unknown[]) => void;
  }
}

export {};
