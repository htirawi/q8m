/**
 * Question Model Tests
 * Tests for Question model CRUD operations and business logic
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Question } from "../../models/Question";

describe("Question Model", () => {
  beforeEach(async () => {
    await Question.deleteMany({});
  });

  describe("Question Creation", () => {
    it("should create a question with required fields", async () => {
      const questionData = {
        framework: "angular",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["angular", "basics"],
        points: 1,
        content: {
          en: {
            question: "What is Angular?",
            options: [
              { id: "a", text: "A framework", isCorrect: true },
              { id: "b", text: "A library", isCorrect: false },
            ],
            explanation: "Angular is a framework.",
          },
        },
        isActive: true,
      };

      const question = await Question.create(questionData);

      expect(question.framework).toBe("angular");
      expect(question.level).toBe("junior");
      expect(question.type).toBe("multiple-choice");
      expect(question.difficulty).toBe("easy");
      expect(question.points).toBe(1);
      expect(question.isActive).toBe(true);
    });

    it("should fail without required framework", async () => {
      const questionData = {
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["test"],
        points: 1,
        content: {
          en: {
            question: "Test question",
          },
        },
      };

      await expect(Question.create(questionData)).rejects.toThrow();
    });

    it("should set default values correctly", async () => {
      const question = await Question.create({
        framework: "react",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["react"],
        points: 1,
        content: {
          en: {
            question: "Test question",
            options: [{ id: "a", text: "Option A", isCorrect: true }],
            explanation: "Test explanation",
          },
        },
      });

      expect(question.isActive).toBe(true);
      expect(question.verified).toBe(false);
    });
  });

  describe("Question Content", () => {
    it("should support bilingual content (en/ar)", async () => {
      const question = await Question.create({
        framework: "vue",
        level: "intermediate",
        type: "multiple-choice",
        category: "components",
        difficulty: "medium",
        tags: ["vue", "components"],
        points: 2,
        content: {
          en: {
            question: "What is a Vue component?",
            options: [
              { id: "a", text: "Reusable code", isCorrect: true },
              { id: "b", text: "A function", isCorrect: false },
            ],
            explanation: "Components are reusable.",
          },
          ar: {
            question: "ما هو مكون Vue؟",
            explanation: "المكونات قابلة لإعادة الاستخدام.",
          },
        },
      });

      expect(question.content.en?.question).toBeDefined();
      expect(question.content.ar?.question).toBeDefined();
    });

    it("should handle code snippets in content", async () => {
      const question = await Question.create({
        framework: "angular",
        level: "senior",
        type: "multiple-choice",
        category: "advanced",
        difficulty: "hard",
        tags: ["angular", "code"],
        points: 3,
        content: {
          en: {
            question: "What does this code do?",
            code: "const app = createApp(App);",
            options: [
              { id: "a", text: "Creates app", isCorrect: true },
              { id: "b", text: "Runs app", isCorrect: false },
            ],
            explanation: "This creates an app instance",
          },
        },
      });

      expect(question.content.en?.code).toBe("const app = createApp(App);");
    });

    it("should store references in content", async () => {
      const question = await Question.create({
        framework: "react",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["react", "docs"],
        points: 1,
        content: {
          en: {
            question: "Test question",
            options: [{ id: "a", text: "Answer", isCorrect: true }],
            explanation: "Test explanation with references",
            references: [
              {
                title: "React Docs",
                url: "https://react.dev",
              },
            ],
          },
        },
      });

      expect(question.content.en?.references).toHaveLength(1);
      expect(question.content.en?.references?.[0].title).toBe("React Docs");
    });
  });

  describe("Question Types", () => {
    it("should support multiple-choice questions", async () => {
      const question = await Question.create({
        framework: "angular",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["angular"],
        points: 1,
        content: {
          en: {
            question: "Multiple choice question",
            options: [
              { id: "a", text: "Option A", isCorrect: true },
              { id: "b", text: "Option B", isCorrect: false },
              { id: "c", text: "Option C", isCorrect: false },
            ],
            explanation: "Option A is correct",
          },
        },
      });

      expect(question.type).toBe("multiple-choice");
      expect(question.content.en?.options).toHaveLength(3);
    });

    it("should support true-false questions", async () => {
      const question = await Question.create({
        framework: "vue",
        level: "junior",
        type: "true-false",
        category: "basics",
        difficulty: "easy",
        tags: ["vue"],
        points: 1,
        content: {
          en: {
            question: "Vue is a framework. True or False?",
            options: [
              { id: "true", text: "True", isCorrect: true },
              { id: "false", text: "False", isCorrect: false },
            ],
            explanation: "Vue is indeed a framework",
          },
        },
      });

      expect(question.type).toBe("true-false");
    });

    it("should support fill-blank questions", async () => {
      const question = await Question.create({
        framework: "react",
        level: "intermediate",
        type: "fill-blank",
        category: "hooks",
        difficulty: "medium",
        tags: ["react", "hooks"],
        points: 2,
        content: {
          en: {
            question: "Complete the useState hook",
            code: "const [count, setCount] = useState(___);",
            options: [
              { id: "a", text: "0", isCorrect: true },
              { id: "b", text: "null", isCorrect: false },
            ],
            explanation: "useState accepts initial value",
          },
        },
      });

      expect(question.type).toBe("fill-blank");
    });
  });

  describe("Question Difficulty", () => {
    beforeEach(async () => {
      await Question.create([
        {
          framework: "angular",
          level: "junior",
          type: "multiple-choice",
          category: "basics",
          difficulty: "easy",
          tags: ["test"],
          points: 1,
          content: { en: { question: "Easy question", options: [], explanation: "Easy" } },
        },
        {
          framework: "angular",
          level: "intermediate",
          type: "multiple-choice",
          category: "advanced",
          difficulty: "medium",
          tags: ["test"],
          points: 2,
          content: { en: { question: "Medium question", options: [], explanation: "Medium" } },
        },
        {
          framework: "angular",
          level: "senior",
          type: "multiple-choice",
          category: "expert",
          difficulty: "hard",
          tags: ["test"],
          points: 3,
          content: { en: { question: "Hard question", options: [], explanation: "Hard" } },
        },
      ]);
    });

    it("should find questions by difficulty", async () => {
      const easyQuestions = await Question.find({ difficulty: "easy" });
      expect(easyQuestions).toHaveLength(1);

      const mediumQuestions = await Question.find({ difficulty: "medium" });
      expect(mediumQuestions).toHaveLength(1);

      const hardQuestions = await Question.find({ difficulty: "hard" });
      expect(hardQuestions).toHaveLength(1);
    });
  });

  describe("Question Points", () => {
    it("should assign points based on difficulty", async () => {
      const easyQuestion = await Question.create({
        framework: "react",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["react"],
        points: 1,
        content: { en: { question: "Easy", options: [], explanation: "Easy explanation" } },
      });

      const hardQuestion = await Question.create({
        framework: "react",
        level: "senior",
        type: "multiple-choice",
        category: "advanced",
        difficulty: "hard",
        tags: ["react"],
        points: 3,
        content: { en: { question: "Hard", options: [], explanation: "Hard explanation" } },
      });

      expect(easyQuestion.points).toBe(1);
      expect(hardQuestion.points).toBe(3);
    });
  });

  describe("Question Queries", () => {
    beforeEach(async () => {
      await Question.create([
        {
          framework: "angular",
          level: "junior",
          type: "multiple-choice",
          category: "basics",
          difficulty: "easy",
          tags: ["angular", "basics"],
          points: 1,
          content: { en: { question: "Angular Q1", options: [], explanation: "Angular" } },
          isActive: true,
        },
        {
          framework: "react",
          level: "intermediate",
          type: "multiple-choice",
          category: "hooks",
          difficulty: "medium",
          tags: ["react", "hooks"],
          points: 2,
          content: { en: { question: "React Q1", options: [], explanation: "React" } },
          isActive: true,
        },
        {
          framework: "vue",
          level: "senior",
          type: "multiple-choice",
          category: "advanced",
          difficulty: "hard",
          tags: ["vue", "advanced"],
          points: 3,
          content: { en: { question: "Vue Q1", options: [], explanation: "Vue" } },
          isActive: false,
        },
      ]);
    });

    it("should find questions by framework", async () => {
      const angularQuestions = await Question.find({ framework: "angular" });
      expect(angularQuestions).toHaveLength(1);

      const reactQuestions = await Question.find({ framework: "react" });
      expect(reactQuestions).toHaveLength(1);
    });

    it("should find active questions only", async () => {
      const activeQuestions = await Question.find({ isActive: true });
      expect(activeQuestions).toHaveLength(2);
    });

    it("should find questions by level", async () => {
      const juniorQuestions = await Question.find({ level: "junior" });
      expect(juniorQuestions).toHaveLength(1);
    });

    it("should find questions by tags", async () => {
      const basicQuestions = await Question.find({ tags: "basics" });
      expect(basicQuestions).toHaveLength(1);
    });
  });

  describe("Question Updates", () => {
    it("should update question content", async () => {
      const question = await Question.create({
        framework: "angular",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["angular"],
        points: 1,
        content: { en: { question: "Original question", options: [], explanation: "Original" } },
      });

      question.content.en = {
        question: "Updated question",
        options: [{ id: "a", text: "New option", isCorrect: true }],
        explanation: "Updated explanation",
      };
      await question.save();

      const updated = await Question.findById(question._id);
      expect(updated?.content.en?.question).toBe("Updated question");
    });

    it("should update question metadata", async () => {
      const question = await Question.create({
        framework: "react",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["react"],
        points: 1,
        content: { en: { question: "Test", options: [], explanation: "Test" } },
      });

      question.verified = true;
      question.isActive = false;
      await question.save();

      const updated = await Question.findById(question._id);
      expect(updated?.verified).toBe(true);
      expect(updated?.isActive).toBe(false);
    });
  });

  describe("Question Deletion", () => {
    it("should delete question", async () => {
      const question = await Question.create({
        framework: "vue",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["vue"],
        points: 1,
        content: { en: { question: "To delete", options: [], explanation: "Delete test" } },
      });

      await Question.deleteOne({ _id: question._id });
      const deleted = await Question.findById(question._id);
      expect(deleted).toBeNull();
    });

    it("should soft delete by setting isActive to false", async () => {
      const question = await Question.create({
        framework: "angular",
        level: "junior",
        type: "multiple-choice",
        category: "basics",
        difficulty: "easy",
        tags: ["angular"],
        points: 1,
        content: { en: { question: "To soft delete", options: [], explanation: "Soft delete" } },
      });

      question.isActive = false;
      await question.save();

      const softDeleted = await Question.findById(question._id);
      expect(softDeleted).toBeDefined();
      expect(softDeleted?.isActive).toBe(false);
    });
  });
});
