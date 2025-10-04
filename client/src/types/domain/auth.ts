/**
 * Auth Domain Types
 *
 * Types related to authentication, user management, and authorization.
 * These types are shared across the application and should be imported
 * from this centralized location.
 */

// Re-export shared auth types for convenience
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@shared/types/auth";

/**
 * Authentication tokens for client-side state management
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Form data for login form
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Form data for registration form
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Token pair for authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
