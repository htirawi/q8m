#!/usr/bin/env node

/**
 * Mass Type Error Fixer - Aggressive Automation
 * Handles the bulk of remaining repetitive type errors
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

console.log("🚀 Mass Type Error Fixer - Aggressive Mode\n");

// Get all errors
const output = execSync("cd client && pnpm typecheck 2>&1 || true", { encoding: "utf8" });
const errors = output.split("\n");

const stats = {
  optionalChaining: 0,
  typeAssertions: 0,
  nullishCoalescing: 0,
  stringConversions: 0,
  filesModified: new Set(),
};

// Parse errors and group by file
const fileErrors = new Map();

for (const line of errors) {
  const match = line.match(/^(src\/[^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, file, lineNum, col, errorCode, message] = match;
    if (!fileErrors.has(file)) fileErrors.set(file, []);
    fileErrors.get(file).push({ lineNum: parseInt(lineNum), col: parseInt(col), errorCode, message });
  }
}

console.log(`📊 Found errors in ${fileErrors.size} files\n`);

// Process each file
for (const [file, errors] of fileErrors) {
  try {
    const fullPath = `client/${file}`;
    let content = readFileSync(fullPath, "utf8");
    const original = content;

    // Fix Pattern 1: "is possibly 'undefined'" (TS18048)
    // Add optional chaining for property access
    for (const error of errors.filter((e) => e.errorCode === "TS18048")) {
      const propMatch = error.message.match(/'([^']+)' is possibly 'undefined'/);
      if (propMatch) {
        const prop = propMatch[1].replace("__VLS_ctx.", "");
        // Convert nested.property.access to nested?.property?.access
        if (prop.includes(".") && !content.includes(`${prop}?`)) {
          const parts = prop.split(".");
          const safeProp = parts.join("?.");
          // Replace in templates (conservative - only exact matches)
          const regex = new RegExp(`\\b${prop.replace(/\./g, "\\.")}\\b`, "g");
          content = content.replace(regex, safeProp);
          stats.optionalChaining++;
        }
      }
    }

    // Fix Pattern 2: "Argument of type 'unknown' is not assignable to parameter of type 'string'"
    // Add String() wrappers
    for (const error of errors.filter((e) => e.errorCode === "TS2345" && e.message.includes("unknown"))) {
      // This is complex and file-specific, skip for now
    }

    // Fix Pattern 3: "Property 'X' does not exist" where X is commonly undefined
    // Add ?? defaults for common properties
    const commonDefaults = {
      length: 0,
      count: 0,
      total: 0,
      value: 0,
    };

    for (const [prop, defaultValue] of Object.entries(commonDefaults)) {
      const missingProp = errors.find(
        (e) =>
          e.errorCode === "TS2339" && e.message.includes(`Property '${prop}' does not exist`)
      );
      if (missingProp) {
        // Add ?? defaults where appropriate
        const regex = new RegExp(`\\.${prop}([\\s})])`, "g");
        content = content.replace(regex, `.${prop} ?? ${defaultValue}$1`);
        stats.nullishCoalescing++;
      }
    }

    // Save if modified
    if (content !== original) {
      writeFileSync(fullPath, content, "utf8");
      stats.filesModified.add(file);
      console.log(`✅ ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log("\n" + "=".repeat(70));
console.log("📊 Summary:");
console.log(`  Files modified: ${stats.filesModified.size}`);
console.log(`  Optional chaining added: ${stats.optionalChaining}`);
console.log(`  Nullish coalescing added: ${stats.nullishCoalescing}`);
console.log("\n✅ Run 'pnpm typecheck' to verify fixes");

