import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://localhost:27017/quiz-platform-test",
      MONGODB_DB_NAME: "quiz-platform-test",
      JWT_SECRET: "test-jwt-secret-key-that-is-long-enough-for-security",
      JWT_REFRESH_SECRET: "test-jwt-refresh-secret-key-that-is-long-enough-for-security",
      MOCK_PAYMENTS: "true",
      SIGNED_URL_SECRET: "test-signed-url-secret-key-that-is-long-enough-for-security",
      CSRF_SECRET: "test-csrf-secret-key-that-is-long-enough-for-security",
      RATE_LIMIT_USER_MAX: "20",
      RATE_LIMIT_USER_WINDOW: "15m",
      LOGIN_FAIL_BASE_BLOCK_MS: "60000",
      LOGIN_FAIL_MAX_BLOCK_MS: "3600000",
      RATE_LIMIT_TRUST_PROXY: "false",
      HMAC_RATE_KEY_SECRET: "test-hmac-rate-key-secret",
      API_BASE_URL: "http://localhost:3001",
      CLIENT_URL: "http://localhost:5173",
      SERVER_URL: "http://localhost:3001",
      LOG_LEVEL: "error",
      MAX_FILE_SIZE: "10485760",
      npm_package_version: "2.0.0",
    },
  },
  resolve: {
    alias: {
      "@server": resolve(__dirname, "./src"),
      "@routes": resolve(__dirname, "./src/routes"),
      "@services": resolve(__dirname, "./src/services"),
      "@schemas": resolve(__dirname, "./src/schemas"),
      "@middlewares": resolve(__dirname, "./src/middlewares"),
      "@models": resolve(__dirname, "./src/models"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@config": resolve(__dirname, "./src/config"),
      "@shared": resolve(__dirname, "../shared"),
    },
  },
  esbuild: {
    target: "node18",
  },
});
