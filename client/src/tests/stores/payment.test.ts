import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePaymentStore } from "@/stores/payment";
import type { PaymentRequest } from "@/stores/payment";

// Mock fetch responses
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Payment Store Integration Tests", () => {
  let store: ReturnType<typeof usePaymentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePaymentStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createPayment", () => {
    it("should successfully create a PayPal payment", async () => {
      const mockResponse = {
        success: true,
        paymentGateway: "paypal",
        checkoutUrl: "https://paypal.com/checkout/123",
        paymentId: "pay_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const paymentRequest: PaymentRequest = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const result = await store.createPayment(paymentRequest);

      expect(mockFetch).toHaveBeenCalledWith("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: JSON.stringify(paymentRequest),
      });

      expect(result).toEqual(mockResponse);
      expect(store.isLoading).toBe(false);
    });

    it("should handle payment creation errors", async () => {
      const mockError = {
        error: "Payment failed",
        code: "PAYMENT_DECLINED",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const paymentRequest: PaymentRequest = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      await expect(store.createPayment(paymentRequest)).rejects.toThrow();
      expect(store.error).toBeTruthy();
      expect(store.isLoading).toBe(false);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const paymentRequest: PaymentRequest = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      await expect(store.createPayment(paymentRequest)).rejects.toThrow();
      expect(store.error).toBeTruthy();
      expect(store.isLoading).toBe(false);
    });
  });

  describe("fetchUserEntitlements", () => {
    it("should successfully fetch user entitlements", async () => {
      const mockEntitlements = {
        success: true,
        entitlements: {
          userId: "user_123",
          entitlements: ["JUNIOR", "INTERMEDIATE"],
          expiresAt: "2024-12-31T23:59:59Z",
          isActive: true,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntitlements),
      });

      const result = await store.fetchUserEntitlements();

      expect(mockFetch).toHaveBeenCalledWith("/api/entitlements/me/entitlements", {
        headers: {
          Authorization: "Bearer mock-token",
        },
      });

      expect(result).toEqual(mockEntitlements.entitlements);
      expect(store.userEntitlements).toEqual(mockEntitlements.entitlements);
      expect(store.isLoading).toBe(false);
    });

    it("should handle entitlement fetch errors", async () => {
      const mockError = {
        error: "Unauthorized",
        code: "AUTH_REQUIRED",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(store.fetchUserEntitlements()).rejects.toThrow();
      expect(store.error).toBeTruthy();
      expect(store.isLoading).toBe(false);
    });
  });

  describe("fetchPurchaseHistory", () => {
    it("should successfully fetch purchase history", async () => {
      const mockPurchases = {
        success: true,
        purchases: [
          {
            id: "purchase_1",
            orderId: "order_1",
            paymentId: "pay_1",
            paymentGateway: "paypal",
            amount: { currency: "USD", value: 29.99 },
            planType: "INTERMEDIATE",
            status: "completed",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        total: 1,
        limit: 10,
        skip: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      });

      const result = await store.fetchPurchaseHistory(10, 0);

      expect(mockFetch).toHaveBeenCalledWith("/api/payments/history?limit=10&skip=0", {
        headers: {
          Authorization: "Bearer mock-token",
        },
      });

      expect(result).toEqual(mockPurchases.purchases);
      expect(store.purchases).toEqual(mockPurchases.purchases);
      expect(store.isLoading).toBe(false);
    });
  });

  describe("checkEntitlement", () => {
    it("should successfully check user entitlement", async () => {
      const mockCheck = {
        success: true,
        hasEntitlement: true,
        level: "INTERMEDIATE",
        expiresAt: "2024-12-31T23:59:59Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCheck),
      });

      const result = await store.checkEntitlement("INTERMEDIATE");

      expect(mockFetch).toHaveBeenCalledWith("/api/entitlements/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: JSON.stringify({ level: "INTERMEDIATE" }),
      });

      expect(result).toEqual(mockCheck);
      expect(store.isLoading).toBe(false);
    });
  });

  describe("generateDownloadUrl", () => {
    it("should successfully generate download URL", async () => {
      const mockDownloadUrl = {
        success: true,
        downloadUrl: "https://api.example.com/download/file.pdf?signature=abc123",
        expiresAt: "2024-01-01T01:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDownloadUrl),
      });

      const result = await store.generateDownloadUrl("file.pdf", "INTERMEDIATE");

      expect(mockFetch).toHaveBeenCalledWith("/api/downloads/generate-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: JSON.stringify({
          filePath: "file.pdf",
          requiredLevel: "INTERMEDIATE",
        }),
      });

      expect(result).toEqual(mockDownloadUrl);
      expect(store.isLoading).toBe(false);
    });
  });

  describe("setCurrency", () => {
    it("should update currency and fetch rates", async () => {
      const mockRates = {
        success: true,
        rates: {
          USD: 1,
          JOD: 0.71,
          SAR: 3.75,
        },
        timestamp: "2024-01-01T00:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRates),
      });

      await store.setCurrency("JOD");

      expect(store.currentCurrency).toBe("JOD");
      expect(mockFetch).toHaveBeenCalledWith("/api/currency/rates");
      expect(store.currencyRates).toEqual(mockRates.rates);
    });
  });

  describe("formatPrice", () => {
    it("should format USD price correctly", () => {
      const formatted = store.formatPrice(29.99, "USD");
      expect(formatted).toBe("29.99 USD");
    });

    it("should format JOD price correctly", () => {
      store.currencyRates = {
        USD: 1,
        JOD: 0.71,
        SAR: 3.75,
      };

      const formatted = store.formatPrice(21.29, "JOD");
      expect(formatted).toBe("21.29 JOD");
    });
  });

  describe("hasContentAccess", () => {
    beforeEach(() => {
      store.userEntitlements = {
        userId: "user_123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        expiresAt: "2024-12-31T23:59:59Z",
        isActive: true,
      };
    });

    it("should return true for JUNIOR content", () => {
      const hasAccess = store.hasContentAccess("JUNIOR");
      expect(hasAccess).toBe(true);
    });

    it("should return true for INTERMEDIATE content", () => {
      const hasAccess = store.hasContentAccess("INTERMEDIATE");
      expect(hasAccess).toBe(true);
    });

    it("should return false for SENIOR content", () => {
      const hasAccess = store.hasContentAccess("SENIOR");
      expect(hasAccess).toBe(false);
    });

    it("should return false when user has no entitlements", () => {
      store.userEntitlements = null;
      const hasAccess = store.hasContentAccess("JUNIOR");
      expect(hasAccess).toBe(false);
    });
  });
});
