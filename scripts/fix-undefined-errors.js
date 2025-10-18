#!/usr/bin/env node

/**
 * Fix Undefined Handling Errors
 * Adds nullish coalescing and optional chaining where needed
 */

import { readFileSync, writeFileSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function main() {
  console.log("🔧 Analyzing undefined errors...\n");

  // Get all typecheck errors
  const { stdout } = await execAsync(
    "cd client && pnpm typecheck 2>&1 || true"
  );

  // Parse errors for "possibly undefined" patterns
  const errors = stdout.split("\n");
  const fixes = {};

  for (const line of errors) {
    // Match pattern like: src/file.vue(123,45): error TS18048: '__VLS_ctx.progress.difficultyProgress' is possibly 'undefined'.
    const match = line.match(
      /^(src\/[^(]+)\((\d+),\d+\): error TS18048: '([^']+)' is possibly 'undefined'\./
    );

    if (match) {
      const [, file, lineNum, expr] = match;
      if (!fixes[file]) fixes[file] = [];
      fixes[file].push({ lineNum: parseInt(lineNum), expr });
    }
  }

  console.log(`Found ${Object.keys(fixes).length} files with undefined errors`);

  let totalFixes = 0;

  // Apply fixes
  for (const [file, fileErrors] of Object.entries(fixes)) {
    try {
      const fullPath = `client/${file}`;
      let content = readFileSync(fullPath, "utf8");
      const lines = content.split("\n");

      // Group errors by expression to avoid duplicate fixes
      const uniqueExprs = [...new Set(fileErrors.map((e) => e.expr))];

      for (const expr of uniqueExprs) {
        // Clean up expression (remove __VLS_ctx.)
        const cleanExpr = expr.replace("__VLS_ctx.", "");

        // Add nullish coalescing if it's a simple property access
        if (cleanExpr.includes(".") && !cleanExpr.includes("?.")) {
          // Replace last dot with ?.
          const parts = cleanExpr.split(".");
          const lastPart = parts.pop();
          const prefix = parts.join(".");

          // Find and fix instances (be conservative to avoid breaking working code)
          const regex = new RegExp(`(?<!\\?)${prefix}\\.${lastPart}`, "g");
          content = content.replace(regex, `${prefix}?.${lastPart}`);
          totalFixes++;
        }
      }

      if (content !== readFileSync(fullPath, "utf8")) {
        writeFileSync(fullPath, content, "utf8");
        console.log(`✅ Fixed ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error fixing ${file}:`, err.message);
    }
  }

  console.log(`\n✅ Applied ${totalFixes} fixes`);
}

main().catch(console.error);

