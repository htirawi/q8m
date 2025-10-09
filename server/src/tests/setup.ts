/**
 * Test Setup Configuration
 *
 * This file sets up the test environment for payment system testing
 */


import { connectDatabase, disconnectDatabase } from "@config/database.js";
import { FxRate } from "@models/FxRate.js";
import { Purchase } from "@models/Purchase.js";
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { entitlementService } from "@services/entitlement.service.js";
import { mockPaymentService } from "@services/mock-payment.service.js";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/quiz-platform-test";
  process.env.MONGODB_DB_NAME = "quiz-platform-test";
  process.env.JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-security";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key-that-is-long-enough-for-security";
  process.env.MOCK_PAYMENTS = "true";
  process.env.SIGNED_URL_SECRET = "test-signed-url-secret-key-that-is-long-enough-for-security";
  process.env.CSRF_SECRET = "test-csrf-secret-key-that-is-long-enough-for-security";
  process.env.RATE_LIMIT_USER_MAX = "20";
  process.env.RATE_LIMIT_USER_WINDOW = "15m";
  process.env.LOGIN_FAIL_BASE_BLOCK_MS = "60000";
  process.env.LOGIN_FAIL_MAX_BLOCK_MS = "3600000";
  process.env.RATE_LIMIT_TRUST_PROXY = "false";
  process.env.HMAC_RATE_KEY_SECRET = "test-hmac-rate-key-secret";
  process.env.API_BASE_URL = "http://localhost:3001";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.SERVER_URL = "http://localhost:3001";
  process.env.LOG_LEVEL = "error";
  process.env.MAX_FILE_SIZE = "10485760";
  process.env.npm_package_version = "2.0.0";

  // Skip database connection for tests that don't need it
  // Only connect if MONGODB_URI is available and not a test URI
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("test")) {
    try {
      await connectDatabase();
    } catch (error) {
      console.warn("Database connection skipped for tests:", error);
    }
  }

  // Enable mock payment service
  mockPaymentService.setEnabled(true);
});

// Global test cleanup
afterAll(async () => {
  // Clear all caches
  mockPaymentService.clearMockPayments();
  entitlementService.clearAllCache();

  // Disconnect from database
  await disconnectDatabase();
});

// Test-specific setup
beforeEach(async () => {
  // Only clear test data if database is connected
  try {
    await User.deleteMany({});
    await Purchase.deleteMany({});
    await Subscription.deleteMany({});
    await FxRate.deleteMany({});
  } catch (error) {
    // Database not available, skip cleanup
    console.warn("Database cleanup skipped:", error);
  }

  // Clear mock payments
  mockPaymentService.clearMockPayments();
  entitlementService.clearAllCache();
});

// Test-specific cleanup
afterEach(async () => {
  // Only clear test data if database is connected
  try {
    await User.deleteMany({});
    await Purchase.deleteMany({});
    await Subscription.deleteMany({});
    await FxRate.deleteMany({});
  } catch (error) {
    // Database not available, skip cleanup
    console.warn("Database cleanup skipped:", error);
  }

  // Clear mock payments
  mockPaymentService.clearMockPayments();
  entitlementService.clearAllCache();
});

// Helper functions for tests
export const createTestUser = async (overrides: Record<string, unknown> = {}) => {
  const defaultUser = {
    email: "test@example.com",
    password: "TestPassword123!",
    name: "Test User",
    isEmailVerified: true,
    isActive: true,
    entitlements: ["JUNIOR"],
    ...overrides,
  };

  return await User.create(defaultUser);
};

export const createTestPurchase = async (overrides: Record<string, unknown> = {}) => {
  const defaultPurchase = {
    userId: (overrides.userId as string) || (await createTestUser())._id,
    planType: "INTERMEDIATE",
    gateway: "mock",
    amount: 1999,
    currency: "USD",
    billingCycle: "monthly",
    gatewayPaymentId: `test-payment-${Date.now()}`,
    status: "completed",
    metadata: {
      testMode: true,
    },
    ...overrides,
  };

  return await Purchase.create(defaultPurchase);
};

export const createTestSubscription = async (overrides: Record<string, unknown> = {}) => {
  const defaultSubscription = {
    userId: (overrides.userId as string) || (await createTestUser())._id,
    purchaseId: (overrides.purchaseId as string) || (await createTestPurchase())._id,
    planType: "INTERMEDIATE",
    status: "active",
    billingCycle: "monthly",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    metadata: {
      testMode: true,
    },
    ...overrides,
  };

  return await Subscription.create(defaultSubscription);
};

export const createTestFxRate = async (overrides: Record<string, unknown> = {}) => {
  const defaultFxRate = {
    baseCurrency: "USD",
    targetCurrency: "JOD",
    rate: 0.71,
    source: "test",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ...overrides,
  };

  return await FxRate.create(defaultFxRate);
};

export const waitForMockPaymentCompletion = async (paymentId: string, timeout: number = 5000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = await mockPaymentService.getPaymentStatus(paymentId);
    if (status?.status === "completed") {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
};

export const simulatePaymentCompletion = async (paymentId: string) => {
  mockPaymentService.simulatePaymentCompletion(paymentId);
  await waitForMockPaymentCompletion(paymentId);
};

export const simulatePaymentFailure = async (paymentId: string) => {
  mockPaymentService.simulatePaymentFailure(paymentId);
};
