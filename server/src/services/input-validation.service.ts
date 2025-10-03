import { z } from "zod";
import { createHash } from "crypto";

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

export class InputValidationService {
  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, ""); // Remove event handlers
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): boolean {
    const emailSchema = z.string().email();
    return emailSchema.safeParse(email).success;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number, currency: string): ValidationResult {
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (amount > 10000) {
      errors.push("Amount exceeds maximum limit");
    }

    // Currency-specific validation
    const currencyLimits: Record<string, number> = {
      USD: 10000,
      JOD: 7000,
      SAR: 37500,
    };

    const maxAmount = currencyLimits[currency];
    if (maxAmount && amount > maxAmount) {
      errors.push(`Amount exceeds maximum limit for ${currency}`);
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate billing address
   */
  validateBillingAddress(address: any): ValidationResult {
    const addressSchema = z.object({
      street: z.string().min(1).max(100),
      city: z.string().min(1).max(50),
      state: z.string().min(1).max(50),
      postalCode: z.string().min(1).max(20),
      country: z.string().length(2), // ISO country code
    });

    const result = addressSchema.safeParse(address);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(err => err.message),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Validate payment request
   */
  validatePaymentRequest(request: any): ValidationResult {
    const paymentSchema = z.object({
      planType: z.enum(["INTERMEDIATE", "SENIOR", "BUNDLE"]),
      currency: z.enum(["USD", "JOD", "SAR"]),
      billingCycle: z.enum(["monthly", "yearly"]),
      billingAddress: z.object({
        street: z.string().min(1).max(100),
        city: z.string().min(1).max(50),
        state: z.string().min(1).max(50),
        postalCode: z.string().min(1).max(20),
        country: z.string().length(2),
      }),
      idempotencyKey: z.string().uuid().optional(),
    });

    const result = paymentSchema.safeParse(request);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(err => err.message),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Sanitize and validate user input
   */
  sanitizeUserInput(input: any): any {
    if (typeof input === "string") {
      return this.sanitizeString(input);
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeUserInput(value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Generate request hash for integrity checking
   */
  generateRequestHash(payload: any): string {
    const payloadString = JSON.stringify(payload);
    return createHash("sha256").update(payloadString).digest("hex");
  }

  /**
   * Validate request integrity
   */
  validateRequestIntegrity(payload: any, expectedHash: string): boolean {
    const actualHash = this.generateRequestHash(payload);
    return actualHash === expectedHash;
  }
}

export const inputValidationService = new InputValidationService();
