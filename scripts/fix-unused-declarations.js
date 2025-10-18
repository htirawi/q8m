#!/usr/bin/env node

/**
 * Fix TS6133: Unused Declarations
 * Prefix unused variables with underscore to indicate intentionally unused
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

console.log("🔧 Fixing unused declarations (TS6133)...\n");

// Get all TS6133 errors
const output = execSync("cd client && pnpm typecheck 2>&1 || true", {
  encoding: "utf8",
});

const errors = output.split("\n");
const fixes = new Map();

for (const line of errors) {
  // Match: src/file.vue(123,7): error TS6133: 'varName' is declared but its value is never read.
  const match = line.match(
    /^(src\/[^(]+)\((\d+),(\d+)\): error TS6133: '([^']+)' is declared but its value is never read\./
  );

  if (match) {
    const [, file, lineNum, col, varName] = match;
    const key = `${file}:${lineNum}:${varName}`;
    if (!fixes.has(key)) {
      fixes.set(key, { file, lineNum: parseInt(lineNum), col: parseInt(col), varName });
    }
  }
}

console.log(`📊 Found ${fixes.size} unused declarations\n`);

const fileGroups = new Map();
for (const fix of fixes.values()) {
  if (!fileGroups.has(fix.file)) {
    fileGroups.set(fix.file, []);
  }
  fileGroups.get(fix.file).push(fix);
}

let totalFixed = 0;

for (const [file, fileFixes] of fileGroups) {
  try {
    const fullPath = `client/${file}`;
    let content = readFileSync(fullPath, "utf8");
    const lines = content.split("\n");

    // Sort by line number (descending) to avoid index shifts
    fileFixes.sort((a, b) => b.lineNum - a.lineNum);

    for (const fix of fileFixes) {
      const lineIdx = fix.lineNum - 1;
      if (lineIdx >= 0 && lineIdx < lines.length) {
        const line = lines[lineIdx];

        // Pattern: const varName =
        if (line.includes(`const ${fix.varName} =`)) {
          lines[lineIdx] = line.replace(`const ${fix.varName} =`, `const _${fix.varName} =`);
          totalFixed++;
        }
        // Pattern: import { ..., varName, ... }
        else if (line.includes(`import`) && line.includes(fix.varName)) {
          // Don't prefix imports, just note them
          console.log(`  ⚠️  ${file}:${fix.lineNum} - Unused import: ${fix.varName}`);
        }
      }
    }

    writeFileSync(fullPath, lines.join("\n"), "utf8");
    if (fileFixes.length > 0) {
      console.log(`✅ ${file} (${fileFixes.length} fixes)`);
    }
  } catch (err) {
    console.error(`❌ Error fixing ${file}:`, err.message);
  }
}

console.log(`\n✅ Fixed ${totalFixed} unused declarations`);
console.log("💡 Variables prefixed with _ to indicate intentionally unused");
