/**
 * Simple logger utility that respects ESLint rules (only console.error and console.warn allowed)
 * In production, only errors and warnings are logged
 * In development, info logs are shown via console.error with INFO prefix
 */

const isProduction = process.env.NODE_ENV === "production";
const isTesting = process.env.NODE_ENV === "test";

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, ...args: unknown[]): void => {
    if (!isProduction && !isTesting) {
      console.error(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (message: string, ...args: unknown[]): void => {
    if (!isTesting) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Log error messages
   */
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};
