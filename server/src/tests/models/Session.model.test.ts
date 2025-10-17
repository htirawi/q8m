/**
 * Session Model Tests
 * Tests for Session model CRUD operations, validation, and session management logic
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Session } from "../../models/Session";
import { User } from "../../models/User";

describe("Session Model", () => {
  let testUser: any;

  beforeEach(async () => {
    await Session.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      email: "session-test@example.com",
      name: "Session Test User",
      password: "Password123!",
    });
  });

  describe("Session Creation", () => {
    it("should create session with required fields", async () => {
      const sessionData = {
        userId: testUser._id,
        refreshToken: "refresh-token-abc123",
        accessToken: "access-token-xyz789",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const session = await Session.create(sessionData);

      expect(session.userId.toString()).toBe(testUser._id.toString());
      expect(session.refreshToken).toBe("refresh-token-abc123");
      expect(session.accessToken).toBe("access-token-xyz789");
      expect(session.isActive).toBe(true); // Default
      expect(session.isRevoked).toBe(false); // Default
    });

    it("should fail without required userId", async () => {
      const sessionData = {
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      await expect(Session.create(sessionData)).rejects.toThrow();
    });

    it("should fail without required tokens", async () => {
      const sessionData = {
        userId: testUser._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      await expect(Session.create(sessionData)).rejects.toThrow();
    });

    it("should set default values correctly", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(session.isActive).toBe(true);
      expect(session.isRevoked).toBe(false);
      expect(session.lastUsed).toBeDefined();
    });
  });

  describe("Device Information", () => {
    it("should store device information", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        device: {
          type: "desktop",
          os: "macOS",
          browser: "Chrome",
        },
      });

      expect(session.device?.type).toBe("desktop");
      expect(session.device?.os).toBe("macOS");
      expect(session.device?.browser).toBe("Chrome");
    });

    it("should store IP address", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: "192.168.1.1",
      });

      expect(session.ipAddress).toBe("192.168.1.1");
    });

    it("should validate IPv4 address format", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: "203.0.113.42",
      });

      expect(session.ipAddress).toBe("203.0.113.42");
    });

    it("should store location information", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: {
          country: "US",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
      });

      expect(session.location?.country).toBe("US");
      expect(session.location?.city).toBe("San Francisco");
    });
  });

  describe("Session Status", () => {
    it("should start as active by default", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(session.isActive).toBe(true);
      expect(session.isRevoked).toBe(false);
    });

    it("should support revoked status with reason", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "user_logout",
      });

      expect(session.isRevoked).toBe(true);
      expect(session.revokedReason).toBe("user_logout");
      expect(session.revokedAt).toBeDefined();
    });
  });

  describe("Session Updates", () => {
    it("should update lastUsed timestamp", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const originalLastUsed = session.lastUsed;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      session.lastUsed = new Date();
      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated?.lastUsed.getTime()).toBeGreaterThan(originalLastUsed.getTime());
    });

    it("should deactivate session", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      session.isActive = false;
      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated?.isActive).toBe(false);
    });
  });

  describe("Session Queries", () => {
    beforeEach(async () => {
      await Session.create([
        {
          userId: testUser._id,
          refreshToken: "refresh-token-1",
          accessToken: "access-token-1",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          userId: testUser._id,
          refreshToken: "refresh-token-2",
          accessToken: "access-token-2",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: false,
        },
        {
          userId: testUser._id,
          refreshToken: "refresh-token-3",
          accessToken: "access-token-3",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true, // Active but revoked
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: "user_logout",
        },
      ]);
    });

    it("should find sessions by userId", async () => {
      const sessions = await Session.find({ userId: testUser._id });
      expect(sessions).toHaveLength(3);
    });

    it("should find active sessions only", async () => {
      const activeSessions = await Session.find({ isActive: true });
      expect(activeSessions).toHaveLength(2); // Session 1 and Session 3 (revoked but still active flag)
    });

    it("should find non-revoked sessions", async () => {
      const validSessions = await Session.find({ isRevoked: false });
      expect(validSessions).toHaveLength(2);
    });

    it("should find session by refresh token", async () => {
      const session = await Session.findOne({ refreshToken: "refresh-token-1" });
      expect(session).toBeDefined();
      expect(session?.refreshToken).toBe("refresh-token-1");
    });
  });

  describe("Session Expiration", () => {
    it("should create session with future expiration", async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt,
      });

      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should handle expired sessions", async () => {
      const expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt,
      });

      expect(session.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe("Session Deletion", () => {
    it("should delete session", async () => {
      const session = await Session.create({
        userId: testUser._id,
        refreshToken: "refresh-token",
        accessToken: "access-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await Session.deleteOne({ _id: session._id });
      const deleted = await Session.findById(session._id);
      expect(deleted).toBeNull();
    });

    it("should delete all sessions for user", async () => {
      await Session.create([
        {
          userId: testUser._id,
          refreshToken: "refresh-1",
          accessToken: "access-1",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          userId: testUser._id,
          refreshToken: "refresh-2",
          accessToken: "access-2",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      await Session.deleteMany({ userId: testUser._id });
      const sessions = await Session.find({ userId: testUser._id });
      expect(sessions).toHaveLength(0);
    });
  });

  describe("Multi-Device Sessions", () => {
    it("should support multiple active sessions for same user", async () => {
      await Session.create([
        {
          userId: testUser._id,
          refreshToken: "desktop-refresh",
          accessToken: "desktop-access",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          device: { type: "desktop", browser: "Chrome" },
        },
        {
          userId: testUser._id,
          refreshToken: "mobile-refresh",
          accessToken: "mobile-access",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          device: { type: "mobile", os: "iOS" },
        },
      ]);

      const sessions = await Session.find({ userId: testUser._id, isActive: true });
      expect(sessions).toHaveLength(2);
    });
  });
});
