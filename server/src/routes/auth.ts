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
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
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
      config: {
        rateLimit: {
          max: 5, // Allow only 5 registration attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: registerSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email, name, password } = request.body as z.infer<typeof registerSchema>;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return reply.status(409).send({
            code: 409,
            error: "Conflict",
            message: "User with this email already exists",
          });
        }

        // Create new user
        const user = new User({
          email: email.toLowerCase(),
          name,
          password,
          entitlements: ["JUNIOR"], // Free tier by default
          isEmailVerified: false,
        });

        await user.save();

        // Generate email verification token
        const verificationToken = await VerificationToken.createToken(
          user._id,
          "email_verification",
          24 // 24 hours
        );

        // Send verification email
        const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.status(201).send({
          message: "User registered successfully. Please check your email to verify your account.",
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } catch (error: any) {
        request.log.error("Registration error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Registration failed",
        });
      }
    }
  );

  // Login user
  fastify.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 10, // Allow only 10 login attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: loginSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body as z.infer<typeof loginSchema>;

        // Find user with password
        const user = await User.findByEmailWithPassword(email.toLowerCase());
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
          userId: user._id,
          refreshToken: crypto.randomBytes(32).toString("hex"),
          accessToken: crypto.randomBytes(32).toString("hex"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: request.headers["user-agent"],
          ipAddress: request.ip,
        });

        await session.save();

        const tokenPair = jwtService.generateTokenPair(user, session._id.toString());

        // Set secure httpOnly cookies
        secureCookieService.setAccessTokenCookie(reply, tokenPair.accessToken);
        secureCookieService.setRefreshTokenCookie(reply, tokenPair.refreshToken);

        // Generate CSRF token
        const csrfToken = secureCookieService.generateCSRFToken();
        secureCookieService.setCSRFTokenCookie(reply, csrfToken);

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
          csrfToken, // Send CSRF token in response body for client
        });
      } catch (error: any) {
        request.log.error("Login error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Login failed",
        });
      }
    }
  );

  // Verify email
  fastify.post(
    "/verify-email",
    {
      config: {
        rateLimit: {
          max: 5, // Allow only 5 verification attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: verifyEmailSchema,
      },
    },
    async (request, reply) => {
      try {
        const { token } = request.body as z.infer<typeof verifyEmailSchema>;

        const verificationToken = await VerificationToken.verifyToken(token, "email_verification");
        const user = await User.findById(verificationToken.userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Mark token as used
        await verificationToken.markAsUsed(request.ip, request.headers["user-agent"]);

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
      } catch (error: any) {
        request.log.error("Email verification error:", error);
        reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: error.message || "Email verification failed",
        });
      }
    }
  );

  // Resend verification email
  fastify.post(
    "/resend-verification",
    {
      config: {
        rateLimit: {
          max: 3, // Allow only 3 resend attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: resendVerificationSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.body as z.infer<typeof resendVerificationSchema>;

        const user = await User.findOne({ email: email.toLowerCase() });
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

        // Send verification email
        const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`;
        await emailService.sendEmailVerification(user.email, user.name, verificationUrl);

        reply.send({
          message: "Verification email sent successfully",
        });
      } catch (error: any) {
        request.log.error("Resend verification error:", error);
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
      config: {
        rateLimit: {
          max: 3, // Allow only 3 forgot password attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: forgotPasswordSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.body as z.infer<typeof forgotPasswordSchema>;

        const user = await User.findOne({ email: email.toLowerCase() });
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

        // Send password reset email
        const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken.token}`;
        await emailService.sendPasswordReset(user.email, user.name, resetUrl);

        reply.send({
          message: "If an account with that email exists, a password reset link has been sent",
        });
      } catch (error: any) {
        request.log.error("Forgot password error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to send password reset email",
        });
      }
    }
  );

  // Reset password
  fastify.post(
    "/reset-password",
    {
      config: {
        rateLimit: {
          max: 5, // Allow only 5 reset attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      schema: {
        body: resetPasswordSchema,
      },
    },
    async (request, reply) => {
      try {
        const { token, password } = request.body as z.infer<typeof resetPasswordSchema>;

        const resetToken = await VerificationToken.verifyToken(token, "password_reset");
        const user = await User.findById(resetToken.userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        // Update password
        user.password = password;
        await user.save();

        // Mark token as used
        await resetToken.markAsUsed(request.ip, request.headers["user-agent"]);

        // Revoke all existing sessions
        await Session.revokeAllForUser(user._id.toString(), "password_change");

        reply.send({
          message: "Password reset successfully",
        });
      } catch (error: any) {
        request.log.error("Reset password error:", error);
        reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: error.message || "Password reset failed",
        });
      }
    }
  );

  // Change password (authenticated)
  fastify.post(
    "/change-password",
    {
      config: {
        rateLimit: {
          max: 5, // Allow only 5 password change attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      preHandler: [authenticate],
      schema: {
        body: changePasswordSchema,
      },
    },
    async (request, reply) => {
      try {
        const { currentPassword, newPassword } = request.body as z.infer<
          typeof changePasswordSchema
        >;
        const userId = request.user!.id;

        const user = await User.findById(userId).select("+password");
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

        // Revoke all existing sessions except current one
        await Session.updateMany(
          { userId: user._id, _id: { $ne: request.sessionId } },
          {
            $set: {
              isActive: false,
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: "password_change",
            },
          }
        );

        // Send password change notification
        await emailService.sendPasswordChangeNotification(user.email, user.name);

        reply.send({
          message: "Password changed successfully",
        });
      } catch (error: any) {
        request.log.error("Change password error:", error);
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
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.user!.id;
        const user = await User.findById(userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            entitlements: user.entitlements,
            isEmailVerified: user.isEmailVerified,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt,
          },
        });
      } catch (error: any) {
        request.log.error("Get user error:", error);
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
      config: {
        rateLimit: {
          max: 10, // Allow only 10 logout attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const sessionId = request.sessionId!;

        // Revoke current session
        const session = await Session.findById(sessionId);
        if (session) {
          await session.revoke("user_logout");
        }

        // Clear authentication cookies
        secureCookieService.clearAuthCookies(reply);

        reply.send({
          message: "Logged out successfully",
        });
      } catch (error: any) {
        request.log.error("Logout error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Logout failed",
        });
      }
    }
  );

  // Logout from all devices
  fastify.post(
    "/logout-all",
    {
      config: {
        rateLimit: {
          max: 5, // Allow only 5 logout-all attempts per window
          timeWindow: 900000, // 15 minutes
        }
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.user!.id;

        // Revoke all sessions for user
        await Session.revokeAllForUser(userId, "user_logout");

        reply.send({
          message: "Logged out from all devices successfully",
        });
      } catch (error: any) {
        request.log.error("Logout all error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Logout from all devices failed",
        });
      }
    }
  );

  // Refresh token
  fastify.post("/refresh", {
    config: {
      rateLimit: {
        max: 10, // Allow only 10 refresh attempts per window
        timeWindow: 900000, // 15 minutes
      }
    },
    schema: {
      body: z.object({
        refreshToken: z.string().min(32, "Refresh token must be at least 32 characters"),
      }),
    },
  }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (!refreshToken) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Refresh token is required",
        });
      }

      // Validate refresh token format to prevent security bypass
      // Use strict validation to prevent any bypass attempts
      if (!refreshToken || 
          typeof refreshToken !== 'string' || 
          refreshToken.length < 32 || 
          refreshToken.length > 256 || 
          !/^[a-zA-Z0-9]+$/.test(refreshToken) ||
          refreshToken.includes(' ') ||
          refreshToken.includes('\n') ||
          refreshToken.includes('\r') ||
          refreshToken.includes('\t') ||
          refreshToken.includes('null') ||
          refreshToken.includes('undefined') ||
          refreshToken.includes('false') ||
          refreshToken.includes('true') ||
          refreshToken.includes('0') ||
          refreshToken.includes('1')) {
        request.log.warn("Invalid refresh token format attempt", { 
          tokenLength: refreshToken?.length,
          tokenType: typeof refreshToken,
          hasWhitespace: refreshToken?.includes(' ') || refreshToken?.includes('\n') || refreshToken?.includes('\r') || refreshToken?.includes('\t')
        });
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Invalid refresh token format",
        });
      }

      // Verify refresh token
      const { userId } = jwtService.verifyRefreshToken(refreshToken);

      // Find session
      const session = await Session.findActiveByRefreshToken(refreshToken);
      if (!session) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Invalid refresh token",
        });
      }

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "User not found or inactive",
        });
      }

      // Generate new access token
      const newAccessToken = jwtService.refreshAccessToken(refreshToken, user);

      // Update session
      await session.refresh();

      reply.send({
        accessToken: newAccessToken,
        expiresIn: 15 * 60, // 15 minutes
      });
    } catch (error: any) {
      request.log.error("Refresh token error:", error);
      reply.status(401).send({
        code: 401,
        error: "Unauthorized",
        message: error.message || "Invalid refresh token",
      });
    }
  });
}
