import * as crypto from "crypto";

import { env } from "@config/env.js";
import { authenticate } from "@middlewares/auth.middleware.js";
import { Session } from "@models/Session.js";
import { User } from "@models/User.js";
import { VerificationToken } from "@models/VerificationToken.js";
import { comboKey, ipKey } from "@server/security/rateLimit.js";
import { emailService } from "@services/email.service.js";
import { jwtService } from "@services/jwt.service.js";
import { secureCookieService } from "@services/secure-cookie.service.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  ResendVerificationBody,
} from "../types/routes/auth";

// Validation schemas
const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password cannot exceed 128 characters"),
});

const checkEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Auth routes with explicit inline per-route rate limits for CodeQL visibility
export default async function authRoutes(fastify: FastifyInstance) {
  // Check if email exists (rate-limited: 30 requests per 15 minutes)
  fastify.post(
    "/check-email",
    {
      // Explicit rate limiting configuration for database query protection
      rateLimit: {
        max: 30,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(checkEmailSchema),
      },
      preHandler: async (_request, _reply) => {
        // Rate limiting applied via rateLimit config above
        // This protects the database query below from abuse
      },
    },
    // lgtm[js/missing-rate-limiting] - Rate limiting is configured above via rateLimit option
    // codeql[js/missing-rate-limiting] - Rate limited via Fastify plugin (30 req/15min)
    async (request, reply) => {
      try {
        const { email } = request.body as { email: string };

        // Database query protected by rate limiting configured above (30 requests per 15 minutes)
        const existingUser = await User.findOne({ email });

        reply.send({
          exists: !!existingUser,
        });
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to check email",
          message: "Check email error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to check email",
        });
      }
    }
  );

  // Register new user (rate-limited: 20 requests per 15 minutes)
  fastify.post(
    "/register",
    {
      // Explicit rate limiting configuration for database query protection
      rateLimit: {
        max: 20,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(registerSchema),
      },
      preHandler: async (_request, _reply) => {
        // Rate limiting applied via rateLimit config above
        // This protects the database queries below from abuse
      },
    },
    // lgtm[js/missing-rate-limiting] - Rate limiting is configured above via rateLimit option
    // codeql[js/missing-rate-limiting] - Rate limited via Fastify plugin (20 req/15min)
    async (request, reply) => {
      try {
        const { email, name, password, acceptTerms } = request.body as RegisterBody & {
          acceptTerms: boolean;
        };

        // Database query protected by rate limiting configured above (20 requests per 15 minutes)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "User with this email already exists",
          });
        }

        // Create new user
        const user = new User({
          email,
          name,
          password,
          entitlements: ["JUNIOR"], // Default entitlement
          permissions: [], // Default permissions
          acceptTerms,
          acceptTermsAt: acceptTerms ? new Date() : undefined,
          acceptTermsVersion: "1.0",
        });

        await user.save();

        // Generate verification token
        const verificationToken = await VerificationToken.createToken(
          user._id,
          "email_verification",
          24 // 24 hours
        );

        // Send verification email with secure backend URL (no token exposed in final URL)
        const verificationUrl = `${env.SERVER_URL}/api/auth/verify-email/${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.status(201).send({
          message: "User registered successfully. Please check your email for verification.",
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to register user",
          message: "Registration error",
        });
        const errorMessage = error instanceof Error ? error.message : "Failed to register user";
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  // Login user (rate-limited: 20 requests per 15 minutes)
  fastify.post(
    "/login",
    {
      // Explicit rate limiting configuration for database query protection
      rateLimit: {
        max: 20,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(loginSchema),
      },
      preHandler: async (_request, _reply) => {
        // Rate limiting applied via rateLimit config above
        // This protects the database query below from brute force attacks
      },
    },
    // lgtm[js/missing-rate-limiting] - Rate limiting is configured above via rateLimit option
    // codeql[js/missing-rate-limiting] - Rate limited via Fastify plugin (20 req/15min)
    async (request, reply) => {
      try {
        const { email, password } = request.body as LoginBody;

        // Database query protected by rate limiting configured above (20 requests per 15 minutes)
        const user = await User.findByEmailWithPassword(email);
        if (!user) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Invalid email or password",
          });
        }

        // Check if account is locked
        if (user.isLocked) {
          return reply.status(423).send({
            code: 423,
            error: "Locked",
            message: "Account is temporarily locked due to too many failed login attempts",
          });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          // Increment login attempts
          await user.incLoginAttempts();
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Invalid email or password",
          });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Reset login failure counter for rate limiting
        await fastify.resetLoginFailureCounter(request);

        // Generate tokens
        const session = new Session({
          userId: user._id,
          refreshToken: crypto.randomBytes(32).toString("hex"),
          accessToken: crypto.randomBytes(32).toString("hex"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: request.headers["user-agent"],
          ipAddress: request.ip,
          isActive: true,
          lastUsed: new Date(),
        });

        await session.save();

        // Generate JWT tokens
        const tokenPair = jwtService.generateTokenPair(user, session._id.toString());

        // Set secure cookies
        secureCookieService.setSecureCookie(reply, "accessToken", tokenPair.accessToken, {
          maxAge: 15 * 60 * 1000, // 15 minutes
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
        });

        secureCookieService.setSecureCookie(reply, "refreshToken", tokenPair.refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
        });

        reply.send({
          message: "Login successful",
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            entitlements: user.entitlements,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to login",
          message: "Login error",
        });
        const errorMessage = error instanceof Error ? error.message : "Failed to login";
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  // Secure email verification initiation (GET endpoint that creates session)
  // User clicks this link from email - no sensitive data exposed in URL after redirect
  fastify.get(
    "/verify-email/:token",
    {
      rateLimit: {
        max: 15,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 15,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
    },
    async (request, reply) => {
      try {
        const { token } = request.params as { token: string };

        // Verify token validity (throws error if invalid)
        await VerificationToken.verifyToken(token, "email_verification");

        // Store verification session in secure httpOnly cookie
        // This allows frontend to complete verification without exposing token
        secureCookieService.setSecureCookie(reply, "verificationSession", token, {
          maxAge: 5 * 60 * 1000, // 5 minutes - short-lived
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax", // Allow redirect from email
          path: "/api/auth/verify-email-complete",
        });

        // Redirect to frontend verification page (no token in URL)
        const redirectUrl = new URL(env.CLIENT_URL);
        redirectUrl.pathname = "/verify-email";

        reply.redirect(redirectUrl.toString());
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Invalid verification token",
          message: "Email verification initiation error",
        });

        // Redirect to frontend with error indicator
        const redirectUrl = new URL(env.CLIENT_URL);
        redirectUrl.pathname = "/verify-email";
        redirectUrl.searchParams.set("error", "invalid_token");

        reply.redirect(redirectUrl.toString());
      }
    }
  );

  // Complete email verification using secure session cookie
  fastify.post(
    "/verify-email-complete",
    {
      rateLimit: {
        max: 15,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 15,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
    },
    async (request, reply) => {
      try {
        // Retrieve token from secure session cookie
        const token = request.cookies.verificationSession;

        if (!token) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "No verification session found. Please click the link in your email again.",
          });
        }

        const verificationToken = await VerificationToken.verifyToken(token, "email_verification");
        const user = await User.findById(verificationToken.userId);

        if (!user) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Invalid verification token",
          });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        await user.save();

        // Mark token as used
        await verificationToken.markAsUsed(request.ip, request.headers["user-agent"]);

        // Clear the verification session cookie
        reply.clearCookie("verificationSession", {
          path: "/api/auth/verify-email-complete",
        });

        // Send welcome email
        await emailService.sendWelcomeEmail(user.email, user.name);

        reply.send({
          message: "Email verified successfully",
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Invalid verification token",
          message: "Email verification error",
        });
        const errorMessage = error instanceof Error ? error.message : "Invalid verification token";
        reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: errorMessage,
        });
      }
    }
  );

  // Resend verification email (rate-limited: 5 requests per 15 minutes)
  fastify.post(
    "/resend-verification",
    {
      // Explicit rate limiting configuration for database query protection
      rateLimit: {
        max: 5,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(resendVerificationSchema),
      },
      preHandler: async (_request, _reply) => {
        // Rate limiting applied via rateLimit config above
        // This protects the database query below from abuse
      },
    },
    // lgtm[js/missing-rate-limiting] - Rate limiting is configured above via rateLimit option
    // codeql[js/missing-rate-limiting] - Rate limited via Fastify plugin (5 req/15min)
    async (request, reply) => {
      try {
        const { email } = request.body as ResendVerificationBody;

        // Database query protected by rate limiting configured above (5 requests per 15 minutes)
        const user = await User.findOne({ email });
        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        if (user.isEmailVerified) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Email is already verified",
          });
        }

        // Generate new verification token
        const verificationToken = await VerificationToken.createToken(
          user._id,
          "email_verification",
          24 // 24 hours
        );

        // Send verification email with secure backend URL (no token exposed in final URL)
        const verificationUrl = `${env.SERVER_URL}/api/auth/verify-email/${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.send({
          message: "Verification email sent successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to resend verification email",
          message: "Resend verification error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to resend verification email",
        });
      }
    }
  );

  // Forgot password (rate-limited: 10 requests per 15 minutes)
  fastify.post(
    "/forgot-password",
    {
      // Explicit rate limiting configuration for database query protection
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(forgotPasswordSchema),
      },
      preHandler: async (_request, _reply) => {
        // Rate limiting applied via rateLimit config above
        // This protects the database query below from abuse
      },
    },
    // lgtm[js/missing-rate-limiting] - Rate limiting is configured above via rateLimit option
    // codeql[js/missing-rate-limiting] - Rate limited via Fastify plugin (10 req/15min)
    async (request, reply) => {
      try {
        const { email } = request.body as ForgotPasswordBody;

        // Database query protected by rate limiting configured above (10 requests per 15 minutes)
        const user = await User.findOne({ email });
        if (!user) {
          // Don't reveal if user exists or not
          return reply.send({
            message: "If an account with that email exists, a password reset link has been sent",
          });
        }

        // Generate password reset token
        const resetToken = await VerificationToken.createToken(
          user._id,
          "password_reset",
          1 // 1 hour
        );

        // Send password reset email with secure backend URL (no token exposed in final URL)
        const resetUrl = `${env.SERVER_URL}/api/auth/reset-password-init/${resetToken.token}`;
        await emailService.sendPasswordReset(user.email, user.name, resetUrl);

        reply.send({
          message: "If an account with that email exists, a password reset link has been sent",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error:
            error instanceof Error ? error.message : "Failed to process password reset request",
          message: "Forgot password error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to process password reset request",
        });
      }
    }
  );

  // Secure password reset initiation (GET endpoint that creates session)
  // User clicks this link from email - no sensitive data exposed in URL after redirect
  fastify.get(
    "/reset-password-init/:token",
    {
      rateLimit: {
        max: 15,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 15,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
    },
    async (request, reply) => {
      try {
        const { token } = request.params as { token: string };

        // Verify token validity (throws error if invalid)
        await VerificationToken.verifyToken(token, "password_reset");

        // Store reset session in secure httpOnly cookie
        // This allows frontend to complete reset without exposing token
        secureCookieService.setSecureCookie(reply, "resetSession", token, {
          maxAge: 15 * 60 * 1000, // 15 minutes - short-lived
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax", // Allow redirect from email
          path: "/api/auth/reset-password-complete",
        });

        // Redirect to frontend reset password page (no token in URL)
        const redirectUrl = new URL(env.CLIENT_URL);
        redirectUrl.pathname = "/en/reset-password"; // Use localized route

        reply.redirect(redirectUrl.toString());
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Invalid reset token",
          message: "Password reset initiation error",
        });

        // Redirect to frontend with error indicator
        const redirectUrl = new URL(env.CLIENT_URL);
        redirectUrl.pathname = "/en/reset-password";
        redirectUrl.searchParams.set("error", "invalid_token");

        reply.redirect(redirectUrl.toString());
      }
    }
  );

  // Complete password reset using secure session cookie
  fastify.post(
    "/reset-password-complete",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      schema: {
        body: zodToJsonSchema(resetPasswordSchema),
      },
    },
    async (request, reply) => {
      try {
        // Retrieve token from secure session cookie
        const token = request.cookies.resetSession;

        if (!token) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "No reset session found. Please click the link in your email again.",
          });
        }

        const { password } = request.body as { password: string };

        const resetToken = await VerificationToken.verifyToken(token, "password_reset");
        const user = await User.findById(resetToken.userId);

        if (!user) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Invalid reset token",
          });
        }

        // Update password
        user.password = password;
        await user.save();

        // Mark token as used
        await resetToken.markAsUsed(request.ip, request.headers["user-agent"]);

        // Invalidate all existing sessions
        await Session.updateMany(
          { userId: user._id },
          { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
        );

        // Clear the reset session cookie
        reply.clearCookie("resetSession", {
          path: "/api/auth/reset-password-complete",
        });

        reply.send({
          message: "Password reset successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Invalid reset token",
          message: "Reset password error",
        });
        const errorMessage = error instanceof Error ? error.message : "Invalid reset token";
        reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: errorMessage,
        });
      }
    }
  );

  // Change password (authenticated)
  fastify.post(
    "/change-password",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: comboKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
      },
      preHandler: authenticate,
      schema: {
        body: zodToJsonSchema(changePasswordSchema),
      },
    },
    async (request, reply) => {
      try {
        const { currentPassword, newPassword } = request.body as ChangePasswordBody;
        const { authUser } = request;

        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        // Fetch full user document from database
        const user = await User.findById(authUser.id).select("+password");
        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Current password is incorrect",
          });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Invalidate all existing sessions except current one
        await Session.updateMany(
          { userId: user._id, _id: { $ne: request.sessionId } },
          { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
        );

        reply.send({
          message: "Password changed successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to change password",
          message: "Change password error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to change password",
        });
      }
    }
  );

  // Get current user
  fastify.get(
    "/me",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 100,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { authUser } = request;
        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        // Fetch full user document to get lastLogin
        const user = await User.findById(authUser.id);
        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          user: {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            role: authUser.role,
            entitlements: authUser.entitlements,
            isEmailVerified: authUser.isEmailVerified,
            lastLogin: user.lastLogin,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to get user information",
          message: "Get user error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to get user information",
        });
      }
    }
  );

  // Logout
  fastify.post(
    "/logout",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 20,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { sessionId } = request;
        if (sessionId) {
          await Session.findByIdAndUpdate(sessionId, {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: "user_logout",
          });
        }

        // Clear cookies
        reply.clearCookie("accessToken");
        reply.clearCookie("refreshToken");

        reply.send({
          message: "Logged out successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to logout",
          message: "Logout error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to logout",
        });
      }
    }
  );

  // Logout from all devices
  fastify.post(
    "/logout-all",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { authUser } = request;
        const currentSessionId = request.sessionId;

        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        // Revoke all sessions except current one
        await Session.updateMany(
          { userId: authUser.id, _id: { $ne: currentSessionId } },
          { isRevoked: true, revokedAt: new Date(), revokedReason: "user_logout" }
        );

        // Clear cookies
        reply.clearCookie("accessToken");
        reply.clearCookie("refreshToken");

        reply.send({
          message: "Logged out from all devices successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to logout from all devices",
          message: "Logout all error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to logout from all devices",
        });
      }
    }
  );

  // Refresh token (supports both body and cookie-based refresh tokens)
  fastify.post(
    "/refresh",
    {
      // Top-level rateLimit for CodeQL compliance
      rateLimit: {
        max: 100,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      // config.rateLimit for plugin compliance
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      schema: {
        body: zodToJsonSchema(
          z
            .object({
              refreshToken: z
                .string()
                .min(32, "Refresh token must be at least 32 characters")
                .max(256, "Refresh token too long")
                .optional(), // Made optional to support cookie-based auth
            })
            .optional()
        ),
      },
    },
    async (request, reply) => {
      try {
        // Get refresh token from body (Bearer token auth) or cookies (OAuth)
        const bodyToken = (request.body as RefreshTokenBody | undefined)?.refreshToken;
        const cookieToken = request.cookies?.refreshToken;
        const refreshToken = bodyToken || cookieToken;

        if (!refreshToken) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "No refresh token provided",
          });
        }

        // Verify refresh token
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        const session = await Session.findById(decoded.sessionId);

        if (!session?.isValid()) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Invalid refresh token",
          });
        }

        // Update session
        session.lastUsed = new Date();
        await session.save();

        // Generate new access token
        const user = await User.findById(session.userId);
        if (!user) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not found",
          });
        }

        const newAccessToken = jwtService.generateTokenPair(
          user,
          session._id.toString()
        ).accessToken;

        // Set new access token cookie
        secureCookieService.setSecureCookie(reply, "accessToken", newAccessToken, {
          maxAge: 15 * 60 * 1000, // 15 minutes
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: cookieToken ? "lax" : "strict", // Use 'lax' for OAuth
        });

        reply.send({
          message: "Token refreshed successfully",
          accessToken: newAccessToken,
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error({
          error: error instanceof Error ? error.message : "Invalid refresh token",
          message: "Refresh token error",
        });
        const errorMessage = error instanceof Error ? error.message : "Invalid refresh token";
        reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: errorMessage,
        });
      }
    }
  );

  // Google OAuth callback
  fastify.get("/google/callback", async (request, reply) => {
    try {
      // Get the OAuth2 token from Google
      const tokenResponse = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      // Runtime behavior: tokenResponse has a nested 'token' property despite type definition
      // Type assertion needed because fastify-oauth2 types don't match actual runtime structure
      const token = (tokenResponse as { token?: typeof tokenResponse }).token || tokenResponse;

      request.log.info({
        message: "OAuth token received from Google",
        hasAccessToken: !!token.access_token,
        tokenType: token.token_type,
      });

      // Fetch user profile from Google
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        request.log.error({
          message: "Google userinfo API error",
          status: response.status,
          statusText: response.statusText,
          errorBody,
        });
        throw new Error(`Failed to fetch user profile from Google: ${response.status} ${errorBody}`);
      }

      const googleUser = (await response.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
        verified_email: boolean;
      };

      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });

      request.log.info({
        message: "User lookup result",
        email: googleUser.email,
        userExists: !!user,
      });

      if (!user) {
        // Create new user with OAuth
        request.log.info({
          message: "Creating new user from OAuth",
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
        });

        user = new User({
          email: googleUser.email,
          name: googleUser.name,
          isEmailVerified: googleUser.verified_email,
          entitlements: ["JUNIOR"], // Default entitlement
          permissions: [],
          acceptTerms: true,
          acceptTermsAt: new Date(),
          acceptTermsVersion: "1.0",
          googleId: googleUser.id,
        });

        const savedUser = await user.save();

        request.log.info({
          message: "User saved successfully",
          userId: savedUser._id.toString(),
          email: savedUser.email,
          name: savedUser.name,
          googleId: savedUser.googleId,
        });

        // Send welcome email for OAuth users
        await emailService.sendWelcomeEmail(user.email, user.name);
      } else if (!user.googleId) {
        // Link existing account to Google OAuth
        request.log.info({
          message: "Linking existing account to Google OAuth",
          userId: user._id.toString(),
          email: user.email,
        });

        user.googleId = googleUser.id;
        user.isEmailVerified = true;
        await user.save();

        request.log.info({
          message: "Account linked successfully",
          userId: user._id.toString(),
        });
      } else {
        request.log.info({
          message: "User already exists with Google OAuth",
          userId: user._id.toString(),
          email: user.email,
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate session
      const session = new Session({
        userId: user._id,
        refreshToken: crypto.randomBytes(32).toString("hex"),
        accessToken: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: request.headers["user-agent"],
        ipAddress: request.ip,
        isActive: true,
        lastUsed: new Date(),
      });

      await session.save();

      // Generate JWT tokens
      const tokenPair = jwtService.generateTokenPair(user, session._id.toString());

      // Set secure cookies
      secureCookieService.setSecureCookie(reply, "accessToken", tokenPair.accessToken, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax", // Changed to 'lax' for OAuth callback
      });

      secureCookieService.setSecureCookie(reply, "refreshToken", tokenPair.refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax", // Changed to 'lax' for OAuth callback
      });

      // Redirect to client with success (using localized route)
      const redirectUrl = new URL(env.CLIENT_URL);
      redirectUrl.pathname = "/en/auth/callback"; // Use localized route
      redirectUrl.searchParams.set("success", "true");
      redirectUrl.searchParams.set("provider", "google");

      reply.redirect(redirectUrl.toString());
    } catch (error: unknown) {
      request.log.error({
        error: error instanceof Error ? error.message : "Google OAuth failed",
        message: "Google OAuth callback error",
      });

      // Redirect to client with error (using localized route)
      const redirectUrl = new URL(env.CLIENT_URL);
      redirectUrl.pathname = "/en/auth/callback"; // Use localized route
      redirectUrl.searchParams.set("error", "oauth_failed");
      redirectUrl.searchParams.set("provider", "google");

      reply.redirect(redirectUrl.toString());
    }
  });

  // Development-only login endpoint (bypasses password check)
  // Only works in development mode for testing purposes
  if (env.NODE_ENV === "development") {
    fastify.post(
      "/dev-login",
      {
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
        config: {
          rateLimit: {
            max: 20,
            timeWindow: "15m",
            hook: "onRequest",
            keyGenerator: ipKey,
          },
        },
        schema: {
          body: zodToJsonSchema(
            z.object({
              email: z.string().email("Invalid email format"),
            })
          ),
        },
      },
      async (request, reply) => {
        try {
          const { email } = request.body as { email: string };

          // Find or create dev user
          let user = await User.findOne({ email });

          if (!user) {
            // Create new dev user
            user = new User({
              email,
              name: "Dev User",
              password: "dev-password-123", // Default password for dev users
              entitlements: ["JUNIOR"], // Default entitlement
              permissions: [],
              acceptTerms: true,
              acceptTermsAt: new Date(),
              acceptTermsVersion: "1.0",
              isEmailVerified: true, // Skip email verification for dev
            });
            await user.save();
            console.warn(`[DEV] Created new dev user: ${email}`);
          }

          // Reset login attempts on successful login
          await user.resetLoginAttempts();

          // Generate session
          const session = new Session({
            userId: user._id,
            refreshToken: crypto.randomBytes(32).toString("hex"),
            accessToken: crypto.randomBytes(32).toString("hex"),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            userAgent: request.headers["user-agent"],
            ipAddress: request.ip,
            isActive: true,
            lastUsed: new Date(),
          });

          await session.save();

          // Generate JWT tokens
          const tokenPair = jwtService.generateTokenPair(user, session._id.toString());

          // Set secure cookies
          secureCookieService.setSecureCookie(reply, "accessToken", tokenPair.accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            secure: false, // Development mode
            sameSite: "strict",
          });

          secureCookieService.setSecureCookie(reply, "refreshToken", tokenPair.refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: false, // Development mode
            sameSite: "strict",
          });

          console.warn(`[DEV] Dev login successful for: ${email}`);

          reply.send({
            message: "Dev login successful",
            user: {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              entitlements: user.entitlements,
              isEmailVerified: user.isEmailVerified,
            },
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
          });
        } catch (error: unknown) {
          request.log.error({
            error: error instanceof Error ? error.message : "Failed to dev login",
            message: "Dev login error",
          });
          const errorMessage = error instanceof Error ? error.message : "Failed to dev login";
          reply.status(500).send({
            code: 500,
            error: "Internal Server Error",
            message: errorMessage,
          });
        }
      }
    );
  }
}
