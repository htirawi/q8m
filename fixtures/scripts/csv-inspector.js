#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CSV File Inspector and Fixer
 * Helps diagnose and fix CSV file issues
 */

class CSVInspector {
  constructor() {
    this.questionsDir = path.join(__dirname, "../questions");
  }

  /**
   * Inspect CSV file and show detailed information
   */
  inspectCSV(csvFile) {
    console.log(`🔍 Inspecting CSV file: ${csvFile}`);
    console.log(`📁 File path: ${path.resolve(csvFile)}`);

    try {
      // Read file content first to avoid race condition
      const content = fs.readFileSync(csvFile, "utf8");
      
      // Get file stats after reading content to ensure consistency
      const stats = fs.statSync(csvFile);
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📄 File encoding: UTF-8`);

      // Check for BOM (Byte Order Mark)
      if (content.charCodeAt(0) === 0xfeff) {
        console.log(`⚠️  File has BOM (Byte Order Mark) - this can cause issues`);
      }

      // Split into lines
      const lines = content.split("\n");
      console.log(`📊 Total lines: ${lines.length}`);

      // Show first few lines
      console.log(`\n📋 First 5 lines:`);
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        const preview = line.length > 100 ? line.substring(0, 100) + "..." : line;
        console.log(`   ${i + 1}: ${preview}`);
      }

      // Check for empty lines
      const emptyLines = lines.filter((line) => line.trim() === "").length;
      console.log(`\n📊 Empty lines: ${emptyLines}`);

      // Check for non-empty lines
      const nonEmptyLines = lines.filter((line) => line.trim() !== "");
      console.log(`📊 Non-empty lines: ${nonEmptyLines.length}`);

      // Show headers
      if (nonEmptyLines.length > 0) {
        const firstLine = nonEmptyLines[0];
        console.log(`\n📋 Headers (first line): ${firstLine}`);

        // Check if it looks like proper CSV headers
        const expectedHeaders = ["question", "answer", "category", "difficulty", "tags"];
        const hasExpectedHeaders = expectedHeaders.some((header) =>
          firstLine.toLowerCase().includes(header.toLowerCase())
        );

        if (hasExpectedHeaders) {
          console.log(`✅ Headers look correct`);
        } else {
          console.log(`❌ Headers don't look like expected CSV format`);
          console.log(`   Expected: question,answer,category,difficulty,tags`);
        }
      }

      // Check for common issues
      console.log(`\n🔍 Checking for common issues:`);

      // Check for binary content
      const hasBinaryContent = content.includes("\0") || content.includes("\x00");
      if (hasBinaryContent) {
        console.log(`❌ File contains binary data - might be corrupted`);
      }

      // Check for Excel artifacts
      const hasExcelArtifacts = content.includes("PK") || content.includes("xl/");
      if (hasExcelArtifacts) {
        console.log(`❌ File appears to be an Excel file (.xlsx) saved as .csv`);
      }

      // Check encoding
      const hasEncodingIssues = content.includes("�") || content.includes("ï¿½");
      if (hasEncodingIssues) {
        console.log(`❌ File has encoding issues`);
      }

      return {
        size: stats.size,
        lines: lines.length,
        emptyLines,
        nonEmptyLines: nonEmptyLines.length,
        hasBinaryContent,
        hasExcelArtifacts,
        hasEncodingIssues,
        firstLine: nonEmptyLines[0] || "",
      };
    } catch (error) {
      console.error(`❌ Error reading file: ${error.message}`);
      return null;
    }
  }

  /**
   * Create a clean CSV template
   */
  createCleanTemplate(outputFile) {
    console.log(`📝 Creating clean CSV template: ${outputFile}`);

    const template = `question,answer,category,difficulty,tags
"What is Angular?","Angular is a platform and framework for building single-page client applications using HTML, CSS and TypeScript.","Angular Basics","easy","angular;basics;framework"
"What is TypeScript?","TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type definitions to JavaScript.","Angular Basics","easy","typescript;javascript;types"
"What is a component in Angular?","A component is a TypeScript class decorated with @Component that defines a view with its associated template and styles.","Angular Components","intermediate","components;decorators;templates"
"What is dependency injection?","Dependency injection is a design pattern where dependencies are provided to a class rather than the class creating them itself.","Angular Services","intermediate","dependency-injection;services;design-patterns"
"What is Angular CLI?","Angular CLI is a command-line interface tool that helps you create, build, and manage Angular applications.","Angular CLI","easy","cli;tools;development"`;

    fs.writeFileSync(outputFile, template);
    console.log(`✅ Template created successfully`);
    console.log(`📋 Template contains 5 sample questions`);
    console.log(`🎯 You can now edit this file and add your 100+ questions`);
  }

  /**
   * Fix common CSV issues
   */
  fixCSV(inputFile, outputFile) {
    console.log(`🔧 Attempting to fix CSV file: ${inputFile}`);

    try {
      const content = fs.readFileSync(inputFile, "utf8");

      // Remove BOM if present
      let cleanContent = content;
      if (content.charCodeAt(0) === 0xfeff) {
        cleanContent = content.slice(1);
        console.log(`✅ Removed BOM`);
      }

      // Split into lines and filter empty ones
      const lines = cleanContent.split("\n");
      const nonEmptyLines = lines.filter((line) => line.trim() !== "");

      console.log(`📊 Original lines: ${lines.length}`);
      console.log(`📊 Non-empty lines: ${nonEmptyLines.length}`);

      if (nonEmptyLines.length === 0) {
        throw new Error("No valid data found in file");
      }

      // Check if first line looks like headers
      const firstLine = nonEmptyLines[0];
      const expectedHeaders = ["question", "answer", "category", "difficulty", "tags"];
      const hasExpectedHeaders = expectedHeaders.some((header) =>
        firstLine.toLowerCase().includes(header.toLowerCase())
      );

      if (!hasExpectedHeaders) {
        console.log(`⚠️  First line doesn't look like proper headers`);
        console.log(`   Adding proper headers...`);

        // Add proper headers
        const headerLine = "question,answer,category,difficulty,tags";
        const fixedLines = [headerLine, ...nonEmptyLines];

        fs.writeFileSync(outputFile, fixedLines.join("\n"));
        console.log(`✅ Added proper headers`);
      } else {
        // Just clean the file
        fs.writeFileSync(outputFile, nonEmptyLines.join("\n"));
        console.log(`✅ Cleaned file (removed empty lines)`);
      }

      console.log(`📁 Fixed file saved as: ${outputFile}`);
      return true;
    } catch (error) {
      console.error(`❌ Error fixing file: ${error.message}`);
      return false;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const inspector = new CSVInspector();

  if (args.length === 0) {
    console.log(`
🔍 CSV File Inspector and Fixer

Usage: 
  node scripts/csv-inspector.js <csv-file> [command]

Commands:
  inspect     Inspect the CSV file (default)
  fix         Fix common CSV issues
  template    Create a clean template

Examples:
  node scripts/csv-inspector.js questions/angular-100-p1.csv
  node scripts/csv-inspector.js questions/angular-100-p1.csv fix
  node scripts/csv-inspector.js questions/angular-100-p1.csv template

🔧 This tool helps diagnose and fix CSV file issues:
  ✅ File corruption detection
  ✅ Encoding issue detection
  ✅ Excel file detection
  ✅ Empty line removal
  ✅ Header validation
  ✅ Template creation
    `);
    process.exit(0);
  }

  const csvFile = args[0];
  const command = args[1] || "inspect";

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  switch (command) {
    case "inspect":
      inspector.inspectCSV(csvFile);
      break;
    case "fix":
      const outputFile = csvFile.replace(".csv", "-fixed.csv");
      inspector.fixCSV(csvFile, outputFile);
      break;
    case "template":
      const templateFile = csvFile.replace(".csv", "-template.csv");
      inspector.createCleanTemplate(templateFile);
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(`Available commands: inspect, fix, template`);
      process.exit(1);
  }
}

export default CSVInspector;
