/**
 * Database Model Types
 *
 * Type definitions for Mongoose models
 */

import type { Document } from "mongoose";

// ============================================================================
// User Model Types
// ============================================================================

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  displayName?: string;
  role: "user" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  entitlements: string[];
  trialStartDate?: Date;
  trialEndDate?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============================================================================
// Session Model Types
// ============================================================================

export interface ISession extends Document {
  _id: string;
  userId: string;
  refreshToken: string;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Purchase Model Types
// ============================================================================

export interface IPurchase extends Document {
  _id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  gateway: "paypal" | "aps" | "hyperpay" | "mock";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  billingCycle: "monthly" | "yearly";
  payerEmail?: string;
  captureId?: string;
  gatewayResponse?: Record<string, string | number | boolean>;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Subscription Model Types
// ============================================================================

export interface ISubscription extends Document {
  _id: string;
  userId: string;
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentGateway: "paypal" | "aps" | "hyperpay" | "mock";
  purchaseId?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Question Model Types
// ============================================================================

export interface IQuestion extends Document {
  _id: string;
  questionContent: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  framework: string;
  level: "JUNIOR" | "INTERMEDIATE" | "SENIOR";
  tags: string[];
  points: number;
  estimatedTime: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FxRate Model Types
// ============================================================================

export interface IFxRate extends Document {
  _id: string;
  baseCurrency: "USD";
  rates: {
    USD: number;
    JOD: number;
    SAR: number;
  };
  source: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VerificationToken Model Types
// ============================================================================

export interface IVerificationToken extends Document {
  _id: string;
  userId: string;
  token: string;
  type: "email" | "password-reset";
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WebhookEvent Model Types
// ============================================================================

export interface IWebhookEvent extends Document {
  _id: string;
  provider: "paypal" | "hyperpay" | "aps";
  eventId: string;
  eventType: string;
  payload: Record<string, string | number | boolean>;
  processed: boolean;
  processedAt?: Date;
  processingError?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
