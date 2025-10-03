import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "src/routes/downloads.ts", // TODO: Fix parsing error
    ],
  },
  {
    files: ["**/*.{js,ts}"],
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
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,
      ...typescript.configs.recommended.rules,

      // TypeScript specific rules - relaxed for legacy code
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-require-imports": "warn",
      "no-case-declarations": "warn",

      // Best practices - relaxed for legacy code
      "prefer-const": "warn",
      "no-var": "warn",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "no-console": "off",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-dupe-keys": "warn",
    },
  },
];
