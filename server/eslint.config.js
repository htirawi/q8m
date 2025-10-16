import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "**/*.d.ts",
      "src/migrations/**",
      "src/scripts/**",
      "src/tests/**",
      "tests/**",
      "src/models/User.ts",
      "src/models/Session.ts",
      "src/models/FxRate.ts",
      "src/models/VerificationToken.ts",
    ],
  },
  // TypeScript files only
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,
      ...typescript.configs.recommended.rules,

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: false },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "import/no-relative-parent-imports": "error",
      "import/order": ["error", { "newlines-between": "always", alphabetize: { order: "asc" } }],
      "no-case-declarations": "warn",

      // Best practices
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: { object: true, array: false },
          AssignmentExpression: { object: true, array: false },
        },
        { enforceForRenamedProperties: false },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-dupe-keys": "error",
    },
  },
  // JavaScript files only
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,

      // Best practices
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: { object: true, array: false },
          AssignmentExpression: { object: true, array: false },
        },
        { enforceForRenamedProperties: false },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-dupe-keys": "error",
    },
  },
];
