/**
 * Auth Store Types
 *
 * Types specific to the auth Pinia store.
 * These types define the store's state, actions, and internal contracts.
 */

import type { User, AuthTokens, LoginFormData, RegisterFormData } from "@/types/domain/auth";

/**
 * Auth store state interface
 */
export interface AuthStoreState {
  // User data
  user: User | null;
  isAuthenticated: boolean;

  // Loading states
  isLoading: boolean;

  // Error states
  error: string | null;

  // Token management
  tokens: AuthTokens | null;
}

/**
 * Auth store actions interface
 */
export interface AuthStoreActions {
  // Authentication actions
  login(credentials: LoginFormData): Promise<boolean>;
  register(userData: RegisterFormData): Promise<boolean>;
  logout(): Promise<boolean>;
  logoutFromAllDevices(): Promise<boolean>;

  // Token management
  refreshToken(): Promise<boolean>;
  getCurrentUser(): Promise<boolean>;

  // Email verification
  verifyEmail(token: string): Promise<boolean>;
  resendVerificationEmail(email: string): Promise<boolean>;

  // Password management
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(token: string, password: string): Promise<boolean>;
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>;

  // State management
  setUser(user: User | null): void;
  setLoading(status: boolean): void;
  setError(message: string | null): void;
  setTokens(tokens: AuthTokens | null): void;

  // Initialization
  initializeAuth(): void;
}

/**
 * Auth store getters interface
 */
export interface AuthStoreGetters {
  // Computed user properties
  hasEntitlement: (entitlement: string) => boolean;
  isEmailVerified: boolean;
  userRole: string;

  // Computed auth state
  isLoggedIn: boolean;
  canAccess: (permission: string) => boolean;
}
