#!/usr/bin/env node

/**
 * Pre-push validation script
 * Comprehensive checks for code quality before pushing to repository
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(`🔍 ${title}`, "cyan");
  console.log("=".repeat(60));
}

function runCommand(command, description) {
  try {
    log(`\n📋 ${description}`, "blue");
    log(`Running: ${command}`, "gray");

    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: process.cwd(),
    });

    log(`✅ ${description} - PASSED`, "green");
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} - FAILED`, "red");
    log(`Error: ${error.message}`, "red");
    if (error.stdout) {
      log(`Output: ${error.stdout}`, "yellow");
    }
    if (error.stderr) {
      log(`Error Output: ${error.stderr}`, "red");
    }
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath) {
  return existsSync(join(process.cwd(), filePath));
}

function main() {
  log("🚀 Starting Pre-Push Validation", "bold");
  log("Ensuring code quality before pushing to repository...", "white");

  const checks = [];

  // 1. TypeScript Compilation Check
  logSection("TypeScript Compilation");
  const typeCheck = runCommand("npx tsc --noEmit", "TypeScript type checking");
  checks.push(typeCheck);

  // 2. ESLint Check (with strict rules)
  logSection("ESLint Code Quality");
  const lintCheck = runCommand(
    "npx eslint src/ --ext ts,tsx --max-warnings 5",
    "ESLint validation (max 5 warnings)"
  );
  checks.push(lintCheck);

  // 3. Prettier Format Check
  logSection("Code Formatting");
  const formatCheck = runCommand("npx prettier --check src/", "Prettier format validation");
  checks.push(formatCheck);

  // 4. Build Check
  logSection("Production Build");
  const buildCheck = runCommand("npm run build", "Production build validation");
  checks.push(buildCheck);

  // 5. Test Suite
  logSection("Test Suite");
  const testCheck = runCommand("npm run test", "Test suite execution");
  checks.push(testCheck);

  // 6. Strict Any Type Check
  logSection("Strict Any Type Detection");
  const anyCheck = runCommand(
    'grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "// eslint-disable" | grep -v "data/" | grep -v "expect.any" || true',
    "Strict any type detection"
  );
  if (anyCheck.success && anyCheck.output.trim()) {
    log('❌ Found "any" types in source code:', "red");
    log(anyCheck.output, "red");
    log('🚫 "any" types are not allowed! Please replace with proper TypeScript types.', "red");
    checks.push({ success: false, error: 'Found "any" types in source code' });
  } else {
    log('✅ No "any" types found in source code', "green");
    checks.push({ success: true });
  }

  // 7. Strict Unused Variable Check
  logSection("Strict Unused Variable Detection");
  const unusedCheck = runCommand(
    'npx eslint src/ --ext ts,tsx --rule "@typescript-eslint/no-unused-vars: error" --quiet',
    "Strict unused variable detection"
  );
  if (unusedCheck.success) {
    log("✅ No unused variables found in source code", "green");
    checks.push({ success: true });
  } else {
    log("❌ Found unused variables in source code:", "red");
    log("🚫 Unused variables are not allowed! Please remove or use them.", "red");
    checks.push({ success: false, error: "Found unused variables in source code" });
  }

  // 8. Console Statement Check (relaxed)
  logSection("Console Statement Detection");
  const consoleCheck = runCommand(
    'grep -r "console\\." src/ --include="*.ts" --include="*.tsx" | grep -v "console.warn" | grep -v "console.error" | grep -v "// eslint-disable" | grep -v "data/" || true',
    "Console statement detection (excluding data files)"
  );
  if (consoleCheck.success && consoleCheck.output.trim()) {
    log("⚠️  Found console statements in source code:", "yellow");
    log(consoleCheck.output, "yellow");
    // Don't fail the build for console statements, just warn
    log("ℹ️  Note: Console statements found but not blocking push (data files excluded)", "blue");
    checks.push({ success: true });
  } else {
    log("✅ No console statements found in source code", "green");
    checks.push({ success: true });
  }

  // 9. Strict Import/Export Check
  logSection("Strict Import/Export Validation");
  const importCheck = runCommand(
    'npx eslint src/ --ext ts,tsx --rule "@typescript-eslint/no-unused-vars: error" --quiet',
    "Strict unused import detection"
  );
  if (importCheck.success) {
    log("✅ No unused imports found in source code", "green");
    checks.push({ success: true });
  } else {
    log("❌ Found unused imports in source code:", "red");
    log("🚫 Unused imports are not allowed! Please remove them.", "red");
    checks.push({ success: false, error: "Found unused imports in source code" });
  }

  // Summary
  logSection("Validation Summary");

  const passed = checks.filter((check) => check.success).length;
  const failed = checks.filter((check) => !check.success).length;

  log(`\n📊 Results:`, "bold");
  log(`✅ Passed: ${passed}`, "green");
  log(`❌ Failed: ${failed}`, failed > 0 ? "red" : "green");

  if (failed > 0) {
    log("\n🚫 Pre-push validation FAILED!", "red");
    log("Please fix the issues above before pushing.", "red");
    log("\n💡 Quick fixes:", "yellow");
    log('• Run "npm run lint:fix" to auto-fix linting issues', "white");
    log('• Run "npm run format" to auto-fix formatting issues', "white");
    log('• Check for "any" types and replace with proper types', "white");
    log("• Remove unused variables and imports", "white");
    log("• Replace console.log with console.warn/error or remove", "white");
    process.exit(1);
  } else {
    log("\n🎉 Pre-push validation PASSED!", "green");
    log("✅ Code is ready to be pushed to repository.", "green");
    process.exit(0);
  }
}

// Run the validation
main();
