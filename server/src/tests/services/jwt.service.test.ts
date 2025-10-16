/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IUser } from "@models/User.js";
import { jwtService, JWTService } from "@services/jwt.js";
import * as jwt from "jsonwebtoken";
import { describe, it, expect } from "vitest";

describe("JWTService", () => {
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockUser: IUser = {
    _id: mockUserId,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    entitlements: ["JUNIOR"],
    password: "hashedPassword",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;

  const sessionId = "test-session-id";

  describe("generateTokenPair", () => {
    it("should generate access and refresh tokens", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBeGreaterThan(0);
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });

    it("should include correct payload in access token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const decoded = jwtService.decodeToken(tokens.accessToken) as any;

      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.entitlements).toEqual(mockUser.entitlements);
      expect(decoded.sessionId).toBe(sessionId);
      expect(decoded.iss).toBe("quiz-platform");
      expect(decoded.aud).toBe("quiz-platform-client");
    });

    it("should include correct payload in refresh token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const decoded = jwtService.decodeToken(tokens.refreshToken) as any;

      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.sessionId).toBe(sessionId);
      expect(decoded.iss).toBe("quiz-platform");
      expect(decoded.aud).toBe("quiz-platform-client");
    });

    it("should calculate correct expiry time", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);

      // Default is 15m = 900 seconds
      expect(tokens.expiresIn).toBe(900);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify valid access token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const payload = jwtService.verifyAccessToken(tokens.accessToken);

      expect(payload.userId).toBe(mockUserId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.sessionId).toBe(sessionId);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        jwtService.verifyAccessToken("invalid-token");
      }).toThrow("Invalid access token");
    });

    it("should throw error for expired token", () => {
      // Create a token with very short expiry
      const expiredToken = jwt.sign(
        { userId: mockUserId, email: mockUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: "0s" }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => {
          jwtService.verifyAccessToken(expiredToken);
        }).toThrow("Access token expired");
      }, 100);
    });

    it("should throw error for token with wrong secret", () => {
      const wrongToken = jwt.sign(
        { userId: mockUserId, email: mockUser.email },
        "wrong-secret",
        { expiresIn: "15m" }
      );

      expect(() => {
        jwtService.verifyAccessToken(wrongToken);
      }).toThrow("Invalid access token");
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const payload = jwtService.verifyRefreshToken(tokens.refreshToken);

      expect(payload.userId).toBe(mockUserId);
      expect(payload.sessionId).toBe(sessionId);
    });

    it("should throw error for invalid refresh token", () => {
      expect(() => {
        jwtService.verifyRefreshToken("invalid-token");
      }).toThrow();
    });
  });

  describe("refreshAccessToken", () => {
    it("should generate new access token from refresh token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const newAccessToken = jwtService.refreshAccessToken(tokens.refreshToken, mockUser);

      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe("string");

      const payload = jwtService.verifyAccessToken(newAccessToken);
      expect(payload.userId).toBe(mockUserId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.sessionId).toBe(sessionId);
    });

    it("should throw error for invalid refresh token", () => {
      expect(() => {
        jwtService.refreshAccessToken("invalid-token", mockUser);
      }).toThrow();
    });
  });

  describe("decodeToken", () => {
    it("should decode token without verification", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const decoded = jwtService.decodeToken(tokens.accessToken) as any;

      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockUser.email);
    });

    it("should return null for invalid token", () => {
      const decoded = jwtService.decodeToken("invalid-token");
      expect(decoded).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const isExpired = jwtService.isTokenExpired(tokens.accessToken);

      expect(isExpired).toBe(false);
    });

    it("should return true for expired token", () => {
      const expiredToken = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET!,
        { expiresIn: "0s" }
      );

      setTimeout(() => {
        const isExpired = jwtService.isTokenExpired(expiredToken);
        expect(isExpired).toBe(true);
      }, 100);
    });

    it("should return true for invalid token", () => {
      const isExpired = jwtService.isTokenExpired("invalid-token");
      expect(isExpired).toBe(true);
    });
  });

  describe("getTokenExpiry", () => {
    it("should return expiry date for valid token", () => {
      const tokens = jwtService.generateTokenPair(mockUser, sessionId);
      const expiry = jwtService.getTokenExpiry(tokens.accessToken);

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry!.getTime()).toBeGreaterThan(Date.now());
    });

    it("should return null for invalid token", () => {
      const expiry = jwtService.getTokenExpiry("invalid-token");
      expect(expiry).toBeNull();
    });
  });

  describe("generateEmailVerificationToken", () => {
    it("should generate email verification token", () => {
      const token = jwtService.generateEmailVerificationToken(mockUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwtService.decodeToken(token) as any;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.type).toBe("email_verification");
      expect(decoded.iss).toBe("quiz-platform");
      expect(decoded.aud).toBe("quiz-platform-email");
    });
  });

  describe("verifyEmailVerificationToken", () => {
    it("should verify valid email verification token", () => {
      const token = jwtService.generateEmailVerificationToken(mockUserId);
      const payload = jwtService.verifyEmailVerificationToken(token);

      expect(payload.userId).toBe(mockUserId);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        jwtService.verifyEmailVerificationToken("invalid-token");
      }).toThrow("Invalid email verification token");
    });

    it("should throw error for wrong token type", () => {
      const wrongTypeToken = jwt.sign(
        { userId: mockUserId, type: "password_reset" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h", issuer: "quiz-platform", audience: "quiz-platform-email" }
      );

      expect(() => {
        jwtService.verifyEmailVerificationToken(wrongTypeToken);
      }).toThrow("Invalid token type");
    });
  });

  describe("generatePasswordResetToken", () => {
    it("should generate password reset token", () => {
      const token = jwtService.generatePasswordResetToken(mockUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwtService.decodeToken(token) as any;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.type).toBe("password_reset");
      expect(decoded.iss).toBe("quiz-platform");
      expect(decoded.aud).toBe("quiz-platform-password-reset");
    });
  });

  describe("verifyPasswordResetToken", () => {
    it("should verify valid password reset token", () => {
      const token = jwtService.generatePasswordResetToken(mockUserId);
      const payload = jwtService.verifyPasswordResetToken(token);

      expect(payload.userId).toBe(mockUserId);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        jwtService.verifyPasswordResetToken("invalid-token");
      }).toThrow("Invalid password reset token");
    });

    it("should throw error for wrong token type", () => {
      const wrongTypeToken = jwt.sign(
        { userId: mockUserId, type: "email_verification" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h", issuer: "quiz-platform", audience: "quiz-platform-password-reset" }
      );

      expect(() => {
        jwtService.verifyPasswordResetToken(wrongTypeToken);
      }).toThrow("Invalid token type");
    });
  });

  describe("parseExpiry", () => {
    it("should parse seconds correctly", () => {
      const service = new JWTService();
      // @ts-expect-error - accessing private method for testing
      const seconds = service.parseExpiry("30s");
      expect(seconds).toBe(30);
    });

    it("should parse minutes correctly", () => {
      const service = new JWTService();
      // @ts-expect-error - accessing private method for testing
      const seconds = service.parseExpiry("15m");
      expect(seconds).toBe(900); // 15 * 60
    });

    it("should parse hours correctly", () => {
      const service = new JWTService();
      // @ts-expect-error - accessing private method for testing
      const seconds = service.parseExpiry("2h");
      expect(seconds).toBe(7200); // 2 * 60 * 60
    });

    it("should parse days correctly", () => {
      const service = new JWTService();
      // @ts-expect-error - accessing private method for testing
      const seconds = service.parseExpiry("7d");
      expect(seconds).toBe(604800); // 7 * 24 * 60 * 60
    });

    it("should throw error for invalid format", () => {
      const service = new JWTService();
      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.parseExpiry("invalid");
      }).toThrow("Invalid expiry format");
    });
  });
});
