/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAuthMiddleware, optionalAuth } from "@middlewares/auth.middleware.js";
import { Session } from "@models/Session.js";
import { User } from "@models/User.js";
import { jwtService } from "@services/jwt.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock dependencies
vi.mock("@services/jwt.js");
vi.mock("@models/Session.js");
vi.mock("@models/User.js");

describe("Auth Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ send: sendMock });

    mockRequest = {
      headers: {},
      log: {
        error: vi.fn(),
        debug: vi.fn(),
      } as any,
    };

    mockReply = {
      status: statusMock,
      send: sendMock,
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createAuthMiddleware", () => {
    it("should authenticate user with valid token", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        entitlements: ["JUNIOR"],
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.authUser).toEqual({
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isEmailVerified: true,
      });
      expect(mockRequest.sessionId).toBe("session123");
      expect(mockSession.refresh).toHaveBeenCalled();
    });

    it("should reject request without authorization header", async () => {
      mockRequest.headers = {};

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      });
    });

    it("should reject request with malformed authorization header", async () => {
      mockRequest.headers = {
        authorization: "InvalidFormat",
      };

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      });
    });

    it("should reject request with expired token", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Access token expired");
      });

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Access token expired",
        errorCode: "TOKEN_EXPIRED",
      });
    });

    it("should accept expired token when allowExpiredTokens is true", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        sessionId: "session123",
      };

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Access token expired");
      });
      (jwtService.decodeToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ allowExpiredTokens: true });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.authUser).toBeDefined();
    });

    it("should reject request with invalid token", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Invalid access token");
      });

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Invalid access token",
      });
    });

    it("should reject request when session not found", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(null);

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Session not found or expired",
      });
    });

    it("should reject request when user not found or inactive", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        sessionId: "session123",
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "User not found or inactive",
      });
    });

    it("should reject unverified email when requireEmailVerification is true", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: false,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ requireEmailVerification: true });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({
        code: 403,
        error: "Forbidden",
        message: "Email verification required",
      });
    });

    it("should reject user without required role", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ requiredRole: ["admin"] });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({
        code: 403,
        error: "Forbidden",
        message: "Insufficient permissions",
      });
    });

    it("should accept user with required role", async () => {
      const mockUser = {
        _id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        entitlements: ["BUNDLE"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "admin123",
        email: "admin@example.com",
        role: "admin",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ requiredRole: ["admin"] });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.authUser).toBeDefined();
      expect(mockRequest.authUser?.role).toBe("admin");
    });

    it("should reject user without required entitlements", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ requiredEntitlements: ["SENIOR", "BUNDLE"] });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith({
        code: 403,
        error: "Forbidden",
        message: "Insufficient entitlements",
      });
    });

    it("should accept user with all required entitlements", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const middleware = createAuthMiddleware({ requiredEntitlements: ["INTERMEDIATE"] });
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.authUser).toBeDefined();
      expect(mockRequest.authUser?.entitlements).toContain("INTERMEDIATE");
    });

    it("should handle internal errors gracefully", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const middleware = createAuthMiddleware();
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Should return 401 for authentication errors, not 500
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({
        code: 401,
        error: "Unauthorized",
        message: "Invalid access token",
      });
    });
  });

  describe("optionalAuth", () => {
    it("should authenticate user when valid token provided", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSession = {
        _id: "session123",
        refresh: vi.fn(),
      };

      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(mockSession);
      (User.findById as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await optionalAuth(mockRequest as FastifyRequest);

      expect(mockRequest.authUser).toBeDefined();
      expect(mockRequest.sessionId).toBe("session123");
    });

    it("should not fail when no token provided", async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as FastifyRequest);

      expect(mockRequest.authUser).toBeUndefined();
      expect(mockRequest.sessionId).toBeUndefined();
    });

    it("should not fail when invalid token provided", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await optionalAuth(mockRequest as FastifyRequest);

      expect(mockRequest.authUser).toBeUndefined();
    });

    it("should not fail when session not found", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        sessionId: "session123",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockReturnValue(mockPayload);
      (Session.findActiveByAccessToken as any) = vi.fn().mockResolvedValue(null);

      await optionalAuth(mockRequest as FastifyRequest);

      expect(mockRequest.authUser).toBeUndefined();
    });

    it("should not fail on unexpected errors", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwtService.verifyAccessToken as any) = vi.fn().mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      await expect(optionalAuth(mockRequest as FastifyRequest)).resolves.not.toThrow();
      expect(mockRequest.authUser).toBeUndefined();
    });
  });
});
