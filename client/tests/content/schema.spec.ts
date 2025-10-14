/**
 * Content Schema Tests
 * Tests for Zod schema validation
 */

import { describe, it, expect } from "vitest";
import {
  StudyItemSchema,
  QuestionSchema,
  ContentPackSchema,
  validateStudyItem,
  validateQuestion,
  validateContentPack,
  safeValidateStudyItem,
  safeValidateQuestion,
  DifficultyEnum,
  LevelEnum,
  FrameworkEnum,
  QuestionTypeEnum,
} from "../../config/content.schema";

describe("Content Schemas", () => {
  describe("StudyItemSchema", () => {
    it("should validate a complete study item", () => {
      const validStudyItem = {
        id: "angular:core:abc123",
        framework: "angular",
        topic: "core-concepts",
        category: "Core Concepts",
        title: {
          en: "What is Angular?",
          ar: "ما هو أنغولار؟",
        },
        slug: "what-is-angular",
        bodyMdx: {
          en: "Angular is a TypeScript-based web application framework.",
          ar: "أنغولار هو إطار تطبيق ويب مبني على TypeScript.",
        },
        difficulty: "medium",
        level: "intermediate",
        tags: ["angular", "core", "basics"],
        updatedAt: new Date(),
        isActive: true,
        legacyId: 1,
        sourceFile: "angular-enhanced.ts",
      };

      const result = StudyItemSchema.parse(validStudyItem);
      expect(result).toBeDefined();
      expect(result.id).toBe(validStudyItem.id);
    });

    it("should reject invalid framework", () => {
      const invalidItem = {
        id: "invalid:core:abc123",
        framework: "invalid",
        topic: "core",
        title: { en: "Test" },
        slug: "test",
        bodyMdx: { en: "Body" },
        difficulty: "medium",
        level: "intermediate",
        tags: ["test"],
        updatedAt: new Date(),
      };

      expect(() => StudyItemSchema.parse(invalidItem)).toThrow();
    });

    it("should reject invalid slug format", () => {
      const invalidItem = {
        id: "angular:core:abc123",
        framework: "angular",
        topic: "core",
        title: { en: "Test" },
        slug: "Invalid Slug With Spaces",
        bodyMdx: { en: "Body" },
        difficulty: "medium",
        level: "intermediate",
        tags: ["test"],
        updatedAt: new Date(),
      };

      expect(() => StudyItemSchema.parse(invalidItem)).toThrow(/kebab-case/);
    });

    it("should allow missing AR translation", () => {
      const itemWithoutAr = {
        id: "react:hooks:def456",
        framework: "react",
        topic: "hooks",
        title: { en: "useState Hook" },
        slug: "usestate-hook",
        bodyMdx: { en: "useState is a React Hook..." },
        difficulty: "easy",
        level: "junior",
        tags: ["react", "hooks"],
        updatedAt: new Date(),
      };

      const result = StudyItemSchema.parse(itemWithoutAr);
      expect(result.title.ar).toBeUndefined();
    });

    it("should require at least one tag", () => {
      const itemWithoutTags = {
        id: "vue:core:ghi789",
        framework: "vue",
        topic: "core",
        title: { en: "Test" },
        slug: "test",
        bodyMdx: { en: "Body" },
        difficulty: "hard",
        level: "senior",
        tags: [],
        updatedAt: new Date(),
      };

      expect(() => StudyItemSchema.parse(itemWithoutTags)).toThrow(/at least one tag/i);
    });
  });

  describe("QuestionSchema", () => {
    it("should validate MCQ question", () => {
      const mcqQuestion = {
        id: "angular:rxjs:xyz123",
        framework: "angular",
        topic: "rxjs",
        category: "RxJS",
        type: "mcq",
        promptMdx: {
          en: "What does the pipe operator do?",
          ar: "ماذا يفعل عامل التوصيل؟",
        },
        options: [
          { id: "a", text: { en: "Option A" }, isCorrect: false },
          { id: "b", text: { en: "Option B" }, isCorrect: true },
          { id: "c", text: { en: "Option C" }, isCorrect: false },
        ],
        explanationMdx: {
          en: "The pipe operator chains RxJS operators.",
        },
        difficulty: "medium",
        level: "intermediate",
        points: 2,
        tags: ["rxjs", "operators"],
        updatedAt: new Date(),
        isActive: true,
      };

      const result = QuestionSchema.parse(mcqQuestion);
      expect(result).toBeDefined();
      expect(result.type).toBe("mcq");
      expect(result.options).toHaveLength(3);
    });

    it("should validate fill-in-blank question", () => {
      const fibQuestion = {
        id: "react:hooks:fib001",
        framework: "react",
        topic: "hooks",
        type: "fib",
        promptMdx: {
          en: "Complete: React uses _____ for state management.",
        },
        answerKey: "useState",
        explanationMdx: {
          en: "useState is the primary hook for state.",
        },
        difficulty: "easy",
        level: "junior",
        points: 1,
        tags: ["react", "hooks", "state"],
        updatedAt: new Date(),
      };

      const result = QuestionSchema.parse(fibQuestion);
      expect(result.type).toBe("fib");
      expect(result.answerKey).toBe("useState");
    });

    it("should validate multiple checkbox question", () => {
      const multiQuestion = {
        id: "nextjs:routing:multi001",
        framework: "nextjs",
        topic: "routing",
        type: "multi",
        promptMdx: {
          en: "Select all valid Next.js routing features:",
        },
        options: [
          { id: "a", text: { en: "Dynamic routes" }, isCorrect: true },
          { id: "b", text: { en: "Catch-all routes" }, isCorrect: true },
          { id: "c", text: { en: "Invalid option" }, isCorrect: false },
        ],
        answerKey: ["a", "b"],
        explanationMdx: {
          en: "Dynamic and catch-all routes are supported.",
        },
        difficulty: "hard",
        level: "senior",
        points: 3,
        tags: ["nextjs", "routing"],
        updatedAt: new Date(),
      };

      const result = QuestionSchema.parse(multiQuestion);
      expect(result.type).toBe("multi");
      expect(Array.isArray(result.answerKey)).toBe(true);
    });

    it("should reject invalid question type", () => {
      const invalidQuestion = {
        id: "test:core:invalid",
        framework: "angular",
        topic: "core",
        type: "invalid-type",
        promptMdx: { en: "Test question?" },
        difficulty: "medium",
        level: "intermediate",
        points: 1,
        tags: ["test"],
        updatedAt: new Date(),
      };

      expect(() => QuestionSchema.parse(invalidQuestion)).toThrow();
    });
  });

  describe("ContentPackSchema", () => {
    it("should validate a content pack", () => {
      const pack = {
        id: "angular_junior",
        framework: "angular",
        level: "junior",
        name: {
          en: "Angular Junior Pack",
          ar: "حزمة أنغولار للمبتدئين",
        },
        description: {
          en: "Beginner Angular content",
          ar: "محتوى أنغولار للمبتدئين",
        },
        studyIds: ["angular:core:001", "angular:core:002"],
        questionIds: ["angular:quiz:001", "angular:quiz:002"],
        curator: "q8m",
        version: "1.0.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        expectedStudyCount: 50,
        expectedQuestionCount: 50,
      };

      const result = ContentPackSchema.parse(pack);
      expect(result).toBeDefined();
      expect(result.level).toBe("junior");
      expect(result.studyIds).toHaveLength(2);
    });

    it("should reject invalid SemVer", () => {
      const invalidPack = {
        id: "react_junior",
        framework: "react",
        level: "junior",
        name: { en: "React Pack" },
        studyIds: [],
        questionIds: [],
        curator: "q8m",
        version: "invalid-version",
        createdAt: new Date(),
        updatedAt: new Date(),
        expectedStudyCount: 50,
        expectedQuestionCount: 50,
      };

      expect(() => ContentPackSchema.parse(invalidPack)).toThrow(/SemVer/);
    });
  });

  describe("Safe Validation", () => {
    it("should return success for valid data", () => {
      const validItem = {
        id: "test:core:001",
        framework: "angular",
        topic: "core",
        title: { en: "Test" },
        slug: "test",
        bodyMdx: { en: "Body" },
        difficulty: "medium",
        level: "intermediate",
        tags: ["test"],
        updatedAt: new Date(),
      };

      const result = safeValidateStudyItem(validItem);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid data", () => {
      const invalidItem = {
        id: "test:core:001",
        framework: "invalid",
        topic: "core",
        title: { en: "Test" },
        slug: "test",
        bodyMdx: { en: "Body" },
        difficulty: "medium",
        level: "intermediate",
        tags: ["test"],
        updatedAt: new Date(),
      };

      const result = safeValidateStudyItem(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("Enum Validation", () => {
    it("should validate difficulty enum", () => {
      expect(() => DifficultyEnum.parse("easy")).not.toThrow();
      expect(() => DifficultyEnum.parse("medium")).not.toThrow();
      expect(() => DifficultyEnum.parse("hard")).not.toThrow();
      expect(() => DifficultyEnum.parse("invalid")).toThrow();
    });

    it("should validate level enum", () => {
      expect(() => LevelEnum.parse("junior")).not.toThrow();
      expect(() => LevelEnum.parse("intermediate")).not.toThrow();
      expect(() => LevelEnum.parse("senior")).not.toThrow();
      expect(() => LevelEnum.parse("bundle")).not.toThrow();
      expect(() => LevelEnum.parse("invalid")).toThrow();
    });

    it("should validate framework enum", () => {
      expect(() => FrameworkEnum.parse("angular")).not.toThrow();
      expect(() => FrameworkEnum.parse("react")).not.toThrow();
      expect(() => FrameworkEnum.parse("nextjs")).not.toThrow();
      expect(() => FrameworkEnum.parse("redux")).not.toThrow();
      expect(() => FrameworkEnum.parse("vue")).not.toThrow();
      expect(() => FrameworkEnum.parse("random")).not.toThrow();
      expect(() => FrameworkEnum.parse("invalid")).toThrow();
    });

    it("should validate question type enum", () => {
      expect(() => QuestionTypeEnum.parse("mcq")).not.toThrow();
      expect(() => QuestionTypeEnum.parse("fib")).not.toThrow();
      expect(() => QuestionTypeEnum.parse("tf")).not.toThrow();
      expect(() => QuestionTypeEnum.parse("multi")).not.toThrow();
      expect(() => QuestionTypeEnum.parse("invalid")).toThrow();
    });
  });
});
