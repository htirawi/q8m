/**
 * Questions API Pagination Tests
 * Tests for GET /api/questions with pagination and multi-difficulty support
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../app.js";
import type { FastifyInstance } from "fastify";

describe("Questions API - Pagination & Multi-Difficulty", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/questions", () => {
    it("should return default 10 questions", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/questions",
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
        url: "/api/questions?difficulty=easy",
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
        url: "/api/questions?difficulty=medium",
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
        url: "/api/questions?difficulty=hard",
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
        url: "/api/questions?difficulty=medium&limit=20",
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
        url: "/api/questions?difficulty=medium&limit=5&offset=0",
      });

      const data1 = JSON.parse(page1.payload);

      // Get second page
      const page2 = await app.inject({
        method: "GET",
        url: "/api/questions?difficulty=medium&limit=5&offset=5",
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
        url: "/api/questions?difficulty=easy&limit=100&offset=0",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.hasMore).toBe(false);
      expect(data.questions.length).toBeLessThanOrEqual(data.total);
    });

    it("should handle offset beyond total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/questions?difficulty=easy&limit=10&offset=1000",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.questions).toHaveLength(0);
      expect(data.hasMore).toBe(false);
    });

    it("should filter by framework", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/questions?framework=angular&limit=5",
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
        url: "/api/questions?framework=angular&difficulty=hard&limit=5",
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
        url: "/api/questions?difficulty=invalid",
      });

      // Should reject invalid enum value
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Backward Compatibility", () => {
    it("should work without limit/offset (use defaults)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/questions?difficulty=easy",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Number(data.limit)).toBe(10); // Default
      expect(Number(data.offset)).toBe(0); // Default
    });

    it("should return questions array in response", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/questions?difficulty=easy",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data.questions)).toBe(true);
    });
  });
});
