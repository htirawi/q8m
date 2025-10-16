/**
 * Questions API Pagination Tests
 * Tests for GET /api/questions with pagination and multi-difficulty support
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { buildApp } from "../../app.js";
import { Question } from "../../models/Question.js";
import { User } from "../../models/User.js";
import { jwtService } from "../../services/jwt.service.js";
import type { FastifyInstance } from "fastify";
import { Session } from "../../models/Session.js";
import { Types } from "mongoose";

// Mock the JWT service to bypass authentication
vi.mock("../../services/jwt.service.js", () => ({
  jwtService: {
    verifyAccessToken: vi.fn().mockReturnValue({
      userId: "507f1f77bcf86cd799439011", // Valid ObjectId string
      email: "test@example.com",
      role: "user",
      entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"], // Allow access to all difficulties
    }),
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    }),
  },
}));

// Mock the Session model
vi.mock("../../models/Session.js", () => ({
  Session: {
    findById: vi.fn().mockResolvedValue({
      _id: "mock-session-id",
      isActive: true,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      refresh: vi.fn(),
    }),
    findActiveByAccessToken: vi.fn().mockResolvedValue({
      _id: "mock-session-id",
      refresh: vi.fn(),
    }),
  },
}));

describe("Questions API - Pagination & Multi-Difficulty", () => {
  let app: FastifyInstance;
  let authToken: string = "mock-access-token";
  let testUser: any;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create test user with the same ID as used in JWT mock
    testUser = await User.create({
      _id: "507f1f77bcf86cd799439011", // Same ObjectId as in JWT mock
      email: "questions-test@example.com",
      password: "TestPassword123!",
      name: "Questions Test User",
      isEmailVerified: true,
      isActive: true,
      entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"], // Allow access to all difficulties
    });
  });

  beforeEach(async () => {
    // Clear existing questions and create test data
    await Question.deleteMany({});

    // Create test questions with different difficulties and frameworks
    const testQuestions = [
      // Easy questions
      ...Array.from({ length: 12 }, (_, i) => ({
        framework: "angular" as const,
        level: "junior" as const,
        type: "multiple-choice" as const,
        category: "basics",
        difficulty: "easy" as const,
        tags: ["basic", "angular"],
        points: 1,
        content: {
          en: {
            question: `Easy Angular Question ${i + 1}`,
            options: [
              { id: "a", text: "Option A", isCorrect: true },
              { id: "b", text: "Option B", isCorrect: false },
              { id: "c", text: "Option C", isCorrect: false },
              { id: "d", text: "Option D", isCorrect: false },
            ],
            explanation: "This is an easy question explanation.",
          },
          ar: {
            question: `سؤال Angular سهل ${i + 1}`,
            explanation: "هذا شرح للسؤال السهل.",
          },
        },
        isActive: true,
      })),
      // Medium questions
      ...Array.from({ length: 15 }, (_, i) => ({
        framework: "react" as const,
        level: "intermediate" as const,
        type: "multiple-choice" as const,
        category: "hooks",
        difficulty: "medium" as const,
        tags: ["react", "hooks"],
        points: 2,
        content: {
          en: {
            question: `Medium React Question ${i + 1}`,
            options: [
              { id: "a", text: "Option A", isCorrect: false },
              { id: "b", text: "Option B", isCorrect: true },
              { id: "c", text: "Option C", isCorrect: false },
              { id: "d", text: "Option D", isCorrect: false },
            ],
            explanation: "This is a medium question explanation.",
          },
          ar: {
            question: `سؤال React متوسط ${i + 1}`,
            explanation: "هذا شرح للسؤال المتوسط.",
          },
        },
        isActive: true,
      })),
      // Hard questions
      ...Array.from({ length: 8 }, (_, i) => ({
        framework: "vue" as const,
        level: "senior" as const,
        type: "multiple-choice" as const,
        category: "advanced",
        difficulty: "hard" as const,
        tags: ["vue", "advanced"],
        points: 3,
        content: {
          en: {
            question: `Hard Vue Question ${i + 1}`,
            options: [
              { id: "a", text: "Option A", isCorrect: false },
              { id: "b", text: "Option B", isCorrect: false },
              { id: "c", text: "Option C", isCorrect: true },
              { id: "d", text: "Option D", isCorrect: false },
            ],
            explanation: "This is a hard question explanation.",
          },
          ar: {
            question: `سؤال Vue صعب ${i + 1}`,
            explanation: "هذا شرح للسؤال الصعب.",
          },
        },
        isActive: true,
      })),
    ];

    await Question.insertMany(testQuestions);
  });

  afterAll(async () => {
    // Clean up test data
    await Question.deleteMany({});
    await User.deleteMany({});
    await app.close();
  });

  describe("GET /api/questions", () => {
    it("should return default 10 questions", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty("questions");
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("limit");
      expect(data).toHaveProperty("offset");
      expect(data).toHaveProperty("hasMore");
      expect(Number(data.limit)).toBe(10);
    });

    it("should filter by difficulty=easy", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=easy",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);

      // All returned questions should be easy difficulty
      data.questions.forEach((q: any) => {
        expect(q.difficulty).toBe("easy");
      });
    });

    it("should filter by difficulty=medium", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=medium",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);

      data.questions.forEach((q: any) => {
        expect(q.difficulty).toBe("medium");
      });
    });

    it("should filter by difficulty=hard", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=hard",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);

      data.questions.forEach((q: any) => {
        expect(q.difficulty).toBe("hard");
      });
    });

    it("should respect custom limit", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=medium&limit=20",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Number(data.limit)).toBe(20);
      expect(data.questions.length).toBeLessThanOrEqual(20);
    });

    it("should support pagination with offset", async () => {
      // Get first page
      const page1 = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=medium&limit=5&offset=0",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data1 = JSON.parse(page1.payload);

      // Get second page
      const page2 = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=medium&limit=5&offset=5",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data2 = JSON.parse(page2.payload);

      // Questions should be different
      const ids1 = data1.questions.map((q: any) => q._id || q.id);
      const ids2 = data2.questions.map((q: any) => q._id || q.id);

      // No overlap in IDs
      const overlap = ids1.filter((id: string) => ids2.includes(id));
      expect(overlap.length).toBe(0);
    });

    it("should indicate hasMore correctly", async () => {
      // Request more than available for easy (12 total)
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=easy&limit=100&offset=0",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.hasMore).toBe(false);
      expect(data.questions.length).toBeLessThanOrEqual(data.total);
    });

    it("should handle offset beyond total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=easy&limit=10&offset=1000",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.questions).toHaveLength(0);
      expect(data.hasMore).toBe(false);
    });

    it("should filter by framework", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?framework=angular&limit=5",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);

      data.questions.forEach((q: any) => {
        expect(q.framework).toBe("angular");
      });
    });

    it("should combine filters (framework + difficulty)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?framework=angular&difficulty=hard&limit=5",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);

      data.questions.forEach((q: any) => {
        expect(q.framework).toBe("angular");
        expect(q.difficulty).toBe("hard");
      });
    });

    it("should validate query parameters", async () => {
      // Invalid difficulty
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=invalid",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Should reject invalid enum value
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Backward Compatibility", () => {
    it("should work without limit/offset (use defaults)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=easy",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Number(data.limit)).toBe(10); // Default
      expect(Number(data.offset)).toBe(0); // Default
    });

    it("should return questions array in response", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty=easy",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data.questions)).toBe(true);
    });
  });
});
