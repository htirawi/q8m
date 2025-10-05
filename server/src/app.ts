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
import adminRoutes from "@routes/admin";
import authRoutes from "@routes/auth";
import entitlementRoutes from "@routes/entitlements";
import paymentRoutes from "@routes/payments";
import pricingRoutes from "@routes/pricing";
import questionRoutes from "@routes/questions";
import seoRoutes from "@routes/seo";
import rateLimitPlugin from "@server/security/rateLimit";
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
  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN?.split(",") || true,
    credentials: env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
    xssFilter: true,
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

  // OAuth2 (for Google and Facebook)
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
    startRedirectPath: "/auth/google",
    callbackUri: `${env.API_BASE_URL}/auth/google/callback`,
    scope: ["profile", "email"],
  });

  await fastify.register(oauth2, {
    name: "facebookOAuth2",
    credentials: {
      client: {
        id: env.FACEBOOK_APP_ID,
        secret: env.FACEBOOK_APP_SECRET,
      },
      auth: {
        authorizeHost: "https://www.facebook.com",
        authorizePath: "/v18.0/dialog/oauth",
        tokenHost: "https://graph.facebook.com",
        tokenPath: "/v18.0/oauth/access_token",
      },
    },
    startRedirectPath: "/auth/facebook",
    callbackUri: `${env.API_BASE_URL}/auth/facebook/callback`,
    scope: ["email", "public_profile"],
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

  // API routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(pricingRoutes, { prefix: "/api/pricing" });
  await fastify.register(paymentRoutes, { prefix: "/api/payments" });
  await fastify.register(questionRoutes, { prefix: "/api/questions" });
  await fastify.register(adminRoutes, { prefix: "/api/admin" });
  await fastify.register(entitlementRoutes, { prefix: "/api/entitlements" });
  await fastify.register(seoRoutes);
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

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      fastify.log.info(`Received ${signal}, shutting down gracefully...`);
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

// Start the server
start();

export const buildApp = async () => {
  // Create a new Fastify instance for testing
  const testApp = Fastify({
    logger: false, // Disable logging in tests
    trustProxy: env.RATE_LIMIT_TRUST_PROXY === "true",
  });

  // Register plugins for test app
  await testApp.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  await testApp.register(cors, {
    origin: env.CORS_ORIGIN?.split(",") || [env.CLIENT_URL],
    credentials: env.CORS_CREDENTIALS === "true",
  });

  await testApp.register(cookie, {
    secret: env.CSRF_SECRET,
  });

  await testApp.register(jwt, {
    secret: env.JWT_SECRET,
  });

  await testApp.register(oauth2, {
    name: "googleOAuth2",
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
      auth: oauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/google",
    callbackUri: `${env.SERVER_URL}/auth/google/callback`,
  });

  await testApp.register(oauth2, {
    name: "facebookOAuth2",
    credentials: {
      client: {
        id: env.FACEBOOK_APP_ID,
        secret: env.FACEBOOK_APP_SECRET,
      },
      auth: oauth2.FACEBOOK_CONFIGURATION,
    },
    startRedirectPath: "/auth/facebook",
    callbackUri: `${env.SERVER_URL}/auth/facebook/callback`,
  });

  await testApp.register(multipart, {
    limits: {
      fileSize: parseInt(env.MAX_FILE_SIZE),
    },
  });

  // Register middleware
  await testApp.register(requestLogger);
  await testApp.register(errorHandler);
  await testApp.register(authPlugin);
  await testApp.register(rateLimitPlugin);

  // Register routes
  await testApp.register(authRoutes, { prefix: "/api/auth" });
  await testApp.register(pricingRoutes, { prefix: "/api/pricing" });
  await testApp.register(paymentRoutes, { prefix: "/api/payments" });
  await testApp.register(questionRoutes, { prefix: "/api/questions" });
  await testApp.register(adminRoutes, { prefix: "/api/admin" });
  await testApp.register(entitlementRoutes, { prefix: "/api/entitlements" });
  await testApp.register(seoRoutes);

  return testApp;
};

export default fastify;
