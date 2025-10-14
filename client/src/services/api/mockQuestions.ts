/**
 * Mock Question Data Adapter
 * Provides mock data when backend is not available
 * Controlled by VITE_USE_MOCK_API environment variable
 */

import type { Question, QuizResult } from "@shared/types/quiz";
import type { DifficultyLevel, ExperienceLevel } from "@/types/plan/access";

const useMockAPI = import.meta.env.VITE_USE_MOCK_API === "true" || import.meta.env.DEV;

/**
 * Generate mock questions for study mode
 */
function generateMockStudyQuestions(difficulty: DifficultyLevel, count: number = 20): Question[] {
  const questions: Question[] = [];
  const difficultyPoints = { easy: 5, medium: 10, hard: 15 };

  for (let i = 1; i <= count; i++) {
    questions.push({
      _id: `study-${difficulty}-${i}`,
      id: i,
      framework: "vue",
      level: "junior",
      difficulty,
      type: "multiple-choice",
      content: {
        en: {
          question: `[${difficulty.toUpperCase()}] Sample Vue.js Question ${i}`,
          options: [
            { id: "a", text: "Option A - Correct answer", isCorrect: true },
            { id: "b", text: "Option B - Incorrect", isCorrect: false },
            { id: "c", text: "Option C - Incorrect", isCorrect: false },
            { id: "d", text: "Option D - Incorrect", isCorrect: false },
          ],
          explanation: `This is a ${difficulty} level explanation for question ${i}. The correct answer demonstrates fundamental Vue.js concepts.`,
        },
        ar: {
          question: `[${difficulty.toUpperCase()}] سؤال Vue.js نموذجي ${i}`,
          options: [
            { id: "a", text: "الخيار أ - الإجابة الصحيحة", isCorrect: true },
            { id: "b", text: "الخيار ب - غير صحيح", isCorrect: false },
            { id: "c", text: "الخيار ج - غير صحيح", isCorrect: false },
            { id: "d", text: "الخيار د - غير صحيح", isCorrect: false },
          ],
          explanation: `هذا شرح لمستوى ${difficulty} للسؤال ${i}. توضح الإجابة الصحيحة مفاهيم Vue.js الأساسية.`,
        },
      },
      category: "fundamentals",
      tags: ["vue", difficulty],
      points: difficultyPoints[difficulty],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return questions;
}

/**
 * Generate mock questions for quiz mode
 */
function generateMockQuizQuestions(level: ExperienceLevel, count: number): Question[] {
  const questions: Question[] = [];
  const levelDifficulty: Record<ExperienceLevel, DifficultyLevel> = {
    junior: "easy",
    intermediate: "medium",
    senior: "hard",
  };
  const difficulty = levelDifficulty[level];
  const levelPoints = { junior: 5, intermediate: 10, senior: 15 };

  const questionTypes: Question["type"][] = [
    "multiple-choice",
    "fill-blank",
    "true-false",
    "multiple-checkbox",
  ];

  for (let i = 1; i <= count; i++) {
    const type = questionTypes[i % questionTypes.length];
    const baseQuestion: Question = {
      _id: `quiz-${level}-${i}`,
      id: i,
      framework: "vue",
      level,
      difficulty,
      type: type || "multiple-choice",
      content: {
        en: {
          question: `[${level.toUpperCase()}] Question ${i}: What is the correct approach?`,
          explanation: `The correct answer for this ${level} level question demonstrates ${type} concepts.`,
        },
        ar: {
          question: `[${level.toUpperCase()}] سؤال ${i}: ما هو النهج الصحيح؟`,
          explanation: `الإجابة الصحيحة لهذا السؤال من مستوى ${level} توضح مفاهيم ${type}.`,
        },
      },
      category: "fundamentals",
      tags: ["vue", level, type || "multiple-choice"],
      points: levelPoints[level],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (type === "multiple-choice" || type === "multiple-checkbox") {
      baseQuestion.content.en.options = [
        { id: "a", text: "Correct answer option", isCorrect: true },
        { id: "b", text: "Incorrect option B", isCorrect: false },
        { id: "c", text: "Incorrect option C", isCorrect: false },
        { id: "d", text: "Incorrect option D", isCorrect: false },
      ];
      baseQuestion.content.ar.options = [
        { id: "a", text: "خيار الإجابة الصحيحة", isCorrect: true },
        { id: "b", text: "الخيار ب غير صحيح", isCorrect: false },
        { id: "c", text: "الخيار ج غير صحيح", isCorrect: false },
        { id: "d", text: "الخيار د غير صحيح", isCorrect: false },
      ];
    } else if (type === "true-false") {
      baseQuestion.content.en.options = [
        { id: "true", text: "True", isCorrect: true },
        { id: "false", text: "False", isCorrect: false },
      ];
      baseQuestion.content.ar.options = [
        { id: "true", text: "صحيح", isCorrect: true },
        { id: "false", text: "خطأ", isCorrect: false },
      ];
    } else if (type === "fill-blank") {
      // No options for fill-blank questions
    }

    questions.push(baseQuestion);
  }

  return questions;
}

/**
 * Fetch questions for study mode
 */
export async function fetchStudyQuestions(difficulty: DifficultyLevel): Promise<Question[]> {
  if (useMockAPI) {
    console.warn("[Mock API] Returning mock study questions for:", difficulty);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
    return generateMockStudyQuestions(difficulty, 20);
  }

  const response = await fetch(`/api/questions?difficulty=${difficulty}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch questions for quiz mode
 */
export async function fetchQuizQuestions(level: ExperienceLevel): Promise<Question[]> {
  const questionCounts: Record<ExperienceLevel, number> = {
    junior: 30,
    intermediate: 40,
    senior: 50,
  };

  if (useMockAPI) {
    console.warn("[Mock API] Returning mock quiz questions for:", level);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
    return generateMockQuizQuestions(level, questionCounts[level]);
  }

  const response = await fetch(`/api/quiz/questions?level=${level}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch quiz questions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submit quiz results (mock or real)
 */
export async function submitQuizResults(result: QuizResult): Promise<void> {
  if (useMockAPI) {
    console.warn("[Mock API] Quiz result submitted:", result);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }

  const response = await fetch("/api/quiz/results", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit results: ${response.statusText}`);
  }
}
