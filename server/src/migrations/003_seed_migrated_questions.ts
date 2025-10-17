/* eslint-disable no-console */

import { Question } from "@models/Question.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Migration 003: Seed Migrated Questions from angular-test
 *
 * Loads the 344 study items migrated from angular-test into MongoDB
 *
 * Run: pnpm migrate:003 or pnpm db:seed:migrated
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigratedStudyItem {
  id: string;
  framework: string;
  topic: string;
  category: string;
  title: {
    en: string;
    ar: string;
  };
  slug: string;
  bodyMdx: {
    en: string;
    ar: string;
  };
  difficulty: "easy" | "medium" | "hard";
  level: "junior" | "intermediate" | "senior";
  tags: string[];
  updatedAt: string;
  createdAt: string;
  isActive: boolean;
  legacyId?: number;
}

interface MigratedQuestion {
  id: string;
  framework: string;
  topic: string;
  category: string;
  type: string;
  promptMdx: {
    en: string;
    ar: string;
  };
  options?: Array<{
    id: string;
    text: {
      en: string;
      ar: string;
    };
    isCorrect: boolean;
  }>;
  answerKey?: string | string[];
  explanationMdx: {
    en: string;
    ar: string;
  };
  difficulty: "easy" | "medium" | "hard";
  level: "junior" | "intermediate" | "senior";
  points: number;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  isActive: boolean;
  legacyId?: string | number;
}

interface SeedResult {
  success: boolean;
  message: string;
  questionsCreated: number;
  error?: string;
}

/**
 * Maps migrated question type to MongoDB question type
 */
function mapQuestionType(
  type: string
): "multiple-choice" | "true-false" | "fill-blank" | "code-completion" {
  const typeMap: Record<
    string,
    "multiple-choice" | "true-false" | "fill-blank" | "code-completion"
  > = {
    mcq: "multiple-choice",
    "multiple-choice": "multiple-choice",
    multi: "multiple-choice",
    "multiple-checkbox": "multiple-choice",
    tf: "true-false",
    "true-false": "true-false",
    fib: "fill-blank",
    "fill-blank": "fill-blank",
    "code-order": "code-completion",
    study: "multiple-choice", // Default fallback
  };

  return typeMap[type] || "multiple-choice";
}

/**
 * Loads all migrated JSON files from a directory
 */
function loadMigratedFiles(directory: string): any[] {
  if (!fs.existsSync(directory)) {
    console.warn(`Directory not found: ${directory}`);
    return [];
  }

  const files = fs.readdirSync(directory).filter((f) => f.endsWith(".json"));
  const items: any[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      items.push(data);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return items;
}

/**
 * Transforms migrated study item to MongoDB Question format
 */
function transformStudyItemToQuestion(item: MigratedStudyItem): any {
  return {
    framework: item.framework,
    level: item.level,
    type: "open-ended", // Study items are explanatory content, not multiple choice
    mode: "study", // Explicitly mark as Study Mode
    category: item.category || "General",
    difficulty: item.difficulty,
    tags: item.tags.length > 0 ? item.tags : ["general"],
    points: item.difficulty === "easy" ? 1 : item.difficulty === "medium" ? 2 : 3,
    content: {
      en: {
        question: item.title.en,
        explanation: item.bodyMdx.en || "No explanation provided.",
        options: [], // Study Mode questions don't have answer options
      },
      ar: {
        question: item.title.ar || item.title.en, // Fallback to EN if AR missing
        explanation: item.bodyMdx.ar || item.bodyMdx.en || "No explanation provided.", // Fallback to EN
        options: [], // Study Mode questions don't have answer options
      },
    },
    isActive: item.isActive,
  };
}

/**
 * Transforms migrated interactive question to MongoDB Question format
 */
function transformInteractiveQuestion(item: MigratedQuestion): any {
  return {
    framework: item.framework,
    level: item.level,
    type: mapQuestionType(item.type),
    mode: "quiz", // Interactive quiz questions are for Quiz Mode
    category: item.category || "General",
    difficulty: item.difficulty,
    tags: item.tags.length > 0 ? item.tags : ["general"],
    points: item.points,
    content: {
      en: {
        question: item.promptMdx.en,
        options: item.options?.map((opt) => ({
          id: opt.id,
          text: opt.text.en,
          isCorrect: opt.isCorrect,
        })),
        explanation: item.explanationMdx?.en || "No explanation provided.",
      },
      ar: {
        question: item.promptMdx.ar || item.promptMdx.en, // Fallback to EN if AR missing
        options: item.options?.map((opt) => ({
          id: opt.id,
          text: opt.text.ar || opt.text.en, // Fallback to EN
          isCorrect: opt.isCorrect,
        })),
        explanation:
          item.explanationMdx?.ar || item.explanationMdx?.en || "No explanation provided.", // Fallback to EN
      },
    },
    isActive: item.isActive,
  };
}

export async function migrate003(): Promise<SeedResult> {
  try {
    console.log("🔄 Starting Migration 003: Seed Migrated Questions...\n");

    const localDataPath = path.join(__dirname, "..", "..", "..", "local-data");
    let totalCreated = 0;
    let totalSkipped = 0;

    // Process study items by framework
    const frameworks = ["angular", "react", "nextjs", "redux", "random"];

    for (const framework of frameworks) {
      const studyDir = path.join(localDataPath, "study", framework);

      if (!fs.existsSync(studyDir)) {
        console.warn(`⚠️  Study directory not found: ${studyDir}`);
        continue;
      }

      const studyItems = loadMigratedFiles(studyDir);
      console.log(`📚 Processing ${framework}: ${studyItems.length} study items`);

      for (const item of studyItems) {
        try {
          // Check if already exists (by title to avoid duplicates)
          const existing = await Question.findOne({
            framework: item.framework,
            "content.en.question": item.title.en,
            isActive: true,
          });

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Transform and save
          const questionData = transformStudyItemToQuestion(item as MigratedStudyItem);
          const question = new Question(questionData);
          await question.save();
          totalCreated++;

          if (totalCreated % 50 === 0) {
            console.log(`  ✓ Created ${totalCreated} questions...`);
          }
        } catch (error) {
          console.error(`  ❌ Failed to create question: ${item.title?.en}`, error);
        }
      }

      console.log(
        `  ✅ ${framework}: ${totalCreated - totalSkipped} created, ${totalSkipped} skipped\n`
      );
      totalSkipped = 0; // Reset for next framework
    }

    // Process interactive quiz questions
    console.log("🎯 Processing Interactive Quiz Questions...");

    for (const framework of frameworks) {
      const questionsDir = path.join(localDataPath, "questions", framework);

      if (!fs.existsSync(questionsDir)) {
        continue;
      }

      const questions = loadMigratedFiles(questionsDir);
      if (questions.length === 0) continue;

      console.log(`  Processing ${framework}: ${questions.length} quiz questions`);

      for (const item of questions) {
        try {
          // Check if already exists
          const existing = await Question.findOne({
            framework: item.framework,
            "content.en.question": item.promptMdx.en,
            isActive: true,
          });

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Transform and save
          const questionData = transformInteractiveQuestion(item as MigratedQuestion);
          const question = new Question(questionData);
          await question.save();
          totalCreated++;
        } catch (error) {
          console.error(`  ❌ Failed to create quiz question: ${item.promptMdx?.en}`, error);
        }
      }

      console.log(`  ✓ ${framework}: created ${questions.length} quiz questions`);
    }

    // Get final statistics
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const byFramework = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$framework", count: { $sum: 1 } } },
    ]);
    const byDifficulty = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);
    const byLevel = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);

    console.log("\n╔══════════════════════════════════════════════════════════════════╗");
    console.log("║             MIGRATION 003 COMPLETE                               ║");
    console.log("╚══════════════════════════════════════════════════════════════════╝\n");

    console.log("📊 Question Database Statistics:");
    console.log(`   Total questions: ${totalQuestions}`);
    console.log(`   Newly created: ${totalCreated}`);
    console.log(`   Skipped (existing): ${totalSkipped}\n`);

    console.log("   By Framework:");
    byFramework.forEach((item: { _id: string; count: number }) => {
      console.log(`     ${item._id.padEnd(12)} ${item.count}`);
    });

    console.log("\n   By Difficulty:");
    byDifficulty.forEach((item: { _id: string; count: number }) => {
      console.log(`     ${item._id.padEnd(12)} ${item.count}`);
    });

    console.log("\n   By Level:");
    byLevel.forEach((item: { _id: string; count: number }) => {
      console.log(`     ${item._id.padEnd(12)} ${item.count}`);
    });

    console.log("\n✅ All migrated questions seeded successfully!\n");

    return {
      success: true,
      message: `Seeded ${totalCreated} questions into database`,
      questionsCreated: totalCreated,
    };
  } catch (error) {
    console.error("❌ Migration 003 failed:", error);
    return {
      success: false,
      message: "Failed to seed migrated questions",
      questionsCreated: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  import("../config/database.js")
    .then((db) => db.connectDatabase())
    .then(() => migrate003())
    .then((result) => {
      console.log(result.success ? "✅ Success" : "❌ Failed");
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
