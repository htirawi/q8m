import * as crypto from "crypto";

import { features } from "@config/appConfig";
import { connectDatabase } from "@config/database";
import { env } from "@config/env";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import oauth2 from "@fastify/oauth2";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import authPlugin, { createAuthMiddleware, type AuthOptions } from "@middlewares/auth.middleware";
import { errorHandler } from "@middlewares/error.middleware";
import { requestLogger } from "@middlewares/logger.middleware";
import { permissionsPolicyMiddleware } from "@middlewares/permissions-policy.middleware";
import adminRoutes from "@routes/admin";
import authRoutes from "@routes/auth";
import challengeRoutes from "@routes/challenges";
import checkoutRoutes from "@routes/checkout";
import couponRoutes from "@routes/coupons";
import devEmailRoutes from "@routes/dev-emails";
import discussionRoutes from "@routes/discussions";
import entitlementRoutes from "@routes/entitlements";
import friendsRoutes from "@routes/friends";
import gamificationRoutes from "@routes/gamification";
import learningPathRoutes from "@routes/learning-paths";
// Notification routes removed - was using Express controllers (dead code)
import paymentRoutes from "@routes/payments";
import paypalRoutes from "@routes/paypal";
import plansRoutes from "@routes/plans";
import pricingRoutes from "@routes/pricing";
import progressRoutes from "@routes/progress";
import questionRoutes from "@routes/questions";
import quizResultsRoutes from "@routes/quiz-results";
import seoRoutes from "@routes/seo";
import shareRoutes from "@routes/shares";
import usersRoutes from "@routes/users";
import rateLimitPlugin from "@server/security/rateLimit";
import { notificationScheduler } from "@services/notification-scheduler";
import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    redact: {
      paths: [
        "req.headers.authorization",
        "body.password",
        "body.token",
        "body.card",
        "query.token",
      ],
      remove: true,
    },
  },
  trustProxy: env.RATE_LIMIT_TRUST_PROXY === "true",
  requestIdHeader: "x-request-id",
  requestIdLogLabel: "reqId",
  genReqId: () => crypto.randomUUID(),
});

// Register error handler
fastify.setErrorHandler((error, request, reply) => {
  return errorHandler(error, request, reply);
});

// Register request logger
fastify.addHook("onRequest", requestLogger);

// Register Permissions-Policy middleware
fastify.addHook("onRequest", permissionsPolicyMiddleware);

// Register response logger
fastify.addHook("onSend", async (request, reply, payload) => {
  const { startTime } = request as FastifyRequest & { startTime?: number };
  if (startTime) {
    const responseTime = Date.now() - startTime;
    const { log, method, url } = request;
    log.info({
      type: "response",
      method,
      url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: reply.getHeader("content-length"),
    });
  }
  return payload;
});

// Register plugins
async function registerPlugins() {
  // CORS - fail fast in production if CORS_ORIGIN not configured
  if (env.NODE_ENV === "production" && !env.CORS_ORIGIN) {
    throw new Error(
      "CORS_ORIGIN must be set in production environment. " +
        "Set it to a comma-separated list of allowed origins (e.g., 'https://example.com,https://www.example.com')"
    );
  }

  await fastify.register(cors, {
    // In development, fallback to localhost:5173 if not set
    // In production, CORS_ORIGIN is required (checked above)
    origin:
      env.CORS_ORIGIN?.split(",") ||
      (env.NODE_ENV === "development" ? ["http://localhost:5173"] : true),
    credentials: env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Security headers (Enhanced)
  // ✅ SECURITY FIX (SEC-002): PayPal domains whitelisted in CSP
  // ✅ SECURITY ENHANCEMENT (SEC-003): Comprehensive security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        // Allow PayPal SDK scripts
        "script-src": ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
        "style-src": [
          "'self'",
          "'unsafe-inline'", // Required for Tailwind & PayPal
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
          "https://www.paypalobjects.com",
        ],
        // Allow PayPal API connections
        "connect-src": [
          "'self'",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
          "https://api.paypal.com",
          "https://api.sandbox.paypal.com",
        ],
        // Allow PayPal checkout iframe
        "frame-src": ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
        "frame-ancestors": ["'none'"],
      },
    },
    xssFilter: true,
    // HSTS for production
    strictTransportSecurity:
      env.NODE_ENV === "production"
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
          }
        : false,
    // ✅ NEW: X-Content-Type-Options
    noSniff: true,
    // ✅ NEW: Referrer-Policy (Helmet uses "no-referrer" by default which is more secure)
    referrerPolicy: { policy: "no-referrer" },
    // Allow PayPal popup windows
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting plugin (per-route configuration)
  await fastify.register(rateLimit, {
    global: false,
    hook: "onRequest",
  });

  // Cookies
  await fastify.register(cookie, {
    secret: env.JWT_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
    verify: {
      maxAge: env.JWT_EXPIRES_IN,
    },
  });

  // OAuth2 (for Google)
  await fastify.register(oauth2, {
    name: "googleOAuth2",
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
      auth: {
        authorizeHost: "https://accounts.google.com",
        authorizePath: "/o/oauth2/v2/auth",
        tokenHost: "https://www.googleapis.com",
        tokenPath: "/oauth2/v4/token",
      },
    },
    startRedirectPath: "/api/v1/auth/google",
    callbackUri: `${env.API_BASE_URL}/api/v1/auth/google/callback`,
    scope: ["profile", "email"],
  });

  // Multipart (for file uploads)
  await fastify.register(multipart, {
    limits: {
      fileSize: parseInt(env.MAX_FILE_SIZE), // 10MB
    },
  });

  // Auth plugin (must be registered before routes)
  await fastify.register(authPlugin);

  // Register auth decorators directly
  fastify.decorate("authenticate", (options?: AuthOptions) => {
    return createAuthMiddleware(options);
  });

  fastify.decorate("requireRole", (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return createAuthMiddleware({ requiredRole: roleArray });
  });

  fastify.decorate("loginFailurePenaltyPreHandler", (_routeId: string) => {
    return async (_req: FastifyRequest, _reply: FastifyReply) => {
      /* no-op by default; your rate-limit penalty logic can go here */
    };
  });

  // Rate limiting security plugin (must be registered before routes)
  await fastify.register(rateLimitPlugin);

  // Log one-time payment provider warnings
  if (!features.paypal) {
    fastify.log.warn({ event: "paypal_config_missing" }, "PayPal credentials not configured");
  }
  if (!features.aps) {
    fastify.log.warn({ event: "aps_config_missing" }, "APS credentials not configured");
  }
  if (!features.hyperpay) {
    fastify.log.warn({ event: "hyperpay_config_missing" }, "HyperPay credentials not configured");
  }

  // Verify that decorators are available
  fastify.log.info(
    {
      authenticate: typeof fastify.authenticate,
      requireRole: typeof fastify.requireRole,
      loginFailurePenaltyPreHandler: typeof fastify.loginFailurePenaltyPreHandler,
    },
    "Auth decorators installed"
  );

  // Swagger documentation
  if (env.NODE_ENV === "development") {
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: "Quiz Platform API",
          description: "API documentation for Quiz Platform",
          version: env.npm_package_version || "1.0.0",
        },
        host: "localhost:3000",
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
          bearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "JWT token",
          },
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });
  }
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: env.npm_package_version || "1.0.0",
    };
  });

  // API routes (v1)
  await fastify.register(authRoutes, { prefix: "/api/v1/auth" });
  await fastify.register(usersRoutes, { prefix: "/api/v1/users" });
  await fastify.register(pricingRoutes, { prefix: "/api/v1/pricing" });
  await fastify.register(paymentRoutes, { prefix: "/api/v1/payments" });
  await fastify.register(paypalRoutes, { prefix: "/api/v1/payments/paypal" });
  await fastify.register(checkoutRoutes, { prefix: "/api/v1/checkout" });
  await fastify.register(couponRoutes, { prefix: "/api/v1/coupons" });
  await fastify.register(questionRoutes, { prefix: "/api/v1/questions" });
  await fastify.register(discussionRoutes, { prefix: "/api/v1/discussions" });
  await fastify.register(friendsRoutes, { prefix: "/api/v1/friends" });
  await fastify.register(challengeRoutes, { prefix: "/api/v1/challenges" });
  await fastify.register(shareRoutes);
  await fastify.register(progressRoutes, { prefix: "/api/v1/progress" });
  await fastify.register(quizResultsRoutes, { prefix: "/api/v1/quiz/results" });
  await fastify.register(gamificationRoutes, { prefix: "/api/v1/gamification" });
  await fastify.register(learningPathRoutes, { prefix: "/api/v1/learning-paths" });
  // Notification routes removed - need to be rebuilt with Fastify when needed
  await fastify.register(adminRoutes, { prefix: "/api/v1/admin" });
  await fastify.register(entitlementRoutes, { prefix: "/api/v1/entitlements" });
  await fastify.register(plansRoutes, { prefix: "/api/v1/plans" });
  await fastify.register(seoRoutes);

  // Development routes (only in dev mode)
  if (env.NODE_ENV === "development") {
    await fastify.register(devEmailRoutes, { prefix: "/api/v1/dev/emails" });
  }
}

// Start server
async function start() {
  try {
    // Connect to database
    await connectDatabase();

    // Register plugins
    await registerPlugins();

    // Register routes
    await registerRoutes();

    // Start server
    const port = env.PORT;
    const host = env.HOST;

    await fastify.listen({ port, host });

    fastify.log.info(`Server listening on http://${host}:${port}`);
    fastify.log.info(`Environment: ${env.NODE_ENV}`);
    fastify.log.info(`API Documentation: http://${host}:${port}/docs`);

    // Start notification scheduler
    try {
      notificationScheduler.start();
      fastify.log.info("Notification scheduler started");
    } catch (error) {
      fastify.log.warn("Failed to start notification scheduler");
      if (error instanceof Error) {
        fastify.log.warn(error.message);
      }
    }

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      fastify.log.info(`Received ${signal}, shutting down gracefully...`);

      // Stop notification scheduler
      try {
        notificationScheduler.stop();
        fastify.log.info("Notification scheduler stopped");
      } catch (error) {
        fastify.log.warn("Failed to stop notification scheduler");
        if (error instanceof Error) {
          fastify.log.warn(error.message);
        }
      }

      await fastify.close();
      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server (but not during tests)
if (process.env.NODE_ENV !== "test") {
  start();
}

export const buildApp = async () => {
  // Connect to database for integration tests
  // This will reuse existing connection if already connected
  await connectDatabase();

  // Create a new Fastify instance for testing
  const testApp = Fastify({
    logger: true, // Enable logging to see errors
    trustProxy: env.RATE_LIMIT_TRUST_PROXY === "true",
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "reqId",
    genReqId: () => crypto.randomUUID(),
  });

  // Register error handler
  testApp.setErrorHandler((error, request, reply) => {
    return errorHandler(error, request, reply);
  });

  // Register request logger
  testApp.addHook("onRequest", requestLogger);

  // Register Permissions-Policy middleware
  testApp.addHook("onRequest", permissionsPolicyMiddleware);

  // Register response logger
  testApp.addHook("onSend", async (request, reply, payload) => {
    const { startTime } = request as FastifyRequest & { startTime?: number };
    if (startTime) {
      const responseTime = Date.now() - startTime;
      const { log, method, url } = request;
      log.info({
        type: "response",
        method,
        url,
        statusCode: reply.statusCode,
        responseTime: `${responseTime}ms`,
        contentLength: reply.getHeader("content-length"),
      });
    }
    return payload;
  });

  // CORS
  await testApp.register(cors, {
    origin: env.CORS_ORIGIN?.split(",") || ["http://localhost:5173", "https://quiz-platform.com"],
    credentials: env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Security headers (same as production for consistency)
  await testApp.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
          "https://www.paypalobjects.com",
        ],
        "connect-src": [
          "'self'",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
          "https://api.paypal.com",
          "https://api.sandbox.paypal.com",
        ],
        "frame-src": ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
        "frame-ancestors": ["'none'"],
      },
    },
    xssFilter: true,
    xContentTypeOptions: true,
    xFrameOptions: { action: "deny" },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting plugin (per-route configuration)
  await testApp.register(rateLimit, {
    global: false,
    hook: "onRequest",
  });

  // Cookies
  await testApp.register(cookie, {
    secret: env.JWT_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });

  // JWT
  await testApp.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
    verify: {
      maxAge: env.JWT_EXPIRES_IN,
    },
  });

  // OAuth2 (for Google) - skip if credentials not available
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    try {
      await testApp.register(oauth2, {
        name: "googleOAuth2",
        credentials: {
          client: {
            id: env.GOOGLE_CLIENT_ID,
            secret: env.GOOGLE_CLIENT_SECRET,
          },
          auth: {
            authorizeHost: "https://accounts.google.com",
            authorizePath: "/o/oauth2/v2/auth",
            tokenHost: "https://www.googleapis.com",
            tokenPath: "/oauth2/v4/token",
          },
        },
        startRedirectPath: "/api/v1/auth/google",
        callbackUri: `${env.API_BASE_URL}/api/v1/auth/google/callback`,
        scope: ["profile", "email"],
      });
    } catch (error) {
      console.warn("Google OAuth2 registration failed:", error);
    }
  }

  // Multipart (for file uploads)
  await testApp.register(multipart, {
    limits: {
      fileSize: parseInt(env.MAX_FILE_SIZE),
    },
  });

  // Auth plugin (must be registered before routes)
  await testApp.register(authPlugin);

  // Register auth decorators directly
  testApp.decorate("authenticate", (options?: AuthOptions) => {
    return createAuthMiddleware(options);
  });

  testApp.decorate("requireRole", (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return createAuthMiddleware({ requiredRole: roleArray });
  });

  testApp.decorate("loginFailurePenaltyPreHandler", (_routeId: string) => {
    return async (_req: FastifyRequest, _reply: FastifyReply) => {
      /* no-op by default; your rate-limit penalty logic can go here */
    };
  });

  // Rate limiting security plugin (must be registered before routes)
  await testApp.register(rateLimitPlugin);

  // Health check
  testApp.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: env.npm_package_version || "1.0.0",
    };
  });

  // Root route for CSP tests
  testApp.get("/", async () => {
    return { message: "Quiz Platform API" };
  });

  // Register routes (v1)
  await testApp.register(authRoutes, { prefix: "/api/v1/auth" });
  await testApp.register(usersRoutes, { prefix: "/api/v1/users" });
  await testApp.register(pricingRoutes, { prefix: "/api/v1/pricing" });
  await testApp.register(paymentRoutes, { prefix: "/api/v1/payments" });
  await testApp.register(paypalRoutes, { prefix: "/api/v1/payments/paypal" });
  await testApp.register(checkoutRoutes, { prefix: "/api/v1/checkout" });
  await testApp.register(couponRoutes, { prefix: "/api/v1/coupons" });
  await testApp.register(questionRoutes, { prefix: "/api/v1/questions" });
  await testApp.register(discussionRoutes, { prefix: "/api/v1/discussions" });
  await testApp.register(friendsRoutes, { prefix: "/api/v1/friends" });
  await testApp.register(challengeRoutes, { prefix: "/api/v1/challenges" });
  await testApp.register(shareRoutes);
  await testApp.register(progressRoutes, { prefix: "/api/v1/progress" });
  await testApp.register(quizResultsRoutes, { prefix: "/api/v1/quiz/results" });
  await testApp.register(gamificationRoutes, { prefix: "/api/v1/gamification" });
  await testApp.register(learningPathRoutes, { prefix: "/api/v1/learning-paths" });
  // Notification routes removed - need to be rebuilt with Fastify when needed
  await testApp.register(adminRoutes, { prefix: "/api/v1/admin" });
  await testApp.register(entitlementRoutes, { prefix: "/api/v1/entitlements" });
  await testApp.register(plansRoutes, { prefix: "/api/v1/plans" });
  await testApp.register(seoRoutes);

  return testApp;
};

export default fastify;
