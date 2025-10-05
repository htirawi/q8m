import * as jwt from "jsonwebtoken";
import type { ObjectId } from "mongoose";

import { env } from "../config/env.js";
import type { IUser } from "../models/User.js";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  entitlements: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = env.JWT_SECRET;
    this.refreshTokenSecret = env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = env.JWT_EXPIRES_IN || "15m";
    this.refreshTokenExpiry = env.JWT_REFRESH_EXPIRES_IN || "7d";
  }

  /**
   * Generate access and refresh token pair
   */
  generateTokenPair(user: IUser, sessionId: string): TokenPair {
    const payload: JWTPayload = {
      userId: (user._id as ObjectId).toString(),
      email: user.email,
      role: user.role,
      entitlements: user.entitlements || [],
      sessionId,
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: "quiz-platform",
      audience: "quiz-platform-client",
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: (user._id as ObjectId).toString(), sessionId },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: "quiz-platform",
        audience: "quiz-platform-client",
      } as jwt.SignOptions
    );

    // Calculate expiry time in seconds
    const expiresIn = this.parseExpiry(this.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "quiz-platform",
        audience: "quiz-platform-client",
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: "quiz-platform",
        audience: "quiz-platform-client",
      }) as { userId: string; sessionId: string };

      if (!decoded?.userId || !decoded?.sessionId) {
        throw new Error("Invalid token payload");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): unknown {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload | null;
      if (!decoded?.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload | null;
      if (!decoded?.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Generate new access token from refresh token
   */
  refreshAccessToken(refreshToken: string, user: IUser): string {
    const { sessionId } = this.verifyRefreshToken(refreshToken);

    const payload: JWTPayload = {
      userId: (user._id as ObjectId).toString(),
      email: user.email,
      role: user.role,
      entitlements: user.entitlements || [],
      sessionId,
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: "quiz-platform",
      audience: "quiz-platform-client",
    } as jwt.SignOptions);
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: "email_verification" }, this.accessTokenSecret, {
      expiresIn: "24h",
      issuer: "quiz-platform",
      audience: "quiz-platform-email",
    });
  }

  /**
   * Verify email verification token
   */
  verifyEmailVerificationToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "quiz-platform",
        audience: "quiz-platform-email",
      }) as { userId: string; type: string };

      if (decoded.type !== "email_verification") {
        throw new Error("Invalid token type");
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Email verification token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid email verification token");
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId, type: "password_reset" }, this.accessTokenSecret, {
      expiresIn: "1h",
      issuer: "quiz-platform",
      audience: "quiz-platform-password-reset",
    });
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "quiz-platform",
        audience: "quiz-platform-password-reset",
      }) as { userId: string; type: string };

      if (decoded.type !== "password_reset") {
        throw new Error("Invalid token type");
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Password reset token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid password reset token");
      } else {
        throw error;
      }
    }
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();
