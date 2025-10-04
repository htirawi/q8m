import { z } from "zod";

const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PORT: z.string().default("3000"),
  HOST: z.string().default("0.0.0.0"),

  // Database Configuration
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_OPTIONS: z.string().optional(),

  // Redis Configuration
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default("0"),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  FACEBOOK_APP_ID: z.string().min(1, "FACEBOOK_APP_ID is required"),
  FACEBOOK_APP_SECRET: z.string().min(1, "FACEBOOK_APP_SECRET is required"),
  FACEBOOK_REDIRECT_URI: z.string().optional(),

  // Email Configuration
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
  EMAIL_FROM_NAME: z.string().default("Quiz Platform"),

  // Payment Gateway Configuration
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_SECRET: z.string().optional(),

  APS_API_KEY: z.string().optional(),
  APS_MERCHANT_ID: z.string().optional(),
  APS_WEBHOOK_SECRET: z.string().optional(),

  HYPERPAY_API_KEY: z.string().optional(),
  HYPERPAY_MERCHANT_ID: z.string().optional(),
  HYPERPAY_WEBHOOK_SECRET: z.string().optional(),

  // Currency Exchange API
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  FX_CACHE_TTL: z.string().default("86400000"), // 24 hours

  // Security Configuration
  BCRYPT_ROUNDS: z.string().default("12"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
  CSRF_SECRET: z.string().min(32, "CSRF_SECRET must be at least 32 characters"),
  SIGNED_URL_SECRET: z
    .string()
    .min(32, "SIGNED_URL_SECRET must be at least 32 characters")
    .optional(),

  // CORS Configuration
  CORS_ORIGIN: z.string().optional(),
  CORS_CREDENTIALS: z.string().default("true"),

  // Monitoring & Logging
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FORMAT: z.enum(["combined", "common", "dev", "short", "tiny"]).default("combined"),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().default("10485760"), // 10MB
  UPLOAD_PATH: z.string().default("./uploads"),
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),

  // Cache Configuration
  CACHE_TTL: z.string().default("3600"), // 1 hour
  CACHE_MAX_ITEMS: z.string().default("1000"),

  // Admin Configuration
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),

  // Webhook Configuration
  WEBHOOK_SECRET: z.string().min(32, "WEBHOOK_SECRET must be at least 32 characters"),
  WEBHOOK_TIMEOUT: z.string().default("30000"), // 30 seconds

  // Feature Flags
  ENABLE_REGISTRATION: z.string().default("true"),
  ENABLE_OAUTH: z.string().default("true"),
  ENABLE_PAYMENTS: z.string().default("true"),
  ENABLE_ANALYTICS: z.string().default("true"),
  ENABLE_DEBUG_MODE: z.string().default("false"),

  // API Configuration
  API_BASE_URL: z.string().url("API_BASE_URL must be a valid URL"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:5173"),
  SERVER_URL: z.string().url("SERVER_URL must be a valid URL").default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
export { envSchema };

export type Env = z.infer<typeof envSchema>;
