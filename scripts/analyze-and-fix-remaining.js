#!/usr/bin/env node

/**
 * Analyze Remaining Type Errors and Generate Fixes
 * Parse all remaining errors and create targeted prop additions
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

console.log("🔍 Analyzing remaining type errors...\n");

const output = execSync("cd client && npx vue-tsc --noEmit 2>&1 || true", {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

const errors = output.split("\n");

// Parse all TS2339 errors (Property does not exist)
const missingProps = new Map();

for (const line of errors) {
  const match = line.match(/error TS2339: Property '([^']+)' does not exist on type '([^']+)'/);
  if (match) {
    const [, propName, typeName] = match;
    // Extract interface name if possible
    const interfaceMatch = typeName.match(/^I\w+Props|^I\w+/);
    if (interfaceMatch) {
      const interfaceName = interfaceMatch[0];
      if (!missingProps.has(interfaceName)) {
        missingProps.set(interfaceName, new Set());
      }
      missingProps.get(interfaceName).add(propName);
    }
  }
}

console.log("📊 Missing Props by Interface:\n");
for (const [interfaceName, props] of missingProps) {
  console.log(`${interfaceName}:`);
  for (const prop of props) {
    console.log(`  - ${prop}`);
  }
  console.log();
}

console.log(`\n✅ Found ${missingProps.size} interfaces with missing props`);
console.log("💡 Add these props to the respective type definition files");

