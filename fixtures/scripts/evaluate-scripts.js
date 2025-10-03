#!/usr/bin/env node

/**
 * Internal Scripts Evaluator
 *
 * This script helps evaluate and test internal scripts for safety and usability.
 * It should only be used in development environments.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(message, color = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${"=".repeat(60)}`, "cyan");
  log(message, "cyan");
  log("=".repeat(60), "cyan");
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

// Script evaluation criteria
const evaluationCriteria = {
  safety: {
    "No hardcoded secrets": "Script should not contain API keys, passwords, or tokens",
    "Input validation": "Script should validate all inputs",
    "Error handling": "Script should handle errors gracefully",
    "File operations": "Script should use safe file operations",
    "External calls": "Script should minimize external API calls",
  },
  usability: {
    "Clear documentation": "Script should have clear usage instructions",
    "Help option": "Script should provide help/usage information",
    "Progress feedback": "Script should provide progress indicators",
    "Exit codes": "Script should use proper exit codes",
    Logging: "Script should provide appropriate logging",
  },
  maintainability: {
    "Code structure": "Script should have clear, readable code structure",
    Dependencies: "Script should have minimal, well-documented dependencies",
    Configuration: "Script should be configurable without code changes",
    Testing: "Script should be testable",
    Documentation: "Script should be well-documented",
  },
};

// Internal scripts directory
const internalScriptsDir = path.join(__dirname);

// Get all JavaScript files in internal directory
function getInternalScripts() {
  try {
    const files = fs.readdirSync(internalScriptsDir);
    return files.filter((file) => file.endsWith(".js") || file.endsWith(".cjs"));
  } catch (error) {
    logError(`Error reading internal scripts directory: ${error.message}`);
    return [];
  }
}

// Analyze a script file
function analyzeScript(scriptPath) {
  const scriptName = path.basename(scriptPath);
  const analysis = {
    name: scriptName,
    path: scriptPath,
    exists: false,
    size: 0,
    lines: 0,
    hasShebang: false,
    hasHelp: false,
    hasErrorHandling: false,
    hasInputValidation: false,
    hasLogging: false,
    dependencies: [],
    risks: [],
    recommendations: [],
  };

  try {
    if (!fs.existsSync(scriptPath)) {
      analysis.exists = false;
      return analysis;
    }

    analysis.exists = true;
    const content = fs.readFileSync(scriptPath, "utf8");
    analysis.size = content.length;
    analysis.lines = content.split("\n").length;

    // Check for shebang
    analysis.hasShebang = content.startsWith("#!");

    // Check for help option
    analysis.hasHelp =
      content.includes("--help") || content.includes("help") || content.includes("usage");

    // Check for error handling
    analysis.hasErrorHandling =
      (content.includes("try") && content.includes("catch")) ||
      content.includes("throw") ||
      content.includes("error");

    // Check for input validation
    analysis.hasInputValidation =
      content.includes("validate") ||
      content.includes("check") ||
      content.includes("if (!") ||
      content.includes("assert");

    // Check for logging
    analysis.hasLogging =
      content.includes("console.log") ||
      content.includes("console.error") ||
      content.includes("console.warn");

    // Extract dependencies (require statements)
    const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g);
    if (requireMatches) {
      analysis.dependencies = requireMatches.map((match) =>
        match.replace(/require\(['"]([^'"]+)['"]\)/, "$1")
      );
    }

    // Risk assessment
    if (content.includes("fs.writeFile") || content.includes("fs.unlink")) {
      analysis.risks.push("File modification operations detected");
    }
    if (content.includes("process.exit")) {
      analysis.risks.push("Process exit operations detected");
    }
    if (content.includes("eval") || content.includes("Function(")) {
      analysis.risks.push("Code execution operations detected");
    }
    if (content.includes("http") || content.includes("https")) {
      analysis.risks.push("Network operations detected");
    }

    // Generate recommendations
    if (!analysis.hasHelp) {
      analysis.recommendations.push("Add --help option for usage information");
    }
    if (!analysis.hasErrorHandling) {
      analysis.recommendations.push("Add proper error handling");
    }
    if (!analysis.hasInputValidation) {
      analysis.recommendations.push("Add input validation");
    }
    if (!analysis.hasLogging) {
      analysis.recommendations.push("Add logging for debugging");
    }
    if (analysis.dependencies.length > 5) {
      analysis.recommendations.push("Consider reducing dependencies");
    }
  } catch (error) {
    logError(`Error analyzing ${scriptName}: ${error.message}`);
  }

  return analysis;
}

// Generate evaluation report
function generateReport(analyses) {
  logHeader("INTERNAL SCRIPTS EVALUATION REPORT");

  log(`\nEvaluated ${analyses.length} scripts:\n`, "white");

  analyses.forEach((analysis) => {
    log(`📄 ${analysis.name}`, "cyan");
    log(`   Path: ${analysis.path}`, "white");

    if (!analysis.exists) {
      logError(`   Script not found`);
      return;
    }

    logInfo(`   Size: ${analysis.size} bytes, ${analysis.lines} lines`);

    // Safety indicators
    if (analysis.hasShebang) logSuccess(`   Has shebang`);
    if (analysis.hasHelp) logSuccess(`   Has help option`);
    if (analysis.hasErrorHandling) logSuccess(`   Has error handling`);
    if (analysis.hasInputValidation) logSuccess(`   Has input validation`);
    if (analysis.hasLogging) logSuccess(`   Has logging`);

    // Dependencies
    if (analysis.dependencies.length > 0) {
      logInfo(`   Dependencies: ${analysis.dependencies.join(", ")}`);
    }

    // Risks
    if (analysis.risks.length > 0) {
      analysis.risks.forEach((risk) => logWarning(`   Risk: ${risk}`));
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      analysis.recommendations.forEach((rec) => logInfo(`   Recommendation: ${rec}`));
    }

    log(""); // Empty line for readability
  });

  // Summary
  logHeader("SUMMARY");

  const totalScripts = analyses.length;
  const existingScripts = analyses.filter((a) => a.exists).length;
  const safeScripts = analyses.filter((a) => a.exists && a.risks.length === 0).length;
  const scriptsWithHelp = analyses.filter((a) => a.exists && a.hasHelp).length;
  const scriptsWithErrorHandling = analyses.filter((a) => a.exists && a.hasErrorHandling).length;

  logInfo(`Total scripts: ${totalScripts}`);
  logInfo(`Existing scripts: ${existingScripts}`);
  logSuccess(`Safe scripts: ${safeScripts}`);
  logInfo(`Scripts with help: ${scriptsWithHelp}`);
  logInfo(`Scripts with error handling: ${scriptsWithErrorHandling}`);

  // Overall assessment
  logHeader("OVERALL ASSESSMENT");

  if (safeScripts === existingScripts) {
    logSuccess("All scripts are safe for internal use");
  } else if (safeScripts > existingScripts / 2) {
    logWarning("Most scripts are safe, but some require review");
  } else {
    logError("Many scripts require review before use");
  }

  logHeader("RECOMMENDATIONS");

  logInfo("1. Always backup data before running data-modifying scripts");
  logInfo("2. Test scripts in isolated environment first");
  logInfo("3. Review script code before execution");
  logInfo("4. Add help options to scripts without them");
  logInfo("5. Implement proper error handling");
  logInfo("6. Add logging for debugging");

  logHeader("NEXT STEPS");

  logInfo("1. Review the detailed evaluation report: scripts/internal/EVALUATION-REPORT.md");
  logInfo("2. Test high-risk scripts in safe environment");
  logInfo("3. Implement recommended improvements");
  logInfo("4. Update script documentation");
  logInfo("5. Create test cases for each script");
}

// Main execution
function main() {
  logHeader("INTERNAL SCRIPTS EVALUATOR");

  logInfo("This tool evaluates internal scripts for safety and usability.");
  logInfo("It should only be used in development environments.\n");

  const scripts = getInternalScripts();

  if (scripts.length === 0) {
    logError("No internal scripts found in scripts/internal/ directory");
    process.exit(1);
  }

  logInfo(`Found ${scripts.length} internal scripts to evaluate:\n`);
  scripts.forEach((script) => log(`  - ${script}`, "white"));

  const analyses = scripts.map((script) => analyzeScript(path.join(internalScriptsDir, script)));

  generateReport(analyses);

  logHeader("EVALUATION COMPLETE");
  logSuccess("Script evaluation completed successfully!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeScript, generateReport, evaluationCriteria };
