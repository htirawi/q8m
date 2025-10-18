#!/usr/bin/env node

/**
 * Final Comprehensive Type Error Fixer
 * Analyzes ALL remaining errors and applies systematic fixes
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const CLIENT_SRC = join(process.cwd(), "client", "src");

console.log("🚀 Final Comprehensive Type Error Fix\n");
console.log("Analyzing all remaining type errors...\n");

// Get all type errors
const output = execSync("cd client && npx vue-tsc --noEmit 2>&1 || true", {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

const errors = output.split("\n");
const stats = {
  filesModified: new Set(),
  errorsByType: {},
  fixesApplied: 0,
};

// Parse all errors by type
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
    });
    stats.errorsByType[errorCode] = (stats.errorsByType[errorCode] || 0) + 1;
  }
}

console.log("📊 Error Distribution:");
Object.entries(stats.errorsByType)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([code, count]) => {
    console.log(`  ${code}: ${count}`);
  });
console.log(`\n📁 Files with errors: ${errorsByFile.size}\n`);

// Fix each file
for (const [file, fileErrors] of errorsByFile) {
  try {
    const fullPath = join("client", file);
    let content = readFileSync(fullPath, "utf8");
    const original = content;
    let fixCount = 0;

    // Pattern 1: Add ?? defaults for possibly undefined (TS18048, TS2345)
    for (const error of fileErrors) {
      if (error.code === "TS18048" && error.message.includes("possibly 'undefined'")) {
        const propMatch = error.message.match(/'([^']+)' is possibly 'undefined'/);
        if (propMatch) {
          const prop = propMatch[1].replace("__VLS_ctx.", "").replace("props.", "");
          
          // Add optional chaining in templates
          if (prop.includes(".")) {
            const safeProp = prop.split(".").join("?.");
            const regex = new RegExp(`\\b${prop.replace(/\./g, "\\.")}\\b`, "g");
            const newContent = content.replace(regex, (match) => {
              // Don't replace if already has ?.
              if (content.substring(content.indexOf(match) - 5, content.indexOf(match)).includes("?.")) {
                return match;
              }
              return safeProp;
            });
            if (newContent !== content) {
              content = newContent;
              fixCount++;
            }
          }
        }
      }

      // Pattern 2: Add ?? 0 for number | undefined to number (TS2345)
      if (
        error.code === "TS2345" &&
        error.message.includes("number | undefined") &&
        error.message.includes("not assignable to parameter of type 'number'")
      ) {
        // These are usually function arguments - add ?? 0 at call sites
        // This is complex, handled by manual review
      }

      // Pattern 3: Prefix unused variables (TS6133)
      if (error.code === "TS6133" && error.message.includes("is declared but its value is never read")) {
        const varMatch = error.message.match(/'([^']+)' is declared but/);
        if (varMatch) {
          const varName = varMatch[1];
          // Prefix with _ if not already
          if (!varName.startsWith("_")) {
            content = content.replace(
              new RegExp(`\\bconst ${varName}\\b`, "g"),
              `const _${varName}`
            );
            fixCount++;
          }
        }
      }

      // Pattern 4: Fix Cannot find name (TS2304) - usually corrupted code
      if (error.code === "TS2304" && error.message.includes("Cannot find name")) {
        const nameMatch = error.message.match(/Cannot find name '([^']+)'/);
        if (nameMatch) {
          const name = nameMatch[1];
          // Check if it's a corrupted camelCase name
          if (name.includes("constvalueconst") || name.includes("typeof") || /[a-z][A-Z]/.test(name) && name.length > 20) {
            // Remove the corrupted line
            const lines = content.split("\n");
            if (error.line > 0 && error.line <= lines.length) {
              const lineContent = lines[error.line - 1];
              if (lineContent.includes(name)) {
                lines[error.line - 1] = ""; // Remove corrupted line
                content = lines.join("\n");
                fixCount++;
              }
            }
          }
        }
      }
    }

    // Pattern 5: Fix duplicate property names (TS1117, TS2451)
    const duplicateErrors = fileErrors.filter((e) => e.code === "TS1117" || e.code === "TS2451");
    if (duplicateErrors.length > 0) {
      // Remove duplicate lines
      const lines = content.split("\n");
      const seenLines = new Set();
      const newLines = lines.filter((line, idx) => {
        const trimmed = line.trim();
        if (duplicateErrors.some((e) => e.line === idx + 1)) {
          if (seenLines.has(trimmed)) {
            fixCount++;
            return false; // Remove duplicate
          }
          seenLines.add(trimmed);
        }
        return true;
      });
      if (newLines.length !== lines.length) {
        content = newLines.join("\n");
      }
    }

    if (content !== original) {
      writeFileSync(fullPath, content, "utf8");
      stats.filesModified.add(file);
      stats.fixesApplied += fixCount;
      console.log(`✅ ${file} (${fixCount} fixes)`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log("\n" + "=".repeat(70));
console.log("📊 Summary:");
console.log(`  Files modified: ${stats.filesModified.size}`);
console.log(`  Fixes applied: ${stats.fixesApplied}`);
console.log("\n✅ Run 'pnpm typecheck' to verify remaining errors");
console.log("💡 Remaining errors may require manual intervention");

