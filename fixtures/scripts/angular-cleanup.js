#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Angular Questions Cleanup Tool
 * Fixes NaN IDs and removes non-Angular questions
 */

class AngularQuestionsCleanup {
  constructor() {
    this.questionsFile = path.join(__dirname, "../src/data/angular-enhanced.ts");
    this.backupDir = path.join(__dirname, "../backups");

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create backup
   */
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(this.backupDir, `angular-enhanced-cleanup-${timestamp}.ts`);

    const content = fs.readFileSync(this.questionsFile, "utf8");
    fs.writeFileSync(backupFile, content);

    console.log(`📦 Backup created: ${backupFile}`);
    return backupFile;
  }

  /**
   * Analyze the questions file
   */
  analyzeQuestions() {
    console.log(`🔍 Analyzing questions file...`);

    const content = fs.readFileSync(this.questionsFile, "utf8");

    // Find all questions with their IDs
    const questionRegex = /{\s*id:\s*([^,]+),\s*question:\s*"([^"]+)"/g;
    const questions = [];
    let match;

    while ((match = questionRegex.exec(content)) !== null) {
      const id = match[1].trim();
      const question = match[2];

      questions.push({
        id: id,
        question: question,
        isNaN: isNaN(parseInt(id)),
        isReact:
          question.toLowerCase().includes("react") && !question.toLowerCase().includes("reactive"),
      });
    }

    console.log(`📊 Total questions found: ${questions.length}`);

    const nanIds = questions.filter((q) => q.isNaN);
    const reactQuestions = questions.filter((q) => q.isReact);

    console.log(`❌ Questions with NaN IDs: ${nanIds.length}`);
    console.log(`❌ React questions (non-Angular): ${reactQuestions.length}`);

    if (nanIds.length > 0) {
      console.log(`\n📋 Questions with NaN IDs:`);
      nanIds.slice(0, 5).forEach((q, index) => {
        console.log(`   ${index + 1}. ID: ${q.id} - ${q.question.substring(0, 60)}...`);
      });
      if (nanIds.length > 5) {
        console.log(`   ... and ${nanIds.length - 5} more`);
      }
    }

    if (reactQuestions.length > 0) {
      console.log(`\n📋 React questions found:`);
      reactQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. ID: ${q.id} - ${q.question.substring(0, 60)}...`);
      });
    }

    return {
      total: questions.length,
      nanIds: nanIds.length,
      reactQuestions: reactQuestions.length,
      questions: questions,
    };
  }

  /**
   * Fix NaN IDs and remove React questions
   */
  fixQuestions() {
    console.log(`🔧 Fixing questions file...`);

    const content = fs.readFileSync(this.questionsFile, "utf8");

    // Find the last valid ID
    const idRegex = /id:\s*(\d+)/g;
    let lastId = 0;
    let match;

    while ((match = idRegex.exec(content)) !== null) {
      const id = parseInt(match[1]);
      if (id > lastId && !isNaN(id)) {
        lastId = id;
      }
    }

    console.log(`🔍 Last valid ID found: ${lastId}`);

    // Remove React questions and fix NaN IDs
    let fixedContent = content;
    let currentId = lastId;

    // Remove React questions
    const reactQuestionRegex = /{\s*id:\s*[^,]+,\s*question:\s*"[^"]*react[^"]*"[^}]*},?\s*/gi;
    fixedContent = fixedContent.replace(reactQuestionRegex, (match) => {
      console.log(`🗑️  Removing React question: ${match.substring(0, 80)}...`);
      return "";
    });

    // Fix NaN IDs
    const nanIdRegex = /id:\s*NaN/g;
    fixedContent = fixedContent.replace(nanIdRegex, () => {
      currentId++;
      console.log(`🔧 Fixing NaN ID to: ${currentId}`);
      return `id: ${currentId}`;
    });

    // Clean up extra commas and formatting
    fixedContent = fixedContent.replace(/,\s*,/g, ",");
    fixedContent = fixedContent.replace(/,\s*}/g, "}");
    fixedContent = fixedContent.replace(/,\s*]/g, "]");

    return fixedContent;
  }

  /**
   * Validate the fixed content
   */
  validateFixedContent(content) {
    console.log(`🔍 Validating fixed content...`);

    // Check for remaining NaN IDs
    const nanIds = (content.match(/id:\s*NaN/g) || []).length;
    console.log(`📊 Remaining NaN IDs: ${nanIds}`);

    // Check for React questions
    const reactQuestions = (content.match(/question:\s*"[^"]*react[^"]*"/gi) || []).length;
    console.log(`📊 Remaining React questions: ${reactQuestions}`);

    // Count total questions
    const totalQuestions = (content.match(/id:\s*\d+/g) || []).length;
    console.log(`📊 Total questions after cleanup: ${totalQuestions}`);

    return {
      nanIds,
      reactQuestions,
      totalQuestions,
    };
  }

  /**
   * Main cleanup process
   */
  async cleanup() {
    console.log(`🚀 Starting Angular questions cleanup...`);

    try {
      // Create backup
      console.log(`📦 Creating backup...`);
      const backupFile = this.createBackup();

      // Analyze current state
      const analysis = this.analyzeQuestions();

      if (analysis.nanIds === 0 && analysis.reactQuestions === 0) {
        console.log(`✅ No issues found! File is already clean.`);
        return;
      }

      // Fix issues
      console.log(`🔧 Fixing issues...`);
      const fixedContent = this.fixQuestions();

      // Validate fixes
      const validation = this.validateFixedContent(fixedContent);

      if (validation.nanIds > 0 || validation.reactQuestions > 0) {
        console.log(`❌ Some issues remain. Please check manually.`);
        return;
      }

      // Write fixed content
      console.log(`💾 Writing fixed content...`);
      fs.writeFileSync(this.questionsFile, fixedContent);

      console.log(`\n🎉 Cleanup completed successfully!`);
      console.log(`   📊 Questions before: ${analysis.total}`);
      console.log(`   📊 Questions after: ${validation.totalQuestions}`);
      console.log(`   🗑️  React questions removed: ${analysis.reactQuestions}`);
      console.log(`   🔧 NaN IDs fixed: ${analysis.nanIds}`);
      console.log(`   📦 Backup: ${backupFile}`);
    } catch (error) {
      console.error(`❌ Error during cleanup: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
🔧 Angular Questions Cleanup Tool

Usage: node scripts/angular-cleanup.js [command]

Commands:
  cleanup     Fix NaN IDs and remove React questions (default)
  analyze     Analyze issues without fixing
  help        Show this help message

Examples:
  node scripts/angular-cleanup.js
  node scripts/angular-cleanup.js analyze

🔧 This tool fixes common issues in angular-enhanced.ts:
  ✅ Removes React questions (non-Angular)
  ✅ Fixes NaN IDs to proper sequential numbers
  ✅ Creates automatic backups
  ✅ Validates fixes before applying
    `);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const cleanup = new AngularQuestionsCleanup();

  if (args.length === 0 || args[0] === "cleanup") {
    cleanup.cleanup();
  } else if (args[0] === "analyze") {
    cleanup.analyzeQuestions();
  } else if (args[0] === "help") {
    cleanup.showHelp();
  } else {
    console.error(`❌ Unknown command: ${args[0]}`);
    cleanup.showHelp();
    process.exit(1);
  }
}

export default AngularQuestionsCleanup;
