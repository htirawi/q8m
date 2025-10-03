#!/usr/bin/env node

/**
 * Inline Types Guard Script
 * 
 * This script detects inline type/interface declarations in Vue files and TypeScript files
 * and fails if found. Used in CI to prevent inline types from being introduced.
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class InlineTypesGuard {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Check for inline type/interface declarations in Vue files
   */
  checkVueFiles() {
    try {
      // Find Vue files and check for inline type declarations
      const result = execSync(
        'find client/src -name "*.vue" | grep -v node_modules | grep -v dist | grep -v fixtures',
        { encoding: 'utf8', cwd: process.cwd() }
      );

      const files = result.trim().split('\n').filter(f => f);

      for (const file of files) {
        if (!existsSync(file)) continue;

        try {
          const content = readFileSync(file, 'utf8');
          
          // Check for interface declarations
          const interfaceMatches = content.match(/\binterface\s+[A-Za-z_][A-Za-z0-9_]*\s*{/g);
          if (interfaceMatches) {
            for (const match of interfaceMatches) {
              this.errors.push(`❌ Inline interface declaration found in Vue file: ${file} - ${match.trim()}`);
            }
          }

          // Check for type declarations
          const typeMatches = content.match(/\btype\s+[A-Za-z_][A-Za-z0-9_]*\s*=/g);
          if (typeMatches) {
            for (const match of typeMatches) {
              this.errors.push(`❌ Inline type declaration found in Vue file: ${file} - ${match.trim()}`);
            }
          }

          // Check for enum declarations
          const enumMatches = content.match(/\benum\s+[A-Za-z_][A-Za-z0-9_]*\s*{/g);
          if (enumMatches) {
            for (const match of enumMatches) {
              this.errors.push(`❌ Inline enum declaration found in Vue file: ${file} - ${match.trim()}`);
            }
          }
        } catch (error) {
          this.warnings.push(`⚠️ Could not read ${file}: ${error}`);
        }
      }
    } catch (error) {
      this.warnings.push(`⚠️ Could not search Vue files: ${error}`);
    }
  }

  /**
   * Check for inline type/interface declarations in TypeScript files (excluding types directory)
   */
  checkTypeScriptFiles() {
    try {
      // Find TypeScript files excluding types directory
      const result = execSync(
        'find client/src -name "*.ts" | grep -v node_modules | grep -v dist | grep -v fixtures | grep -v "/types/"',
        { encoding: 'utf8', cwd: process.cwd() }
      );

      const files = result.trim().split('\n').filter(f => f);

      for (const file of files) {
        if (!existsSync(file)) continue;

        try {
          const content = readFileSync(file, 'utf8');
          
          // Skip if it's a type definition file
          if (file.endsWith('.d.ts')) continue;
          
          // Skip if it's in types directory
          if (file.includes('/types/')) continue;

          // Check for interface declarations (excluding exports)
          const interfaceMatches = content.match(/(?:^|\n)\s*interface\s+[A-Za-z_][A-Za-z0-9_]*\s*{/gm);
          if (interfaceMatches) {
            for (const match of interfaceMatches) {
              // Allow if it's exported
              if (!match.includes('export')) {
                this.errors.push(`❌ Inline interface declaration found in TS file: ${file} - ${match.trim()}`);
              }
            }
          }

          // Check for type declarations (excluding exports)
          const typeMatches = content.match(/(?:^|\n)\s*type\s+[A-Za-z_][A-Za-z0-9_]*\s*=/gm);
          if (typeMatches) {
            for (const match of typeMatches) {
              // Allow if it's exported
              if (!match.includes('export')) {
                this.errors.push(`❌ Inline type declaration found in TS file: ${file} - ${match.trim()}`);
              }
            }
          }

          // Check for enum declarations (excluding exports)
          const enumMatches = content.match(/(?:^|\n)\s*enum\s+[A-Za-z_][A-Za-z0-9_]*\s*{/gm);
          if (enumMatches) {
            for (const match of enumMatches) {
              // Allow if it's exported
              if (!match.includes('export')) {
                this.errors.push(`❌ Inline enum declaration found in TS file: ${file} - ${match.trim()}`);
              }
            }
          }
        } catch (error) {
          this.warnings.push(`⚠️ Could not read ${file}: ${error}`);
        }
      }
    } catch (error) {
      this.warnings.push(`⚠️ Could not search TypeScript files: ${error}`);
    }
  }

  /**
   * Check for inline type/interface declarations in component folders
   */
  checkComponentFolders() {
    const componentFolders = [
      'client/src/components',
      'client/src/views',
      'client/src/composables',
      'client/src/stores'
    ];

    for (const folder of componentFolders) {
      if (!existsSync(folder)) continue;

      try {
        // Find files in component folders
        const result = execSync(
          `find ${folder} -name "*.ts" -o -name "*.vue" | grep -v node_modules | grep -v dist | grep -v fixtures`,
          { encoding: 'utf8', cwd: process.cwd() }
        );

        const files = result.trim().split('\n').filter(f => f);

        for (const file of files) {
          if (!existsSync(file)) continue;

          try {
            const content = readFileSync(file, 'utf8');
            
            // Skip if it's a type definition file
            if (file.endsWith('.d.ts')) continue;
            
            // Skip if it's in types directory
            if (file.includes('/types/')) continue;

            // Check for interface declarations
            const interfaceMatches = content.match(/\binterface\s+[A-Za-z_][A-Za-z0-9_]*\s*{/g);
            if (interfaceMatches) {
              for (const match of interfaceMatches) {
                this.errors.push(`❌ Inline interface declaration found in component file: ${file} - ${match.trim()}`);
              }
            }

            // Check for type declarations
            const typeMatches = content.match(/\btype\s+[A-Za-z_][A-Za-z0-9_]*\s*=/g);
            if (typeMatches) {
              for (const match of typeMatches) {
                this.errors.push(`❌ Inline type declaration found in component file: ${file} - ${match.trim()}`);
              }
            }

            // Check for enum declarations
            const enumMatches = content.match(/\benum\s+[A-Za-z_][A-Za-z0-9_]*\s*{/g);
            if (enumMatches) {
              for (const match of enumMatches) {
                this.errors.push(`❌ Inline enum declaration found in component file: ${file} - ${match.trim()}`);
              }
            }
          } catch (error) {
            this.warnings.push(`⚠️ Could not read ${file}: ${error}`);
          }
        }
      } catch (error) {
        this.warnings.push(`⚠️ Could not search ${folder}: ${error}`);
      }
    }
  }

  /**
   * Run all guard checks
   */
  run() {
    console.log(`${YELLOW}🔍 Running inline types guard checks...${RESET}\n`);

    this.checkVueFiles();
    this.checkTypeScriptFiles();
    this.checkComponentFolders();

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
      console.log(`${RED}🚫 Inline type/interface declarations detected!${RESET}`);
      console.log(`${RED}   Extract types to src/types/ directory for better organization.${RESET}`);
      return { passed: false, errors: this.errors, warnings: this.warnings };
    }

    console.log(`${GREEN}✅ No inline type/interface declarations detected. Types are properly organized.${RESET}`);
    return { passed: true, errors: [], warnings: this.warnings };
  }
}

// Run the guard
const guard = new InlineTypesGuard();
const result = guard.run();

if (!result.passed) {
  process.exit(1);
}

process.exit(0);
