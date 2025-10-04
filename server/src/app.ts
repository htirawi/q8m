import Fastify from "fastify";
import { config } from "dotenv";
import crypto from "crypto";

// Load environment variables
config();

// Import plugins
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import oauth2 from "@fastify/oauth2";

// Import routes
import authRoutes from "./routes/auth";
import pricingRoutes from "./routes/pricing";
import paymentRoutes from "./routes/payments";
import questionRoutes from "./routes/questions";
import adminRoutes from "./routes/admin";
import entitlementRoutes from "./routes/entitlements";
// import downloadRoutes from "./routes/downloads"; // TODO: Fix broken downloads route
import seoRoutes from "./routes/seo";

// Import middleware
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import authPlugin from "./middlewares/auth.middleware";

// Import database
import { connectDatabase } from "./config/database";

// Import environment validation
import { envSchema } from "./config/env";

// Validate environment variables
const env = envSchema.parse(process.env);

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
  },
  trustProxy: true,
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
  const startTime = (request as any).startTime;
  if (startTime) {
    const responseTime = Date.now() - startTime;
    request.log.info({
      type: "response",
      method: request.method,
      url: request.url,
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
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS || "100"),
    timeWindow: env.RATE_LIMIT_WINDOW_MS || "900000", // 15 minutes
    errorResponseBuilder: (_request, context) => ({
      code: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
      retryAfter: Math.round(context.ttl / 1000),
    }),
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
      expiresIn: env.JWT_EXPIRES_IN || "15m",
    },
    verify: {
      maxAge: env.JWT_EXPIRES_IN || "15m",
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
      fileSize: parseInt(env.MAX_FILE_SIZE || "10485760"), // 10MB
    },
  });

  // Auth plugin
  await fastify.register(authPlugin);

  // Swagger documentation
  if (env.NODE_ENV === "development") {
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: "Quiz Platform API",
          description: "API documentation for Quiz Platform",
          version: "1.0.0",
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
      version: process.env.npm_package_version || "1.0.0",
    };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(pricingRoutes, { prefix: "/api/pricing" });
  await fastify.register(paymentRoutes, { prefix: "/api/payments" });
  await fastify.register(questionRoutes, { prefix: "/api/questions" });
  await fastify.register(adminRoutes, { prefix: "/api/admin" });
  await fastify.register(entitlementRoutes, { prefix: "/api/entitlements" });
  // await fastify.register(downloadRoutes, { prefix: "/api/downloads" }); // TODO: Fix broken downloads route
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
    const port = parseInt(env.PORT || "3000");
    const host = env.HOST || "0.0.0.0";

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
  fastify.log.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, _promise) => {
  fastify.log.error(reason);
  process.exit(1);
});

// Start the server
start();

export default fastify;
