import { config } from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),

  // Database
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  MONGODB_DB_NAME: z.string().min(1, "MongoDB database name is required"),
  MONGODB_OPTIONS: z.string().optional(),

  // Auth / JWT
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),

  // Email Configuration
  SMTP_HOST: z.string().min(1, "SMTP host is required"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1, "SMTP user is required"),
  SMTP_PASS: z.string().min(1, "SMTP password is required"),
  EMAIL_FROM: z.string().email("Invalid email format"),
  EMAIL_FROM_NAME: z.string().default("Quiz Platform"),

  // PayPal Configuration (Orders v2 API)
  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.string().min(1, "PayPal Client ID is required"),
  PAYPAL_CLIENT_SECRET: z.string().min(1, "PayPal Client Secret is required"),
  PAYPAL_WEBHOOK_ID: z.string().min(1, "PayPal Webhook ID is required for webhook verification"),

  // Other Payment Gateways (optional -> feature toggles)

  APS_ACCESS_KEY: z.string().optional(),
  APS_MERCHANT_IDENTIFIER: z.string().optional(),
  APS_WEBHOOK_SECRET: z.string().optional(),

  HYPERPAY_API_KEY: z.string().optional(),
  HYPERPAY_MERCHANT_ID: z.string().optional(),
  HYPERPAY_WEBHOOK_SECRET: z.string().optional(),

  // Currency Exchange API
  EXCHANGE_RATE_API_KEY: z.string().optional(),

  // Security Configuration
  CSRF_SECRET: z.string().min(32, "CSRF secret must be at least 32 characters"),
  SIGNED_URL_SECRET: z
    .string()
    .min(32, "Signed URL secret must be at least 32 characters")
    .optional(),

  // Rate limiting
  RATE_LIMIT_USER_MAX: z.coerce.number().default(20),
  RATE_LIMIT_USER_WINDOW: z.string().default("15m"),
  LOGIN_FAIL_BASE_BLOCK_MS: z.coerce.number().default(60000),
  LOGIN_FAIL_MAX_BLOCK_MS: z.coerce.number().default(3600000),
  RATE_LIMIT_REDIS_URL: z.string().optional(),
  RATE_LIMIT_TRUST_PROXY: z.string().optional(),

  // Rate-limit HMAC
  HMAC_RATE_KEY_SECRET: z.string().min(32, "HMAC rate key secret must be at least 32 characters"),

  // API Configuration
  API_BASE_URL: z.string().url("Invalid API base URL"),
  CLIENT_URL: z.string().url("Invalid client URL").default("http://localhost:5173"),
  SERVER_URL: z.string().url("Invalid server URL").default("http://localhost:3000"),

  // CORS Configuration
  CORS_ORIGIN: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // File upload
  MAX_FILE_SIZE: z.string().default("10485760"), // 10MB

  // Package version
  npm_package_version: z.string().optional(),

  // Development security (only for development environment)
  DEV_LOGIN_SECRET: z
    .string()
    .min(32, "Dev login secret must be at least 32 characters")
    .optional(),
  DEV_LOGIN_WHITELIST: z.string().optional(),

  // API Key Configuration (for external integrations)
  API_KEY_ACTIVE: z.string().optional(),
  API_KEY_NEXT: z.string().optional(),
  API_KEY_ROTATION_GRACE_PERIOD_DAYS: z.coerce.number().default(7),
  API_KEY_ACTIVE_ID: z.string().optional(),
  API_KEY_NEXT_ID: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast on truly required envs (like DB/JWT). Payments are optional.
    const formatted = parsed.error.format();
    throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted, null, 2)}`);
  }
  return parsed.data;
}

export const env = loadEnv();
