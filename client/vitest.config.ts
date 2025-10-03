import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "*.config.{js,ts}",
        "dist/",
        "tests/",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts,vue}"],
    exclude: ["node_modules/", "dist/", "coverage/"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@features": resolve(__dirname, "./src/features"),
      "@stores": resolve(__dirname, "./src/stores"),
      "@composables": resolve(__dirname, "./src/composables"),
      "@router": resolve(__dirname, "./src/router"),
      "@locales": resolve(__dirname, "./src/locales"),
      "@styles": resolve(__dirname, "./src/styles"),
      "@types": resolve(__dirname, "./src/types"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@shared": resolve(__dirname, "../shared"),
    },
  },
});
