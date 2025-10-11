/**
 * Input Validation Service Types
 *
 * Type definitions for input validation operations
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}
