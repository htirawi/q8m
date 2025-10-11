/**
 * Component Emits Types
 *
 * Centralized emit interfaces for all UI components
 */

export interface ErrorBoundaryEmits {
  (e: "error", error: Error, info: string): void;
  (e: "retry"): void;
}

export interface LoginFormEmits {
  (e: "show-forgot-password"): void;
  (e: "show-register"): void;
}

