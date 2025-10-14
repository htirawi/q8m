/**
 * Migration Logic Tests
 * Tests for content migration utilities
 */

import { describe, it, expect } from "vitest";
import {
  normalizeDifficulty,
  difficultyToLevel,
  mapSourceDifficultyToLevel,
  getLevelConfig,
  getContentLimits,
  validateContentCounts,
} from "../../config/levels";
import {
  mapCategory,
  getCategoryTopic,
  getFrameworkConfig,
  getActiveFrameworks,
  getFrameworkTopics,
} from "../../config/taxonomy";

describe("Migration Utilities", () => {
  describe("Difficulty Normalization", () => {
    it("should normalize standard difficulties", () => {
      expect(normalizeDifficulty("easy")).toBe("easy");
      expect(normalizeDifficulty("medium")).toBe("medium");
      expect(normalizeDifficulty("hard")).toBe("hard");
    });

    it("should map legacy difficulty values", () => {
      expect(normalizeDifficulty("beginner")).toBe("easy");
      expect(normalizeDifficulty("intermediate")).toBe("medium");
      expect(normalizeDifficulty("advanced")).toBe("hard");
      expect(normalizeDifficulty("senior")).toBe("hard");
      expect(normalizeDifficulty("expert")).toBe("hard");
    });

    it("should handle numeric difficulties", () => {
      expect(normalizeDifficulty("1")).toBe("easy");
      expect(normalizeDifficulty("2")).toBe("medium");
      expect(normalizeDifficulty("3")).toBe("hard");
    });

    it("should handle case insensitivity", () => {
      expect(normalizeDifficulty("EASY")).toBe("easy");
      expect(normalizeDifficulty("Hard")).toBe("hard");
      expect(normalizeDifficulty("  medium  ")).toBe("medium");
    });

    it("should default to medium for unknown values", () => {
      expect(normalizeDifficulty("unknown")).toBe("medium");
      expect(normalizeDifficulty("")).toBe("medium");
      expect(normalizeDifficulty(undefined)).toBe("medium");
    });
  });

  describe("Difficulty to Level Mapping", () => {
    it("should map difficulties to levels", () => {
      expect(difficultyToLevel("easy")).toBe("junior");
      expect(difficultyToLevel("medium")).toBe("intermediate");
      expect(difficultyToLevel("hard")).toBe("senior");
    });

    it("should map source difficulty directly to level", () => {
      expect(mapSourceDifficultyToLevel("beginner")).toBe("junior");
      expect(mapSourceDifficultyToLevel("intermediate")).toBe("intermediate");
      expect(mapSourceDifficultyToLevel("expert")).toBe("senior");
    });
  });

  describe("Level Configuration", () => {
    it("should get level config", () => {
      const juniorConfig = getLevelConfig("junior");
      expect(juniorConfig).toBeDefined();
      expect(juniorConfig.isFree).toBe(true);
      expect(juniorConfig.maxStudyItems).toBe(50);
      expect(juniorConfig.maxQuestions).toBe(50);
    });

    it("should get content limits", () => {
      const juniorLimits = getContentLimits("junior");
      expect(juniorLimits.maxStudyItems).toBe(50);
      expect(juniorLimits.maxQuestions).toBe(50);

      const bundleLimits = getContentLimits("bundle");
      expect(bundleLimits.maxStudyItems).toBe(Infinity);
      expect(bundleLimits.maxQuestions).toBe(Infinity);
    });

    it("should validate content counts", () => {
      const validResult = validateContentCounts("junior", 40, 45);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidResult = validateContentCounts("junior", 60, 70);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it("should allow unlimited for bundle tier", () => {
      const result = validateContentCounts("bundle", 1000, 1000);
      expect(result.valid).toBe(true);
    });
  });

  describe("Category Mapping", () => {
    it("should map known Angular categories", () => {
      expect(mapCategory("HTTP", "angular")).toBe("http");
      expect(mapCategory("RxJS", "angular")).toBe("rxjs");
      expect(mapCategory("Core Concepts", "angular")).toBe("core-concepts");
      expect(mapCategory("Signals", "angular")).toBe("signals");
    });

    it("should map known React categories", () => {
      expect(mapCategory("Hooks", "react")).toBe("hooks");
      expect(mapCategory("Components", "react")).toBe("components");
    });

    it("should map known Next.js categories", () => {
      expect(mapCategory("SSR", "nextjs")).toBe("ssr");
      expect(mapCategory("API Routes", "nextjs")).toBe("api-routes");
    });

    it("should fallback to kebab-case for unknown categories", () => {
      expect(mapCategory("Unknown Category", "angular")).toBe("unknown-category");
      expect(mapCategory("New Topic Here", "react")).toBe("new-topic-here");
    });

    it("should handle case insensitivity", () => {
      expect(mapCategory("hooks", "react")).toBe("hooks");
      expect(mapCategory("HOOKS", "react")).toBe("hooks");
    });

    it("should get topic from category", () => {
      const topic = getCategoryTopic("rxjs", "angular");
      expect(topic).toBe("rxjs");
    });
  });

  describe("Framework Configuration", () => {
    it("should get framework config", () => {
      const angularConfig = getFrameworkConfig("angular");
      expect(angularConfig).toBeDefined();
      expect(angularConfig.id).toBe("angular");
      expect(angularConfig.name.en).toBe("Angular");
      expect(angularConfig.isActive).toBe(true);
    });

    it("should get active frameworks", () => {
      const activeFrameworks = getActiveFrameworks();
      expect(activeFrameworks).toContain("angular");
      expect(activeFrameworks).toContain("react");
      expect(activeFrameworks).toContain("nextjs");
    });

    it("should get framework topics", () => {
      const angularTopics = getFrameworkTopics("angular");
      expect(angularTopics).toContain("core-concepts");
      expect(angularTopics).toContain("rxjs");
      expect(angularTopics).toContain("ngrx");
      expect(angularTopics).toContain("signals");

      const reactTopics = getFrameworkTopics("react");
      expect(reactTopics).toContain("hooks");
      expect(reactTopics).toContain("state-management");
      expect(reactTopics).toContain("concurrent-features");
    });

    it("should have bilingual names", () => {
      const angularConfig = getFrameworkConfig("angular");
      expect(angularConfig.name.en).toBe("Angular");
      expect(angularConfig.name.ar).toBe("أنغولار");

      const vueConfig = getFrameworkConfig("vue");
      expect(vueConfig.name.en).toBe("Vue.js");
      expect(vueConfig.name.ar).toBe("فيو جي إس");
    });
  });
});

describe("ID Generation", () => {
  it("should generate stable IDs", () => {
    // Simulating the ID generation from migration script
    const crypto = await import("node:crypto");

    function generateStableId(framework: string, topic: string, text: string): string {
      const hash = crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
      return `${framework}:${topic}:${hash}`;
    }

    const id1 = generateStableId("angular", "core", "What is Angular?");
    const id2 = generateStableId("angular", "core", "What is Angular?");

    expect(id1).toBe(id2); // Stable: same input = same ID
  });

  it("should generate different IDs for different content", () => {
    const crypto = await import("node:crypto");

    function generateStableId(framework: string, topic: string, text: string): string {
      const hash = crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
      return `${framework}:${topic}:${hash}`;
    }

    const id1 = generateStableId("angular", "core", "What is Angular?");
    const id2 = generateStableId("angular", "core", "What is React?");

    expect(id1).not.toBe(id2);
  });
});

describe("Slugification", () => {
  it("should create valid slugs", () => {
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    expect(slugify("What is Angular?")).toBe("what-is-angular");
    expect(slugify("How to use useState() hook")).toBe("how-to-use-usestate-hook");
    expect(slugify("SSR vs CSR: Comparison")).toBe("ssr-vs-csr-comparison");
  });

  it("should handle special characters", () => {
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    expect(slugify("React@19 Features!")).toBe("react19-features");
    expect(slugify("Component & Service")).toBe("component-service");
  });
});
