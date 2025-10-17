/**
 * QuizResult Model Tests
 * Tests for QuizResult model CRUD operations, scoring, and analytics
 */

import { describe, it, expect, beforeEach } from "vitest";
import { QuizResult } from "../../models/QuizResult";
import { User } from "../../models/User";

describe("QuizResult Model", () => {
  let testUser: any;

  beforeEach(async () => {
    await QuizResult.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      email: "quiz-result-test@example.com",
      name: "Quiz Result Test User",
      password: "Password123!",
    });
  });

  describe("QuizResult Creation", () => {
    it("should create quiz result with required fields", async () => {
      const startTime = new Date();
      const endTime = new Date(Date.now() + 600000); // 10 minutes later

      const resultData = {
        userId: testUser._id,
        quizType: "practice" as const,
        level: "junior" as const,
        framework: "react",
        score: 80,
        correctAnswers: 8,
        incorrectAnswers: 2,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 8,
        startTime,
        endTime,
        totalTimeSeconds: 600,
        averageTimePerQuestion: 60,
        answers: [
          {
            questionId: "q1",
            userAnswer: "a",
            correctAnswer: "a",
            isCorrect: true,
            timeSpentSeconds: 45,
            difficultyLevel: "easy" as const,
            category: "basics",
            tags: ["react"],
            points: 1,
            pointsEarned: 1,
          },
        ],
        categoryPerformance: [
          {
            category: "basics",
            totalQuestions: 10,
            correctAnswers: 8,
            accuracy: 80,
            averageTimeSeconds: 60,
            isWeak: false,
            isStrong: true,
          },
        ],
        difficultyPerformance: [
          {
            difficulty: "easy" as const,
            totalQuestions: 10,
            correctAnswers: 8,
            accuracy: 80,
            averageTimeSeconds: 60,
          },
        ],
        weakCategories: [],
        strongCategories: ["basics"],
        xpEarned: 80,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      };

      const result = await QuizResult.create(resultData);

      expect(result.userId.toString()).toBe(testUser._id.toString());
      expect(result.score).toBe(80);
      expect(result.correctAnswers).toBe(8);
      expect(result.totalQuestions).toBe(10);
      expect(result.quizType).toBe("practice");
    });

    it("should fail without required fields", async () => {
      const incompleteData = {
        userId: testUser._id,
        score: 80,
      };

      await expect(QuizResult.create(incompleteData)).rejects.toThrow();
    });

    it("should calculate percentage correctly", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        framework: "angular",
        score: 90,
        correctAnswers: 9,
        incorrectAnswers: 1,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 9,
        startTime: new Date(),
        endTime: new Date(Date.now() + 300000),
        totalTimeSeconds: 300,
        averageTimePerQuestion: 30,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 90,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: true,
      });

      expect(result.score).toBe(90);
      expect(result.correctAnswers / result.totalQuestions).toBe(0.9);
    });
  });

  describe("Quiz Types", () => {
    it("should support practice quiz type", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 75,
        correctAnswers: 15,
        incorrectAnswers: 5,
        skippedAnswers: 0,
        totalQuestions: 20,
        totalPoints: 20,
        pointsEarned: 15,
        startTime: new Date(),
        endTime: new Date(Date.now() + 1200000),
        totalTimeSeconds: 1200,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 75,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.quizType).toBe("practice");
    });

    it("should support exam quiz type", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "exam",
        level: "intermediate",
        score: 85,
        correctAnswers: 17,
        incorrectAnswers: 3,
        skippedAnswers: 0,
        totalQuestions: 20,
        totalPoints: 20,
        pointsEarned: 17,
        startTime: new Date(),
        endTime: new Date(Date.now() + 900000),
        totalTimeSeconds: 900,
        averageTimePerQuestion: 45,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 85,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: true,
      });

      expect(result.quizType).toBe("exam");
      expect(result.isFast).toBe(true);
    });
  });

  describe("Performance Tracking", () => {
    it("should track category performance", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 80,
        correctAnswers: 8,
        incorrectAnswers: 2,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 8,
        startTime: new Date(),
        endTime: new Date(Date.now() + 600000),
        totalTimeSeconds: 600,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [
          {
            category: "hooks",
            totalQuestions: 5,
            correctAnswers: 4,
            accuracy: 80,
            averageTimeSeconds: 55,
            isWeak: false,
            isStrong: true,
          },
          {
            category: "components",
            totalQuestions: 5,
            correctAnswers: 4,
            accuracy: 80,
            averageTimeSeconds: 65,
            isWeak: false,
            isStrong: true,
          },
        ],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: ["hooks", "components"],
        xpEarned: 80,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.categoryPerformance).toHaveLength(2);
      expect(result.categoryPerformance[0].category).toBe("hooks");
      expect(result.categoryPerformance[0].accuracy).toBe(80);
    });

    it("should identify weak categories", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "intermediate",
        score: 60,
        correctAnswers: 6,
        incorrectAnswers: 4,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 6,
        startTime: new Date(),
        endTime: new Date(Date.now() + 600000),
        totalTimeSeconds: 600,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [
          {
            category: "advanced-hooks",
            totalQuestions: 5,
            correctAnswers: 2,
            accuracy: 40,
            averageTimeSeconds: 70,
            isWeak: true,
            isStrong: false,
          },
        ],
        difficultyPerformance: [],
        weakCategories: ["advanced-hooks"],
        strongCategories: [],
        xpEarned: 60,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.weakCategories).toContain("advanced-hooks");
      expect(result.categoryPerformance[0].isWeak).toBe(true);
    });

    it("should track difficulty performance", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "senior",
        score: 75,
        correctAnswers: 15,
        incorrectAnswers: 5,
        skippedAnswers: 0,
        totalQuestions: 20,
        totalPoints: 30,
        pointsEarned: 22,
        startTime: new Date(),
        endTime: new Date(Date.now() + 1200000),
        totalTimeSeconds: 1200,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [
          {
            difficulty: "easy",
            totalQuestions: 5,
            correctAnswers: 5,
            accuracy: 100,
            averageTimeSeconds: 30,
          },
          {
            difficulty: "medium",
            totalQuestions: 10,
            correctAnswers: 8,
            accuracy: 80,
            averageTimeSeconds: 60,
          },
          {
            difficulty: "hard",
            totalQuestions: 5,
            correctAnswers: 2,
            accuracy: 40,
            averageTimeSeconds: 90,
          },
        ],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 75,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.difficultyPerformance).toHaveLength(3);
      expect(result.difficultyPerformance[0].difficulty).toBe("easy");
      expect(result.difficultyPerformance[0].accuracy).toBe(100);
    });
  });

  describe("Perfect and Fast Quizzes", () => {
    it("should mark perfect score quizzes", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 100,
        correctAnswers: 10,
        incorrectAnswers: 0,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 10,
        startTime: new Date(),
        endTime: new Date(Date.now() + 300000),
        totalTimeSeconds: 300,
        averageTimePerQuestion: 30,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 100,
        badgesEarned: ["perfect-score"],
        streakMaintained: true,
        isPerfect: true,
        isFast: false,
      });

      expect(result.isPerfect).toBe(true);
      expect(result.score).toBe(100);
      expect(result.badgesEarned).toContain("perfect-score");
    });

    it("should mark fast completion quizzes", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "exam",
        level: "intermediate",
        score: 85,
        correctAnswers: 17,
        incorrectAnswers: 3,
        skippedAnswers: 0,
        totalQuestions: 20,
        totalPoints: 20,
        pointsEarned: 17,
        startTime: new Date(),
        endTime: new Date(Date.now() + 300000),
        totalTimeSeconds: 300,
        averageTimePerQuestion: 15, // Very fast
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 85,
        badgesEarned: ["speed-demon"],
        streakMaintained: true,
        isPerfect: false,
        isFast: true,
      });

      expect(result.isFast).toBe(true);
      expect(result.averageTimePerQuestion).toBe(15);
    });
  });

  describe("XP and Badges", () => {
    it("should award XP based on performance", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "senior",
        score: 95,
        correctAnswers: 19,
        incorrectAnswers: 1,
        skippedAnswers: 0,
        totalQuestions: 20,
        totalPoints: 30,
        pointsEarned: 28,
        startTime: new Date(),
        endTime: new Date(Date.now() + 900000),
        totalTimeSeconds: 900,
        averageTimePerQuestion: 45,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 150, // Bonus XP for high score
        badgesEarned: ["high-achiever"],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.xpEarned).toBe(150);
      expect(result.badgesEarned).toContain("high-achiever");
    });

    it("should track multiple badges earned", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 100,
        correctAnswers: 10,
        incorrectAnswers: 0,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 10,
        startTime: new Date(),
        endTime: new Date(Date.now() + 200000),
        totalTimeSeconds: 200,
        averageTimePerQuestion: 20,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 120,
        badgesEarned: ["perfect-score", "speed-demon", "first-try"],
        streakMaintained: true,
        isPerfect: true,
        isFast: true,
      });

      expect(result.badgesEarned).toHaveLength(3);
      expect(result.isPerfect).toBe(true);
      expect(result.isFast).toBe(true);
    });
  });

  describe("Streak Tracking", () => {
    it("should track streak maintenance", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 70,
        correctAnswers: 7,
        incorrectAnswers: 3,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 7,
        startTime: new Date(),
        endTime: new Date(Date.now() + 400000),
        totalTimeSeconds: 400,
        averageTimePerQuestion: 40,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 70,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      expect(result.streakMaintained).toBe(true);
    });

    it("should track when streak is broken", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 40,
        correctAnswers: 4,
        incorrectAnswers: 6,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 4,
        startTime: new Date(),
        endTime: new Date(Date.now() + 600000),
        totalTimeSeconds: 600,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 40,
        badgesEarned: [],
        streakMaintained: false,
        isPerfect: false,
        isFast: false,
      });

      expect(result.streakMaintained).toBe(false);
    });
  });

  describe("Queries", () => {
    beforeEach(async () => {
      await QuizResult.create([
        {
          userId: testUser._id,
          quizType: "practice",
          level: "junior",
          framework: "react",
          score: 80,
          correctAnswers: 8,
          incorrectAnswers: 2,
          skippedAnswers: 0,
          totalQuestions: 10,
          totalPoints: 10,
          pointsEarned: 8,
          startTime: new Date(),
          endTime: new Date(Date.now() + 600000),
          totalTimeSeconds: 600,
          averageTimePerQuestion: 60,
          answers: [],
          categoryPerformance: [],
          difficultyPerformance: [],
          weakCategories: [],
          strongCategories: [],
          xpEarned: 80,
          badgesEarned: [],
          streakMaintained: true,
          isPerfect: false,
          isFast: false,
        },
        {
          userId: testUser._id,
          quizType: "exam",
          level: "intermediate",
          framework: "angular",
          score: 90,
          correctAnswers: 18,
          incorrectAnswers: 2,
          skippedAnswers: 0,
          totalQuestions: 20,
          totalPoints: 20,
          pointsEarned: 18,
          startTime: new Date(),
          endTime: new Date(Date.now() + 900000),
          totalTimeSeconds: 900,
          averageTimePerQuestion: 45,
          answers: [],
          categoryPerformance: [],
          difficultyPerformance: [],
          weakCategories: [],
          strongCategories: [],
          xpEarned: 90,
          badgesEarned: [],
          streakMaintained: true,
          isPerfect: false,
          isFast: true,
        },
      ]);
    });

    it("should find results by userId", async () => {
      const results = await QuizResult.find({ userId: testUser._id });
      expect(results).toHaveLength(2);
    });

    it("should find results by quiz type", async () => {
      const practiceResults = await QuizResult.find({ quizType: "practice" });
      expect(practiceResults).toHaveLength(1);
    });

    it("should find results by framework", async () => {
      const reactResults = await QuizResult.find({ framework: "react" });
      expect(reactResults).toHaveLength(1);
      expect(reactResults[0].framework).toBe("react");
    });

    it("should find results by level", async () => {
      const juniorResults = await QuizResult.find({ level: "junior" });
      expect(juniorResults).toHaveLength(1);
    });

    it("should sort results by score descending", async () => {
      const results = await QuizResult.find({ userId: testUser._id }).sort({ score: -1 });
      expect(results[0].score).toBe(90);
      expect(results[1].score).toBe(80);
    });

    it("should find perfect score results", async () => {
      await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 100,
        correctAnswers: 10,
        incorrectAnswers: 0,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 10,
        startTime: new Date(),
        endTime: new Date(Date.now() + 500000),
        totalTimeSeconds: 500,
        averageTimePerQuestion: 50,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 100,
        badgesEarned: ["perfect"],
        streakMaintained: true,
        isPerfect: true,
        isFast: false,
      });

      const perfectResults = await QuizResult.find({ isPerfect: true });
      expect(perfectResults).toHaveLength(1);
      expect(perfectResults[0].score).toBe(100);
    });
  });

  describe("Deletion", () => {
    it("should delete quiz result", async () => {
      const result = await QuizResult.create({
        userId: testUser._id,
        quizType: "practice",
        level: "junior",
        score: 70,
        correctAnswers: 7,
        incorrectAnswers: 3,
        skippedAnswers: 0,
        totalQuestions: 10,
        totalPoints: 10,
        pointsEarned: 7,
        startTime: new Date(),
        endTime: new Date(Date.now() + 600000),
        totalTimeSeconds: 600,
        averageTimePerQuestion: 60,
        answers: [],
        categoryPerformance: [],
        difficultyPerformance: [],
        weakCategories: [],
        strongCategories: [],
        xpEarned: 70,
        badgesEarned: [],
        streakMaintained: true,
        isPerfect: false,
        isFast: false,
      });

      await QuizResult.deleteOne({ _id: result._id });
      const deleted = await QuizResult.findById(result._id);
      expect(deleted).toBeNull();
    });
  });
});

