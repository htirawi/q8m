#!/usr/bin/env node

/**
 * Generate Missing Type Definitions
 * Analyzes errors and generates exact type additions needed
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

console.log("🔍 Generating missing type definitions...\n");

// Get all type errors
const output = execSync("cd client && npx vue-tsc --noEmit 2>&1 || true", {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

const errors = output.split("\n");

// Map interface names to their type file paths
const interfaceToFile = {
  ISmartRecommendationsProps: "client/src/types/components/recommendations.ts",
  IStickyStartBarProps: "client/src/types/components/study.ts",
  ICountdownTimerProps: "client/src/types/components/pricing.ts",
  IShareButtonProps: "client/src/types/components/shares.ts",
  IShareModalProps: "client/src/types/components/shares.ts",
  IBadgeUnlockNotificationProps: "client/src/types/components/gamification.ts",
  ILeaderboardProps: "client/src/types/components/gamification.ts",
  IBadgesGridProps: "client/src/types/components/gamification.ts",
  IPlanUpsellModalProps: "client/src/types/components/marketing.ts",
  IDiscussionFormProps: "client/src/types/components/discussions.ts",
  // Add more as needed
};

// Collect missing props by interface
const missingPropsByInterface = {};

for (const line of errors) {
  const match = line.match(/error TS2339: Property '([^']+)' does not exist on type.*?'(I\w+Props)'/);
  if (match) {
    const [, propName, interfaceName] = match;
    if (!missingPropsByInterface[interfaceName]) {
      missingPropsByInterface[interfaceName] = new Set();
    }
    missingPropsByInterface[interfaceName].add(propName);
  }
}

console.log("📊 Missing Props by Interface:\n");

// Apply fixes to type files
let totalAdded = 0;

for (const [interfaceName, props] of Object.entries(missingPropsByInterface)) {
  const file = interfaceToFile[interfaceName];
  if (!file) {
    console.log(`⚠️  ${interfaceName}: ${Array.from(props).join(", ")} (no file mapping)`);
    continue;
  }

  try {
    let content = readFileSync(file, "utf8");
    const original = content;

    // Find the interface definition
    const interfaceRegex = new RegExp(
      `export interface ${interfaceName}\\s*\\{([^}]+)\\}`,
      "s"
    );
    const match = content.match(interfaceRegex);

    if (match) {
      const [fullMatch, interfaceBody] = match;
      const propsToAdd = Array.from(props);

      console.log(`✅ ${interfaceName}:`);
      console.log(`   Adding: ${propsToAdd.join(", ")}`);

      // Generate prop additions
      const newProps = propsToAdd
        .map((prop) => {
          // Infer type based on prop name
          let type = "unknown";
          if (prop.includes("show") || prop.includes("is") || prop.includes("has") || prop.includes("auto") || prop.includes("dismissible")) {
            type = "boolean";
          } else if (prop.includes("count") || prop.includes("index") || prop.includes("total") || prop.includes("width") || prop.includes("height") || prop.includes("delay") || prop.includes("duration")) {
            type = "number";
          } else if (prop.includes("variant") || prop.includes("size") || prop.includes("type") || prop.includes("platform") || prop.includes("target")) {
            type = "string";
          } else if (prop.includes("Class") || prop.includes("onClick") || prop.includes("handle")) {
            type = "(...args: any[]) => any";
          } else {
            type = "unknown";
          }
          return `  ${prop}?: ${type};`;
        })
        .join("\n");

      // Insert before closing brace
      const newInterface = fullMatch.replace(/\}$/, `${newProps}\n}`);
      content = content.replace(fullMatch, newInterface);

      totalAdded += propsToAdd.length;
    }

    if (content !== original) {
      writeFileSync(file, content, "utf8");
    }
  } catch (err) {
    console.error(`❌ Error processing ${interfaceName}:`, err.message);
  }
}

console.log(`\n✅ Added ${totalAdded} missing props`);
console.log("🔄 Run 'pnpm typecheck' to verify");

