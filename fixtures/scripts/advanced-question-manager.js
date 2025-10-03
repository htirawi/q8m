#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Advanced Question Management System
 * Supports multiple input formats and bulk operations
 */

class AdvancedQuestionManager {
  constructor() {
    this.questionsFile = path.join(__dirname, "../src/data/angular-enhanced.ts");
    this.backupDir = path.join(__dirname, "../backups");
    this.questionsDir = path.join(__dirname, "../questions");

    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.backupDir, this.questionsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Create timestamped backup
   */
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(this.backupDir, `angular-enhanced-${timestamp}.ts`);

    const content = fs.readFileSync(this.questionsFile, "utf8");
    fs.writeFileSync(backupFile, content);

    console.log(`📦 Backup created: ${backupFile}`);
    return backupFile;
  }

  /**
   * Parse questions from various formats
   */
  parseQuestions(inputFile) {
    const ext = path.extname(inputFile).toLowerCase();

    switch (ext) {
      case ".json":
        return this.parseJSON(inputFile);
      case ".csv":
        return this.parseCSV(inputFile);
      case ".md":
        return this.parseMarkdown(inputFile);
      case ".txt":
        return this.parseText(inputFile);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  parseJSON(file) {
    const content = fs.readFileSync(file, "utf8");
    const data = JSON.parse(content);

    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error(
        'Invalid JSON format. Expected array of questions or object with "questions" property.'
      );
    }
  }

  parseCSV(file) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row");
    }

    // Parse CSV with proper quote handling
    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const question = {};

      headers.forEach((header, index) => {
        question[header] = values[index] || "";
      });

      // Convert tags string to array
      if (question.tags) {
        question.tags = question.tags
          .split(";")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }

      questions.push(question);
    }

    return questions;
  }

  parseMarkdown(file) {
    const content = fs.readFileSync(file, "utf8");
    const questions = [];

    // Simple markdown parser for Q&A format
    const sections = content.split(/^## /m);

    for (const section of sections) {
      if (section.trim()) {
        const lines = section.split("\n");
        const title = lines[0].trim();

        if (title && title.includes("?")) {
          const question = {
            question: title,
            answer: lines.slice(1).join("\n").trim(),
            category: "General",
            difficulty: "intermediate",
            tags: ["general"],
          };
          questions.push(question);
        }
      }
    }

    return questions;
  }

  parseText(file) {
    const content = fs.readFileSync(file, "utf8");
    const questions = [];

    // Simple text parser for Q&A format
    const sections = content.split(/^Q\d*:?\s*/m);

    for (const section of sections) {
      if (section.trim()) {
        const lines = section.split("\n");
        const questionText = lines[0].trim();

        if (questionText) {
          const question = {
            question: questionText,
            answer: lines.slice(1).join("\n").trim(),
            category: "General",
            difficulty: "intermediate",
            tags: ["general"],
          };
          questions.push(question);
        }
      }
    }

    return questions;
  }

  /**
   * Validate questions
   */
  validateQuestions(questions) {
    const requiredFields = ["question", "answer"];
    const validDifficulties = ["easy", "intermediate", "hard", "expert"];

    const errors = [];

    questions.forEach((question, index) => {
      // Check required fields
      requiredFields.forEach((field) => {
        if (!question[field] || question[field].trim() === "") {
          errors.push(`Question ${index + 1}: Missing or empty ${field}`);
        }
      });

      // Set defaults
      if (!question.category) question.category = "General";
      if (!question.difficulty) question.difficulty = "intermediate";
      if (!question.tags) question.tags = ["general"];

      // Validate difficulty
      if (!validDifficulties.includes(question.difficulty)) {
        errors.push(
          `Question ${index + 1}: Invalid difficulty "${question.difficulty}". Must be one of: ${validDifficulties.join(", ")}`
        );
      }

      // Ensure tags is array
      if (!Array.isArray(question.tags)) {
        question.tags = [question.tags];
      }
    });

    if (errors.length > 0) {
      console.error("❌ Validation errors:");
      errors.forEach((error) => console.error(`   ${error}`));
      return false;
    }

    return true;
  }

  /**
   * Find last question ID
   */
  findLastQuestionId(content) {
    const idRegex = /id:\s*(\d+)/g;
    let lastId = 0;
    let match;

    while ((match = idRegex.exec(content)) !== null) {
      const id = parseInt(match[1]);
      if (id > lastId) {
        lastId = id;
      }
    }

    return lastId;
  }

  /**
   * Format question for TypeScript
   */
  formatQuestion(question, startId) {
    const id = startId + question.id;

    // Escape the answer properly
    const escapedAnswer = question.answer
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");

    return `  {
    id: ${id},
    question: "${question.question.replace(/"/g, '\\"')}",
    answer:
      "${escapedAnswer}",
    category: "${question.category}",
    difficulty: "${question.difficulty}",
    tags: [${question.tags.map((tag) => `"${tag}"`).join(", ")}],
  },`;
  }

  /**
   * Add questions to file
   */
  async addQuestions(inputFile, options = {}) {
    console.log(`🚀 Starting advanced question addition process...`);
    console.log(`📁 Input file: ${inputFile}`);
    console.log(`📁 Target file: ${this.questionsFile}`);

    try {
      // Parse questions
      console.log(`📖 Parsing questions from ${path.extname(inputFile)} file...`);
      const questions = this.parseQuestions(inputFile);
      console.log(`📊 Found ${questions.length} questions`);

      // Validate questions
      console.log(`🔍 Validating questions...`);
      if (!this.validateQuestions(questions)) {
        throw new Error("Validation failed");
      }
      console.log(`✅ All questions validated successfully`);

      // Create backup
      console.log(`📦 Creating backup...`);
      const backupFile = this.createBackup();

      // Read current content
      console.log(`📖 Reading current questions file...`);
      const currentContent = fs.readFileSync(this.questionsFile, "utf8");
      const lastId = this.findLastQuestionId(currentContent);
      console.log(`🔍 Last question ID: ${lastId}`);

      // Process questions
      console.log(`🔄 Processing questions...`);
      const newQuestions = questions.map((question, index) => {
        const formatted = this.formatQuestion(question, lastId);
        console.log(
          `   ✅ ${index + 1}/${questions.length}: ${question.question.substring(0, 50)}...`
        );
        return formatted;
      });

      // Insert questions
      const insertionPoint = currentContent.lastIndexOf("];");
      if (insertionPoint === -1) {
        throw new Error("Could not find insertion point");
      }

      const beforeInsertion = currentContent.substring(0, insertionPoint);
      const afterInsertion = currentContent.substring(insertionPoint);

      const updatedContent =
        beforeInsertion + "\n" + newQuestions.join("\n") + "\n" + afterInsertion;

      // Write updated file
      console.log(`💾 Writing updated questions file...`);
      fs.writeFileSync(this.questionsFile, updatedContent);

      console.log(`\n🎉 Successfully added ${questions.length} questions!`);
      console.log(`   📊 New question IDs: ${lastId + 1} - ${lastId + questions.length}`);
      console.log(`   📊 Total questions: ${lastId + questions.length}`);
      console.log(`   📦 Backup: ${backupFile}`);

      return {
        added: questions.length,
        startId: lastId + 1,
        endId: lastId + questions.length,
        total: lastId + questions.length,
        backup: backupFile,
      };
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Interactive mode
   */
  async interactiveMode() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    console.log(`\n🎯 Interactive Question Manager\n`);

    try {
      const inputFile = await question("📁 Enter path to questions file: ");

      if (!fs.existsSync(inputFile)) {
        console.error(`❌ File not found: ${inputFile}`);
        process.exit(1);
      }

      const confirm = await question(
        `⚠️  This will add questions to ${this.questionsFile}. Continue? (y/N): `
      );

      if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
        console.log("❌ Operation cancelled");
        process.exit(0);
      }

      await this.addQuestions(inputFile);
    } finally {
      rl.close();
    }
  }

  /**
   * List supported formats
   */
  listFormats() {
    console.log(`
📚 Supported Question Formats:

1. JSON Format (.json):
   {
     "questions": [
       {
         "id": 1,
         "question": "What is Angular?",
         "answer": "Angular is a platform...",
         "category": "Angular Basics",
         "difficulty": "easy",
         "tags": ["angular", "basics"]
       }
     ]
   }

2. CSV Format (.csv):
   question,answer,category,difficulty,tags
   "What is Angular?","Angular is a platform...","Angular Basics","easy","angular;basics"

3. Markdown Format (.md):
   ## What is Angular?
   Angular is a platform and framework for building single-page client applications.

4. Text Format (.txt):
   Q1: What is Angular?
   Angular is a platform and framework for building single-page client applications.

🔧 Features:
  ✅ Multiple input formats
  ✅ Automatic validation
  ✅ Backup creation
  ✅ Progress tracking
  ✅ Error handling
  ✅ Interactive mode
    `);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const manager = new AdvancedQuestionManager();

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
🚀 Advanced Question Manager

Usage:
  node scripts/advanced-question-manager.js <questions-file>
  node scripts/advanced-question-manager.js --interactive
  node scripts/advanced-question-manager.js --formats

Examples:
  node scripts/advanced-question-manager.js questions/angular-18.json
  node scripts/advanced-question-manager.js questions/react-questions.csv
  node scripts/advanced-question-manager.js questions/vue-questions.md
  node scripts/advanced-question-manager.js --interactive

Options:
  --interactive    Run in interactive mode
  --formats        Show supported formats
  --help, -h       Show this help message
    `);
    process.exit(0);
  }

  if (args[0] === "--formats") {
    manager.listFormats();
    process.exit(0);
  }

  if (args[0] === "--interactive") {
    manager.interactiveMode();
  } else {
    const inputFile = args[0];
    manager.addQuestions(inputFile);
  }
}

export default AdvancedQuestionManager;
