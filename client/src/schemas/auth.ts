import { z } from "zod";

/**
 * Email validation schema
 * - Required
 * - Must be valid email format
 */
export const emailSchema = z
  .string()
  .min(1, "auth.validation.emailRequired")
  .email("auth.validation.emailInvalid");

/**
 * Password validation schema
 * - Required
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(1, "auth.validation.passwordRequired")
  .min(8, "auth.validation.passwordMinLength")
  .regex(/[A-Z]/, "auth.validation.passwordUppercase")
  .regex(/[a-z]/, "auth.validation.passwordLowercase")
  .regex(/[0-9]/, "auth.validation.passwordNumber");

/**
 * Name validation schema
 * - Required
 * - Minimum 2 characters
 * - Trimmed
 */
export const nameSchema = z
  .string()
  .min(1, "auth.validation.nameRequired")
  .transform((val) => val.trim())
  .refine((val) => val.length >= 2, {
    message: "auth.validation.nameMinLength",
  });

/**
 * Terms acceptance validation schema
 * - Must be true
 */
export const acceptTermsSchema = z.boolean().refine((val) => val === true, {
  message: "auth.validation.acceptTermsRequired",
});

/**
 * Email step validation schema
 * Used when user enters email to check if account exists
 */
export const emailStepSchema = z.object({
  email: emailSchema,
});

/**
 * Login form validation schema
 * Used when email exists and user is signing in
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Register form validation schema
 * Used when email doesn't exist and user is creating account
 */
export const registerFormSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
  acceptTerms: acceptTermsSchema,
});

// Export types
export type EmailStepInput = z.infer<typeof emailStepSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
