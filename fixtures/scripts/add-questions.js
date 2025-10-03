#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to automatically add questions to Angular enhanced questions file
 * Usage: node scripts/add-questions.js questions.json
 */

class QuestionAdder {
  constructor() {
    this.questionsFile = path.join(__dirname, "../src/data/angular-enhanced.ts");
    this.backupFile = path.join(__dirname, "../src/data/angular-enhanced.backup.ts");
  }

  /**
   * Parse questions from JSON file
   */
  parseQuestions(jsonFile) {
    try {
      const content = fs.readFileSync(jsonFile, "utf8");
      const data = JSON.parse(content);

      // Handle both formats: {questions: [...]} and [...]
      if (data.questions && Array.isArray(data.questions)) {
        return data.questions;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        throw new Error(
          'Invalid JSON format. Expected array of questions or object with "questions" property.'
        );
      }
    } catch (error) {
      console.error(`Error reading questions file: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Read current questions file
   */
  readCurrentQuestions() {
    try {
      return fs.readFileSync(this.questionsFile, "utf8");
    } catch (error) {
      console.error(`Error reading current questions file: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Find the last question ID in the file
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
   * Convert question object to TypeScript format
   */
  formatQuestion(question, startId) {
    const id = startId + question.id;

    // Properly escape all special characters for both question and answer
    const escapeString = (str) => {
      return str
        .replace(/\\/g, "\\\\")  // Escape backslashes first
        .replace(/"/g, '\\"')     // Escape quotes
        .replace(/\n/g, "\\n")    // Escape newlines
        .replace(/\r/g, "\\r")    // Escape carriage returns
        .replace(/\t/g, "\\t")    // Escape tabs
        .replace(/\$/g, "\\$")    // Escape dollar signs (for template literals)
        .replace(/`/g, "\\`");    // Escape backticks
    };

    const escapedQuestion = escapeString(question.question);
    const escapedAnswer = escapeString(question.answer);
    const escapedCategory = escapeString(question.category);
    const escapedDifficulty = escapeString(question.difficulty);

    return `  {
    id: ${id},
    question: "${escapedQuestion}",
    answer:
      "${escapedAnswer}",
    category: "${escapedCategory}",
    difficulty: "${escapedDifficulty}",
    tags: [${question.tags.map((tag) => `"${escapeString(tag)}"`).join(", ")}],
  },`;
  }

  /**
   * Add questions to the file
   */
  addQuestions(questions) {
    console.log(`📖 Reading current questions file...`);
    const currentContent = this.readCurrentQuestions();

    console.log(`🔍 Finding last question ID...`);
    const lastId = this.findLastQuestionId(currentContent);
    console.log(`   Last question ID: ${lastId}`);

    console.log(`📝 Creating backup...`);
    fs.writeFileSync(this.backupFile, currentContent);
    console.log(`   Backup created: ${this.backupFile}`);

    console.log(`🔄 Processing ${questions.length} questions...`);

    // Find the insertion point (before the closing bracket and export)
    const insertionPoint = currentContent.lastIndexOf("];");
    if (insertionPoint === -1) {
      console.error("❌ Could not find insertion point in questions file");
      process.exit(1);
    }

    // Generate new questions
    const newQuestions = questions.map((question, index) => {
      const formattedQuestion = this.formatQuestion(question, lastId);
      console.log(
        `   ✅ Processed question ${index + 1}/${questions.length}: ${question.question.substring(0, 50)}...`
      );
      return formattedQuestion;
    });

    // Insert new questions
    const beforeInsertion = currentContent.substring(0, insertionPoint);
    const afterInsertion = currentContent.substring(insertionPoint);

    const updatedContent = beforeInsertion + "\n" + newQuestions.join("\n") + "\n" + afterInsertion;

    console.log(`💾 Writing updated questions file...`);
    fs.writeFileSync(this.questionsFile, updatedContent);

    console.log(`🎉 Successfully added ${questions.length} questions!`);
    console.log(`   New question IDs: ${lastId + 1} - ${lastId + questions.length}`);
    console.log(`   Total questions: ${lastId + questions.length}`);
  }

  /**
   * Validate questions format
   */
  validateQuestions(questions) {
    const requiredFields = ["question", "answer", "category", "difficulty", "tags"];
    const validDifficulties = ["easy", "intermediate", "hard", "expert"];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Check required fields
      for (const field of requiredFields) {
        if (!question[field]) {
          console.error(`❌ Question ${i + 1} missing required field: ${field}`);
          return false;
        }
      }

      // Check difficulty
      if (!validDifficulties.includes(question.difficulty)) {
        console.error(`❌ Question ${i + 1} has invalid difficulty: ${question.difficulty}`);
        console.error(`   Valid difficulties: ${validDifficulties.join(", ")}`);
        return false;
      }

      // Check tags array
      if (!Array.isArray(question.tags) || question.tags.length === 0) {
        console.error(`❌ Question ${i + 1} must have at least one tag`);
        return false;
      }
    }

    return true;
  }

  /**
   * Main execution
   */
  run(jsonFile) {
    console.log(`🚀 Starting question addition process...`);
    console.log(`📁 Questions file: ${jsonFile}`);
    console.log(`📁 Target file: ${this.questionsFile}`);

    // Parse questions
    const questions = this.parseQuestions(jsonFile);
    console.log(`📊 Found ${questions.length} questions to add`);

    // Validate questions
    console.log(`🔍 Validating questions...`);
    if (!this.validateQuestions(questions)) {
      console.error(`❌ Validation failed`);
      process.exit(1);
    }
    console.log(`✅ All questions validated successfully`);

    // Add questions
    this.addQuestions(questions);

    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Review the changes in ${this.questionsFile}`);
    console.log(`   2. Test the application: pnpm dev`);
    console.log(`   3. If everything looks good, delete backup: rm ${this.backupFile}`);
    console.log(`   4. If issues, restore backup: cp ${this.backupFile} ${this.questionsFile}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📚 Angular Questions Adder

Usage: node scripts/add-questions.js <questions.json>

Examples:
  node scripts/add-questions.js questions/angular-17.json
  node scripts/add-questions.js questions/react-questions.json

📋 Questions JSON Format:
{
  "questions": [
    {
      "id": 1,
      "question": "What is Angular?",
      "answer": "Angular is a platform and framework...",
      "category": "Angular Basics",
      "difficulty": "easy",
      "tags": ["angular", "basics", "framework"]
    }
  ]
}

🔧 Features:
  ✅ Automatic ID assignment
  ✅ Backup creation
  ✅ Validation
  ✅ Progress tracking
  ✅ Error handling
    `);
    process.exit(1);
  }

  const jsonFile = args[0];

  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ Questions file not found: ${jsonFile}`);
    process.exit(1);
  }

  const adder = new QuestionAdder();
  adder.run(jsonFile);
}

export default QuestionAdder;
