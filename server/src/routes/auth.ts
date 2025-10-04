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
import { comboKey, ipKey } from "../security/rateLimit.js";
import * as crypto from "crypto";

// Type definitions for request bodies
interface RegisterBody {
  email: string;
  name: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface VerifyEmailBody {
  token: string;
}

interface ResendVerificationBody {
  email: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  password: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

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
  // Register new user
  fastify.post(
      "/register",
      {
        // Top-level rateLimit for CodeQL compliance
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
        // config.rateLimit for plugin compliance
        config: {
          rateLimit: {
            max: 20,
            timeWindow: "15m",
            hook: "onRequest",
            keyGenerator: comboKey,
          },
        },
        schema: {
          body: registerSchema,
        },
      },
      async (request, reply) => {
        try {
          const { email, name, password } = request.body as RegisterBody;

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
          const verificationToken = await (VerificationToken as any).createToken(
            (user as any)._id.toString(),
            "email_verification",
            24 // 24 hours
          );

          // Send verification email
          const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`;
          await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

          reply.status(201).send({
            message: "User registered successfully. Please check your email for verification.",
            user: {
              id: (user as any)._id.toString(),
              email: user.email,
              name: user.name,
              isEmailVerified: user.isEmailVerified,
            },
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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

  // Login user
  fastify.post(
      "/login",
      {
        // Top-level rateLimit for CodeQL compliance
        rateLimit: {
          max: 20,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
        // config.rateLimit for plugin compliance
        config: {
          rateLimit: {
            max: 20,
            timeWindow: "15m",
            hook: "onRequest",
            keyGenerator: comboKey,
          },
        },
        preHandler: [fastify.loginFailurePenaltyPreHandler("auth:login")],
        schema: {
          body: loginSchema,
        },
      },
      async (request, reply) => {
        try {
          const { email, password } = request.body as LoginBody;

          // Find user with password
          const user = await (User as any).findByEmailWithPassword(email);
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
            userId: (user as any)._id,
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
          const tokenPair = jwtService.generateTokenPair(user, (session as any)._id.toString());

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
              id: (user as any)._id.toString(),
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
          (request.log as any).error({
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

  // Verify email
  fastify.post(
      "/verify-email",
      {
        // Top-level rateLimit for CodeQL compliance
        rateLimit: {
          max: 15,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
        // config.rateLimit for plugin compliance
        config: {
          rateLimit: {
            max: 15,
            timeWindow: "15m",
            hook: "onRequest",
            keyGenerator: comboKey,
          },
        },
        schema: {
          body: verifyEmailSchema,
        },
      },
      async (request, reply) => {
        try {
          const { token } = request.body as VerifyEmailBody;

          const verificationToken = await (VerificationToken as any).verifyToken(
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
              id: (user as any)._id.toString(),
              email: user.email,
              name: user.name,
              isEmailVerified: user.isEmailVerified,
            },
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
            error: error instanceof Error ? error.message : "Invalid verification token",
            message: "Email verification error",
          });
          const errorMessage =
            error instanceof Error ? error.message : "Invalid verification token";
          reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: errorMessage,
          });
        }
      }
    );

  // Resend verification email
  fastify.post(
      "/resend-verification",
      {
        // Top-level rateLimit for CodeQL compliance
        rateLimit: {
          max: 5,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: comboKey,
        },
        // config.rateLimit for plugin compliance
        config: {
          rateLimit: {
            max: 5,
            timeWindow: "15m",
            hook: "onRequest",
            keyGenerator: comboKey,
          },
        },
        schema: {
          body: resendVerificationSchema,
        },
      },
      async (request, reply) => {
        try {
          const { email } = request.body as ResendVerificationBody;

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
          const verificationToken = await (VerificationToken as any).createToken(
            (user as any)._id.toString(),
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
          (request.log as any).error({
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

  // Forgot password
  fastify.post(
      "/forgot-password",
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
          body: forgotPasswordSchema,
        },
      },
      async (request, reply) => {
        try {
          const { email } = request.body as ForgotPasswordBody;

          const user = await User.findOne({ email });
          if (!user) {
            // Don't reveal if user exists or not
            return reply.send({
              message: "If an account with that email exists, a password reset link has been sent",
            });
          }

          // Generate password reset token
          const resetToken = await (VerificationToken as any).createToken(
            (user as any)._id.toString(),
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
          (request.log as any).error({
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

  // Reset password
  fastify.post(
      "/reset-password",
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
          body: resetPasswordSchema,
        },
      },
      async (request, reply) => {
        try {
          const { token, password } = request.body as ResetPasswordBody;

          const resetToken = await (VerificationToken as any).verifyToken(token, "password_reset");
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
            { userId: (user as any)._id },
            { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
          );

          reply.send({
            message: "Password reset successfully",
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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
          body: changePasswordSchema,
        },
      },
      async (request, reply) => {
        try {
          const { currentPassword, newPassword } = request.body as ChangePasswordBody;
          const user = request.authUser;

          // Verify current password
          const isCurrentPasswordValid = await (user as any).comparePassword(currentPassword);
          if (!isCurrentPasswordValid) {
            return reply.status(400).send({
              code: 400,
              error: "Bad Request",
              message: "Current password is incorrect",
            });
          }

          // Update password
          (user as any).password = newPassword;
          await (user as any).save();

          // Invalidate all existing sessions except current one
          await Session.updateMany(
            { userId: (user as any)._id, _id: { $ne: (request as any).sessionId } },
            { isRevoked: true, revokedAt: new Date(), revokedReason: "password_change" }
          );

          reply.send({
            message: "Password changed successfully",
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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
          const user = request.authUser;
          reply.send({
            user: {
              id: (user as any)._id.toString(),
              email: user!.email,
              name: user!.name,
              role: user!.role,
              entitlements: user!.entitlements,
              isEmailVerified: user!.isEmailVerified,
              lastLogin: (user as any).lastLogin,
            },
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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
          const sessionId = (request as any).sessionId;
          if (sessionId) {
            await Session.findByIdAndUpdate(sessionId, {
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: "user_logout",
            });
          }

          // Clear cookies
          (reply as any).clearCookie("accessToken");
          (reply as any).clearCookie("refreshToken");

          reply.send({
            message: "Logged out successfully",
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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
          const user = request.authUser;
          const currentSessionId = (request as any).sessionId;

          // Revoke all sessions except current one
          await Session.updateMany(
            { userId: (user as any)._id, _id: { $ne: currentSessionId } },
            { isRevoked: true, revokedAt: new Date(), revokedReason: "user_logout" }
          );

          // Clear cookies
          (reply as any).clearCookie("accessToken");
          (reply as any).clearCookie("refreshToken");

          reply.send({
            message: "Logged out from all devices successfully",
          });
        } catch (error: unknown) {
          // Error handling
          (request.log as any).error({
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

  // Refresh token
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
          const { refreshToken } = request.body as RefreshTokenBody;

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
            (session as any)._id.toString()
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
          (request.log as any).error({
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
}
