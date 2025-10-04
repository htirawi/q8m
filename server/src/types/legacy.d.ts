// Legacy type declarations to reduce TypeScript errors
// These are temporary fixes for legacy code that will be refactored

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
    _id: any;
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
    preferences?: any;
    stats?: any;
    isRevoked?: boolean;
    expiresAt?: Date;
    lastUsed?: Date;
    refreshToken?: string;
    accessToken?: string;
    revoke?(reason: string): Promise<void>;
    refresh?(): Promise<void>;
    markAsCompleted?(): Promise<void>;
    markAsFailed?(): Promise<void>;
    processRefund?(data: any): Promise<void>;
    cancel?(): Promise<void>;
    comparePassword?(password: string): Promise<boolean>;
    incLoginAttempts?(): Promise<void>;
    resetLoginAttempts?(): Promise<void>;
  }
  
  interface Model<T, TQueryHelpers = {}, TMethods = {}, TVirtuals = {}, TSchema = any> {
    findByEmailWithPassword?(email: string): Promise<any>;
    createToken?(userId: string, type: string, hours: number): Promise<any>;
    verifyToken?(token: string, type: string): Promise<any>;
    findActiveByAccessToken?(token: string): Promise<any>;
    findActiveByRefreshToken?(token: string): Promise<any>;
    revokeAllForUser?(userId: string, reason: string): Promise<any>;
    findByPaymentId?(paymentId: string): Promise<any>;
    findActiveForUser?(userId: string): Promise<any>;
    findExpiringSoon?(): Promise<any>;
    getSubscriptionStats?(): Promise<any>;
    getFreshRate?(from: string, to: string): Promise<any>;
    getLatestRate?(from: string, to: string): Promise<any>;
    createFallbackRate?(from: string, to: string, rate: number): Promise<any>;
    cleanupExpired?(): Promise<void>;
  }
}

// Temporary fixes for legacy service methods
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
  preferences?: any;
  stats?: any;
}

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

interface LegacyPurchaseMethods {
  markAsCompleted?(): Promise<void>;
  markAsFailed?(): Promise<void>;
  processRefund?(data: any): Promise<void>;
  findByPaymentId?(paymentId: string): Promise<any>;
}

interface LegacySubscriptionMethods {
  cancel?(): Promise<void>;
  findActiveForUser?(userId: string): Promise<any>;
  findExpiringSoon?(): Promise<any>;
  getSubscriptionStats?(): Promise<any>;
}

interface LegacyVerificationTokenMethods {
  createToken?(userId: string, type: string, hours: number): Promise<any>;
  verifyToken?(token: string, type: string): Promise<any>;
}

interface LegacyFxRateMethods {
  getFreshRate?(from: string, to: string): Promise<any>;
  getLatestRate?(from: string, to: string): Promise<any>;
  createFallbackRate?(from: string, to: string, rate: number): Promise<any>;
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
  interface FastifyBaseLogger {
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
  }
}

export {};
