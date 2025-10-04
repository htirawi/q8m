import { z } from "zod";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  // Database
  MONGODB_URI: z.string().min(1),
  MONGODB_OPTIONS: z.string().optional(),
  // Auth / JWT
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  // OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  FACEBOOK_APP_ID: z.string().min(1),
  FACEBOOK_APP_SECRET: z.string().min(1),
  // Email Configuration
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default("Quiz Platform"),
  // Payments (optional -> feature toggles)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_SECRET: z.string().optional(),
  APS_ACCESS_KEY: z.string().optional(),
  APS_MERCHANT_IDENTIFIER: z.string().optional(),
  APS_WEBHOOK_SECRET: z.string().optional(),
  HYPERPAY_API_KEY: z.string().optional(),
  HYPERPAY_MERCHANT_ID: z.string().optional(),
  HYPERPAY_WEBHOOK_SECRET: z.string().optional(),
  // Currency Exchange API
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  // Security Configuration
  CSRF_SECRET: z.string().min(32),
  SIGNED_URL_SECRET: z.string().min(32).optional(),
  // Rate limiting
  RATE_LIMIT_USER_MAX: z.string().default("20"),
  RATE_LIMIT_USER_WINDOW: z.string().default("15m"),
  LOGIN_FAIL_BASE_BLOCK_MS: z.string().default("60000"),
  LOGIN_FAIL_MAX_BLOCK_MS: z.string().default("3600000"),
  RATE_LIMIT_REDIS_URL: z.string().optional(),
  // Rate-limit HMAC
  HMAC_RATE_KEY_SECRET: z.string().default("change-me"),
  // API Configuration
  API_BASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  SERVER_URL: z.string().url().default("http://localhost:3000"),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): AppEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast on truly required envs (like DB/JWT). Payments are optional.
    const formatted = parsed.error.format();
    throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`);
  }
  return parsed.data;
}

export const env = loadEnv();
