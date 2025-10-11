import type { Document } from "mongoose";

// Common MongoDB document type with proper typing
export interface MongooseDocument extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fastify request with proper typing
export interface AuthenticatedRequest {
  authUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    entitlements: string[];
    isEmailVerified: boolean;
  };
  sessionId?: string;
}

// Common error response type
export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  errorCode?: string;
}

// Common success response type
export interface SuccessResponse<T = Record<string, string | number | boolean>> {
  success: boolean;
  data?: T;
  message?: string;
}

// Payment gateway response types
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  approvalUrl?: string;
  orderId?: string;
  error?: string;
}

// Webhook response types
export interface WebhookResponse {
  success: boolean;
  error?: string;
}

// Webhook resource data
export interface WebhookResourceData {
  id: string;
  state?: string;
  status?: string;
  amount?: {
    total: string;
    currency: string;
    details?: Record<string, string | number>;
  };
  sale_id?: string;
  parent_payment?: string;
  [key: string]: string | number | boolean | WebhookAmountData | undefined;
}

export interface WebhookAmountData {
  total: string;
  currency: string;
  details?: Record<string, string | number>;
}

// Service configuration status
export interface ServiceStatus {
  configured: boolean;
  mode?: string;
  clientId?: string | null;
}

// Common logging fields
export interface LogFields {
  event: string;
  error?: string;
  stack?: string;
  userId?: string;
  [key: string]: string | number | boolean | undefined;
}

// Currency conversion result
export interface CurrencyConversion {
  convertedAmount: number;
  exchangeRate: number;
  originalAmount: number;
  originalCurrency: string;
  targetCurrency: string;
}

// Rate limit context
export interface RateLimitContext {
  ttl: number;
  max: number;
}

// JWT payload types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions?: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Mongoose query result types
export type MongooseQueryResult<T> = T | null;
export type MongooseQueryResults<T> = T[];

// Common service response types
export interface ServiceResponse<T = Record<string, string | number | boolean>> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServiceError {
  ok: false;
  code: string;
}

// Payment service specific types
export interface PaymentRequest {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  userId: string;
  userEmail: string;
  userName: string;
  returnUrl: string;
  cancelUrl: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Webhook data types
export interface WebhookData {
  event_type: string;
  resource: WebhookResourceData;
  id: string;
  create_time: string;
  event_version: string;
}

// Common validation error
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: string | number | boolean;
}

// Pagination types
export interface PaginationParams {
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    skip: number;
    hasMore: boolean;
    total?: number;
  };
}
