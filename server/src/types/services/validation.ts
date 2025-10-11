/**
 * Input Validation Service Types
 *
 * Type definitions for input validation operations
 */

export interface ValidationResult {
  success: boolean;
  data?: Record<string, string | number | boolean>;
  errors?: string[];
}
