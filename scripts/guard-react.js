#!/usr/bin/env node

/**
 * React/Next.js Guard Script
 * 
 * This script detects React/Next.js artifacts in the codebase and fails if found.
 * Used in CI to prevent React/Next.js code from being introduced to this Vue 3 project.
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class ReactGuard {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Check for React/Next.js dependencies in package.json files
   */
  checkDependencies() {
    const packageFiles = [
      'package.json',
      'client/package.json',
      'server/package.json'
    ];

    const forbiddenDeps = [
      'react',
      'react-dom',
      'next',
      '@testing-library/react',
      'enzyme',
      'react-router',
      'framer-motion',
      'eslint-plugin-react',
      'babel-preset-react',
      '@vitejs/plugin-react',
      'eslint-config-next'
    ];

    for (const packageFile of packageFiles) {
      if (!existsSync(packageFile)) continue;

      try {
        const content = readFileSync(packageFile, 'utf8');
        const pkg = JSON.parse(content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        for (const dep of forbiddenDeps) {
          if (allDeps[dep]) {
            this.errors.push(`❌ Forbidden dependency "${dep}" found in ${packageFile}`);
          }
        }
      } catch (error) {
        this.warnings.push(`⚠️ Could not parse ${packageFile}: ${error}`);
      }
    }
  }

  /**
   * Check for React imports and patterns in source code
   */
  checkSourceCode() {
    const reactPatterns = [
      { pattern: /import.*react/i, message: 'React import detected' },
      { pattern: /from.*react/i, message: 'React import detected' },
      { pattern: /React\./, message: 'React object usage detected' },
      { pattern: /useState|useEffect|useMemo|useCallback/i, message: 'React hooks detected' },
      { pattern: /createContext/i, message: 'React context detected' },
      { pattern: /StrictMode/i, message: 'React StrictMode detected' },
      { pattern: /ReactDOM/i, message: 'ReactDOM usage detected' }
    ];

    try {
      // Search for React patterns in source files
      const result = execSync('find . -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v node_modules | grep -v fixtures | grep -v dist', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });

      const files = result.trim().split('\n').filter(f => f);

      for (const file of files) {
        if (!existsSync(file)) continue;

        try {
          const content = readFileSync(file, 'utf8');
          
          for (const { pattern, message } of reactPatterns) {
            if (pattern.test(content)) {
              this.errors.push(`❌ ${message} in ${file}`);
            }
          }
        } catch (error) {
          this.warnings.push(`⚠️ Could not read ${file}: ${error}`);
        }
      }
    } catch (error) {
      this.warnings.push(`⚠️ Could not search source files: ${error}`);
    }
  }

  /**
   * Check for React-specific file extensions
   */
  checkFileExtensions() {
    try {
      const result = execSync('find . -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | grep -v fixtures', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });

      const files = result.trim().split('\n').filter(f => f);
      
      for (const file of files) {
        this.errors.push(`❌ React file extension detected: ${file}`);
      }
    } catch (error) {
      // No JSX/TSX files found - this is good
    }
  }

  /**
   * Check TypeScript configuration for React JSX mode
   */
  checkTypeScriptConfig() {
    const tsconfigFiles = [
      'tsconfig.json',
      'client/tsconfig.json',
      'server/tsconfig.json'
    ];

    for (const configFile of tsconfigFiles) {
      if (!existsSync(configFile)) continue;

      try {
        const content = readFileSync(configFile, 'utf8');
        const config = JSON.parse(content);

        if (config.compilerOptions?.jsx === 'react-jsx') {
          this.errors.push(`❌ React JSX mode detected in ${configFile}`);
        }
      } catch (error) {
        this.warnings.push(`⚠️ Could not parse ${configFile}: ${error}`);
      }
    }
  }

  /**
   * Check Vite configuration for React plugins
   */
  checkViteConfig() {
    const viteConfigFiles = [
      'vite.config.ts',
      'client/vite.config.ts'
    ];

    for (const configFile of viteConfigFiles) {
      if (!existsSync(configFile)) continue;

      try {
        const content = readFileSync(configFile, 'utf8');

        if (content.includes('@vitejs/plugin-react')) {
          this.errors.push(`❌ React Vite plugin detected in ${configFile}`);
        }
      } catch (error) {
        this.warnings.push(`⚠️ Could not read ${configFile}: ${error}`);
      }
    }
  }

  /**
   * Run all guard checks
   */
  run() {
    console.log(`${YELLOW}🔍 Running React/Next.js guard checks...${RESET}\n`);

    this.checkDependencies();
    this.checkSourceCode();
    this.checkFileExtensions();
    this.checkTypeScriptConfig();
    this.checkViteConfig();

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
      console.log(`${RED}🚫 React/Next.js artifacts detected! This is a Vue 3 project.${RESET}`);
      return { passed: false, errors: this.errors, warnings: this.warnings };
    }

    console.log(`${GREEN}✅ No React/Next.js artifacts detected. Repository is clean.${RESET}`);
    return { passed: true, errors: [], warnings: this.warnings };
  }
}

// Run the guard
const guard = new ReactGuard();
const result = guard.run();

if (!result.passed) {
  process.exit(1);
}

process.exit(0);
