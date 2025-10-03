#!/usr/bin/env node

/**
 * Data Guard Script
 * 
 * This script detects question/quiz data files outside of fixtures directory
 * and fails if found. Used in CI to prevent stale data files from being introduced.
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class DataGuard {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Check for question/quiz data files outside fixtures
   */
  checkDataFiles() {
    // Only check for actual data files, not production code
    const dataFilePatterns = [
      'questions.csv',
      'quiz.csv',
      'qa.csv',
      'mcq.csv',
      'exam.csv',
      'bank.csv',
      'sample-questions.json',
      'sample-quiz.json',
      'test-questions.json',
      'mock-questions.json'
    ];

    for (const pattern of dataFilePatterns) {
      try {
        // Find files matching exact pattern, excluding fixtures, node_modules, dist
        const result = execSync(
          `find . -path "./fixtures" -prune -o -path "./node_modules" -prune -o -path "./dist" -prune -o -path "./coverage" -prune -o -name "${pattern}" -type f -print`,
          { encoding: 'utf8', cwd: process.cwd() }
        );

        const files = result.trim().split('\n').filter(f => f && f !== '.');

        for (const file of files) {
          this.errors.push(`❌ Question/quiz data file detected outside fixtures: ${file}`);
        }
      } catch (error) {
        // No files found - this is good
      }
    }
  }

  /**
   * Check for data-related directories outside fixtures
   */
  checkDataDirectories() {
    const forbiddenDirs = [
      'questions',
      'quizzes',
      'data',
      'assets/data',
      'public/data'
    ];

    for (const dir of forbiddenDirs) {
      if (existsSync(dir)) {
        this.errors.push(`❌ Data directory detected outside fixtures: ${dir}`);
      }
    }
  }

  /**
   * Check for data exports in source code
   */
  checkDataExports() {
    const dataPatterns = [
      { pattern: /export\s+const\s+questions\s*=/i, message: 'Questions export detected' },
      { pattern: /export\s+const\s+quiz\s*=/i, message: 'Quiz export detected' },
      { pattern: /const\s+questions\s*=\s*\[/i, message: 'Questions array detected' },
      { pattern: /const\s+quiz\s*=\s*\[/i, message: 'Quiz array detected' }
    ];

    try {
      // Search for data patterns in source files (excluding fixtures, node_modules, dist, backups)
      const result = execSync(
        'find . -path "./fixtures" -prune -o -path "./node_modules" -prune -o -path "./dist" -prune -o -path "./coverage" -prune -o -path "./backups" -prune -o -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v fixtures | grep -v node_modules | grep -v dist | grep -v coverage | grep -v backups',
        { encoding: 'utf8', cwd: process.cwd() }
      );

      const files = result.trim().split('\n').filter(f => f);

      for (const file of files) {
        if (!existsSync(file)) continue;

        try {
          const content = readFileSync(file, 'utf8');
          
          for (const { pattern, message } of dataPatterns) {
            if (pattern.test(content)) {
              // Check if it's in a test file or mock
              if (file.includes('test') || file.includes('mock') || file.includes('spec')) {
                this.warnings.push(`⚠️ ${message} in test file: ${file}`);
              } else {
                this.errors.push(`❌ ${message} in source file: ${file}`);
              }
            }
          }
        } catch (error) {
          this.warnings.push(`⚠️ Could not read ${file}: ${error}`);
        }
      }
    } catch (error) {
      this.warnings.push(`⚠️ Could not search source files: ${error}`);
    }
  }

  /**
   * Check for CSV files outside fixtures
   */
  checkCsvFiles() {
    try {
      const result = execSync(
        'find . -path "./fixtures" -prune -o -path "./node_modules" -prune -o -path "./dist" -prune -o -name "*.csv" -type f -print',
        { encoding: 'utf8', cwd: process.cwd() }
      );

      const files = result.trim().split('\n').filter(f => f);

      for (const file of files) {
        this.errors.push(`❌ CSV file detected outside fixtures: ${file}`);
      }
    } catch (error) {
      // No CSV files found - this is good
    }
  }

  /**
   * Check for sample data files outside fixtures
   */
  checkSampleFiles() {
    const samplePatterns = [
      'sample-questions.json',
      'sample-data.json',
      'test-data.json',
      'mock-data.json'
    ];

    for (const pattern of samplePatterns) {
      try {
        const result = execSync(
          `find . -path "./fixtures" -prune -o -path "./node_modules" -prune -o -path "./dist" -prune -o -name "${pattern}" -type f -print`,
          { encoding: 'utf8', cwd: process.cwd() }
        );

        const files = result.trim().split('\n').filter(f => f);

        for (const file of files) {
          this.errors.push(`❌ Sample data file detected outside fixtures: ${file}`);
        }
      } catch (error) {
        // No sample files found - this is good
      }
    }
  }

  /**
   * Run all guard checks
   */
  run() {
    console.log(`${YELLOW}🔍 Running data guard checks...${RESET}\n`);

    this.checkDataFiles();
    this.checkDataDirectories();
    this.checkDataExports();
    this.checkCsvFiles();
    this.checkSampleFiles();

    // Print results
    if (this.warnings.length > 0) {
      console.log(`${YELLOW}⚠️ Warnings:${RESET}`);
      this.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log();
    }

    if (this.errors.length > 0) {
      console.log(`${RED}❌ Errors found:${RESET}`);
      this.errors.forEach(error => console.log(`  ${error}`));
      console.log();
      console.log(`${RED}🚫 Question/quiz data files detected outside fixtures!${RESET}`);
      console.log(`${RED}   Move data files to fixtures/ directory for development use.${RESET}`);
      return { passed: false, errors: this.errors, warnings: this.warnings };
    }

    console.log(`${GREEN}✅ No question/quiz data files detected outside fixtures. Repository is clean.${RESET}`);
    return { passed: true, errors: [], warnings: this.warnings };
  }
}

// Run the guard
const guard = new DataGuard();
const result = guard.run();

if (!result.passed) {
  process.exit(1);
}

process.exit(0);
