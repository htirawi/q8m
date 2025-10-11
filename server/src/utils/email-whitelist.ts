import { env } from "@config/env.js";

/**
 * Check if an email is in the testing whitelist
 * 
 * Whitelisted emails bypass email verification for testing purposes.
 * Configure via TEST_EMAIL_WHITELIST environment variable (comma-separated)
 * 
 * @example
 * // In .env or environment:
 * TEST_EMAIL_WHITELIST=test@example.com,qa@example.com,admin@test.local
 * 
 * @param email - Email address to check
 * @returns true if email is whitelisted, false otherwise
 */
export function isEmailWhitelisted(email: string): boolean {
  // Only enable in development/test environments
  if (env.NODE_ENV === "production") {
    return false;
  }

  const whitelist = env.TEST_EMAIL_WHITELIST;
  if (!whitelist || whitelist.trim() === "") {
    return false;
  }

  // Parse comma-separated list and normalize emails
  const whitelistedEmails = whitelist
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  const normalizedEmail = email.trim().toLowerCase();

  return whitelistedEmails.includes(normalizedEmail);
}

/**
 * Get list of whitelisted emails for logging/debugging
 * Only returns list in non-production environments
 */
export function getWhitelistedEmails(): string[] {
  if (env.NODE_ENV === "production") {
    return [];
  }

  const whitelist = env.TEST_EMAIL_WHITELIST;
  if (!whitelist || whitelist.trim() === "") {
    return [];
  }

  return whitelist
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

