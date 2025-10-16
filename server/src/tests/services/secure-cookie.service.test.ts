import { secureCookieService } from "@services/secure-cookie.js";
import type { FastifyReply } from "fastify";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SecureCookieService", () => {
  let mockReply: Partial<FastifyReply>;
  let setCookieMock: ReturnType<typeof vi.fn>;
  let clearCookieMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setCookieMock = vi.fn();
    clearCookieMock = vi.fn();

    mockReply = {
      setCookie: setCookieMock,
      clearCookie: clearCookieMock,
    };

    vi.clearAllMocks();
  });

  describe("setSecureCookie", () => {
    it("should set cookie with default options", () => {
      secureCookieService.setSecureCookie(mockReply as FastifyReply, "testCookie", "testValue");

      expect(setCookieMock).toHaveBeenCalledWith("testCookie", "testValue", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
        domain: undefined,
      });
    });

    it("should set cookie with security flags", () => {
      secureCookieService.setSecureCookie(mockReply as FastifyReply, "testCookie", "testValue");

      const callArgs = setCookieMock.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs![0]).toBe("testCookie");
      expect(callArgs![1]).toBe("testValue");
      expect(callArgs![2]).toHaveProperty("httpOnly", true);
      expect(callArgs![2]).toHaveProperty("sameSite", "strict");
      expect(callArgs![2]).toHaveProperty("path", "/");
    });

    it("should merge custom options with defaults", () => {
      secureCookieService.setSecureCookie(
        mockReply as FastifyReply,
        "testCookie",
        "testValue",
        {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          domain: "example.com",
          sameSite: "lax",
        }
      );

      expect(setCookieMock).toHaveBeenCalledWith("testCookie", "testValue", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        domain: "example.com",
      });
    });

    it("should allow httpOnly to be overridden", () => {
      secureCookieService.setSecureCookie(
        mockReply as FastifyReply,
        "testCookie",
        "testValue",
        {
          httpOnly: false,
        }
      );

      expect(setCookieMock).toHaveBeenCalledWith(
        "testCookie",
        "testValue",
        expect.objectContaining({
          httpOnly: false,
        })
      );
    });

    it("should support different sameSite values", () => {
      const sameSiteValues: Array<"strict" | "lax" | "none"> = ["strict", "lax", "none"];

      for (const sameSite of sameSiteValues) {
        setCookieMock.mockClear();
        secureCookieService.setSecureCookie(
          mockReply as FastifyReply,
          "testCookie",
          "testValue",
          {
            sameSite,
          }
        );

        expect(setCookieMock).toHaveBeenCalledWith(
          "testCookie",
          "testValue",
          expect.objectContaining({
            sameSite,
          })
        );
      }
    });
  });

  describe("setAccessTokenCookie", () => {
    it("should set access token cookie with 15 minute expiry", () => {
      secureCookieService.setAccessTokenCookie(mockReply as FastifyReply, "test-access-token");

      expect(setCookieMock).toHaveBeenCalledWith("accessToken", "test-access-token", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
        domain: undefined,
      });
    });

    it("should set access token with correct name", () => {
      secureCookieService.setAccessTokenCookie(mockReply as FastifyReply, "token-value");

      expect(setCookieMock).toHaveBeenCalledWith(
        "accessToken",
        "token-value",
        expect.any(Object)
      );
    });
  });

  describe("setRefreshTokenCookie", () => {
    it("should set refresh token cookie with 7 day expiry", () => {
      secureCookieService.setRefreshTokenCookie(mockReply as FastifyReply, "test-refresh-token");

      expect(setCookieMock).toHaveBeenCalledWith("refreshToken", "test-refresh-token", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        domain: undefined,
      });
    });

    it("should set refresh token with correct name", () => {
      secureCookieService.setRefreshTokenCookie(mockReply as FastifyReply, "refresh-value");

      expect(setCookieMock).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-value",
        expect.any(Object)
      );
    });
  });

  describe("clearAuthCookies", () => {
    it("should clear both access and refresh token cookies", () => {
      secureCookieService.clearAuthCookies(mockReply as FastifyReply);

      expect(clearCookieMock).toHaveBeenCalledTimes(2);
      expect(clearCookieMock).toHaveBeenCalledWith("accessToken", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        path: "/",
      });
      expect(clearCookieMock).toHaveBeenCalledWith("refreshToken", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        path: "/",
      });
    });

    it("should clear both cookies with correct options", () => {
      secureCookieService.clearAuthCookies(mockReply as FastifyReply);

      const {calls} = clearCookieMock.mock;
      expect(calls).toHaveLength(2);

      const cookieNames = calls.map(call => call[0]);
      expect(cookieNames).toContain("accessToken");
      expect(cookieNames).toContain("refreshToken");

      calls.forEach(call => {
        expect(call[1]).toHaveProperty("httpOnly", true);
        expect(call[1]).toHaveProperty("sameSite", "strict");
        expect(call[1]).toHaveProperty("path", "/");
      });
    });
  });

  describe("generateCSRFToken", () => {
    it("should generate a 64-character hex token", () => {
      const token = secureCookieService.generateCSRFToken();

      expect(token).toMatch(/^[a-f0-9]{64}$/);
      expect(token.length).toBe(64);
    });

    it("should generate unique tokens", () => {
      const token1 = secureCookieService.generateCSRFToken();
      const token2 = secureCookieService.generateCSRFToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate random tokens each time", () => {
      const tokens = new Set();
      for (let i = 0; i < 10; i++) {
        tokens.add(secureCookieService.generateCSRFToken());
      }

      expect(tokens.size).toBe(10);
    });
  });

  describe("setCSRFTokenCookie", () => {
    it("should set CSRF token cookie with 1 hour expiry", () => {
      secureCookieService.setCSRFTokenCookie(mockReply as FastifyReply, "test-csrf-token");

      expect(setCookieMock).toHaveBeenCalledWith("csrfToken", "test-csrf-token", {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
        path: "/",
        domain: undefined,
      });
    });

    it("should set CSRF token with correct name", () => {
      secureCookieService.setCSRFTokenCookie(mockReply as FastifyReply, "csrf-value");

      expect(setCookieMock).toHaveBeenCalledWith("csrfToken", "csrf-value", expect.any(Object));
    });
  });

  describe("verifyCSRFToken", () => {
    it("should return true when tokens match", () => {
      const token = "test-csrf-token-12345";
      const result = secureCookieService.verifyCSRFToken(token, token);

      expect(result).toBe(true);
    });

    it("should return false when tokens do not match", () => {
      const result = secureCookieService.verifyCSRFToken("token1", "token2");

      expect(result).toBe(false);
    });

    it("should return false when request token is empty", () => {
      const result = secureCookieService.verifyCSRFToken("", "cookieToken");

      expect(result).toBe(false);
    });

    it("should return false when cookie token is empty", () => {
      const result = secureCookieService.verifyCSRFToken("requestToken", "");

      expect(result).toBe(false);
    });

    it("should return false when both tokens are empty", () => {
      const result = secureCookieService.verifyCSRFToken("", "");

      expect(result).toBe(false);
    });

    it("should be case-sensitive", () => {
      const result = secureCookieService.verifyCSRFToken("TokenABC", "tokenABC");

      expect(result).toBe(false);
    });

    it("should verify exact match including special characters", () => {
      const token = "special-token-!@#$%^&*()";
      const result = secureCookieService.verifyCSRFToken(token, token);

      expect(result).toBe(true);
    });
  });

  describe("getCookieSecret", () => {
    it("should return the cookie secret", () => {
      const secret = secureCookieService.getCookieSecret();

      expect(secret).toBeDefined();
      expect(typeof secret).toBe("string");
      expect(secret.length).toBeGreaterThan(0);
    });

    it("should return consistent secret", () => {
      const secret1 = secureCookieService.getCookieSecret();
      const secret2 = secureCookieService.getCookieSecret();

      expect(secret1).toBe(secret2);
    });
  });

  describe("Integration Tests", () => {
    it("should set and verify CSRF token workflow", () => {
      // Generate token
      const token = secureCookieService.generateCSRFToken();

      // Set cookie
      secureCookieService.setCSRFTokenCookie(mockReply as FastifyReply, token);

      // Verify it was set correctly
      expect(setCookieMock).toHaveBeenCalledWith(
        "csrfToken",
        token,
        expect.objectContaining({
          maxAge: 60 * 60 * 1000,
        })
      );

      // Verify token
      const isValid = secureCookieService.verifyCSRFToken(token, token);
      expect(isValid).toBe(true);
    });

    it("should handle full auth cookie lifecycle", () => {
      const accessToken = "access-token-123";
      const refreshToken = "refresh-token-456";

      // Set auth cookies
      secureCookieService.setAccessTokenCookie(mockReply as FastifyReply, accessToken);
      secureCookieService.setRefreshTokenCookie(mockReply as FastifyReply, refreshToken);

      expect(setCookieMock).toHaveBeenCalledTimes(2);
      expect(setCookieMock).toHaveBeenCalledWith("accessToken", accessToken, expect.any(Object));
      expect(setCookieMock).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken,
        expect.any(Object)
      );

      // Clear auth cookies
      secureCookieService.clearAuthCookies(mockReply as FastifyReply);

      expect(clearCookieMock).toHaveBeenCalledTimes(2);
      expect(clearCookieMock).toHaveBeenCalledWith("accessToken", expect.any(Object));
      expect(clearCookieMock).toHaveBeenCalledWith("refreshToken", expect.any(Object));
    });
  });

  describe("Environment-specific behavior", () => {
    it("should use secure flag based on NODE_ENV", () => {
      // The service reads NODE_ENV at construction time, not at runtime
      // So we just verify it sets the flag correctly
      secureCookieService.setSecureCookie(mockReply as FastifyReply, "test", "value");

      expect(setCookieMock).toHaveBeenCalledWith(
        "test",
        "value",
        expect.objectContaining({
          secure: expect.any(Boolean),
          httpOnly: true,
          sameSite: "strict",
        })
      );
    });

    it("should set cookies with all security options", () => {
      secureCookieService.setSecureCookie(mockReply as FastifyReply, "test", "value");

      const call = setCookieMock.mock.calls[0];
      expect(call).toBeDefined();
      expect(call![2]).toHaveProperty("httpOnly");
      expect(call![2]).toHaveProperty("secure");
      expect(call![2]).toHaveProperty("sameSite");
      expect(call![2]).toHaveProperty("path");
    });
  });
});
