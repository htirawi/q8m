/**
 * Environment Configuration
 *
 * Type-safe access to environment variables
 */

/**
 * Get environment variable with fallback
 */
export const getEnv = (key: string, fallback: string = ""): string => {
  const value = import.meta.env[key];
  return typeof value === "string" ? value : fallback;
};

/**
 * Get base URL for the application
 */
export const getBaseUrl = (): string => {
  return getEnv("VITE_CLIENT_URL", "https://quiz-platform.com");
};

/**
 * Get API URL
 */
export const getApiUrl = (): string => {
  return getEnv("VITE_API_URL", "http://localhost:3000");
};

/**
 * Check if running in development mode
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV === true;
};

/**
 * Check if running in production mode
 */
export const isProd = (): boolean => {
  return import.meta.env.PROD === true;
};

/**
 * Get current mode
 */
export const getMode = (): string => {
  return import.meta.env.MODE ?? "development";
};
