/**
 * Application Constants
 * Centralized location for all magic strings and values
 */

// ============================================
// HTTP Constants
// ============================================

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  ACCEPT: "Accept",
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
} as const;

// Common headers object
export const JSON_HEADERS = {
  [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
} as const;

// ============================================
// Authentication Constants
// ============================================

export const AUTH_CONSTANTS = {
  COOKIE_BASED_TOKEN: "cookie-based",
  TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  BEARER_PREFIX: "Bearer",
  DEV_WHITELIST: ["dev@example.com"] as readonly string[],
} as const;

// ============================================
// LocalStorage Keys
// ============================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  AUTH_TOKEN: "auth_token", // Legacy - should be removed
  PREFERRED_CURRENCY: "preferred_currency",
  THEME: "theme",
  LOCALE: "locale",
  USER_LAST_MODE: "user_last_mode",
  USER_INCOMPLETE_QUIZ: "user_incomplete_quiz",
  USER_UI_PREFERENCES: "user_ui_preferences",
} as const;

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ============================================
// Business Logic Constants
// ============================================

export const CURRENCIES = {
  USD: "USD",
  JOD: "JOD",
  SAR: "SAR",
} as const;

export const SUPPORTED_CURRENCIES = [CURRENCIES.USD, CURRENCIES.JOD, CURRENCIES.SAR] as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export const EXPERIENCE_LEVELS = {
  JUNIOR: "junior",
  INTERMEDIATE: "intermediate",
  SENIOR: "senior",
} as const;

export const PLAN_TIERS = {
  FREE: "free",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  PRO: "pro",
} as const;

// ============================================
// UI Constants
// ============================================

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ============================================
// Type Exports
// ============================================

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS];
export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];
