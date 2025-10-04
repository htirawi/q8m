// Error types for better type safety
export interface AppError extends Error {
  code?: string | number;
  statusCode?: number;
  details?: unknown;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: unknown;
}

export interface DatabaseError extends AppError {
  operation?: string;
  collection?: string;
}

export interface AuthenticationError extends AppError {
  reason?: string;
}

export interface PaymentError extends AppError {
  paymentId?: string;
  provider?: string;
}

// Generic error handler type
export type ErrorHandler = (error: unknown) => AppError;

// Common error types
export type KnownError = 
  | AppError 
  | ValidationError 
  | DatabaseError 
  | AuthenticationError 
  | PaymentError;

// Type guard functions
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error;
}

export function isValidationError(error: unknown): error is ValidationError {
  return isAppError(error) && 'field' in error;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return isAppError(error) && 'operation' in error;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return isAppError(error) && 'reason' in error;
}

export function isPaymentError(error: unknown): error is PaymentError {
  return isAppError(error) && 'paymentId' in error;
}
