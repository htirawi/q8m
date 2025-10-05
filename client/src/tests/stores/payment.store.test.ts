/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePaymentStore } from "@/stores/payment";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useToast and useErrorHandler
vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/composables/useErrorHandler", () => ({
  useErrorHandler: () => ({
    clearError: vi.fn(),
    handlePaymentError: vi.fn((error) => ({ message: error.message })),
    handleNetworkError: vi.fn((error) => ({ message: error.message })),
  }),
}));

describe("Payment Store", () => {
  let store: ReturnType<typeof usePaymentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePaymentStore();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.subscription).toBe(null);
      expect(store.purchaseHistory).toEqual([]);
      expect(store.userEntitlements).toBe(null);
      expect(store.contentCategories).toEqual([]);
      expect(store.currentCurrency).toBe("USD");
    });
  });

  describe("Payment Creation", () => {
    it("should create payment successfully", async () => {
      const mockResponse = {
        success: true,
        paymentGateway: "paypal",
        checkoutUrl: "https://paypal.com/checkout/123",
        orderId: "order_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const paymentRequest = {
        planType: "INTERMEDIATE" as const,
        currency: "USD",
        billingCycle: "monthly" as const,
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const result = await store.createPayment(paymentRequest);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.$state.token}`,
        },
        body: JSON.stringify(paymentRequest),
      });
    });

    it("should handle payment creation failure", async () => {
      const mockError = new Error("Payment failed");
      mockFetch.mockRejectedValueOnce(mockError);

      const paymentRequest = {
        planType: "INTERMEDIATE" as const,
        currency: "USD",
        billingCycle: "monthly" as const,
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      await expect(store.createPayment(paymentRequest)).rejects.toThrow("Payment failed");
    });
  });

  describe("Subscription Management", () => {
    it("should fetch subscription successfully", async () => {
      const mockSubscription = {
        id: "sub_123",
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: "2024-01-01T00:00:00Z",
        currentPeriodEnd: "2024-02-01T00:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ subscription: mockSubscription }),
      });

      await store.fetchSubscription();

      expect(store.subscription).toEqual(mockSubscription);
      expect(mockFetch).toHaveBeenCalledWith("/api/payments/subscription", {
        headers: {
          Authorization: `Bearer ${store.$state.token}`,
        },
      });
    });

    it("should handle subscription fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await store.fetchSubscription();

      expect(store.subscription).toBe(null);
    });
  });

  describe("Purchase History", () => {
    it("should fetch purchase history successfully", async () => {
      const mockPurchases = [
        {
          id: "purchase_1",
          planType: "INTERMEDIATE",
          amount: 29.99,
          currency: "USD",
          status: "completed",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ purchases: mockPurchases }),
      });

      await store.fetchPurchaseHistory();

      expect(store.purchaseHistory).toEqual(mockPurchases);
      expect(mockFetch).toHaveBeenCalledWith("/api/payments/history", {
        headers: {
          Authorization: `Bearer ${store.$state.token}`,
        },
      });
    });
  });

  describe("User Entitlements", () => {
    it("should fetch user entitlements successfully", async () => {
      const mockEntitlements = {
        level: "INTERMEDIATE",
        permissions: ["quiz_access", "download_content"],
        expiresAt: "2024-12-31T23:59:59Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ entitlements: mockEntitlements }),
      });

      await store.fetchUserEntitlements();

      expect(store.userEntitlements).toEqual(mockEntitlements);
      expect(mockFetch).toHaveBeenCalledWith("/api/entitlements", {
        headers: {
          Authorization: `Bearer ${store.$state.token}`,
        },
      });
    });

    it("should check content access correctly", async () => {
      const mockEntitlements = {
        level: "INTERMEDIATE",
        permissions: ["quiz_access"],
        expiresAt: "2024-12-31T23:59:59Z",
      };

      store.userEntitlements = mockEntitlements;

      expect(store.hasContentAccess("INTERMEDIATE")).toBe(true);
      expect(store.hasContentAccess("SENIOR")).toBe(false);
      expect(store.hasContentAccess("JUNIOR")).toBe(true);
    });
  });

  describe("Currency Management", () => {
    it("should update currency correctly", () => {
      store.setCurrency("EUR");
      expect(store.currentCurrency).toBe("EUR");
    });

    it("should get pricing for different currencies", async () => {
      const mockPricing = {
        USD: { INTERMEDIATE: 29.99, SENIOR: 49.99 },
        EUR: { INTERMEDIATE: 27.99, SENIOR: 46.99 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricing: mockPricing }),
      });

      await store.fetchPricing();

      expect(store.pricing).toEqual(mockPricing);
    });
  });

  describe("Download Management", () => {
    it("should generate download URL successfully", async () => {
      const mockDownloadUrl = {
        url: "https://example.com/download/123?signed=true",
        expiresAt: "2024-01-01T01:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ downloadUrl: mockDownloadUrl }),
      });

      const result = await store.generateDownloadUrl("content_123");

      expect(result).toEqual(mockDownloadUrl);
      expect(mockFetch).toHaveBeenCalledWith("/api/downloads/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.$state.token}`,
        },
        body: JSON.stringify({ contentId: "content_123" }),
      });
    });

    it("should download file successfully", async () => {
      const mockBlob = new Blob(["test content"], { type: "application/pdf" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => "blob:test-url");
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement and click
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      const mockCreateElement = vi.fn(() => mockLink);
      global.document.createElement = mockCreateElement as any;

      await store.downloadFile("content_123");

      expect(mockFetch).toHaveBeenCalledWith("/api/downloads/content_123", {
        headers: {
          Authorization: `Bearer ${store.$state.token}`,
        },
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    });
  });

  describe("Store Initialization", () => {
    it("should initialize store correctly", async () => {
      const mockSubscription = { id: "sub_123", planType: "INTERMEDIATE" };
      const mockEntitlements = { level: "INTERMEDIATE", permissions: [] };
      const mockCategories = [{ id: "cat_1", name: "Vue.js" }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ subscription: mockSubscription }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ entitlements: mockEntitlements }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ categories: mockCategories }),
        });

      await store.initialize();

      expect(store.subscription).toEqual(mockSubscription);
      expect(store.userEntitlements).toEqual(mockEntitlements);
      expect(store.contentCategories).toEqual(mockCategories);
    });
  });
});
