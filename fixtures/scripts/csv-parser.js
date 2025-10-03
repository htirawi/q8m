#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced CSV Question Parser
 * Handles common CSV issues and provides better error messages
 */

class CSVQuestionParser {
  constructor() {
    this.questionsFile = path.join(__dirname, "../../src/data/angular-enhanced.ts");
    this.backupDir = path.join(__dirname, "../backups");

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Parse CSV with better error handling
   */
  parseCSV(file) {
    console.log(`📖 Reading CSV file: ${file}`);
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row");
    }

    console.log(`📊 Found ${lines.length - 1} data rows`);

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
    console.log(`📋 Headers: ${headers.join(", ")}`);

    // Validate headers
    const requiredHeaders = ["question", "answer"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
    }

    const questions = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const lineNumber = i + 1;
      const values = parseCSVLine(lines[i]);
      const question = {};

      // Map values to headers
      headers.forEach((header, index) => {
        question[header] = values[index] || "";
      });

      // Validate required fields
      if (!question.question || question.question.trim() === "") {
        errors.push(`Row ${lineNumber}: Missing question`);
      }

      if (!question.answer || question.answer.trim() === "") {
        errors.push(`Row ${lineNumber}: Missing answer`);
      }

      // Set defaults for optional fields
      if (!question.category) question.category = "General";
      if (!question.difficulty) question.difficulty = "intermediate";
      if (!question.tags) question.tags = "general";

      // Validate difficulty
      const validDifficulties = ["easy", "intermediate", "hard", "expert"];
      if (!validDifficulties.includes(question.difficulty)) {
        errors.push(
          `Row ${lineNumber}: Invalid difficulty "${question.difficulty}". Must be one of: ${validDifficulties.join(", ")}`
        );
      }

      // Convert tags string to array
      if (question.tags) {
        question.tags = question.tags
          .split(";")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }

      questions.push(question);
    }

    if (errors.length > 0) {
      console.error("❌ CSV Validation Errors:");
      errors.forEach((error) => console.error(`   ${error}`));
      throw new Error("CSV validation failed");
    }

    console.log(`✅ Successfully parsed ${questions.length} questions`);
    return questions;
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
  formatQuestion(question, startId, index) {
    const id = startId + index + 1;

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
   * Create backup
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
   * Add questions to file
   */
  async addQuestions(csvFile) {
    console.log(`🚀 Starting CSV question addition process...`);
    console.log(`📁 CSV file: ${csvFile}`);
    console.log(`📁 Target file: ${this.questionsFile}`);

    try {
      // Parse questions
      const questions = this.parseCSV(csvFile);

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
        const formatted = this.formatQuestion(question, lastId, index);
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
   * Validate CSV file before processing
   */
  validateCSV(csvFile) {
    console.log(`🔍 Validating CSV file: ${csvFile}`);

    try {
      const questions = this.parseCSV(csvFile);
      console.log(`✅ CSV file is valid with ${questions.length} questions`);
      return true;
    } catch (error) {
      console.error(`❌ CSV validation failed: ${error.message}`);
      return false;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const parser = new CSVQuestionParser();

  if (args.length === 0) {
    console.log(`
📚 CSV Question Parser

Usage: node scripts/csv-parser.js <csv-file> [--validate]

Examples:
  node scripts/csv-parser.js questions/my-questions.csv
  node scripts/csv-parser.js questions/my-questions.csv --validate

Options:
  --validate    Only validate the CSV file without adding questions
  --help, -h    Show this help message

📋 Required CSV Format:
  question,answer,category,difficulty,tags
  "What is Angular?","Angular is a platform...","Angular Basics","easy","angular;basics"

🔧 Features:
  ✅ Better error messages
  ✅ Automatic validation
  ✅ Backup creation
  ✅ Progress tracking
    `);
    process.exit(0);
  }

  const csvFile = args[0];
  const validateOnly = args.includes("--validate");

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  if (validateOnly) {
    parser.validateCSV(csvFile);
  } else {
    parser.addQuestions(csvFile);
  }
}

export default CSVQuestionParser;
