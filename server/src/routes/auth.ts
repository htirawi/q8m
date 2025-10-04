import { FastifyInstance } from "fastify";
import { z } from "zod";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { VerificationToken } from "../models/VerificationToken.js";
import { jwtService } from "../services/jwt.service.js";
import { emailService } from "../services/email.service.js";
import { secureCookieService } from "../services/secure-cookie.service.js";
import { env } from "../config/env.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import rateLimit from "@fastify/rate-limit";
import crypto from "crypto";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32, "Invalid verification token"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32, "Invalid reset token"),
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

export default async function authRoutes(fastify: FastifyInstance) {
  // Register rate limiting plugin with specific configurations
  await fastify.register(rateLimit, {
    global: false, // We'll apply it per route
  });

  // Register new user
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:signup:${request.ip}`,
    });

    fastify.post(
      "/register",
      {
        schema: {
          body: registerSchema,
        },
      },
    async (request, reply) => {
      try {
        const { email, name, password } = request.body as z.infer<typeof registerSchema>;

        // Check if user already exists
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
        });

        await user.save();

        // Generate verification token
        const verificationToken = await (VerificationToken as unknown).createToken(
          (user as unknown)._id.toString(),
          "email_verification",
          24 // 24 hours
        );

        // Send verification email
        const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.status(201).send({
          message: "User registered successfully. Please check your email for verification.",
          user: {
            id: (user as unknown)._id.toString(),
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Registration error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to register user";
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    });
  });

  // Login user
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:login:${request.ip}`,
    });

    fastify.post(
      "/login",
      {
        schema: {
          body: loginSchema,
        },
      },
    async (request, reply) => {
      try {
        const { email, password } = request.body as z.infer<typeof loginSchema>;

        // Find user with password
        const user = await (User as unknown).findByEmailWithPassword(email);
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

        // Generate tokens
        const session = new Session({
          userId: (user as unknown)._id,
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
        const tokenPair = jwtService.generateTokenPair(user, (session as unknown)._id.toString());

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
            id: (user as unknown)._id.toString(),
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
        request.log.error("Login error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to login";
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    });
  });

  // Verify email
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:verify-email:${request.ip}`,
    });

    fastify.post(
      "/verify-email",
      {
        schema: {
          body: verifyEmailSchema,
        },
      },
    async (request, reply) => {
      try {
        const { token } = request.body as z.infer<typeof verifyEmailSchema>;

        const verificationToken = await (VerificationToken as unknown).verifyToken(
          token,
          "email_verification"
        );
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

        // Send welcome email
        await emailService.sendWelcomeEmail(user.email, user.name);

        reply.send({
          message: "Email verified successfully",
          user: {
            id: (user as unknown)._id.toString(),
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Email verification error:", error);
        const errorMessage = error instanceof Error ? error.message : "Invalid verification token";
        reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: errorMessage,
        });
      }
    });
  });

  // Resend verification email
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:resend-code:${request.ip}`,
    });

    fastify.post(
      "/resend-verification",
      {
        schema: {
          body: resendVerificationSchema,
        },
      },
    async (request, reply) => {
      try {
        const { email } = request.body as z.infer<typeof resendVerificationSchema>;

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
        const verificationToken = await (VerificationToken as unknown).createToken(
          (user as unknown)._id.toString(),
          "email_verification",
          24 // 24 hours
        );

        // Send verification email
        const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.send({
          message: "Verification email sent successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Resend verification error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to resend verification email",
        });
      }
    });
  });

  // Forgot password
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:forgot-password:${request.ip}`,
    });

    fastify.post(
      "/forgot-password",
      {
        schema: {
          body: forgotPasswordSchema,
        },
      },
    async (request, reply) => {
      try {
        const { email } = request.body as z.infer<typeof forgotPasswordSchema>;

        const user = await User.findOne({ email });
        if (!user) {
          // Don't reveal if user exists or not
          return reply.send({
            message: "If an account with that email exists, a password reset link has been sent",
          });
        }

        // Generate password reset token
        const resetToken = await (VerificationToken as unknown).createToken(
          (user as unknown)._id.toString(),
          "password_reset",
          1 // 1 hour
        );

        // Send password reset email
        const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken.token}`;
        await emailService.sendPasswordReset(user.email, user.name, resetUrl);

        reply.send({
          message: "If an account with that email exists, a password reset link has been sent",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Forgot password error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to process password reset request",
        });
      }
    });
  });

  // Reset password
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_USER_MAX),
      timeWindow: env.RATE_LIMIT_USER_WINDOW,
      keyGenerator: (request) => `auth:reset-password:${request.ip}`,
    });

    fastify.post(
      "/reset-password",
      {
        schema: {
          body: resetPasswordSchema,
        },
      },
    async (request, reply) => {
      try {
        const { token, password } = request.body as z.infer<typeof resetPasswordSchema>;

        const resetToken = await (VerificationToken as unknown).verifyToken(
          token,
          "password_reset"
        );
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
          { userId: (user as unknown)._id },
          { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
        );

        reply.send({
          message: "Password reset successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Reset password error:", error);
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
      preHandler: authenticate,
      schema: {
        body: changePasswordSchema,
      },
    },
    async (request, reply) => {
      try {
        const { currentPassword, newPassword } = request.body as z.infer<
          typeof changePasswordSchema
        >;
        const user = request.authUser;

        // Verify current password
        const isCurrentPasswordValid = await (user as unknown).comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Current password is incorrect",
          });
        }

        // Update password
        (user as unknown).password = newPassword;
        await (user as unknown).save();

        // Invalidate all existing sessions except current one
        await Session.updateMany(
          { userId: (user as unknown)._id, _id: { $ne: (request as unknown).sessionId } },
          { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
        );

        reply.send({
          message: "Password changed successfully",
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Change password error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to change password",
        });
      }
    });
  });

  // Get current user
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_IP_MAX),
      timeWindow: env.RATE_LIMIT_IP_WINDOW,
      keyGenerator: (request) => `auth:me:${request.ip}`,
    });

    fastify.get(
      "/me",
      {
        preHandler: authenticate,
      },
    async (request, reply) => {
      try {
        const user = request.authUser;
        reply.send({
          user: {
            id: (user as unknown)._id.toString(),
            email: user!.email,
            name: user!.name,
            role: user!.role,
            entitlements: user!.entitlements,
            isEmailVerified: user!.isEmailVerified,
            lastLogin: (user as unknown).lastLogin,
          },
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Get user error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to get user information",
        });
      }
    });
  });

  // Logout
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_IP_MAX),
      timeWindow: env.RATE_LIMIT_IP_WINDOW,
      keyGenerator: (request) => `auth:logout:${request.ip}`,
    });

    fastify.post(
      "/logout",
      {
        preHandler: authenticate,
      },
    async (request, reply) => {
      try {
        const sessionId = (request as unknown).sessionId;
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
        request.log.error("Logout error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to logout",
        });
      }
    });
  });

  // Logout from all devices
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_IP_MAX),
      timeWindow: env.RATE_LIMIT_IP_WINDOW,
      keyGenerator: (request) => `auth:logout-all:${request.ip}`,
    });

    fastify.post(
      "/logout-all",
      {
        preHandler: authenticate,
      },
    async (request, reply) => {
      try {
        const user = request.authUser;
        const currentSessionId = (request as unknown).sessionId;

        // Revoke all sessions except current one
        await Session.updateMany(
          { userId: (user as unknown)._id, _id: { $ne: currentSessionId } },
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
        request.log.error("Logout all error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to logout from all devices",
        });
      }
    });
  });

  // Refresh token
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_IP_MAX),
      timeWindow: env.RATE_LIMIT_IP_WINDOW,
      keyGenerator: (request) => `auth:refresh:${request.ip}`,
    });

    fastify.post(
      "/refresh",
      {
        schema: {
          body: z.object({
            refreshToken: z
              .string()
              .min(32, "Refresh token must be at least 32 characters")
              .max(256, "Refresh token too long"),
          }),
        },
      },
    async (request, reply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };

        // Verify refresh token
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        const session = await Session.findById(decoded.sessionId);

        if (!session || !session.isValid()) {
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
          (session as unknown)._id.toString()
        ).accessToken;

        // Set new access token cookie
        secureCookieService.setSecureCookie(reply, "accessToken", newAccessToken, {
          maxAge: 15 * 60 * 1000, // 15 minutes
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
        });

        reply.send({
          message: "Token refreshed successfully",
          accessToken: newAccessToken,
        });
      } catch (error: unknown) {
        // Error handling
        request.log.error("Refresh token error:", error);
        const errorMessage = error instanceof Error ? error.message : "Invalid refresh token";
        reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: errorMessage,
        });
      }
    });
  });
}
