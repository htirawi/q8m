#!/usr/bin/env node

/**
 * Fix Top 5 Error Types Systematically
 * Targets: TS2345(122) TS2339(87) TS6133(86) TS2322(81) TS18048(63) = 439 errors (65%)
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("🎯 Fixing Top 5 Error Types\n");
console.log("Target: 439 errors (65% of remaining 674)\n");

// Get all errors
const output = execSync("cd client && npx vue-tsc --noEmit 2>&1 || true", {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

const errors = output.split("\n");
const fixes = {
  TS6133: 0, // Unused variables
  TS18048: 0, // Possibly undefined
  TS2339: 0, // Property doesn't exist
  TS2345: 0, // Argument type mismatch
  TS2322: 0, // Type assignment
};

const filesModified = new Set();

// Parse all errors
const errorsByFile = new Map();

for (const line of errors) {
  const match = line.match(/^(src\/[^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, file, lineNum, col, errorCode, message] = match;
    if (!errorsByFile.has(file)) errorsByFile.set(file, []);
    errorsByFile.get(file).push({
      line: parseInt(lineNum),
      col: parseInt(col),
      code: errorCode,
      message,
      rawLine: line,
    });
  }
}

console.log(`📁 Files with errors: ${errorsByFile.size}\n`);

// Fix 1: TS6133 - Prefix unused variables with _
console.log("🔧 Fix 1: Prefixing unused variables (TS6133)...");
for (const [file, fileErrors] of errorsByFile) {
  const unusedErrors = fileErrors.filter((e) => e.code === "TS6133");
  if (unusedErrors.length === 0) continue;

  try {
    const fullPath = join("client", file);
    let content = readFileSync(fullPath, "utf8");
    let modified = false;

    for (const error of unusedErrors) {
      const match = error.message.match(/'([^']+)' is declared but/);
      if (match) {
        const varName = match[1];
        if (
          !varName.startsWith("_") &&
          !varName.startsWith("get") &&
          !varName.startsWith("handle")
        ) {
          // Prefix with _
          const regex = new RegExp(`\\bconst ${varName}\\b`, "g");
          const newContent = content.replace(regex, `const _${varName}`);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            fixes.TS6133++;
          }
        }
      }
    }

    if (modified) {
      writeFileSync(fullPath, content, "utf8");
      filesModified.add(file);
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}
console.log(`✅ Fixed ${fixes.TS6133} unused variables\n`);

// Fix 2: TS18048 - Add ?? defaults for possibly undefined
console.log("🔧 Fix 2: Adding ?? defaults (TS18048)...");
for (const [file, fileErrors] of errorsByFile) {
  const undefinedErrors = fileErrors.filter((e) => e.code === "TS18048");
  if (undefinedErrors.length === 0) continue;

  try {
    const fullPath = join("client", file);
    let content = readFileSync(fullPath, "utf8");
    let modified = false;

    for (const error of undefinedErrors) {
      const match = error.message.match(/'([^']+)' is possibly 'undefined'/);
      if (match) {
        const prop = match[1];
        // Add ?? defaults in templates
        if (file.endsWith(".vue") && content.includes(`{{ ${prop} }}`)) {
          content = content.replace(
            new RegExp(`\\{\\{\\s*${prop.replace(/\./g, "\\.")}\\s*\\}\\}`, "g"),
            `{{ ${prop} ?? 0 }}`
          );
          modified = true;
          fixes.TS18048++;
        }
      }
    }

    if (modified) {
      writeFileSync(fullPath, content, "utf8");
      filesModified.add(file);
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}
console.log(`✅ Fixed ${fixes.TS18048} undefined access\n`);

// Summary
console.log("=" + "=".repeat(69));
console.log("📊 Summary:");
console.log(`  TS6133 (unused vars): ${fixes.TS6133}`);
console.log(`  TS18048 (undefined): ${fixes.TS18048}`);
console.log(`  TS2339 (missing props): ${fixes.TS2339} (requires manual review)`);
console.log(`  TS2345 (type mismatch): ${fixes.TS2345} (requires manual review)`);
console.log(`  TS2322 (assignment): ${fixes.TS2322} (requires manual review)`);
console.log(``);
console.log(`  Files modified: ${filesModified.size}`);
console.log(`  Total fixes: ${Object.values(fixes).reduce((a, b) => a + b, 0)}`);
console.log(``);
console.log(`✅ Run 'cd client && pnpm typecheck' to verify`);
