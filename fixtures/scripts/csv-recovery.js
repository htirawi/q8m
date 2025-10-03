#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CSV Data Recovery Tool
 * Helps recover and fix corrupted CSV data
 */

class CSVRecoveryTool {
  constructor() {
    this.questionsDir = path.join(__dirname, "../questions");
  }

  /**
   * Analyze the corrupted CSV and extract valid questions
   */
  analyzeCorruptedCSV(csvFile) {
    console.log(`🔍 Analyzing corrupted CSV: ${csvFile}`);

    const content = fs.readFileSync(csvFile, "utf8");
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    console.log(`📊 Total non-empty lines: ${lines.length}`);

    const validQuestions = [];
    const issues = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = this.parseCSVLine(line);

      if (parts.length >= 2) {
        const question = parts[0]?.trim();
        const answer = parts[1]?.trim();

        // Check if this looks like a valid question-answer pair
        if (
          question &&
          answer &&
          question.length > 10 &&
          answer.length > 20 &&
          question.includes("?") &&
          !question.includes("by contrast") &&
          !question.includes("easier to test") &&
          !question.includes("etc.")
        ) {
          validQuestions.push({
            question: question,
            answer: answer,
            category: parts[2]?.trim() || "General",
            difficulty: this.extractDifficulty(parts[3]?.trim()),
            tags: this.extractTags(parts[4]?.trim()),
          });
        } else {
          issues.push(`Row ${i + 1}: Invalid or incomplete data`);
        }
      }
    }

    console.log(`✅ Found ${validQuestions.length} valid questions`);
    console.log(`❌ Found ${issues.length} problematic rows`);

    return validQuestions;
  }

  /**
   * Parse CSV line with proper quote handling
   */
  parseCSVLine(line) {
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
  }

  /**
   * Extract valid difficulty from corrupted data
   */
  extractDifficulty(difficulty) {
    if (!difficulty) return "intermediate";

    const validDifficulties = ["easy", "intermediate", "hard", "expert"];

    // Check if it's already valid
    if (validDifficulties.includes(difficulty.toLowerCase())) {
      return difficulty.toLowerCase();
    }

    // Try to extract from corrupted text
    const lower = difficulty.toLowerCase();
    if (lower.includes("easy")) return "easy";
    if (lower.includes("hard")) return "hard";
    if (lower.includes("expert")) return "expert";
    if (lower.includes("intermediate")) return "intermediate";

    // Default to intermediate
    return "intermediate";
  }

  /**
   * Extract tags from corrupted data
   */
  extractTags(tags) {
    if (!tags) return ["general"];

    // Try to split by semicolon
    if (tags.includes(";")) {
      return tags
        .split(";")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }

    // Try to split by comma
    if (tags.includes(",")) {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }

    // Single tag
    return [tags.trim()];
  }

  /**
   * Create a clean CSV from recovered data
   */
  createCleanCSV(validQuestions, outputFile) {
    console.log(`📝 Creating clean CSV: ${outputFile}`);

    const header = "question,answer,category,difficulty,tags";
    const csvLines = [header];

    validQuestions.forEach((q, index) => {
      const line = `"${q.question.replace(/"/g, '""')}","${q.answer.replace(/"/g, '""')}","${q.category}","${q.difficulty}","${q.tags.join(";")}"`;
      csvLines.push(line);
    });

    fs.writeFileSync(outputFile, csvLines.join("\n"));
    console.log(`✅ Clean CSV created with ${validQuestions.length} questions`);
  }

  /**
   * Create a template for manual data entry
   */
  createTemplate(outputFile, count = 100) {
    console.log(`📝 Creating template for ${count} questions: ${outputFile}`);

    const header = "question,answer,category,difficulty,tags";
    const csvLines = [header];

    for (let i = 1; i <= count; i++) {
      const line = `"Question ${i}?","Answer ${i} - Please provide a comprehensive answer here.","General","intermediate","general"`;
      csvLines.push(line);
    }

    fs.writeFileSync(outputFile, csvLines.join("\n"));
    console.log(`✅ Template created with ${count} placeholder questions`);
    console.log(
      `🎯 You can now edit this file and replace the placeholders with your actual questions`
    );
  }

  /**
   * Show sample of recovered questions
   */
  showSample(validQuestions, count = 5) {
    console.log(`\n📋 Sample of recovered questions:`);

    validQuestions.slice(0, count).forEach((q, index) => {
      console.log(`\n${index + 1}. Question: ${q.question.substring(0, 80)}...`);
      console.log(`   Answer: ${q.answer.substring(0, 100)}...`);
      console.log(`   Category: ${q.category}, Difficulty: ${q.difficulty}`);
      console.log(`   Tags: ${q.tags.join(", ")}`);
    });
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const recovery = new CSVRecoveryTool();

  if (args.length === 0) {
    console.log(`
🔧 CSV Data Recovery Tool

Usage: 
  node scripts/csv-recovery.js <corrupted-csv> [command]

Commands:
  analyze     Analyze and show what can be recovered (default)
  recover     Recover valid questions and create clean CSV
  template    Create a template for manual data entry

Examples:
  node scripts/csv-recovery.js questions/angular-p1.csv
  node scripts/csv-recovery.js questions/angular-p1.csv recover
  node scripts/csv-recovery.js questions/angular-p1.csv template

🔧 This tool helps recover data from corrupted CSV files:
  ✅ Extracts valid question-answer pairs
  ✅ Fixes difficulty values
  ✅ Cleans up tags
  ✅ Creates clean CSV output
  ✅ Generates templates for manual entry
    `);
    process.exit(0);
  }

  const csvFile = args[0];
  const command = args[1] || "analyze";

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  switch (command) {
    case "analyze":
      const questions = recovery.analyzeCorruptedCSV(csvFile);
      recovery.showSample(questions);
      break;
    case "recover":
      const validQuestions = recovery.analyzeCorruptedCSV(csvFile);
      const outputFile = csvFile.replace(".csv", "-recovered.csv");
      recovery.createCleanCSV(validQuestions, outputFile);
      break;
    case "template":
      const templateFile = csvFile.replace(".csv", "-template.csv");
      recovery.createTemplate(templateFile, 100);
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(`Available commands: analyze, recover, template`);
      process.exit(1);
  }
}

export default CSVRecoveryTool;
