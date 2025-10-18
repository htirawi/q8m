/* eslint-disable @typescript-eslint/no-explicit-any */
import { FxRate } from "@models/FxRate.js";
import { currencyService, CurrencyService } from "@services/currency.js";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock FxRate model
vi.mock("@models/FxRate.js", () => ({
  FxRate: {
    getFreshRate: vi.fn(),
    getLatestRate: vi.fn(),
    createFallbackRate: vi.fn(),
    create: vi.fn(),
    cleanupExpired: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("CurrencyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = CurrencyService.getInstance();
      const instance2 = CurrencyService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("convertFromUSD", () => {
    it("should convert USD to JOD using cached rate", async () => {
      const mockRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 1,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.convertFromUSD(100, "JOD");

      expect(result).toEqual({
        originalAmount: 100,
        originalCurrency: "USD",
        convertedAmount: 71,
        convertedCurrency: "JOD",
        exchangeRate: 0.71,
        rateSource: "cache",
        rateAge: 1,
        timestamp: expect.any(Date),
      });
    });

    it("should convert USD to SAR using cached rate", async () => {
      const mockRate = {
        rate: 3.75,
        source: "cache",
        ageInHours: 2,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.convertFromUSD(100, "SAR");

      expect(result).toEqual({
        originalAmount: 100,
        originalCurrency: "USD",
        convertedAmount: 375,
        convertedCurrency: "SAR",
        exchangeRate: 3.75,
        rateSource: "cache",
        rateAge: 2,
        timestamp: expect.any(Date),
      });
    });

    it("should round converted amount to 2 decimal places", async () => {
      const mockRate = {
        rate: 0.709,
        source: "cache",
        ageInHours: 0,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.convertFromUSD(100, "JOD");

      expect(result.convertedAmount).toBe(70.9);
    });
  });

  describe("convertToUSD", () => {
    it("should convert JOD to USD using cached rate", async () => {
      const mockRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 1,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.convertToUSD(71, "JOD");

      expect(result).toEqual({
        originalAmount: 71,
        originalCurrency: "JOD",
        convertedAmount: 100,
        convertedCurrency: "USD",
        exchangeRate: 0.71,
        rateSource: "cache",
        rateAge: 1,
        timestamp: expect.any(Date),
      });
    });

    it("should convert SAR to USD using cached rate", async () => {
      const mockRate = {
        rate: 3.75,
        source: "cache",
        ageInHours: 2,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.convertToUSD(375, "SAR");

      expect(result).toEqual({
        originalAmount: 375,
        originalCurrency: "SAR",
        convertedAmount: 100,
        convertedCurrency: "USD",
        exchangeRate: 3.75,
        rateSource: "cache",
        rateAge: 2,
        timestamp: expect.any(Date),
      });
    });
  });

  describe("getExchangeRate", () => {
    it("should return fresh rate from cache", async () => {
      const mockRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 5,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.getExchangeRate("USD", "JOD");

      expect(result).toEqual({
        rate: 0.71,
        source: "cache",
        ageInHours: 5,
      });
      expect(FxRate.getFreshRate).toHaveBeenCalledWith("USD", "JOD", 24);
    });

    it("should fetch from API when cache is stale", async () => {
      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);
      (global.fetch as any).mockRejectedValue(new Error("API not configured"));

      const result = await currencyService.getExchangeRate("USD", "JOD");

      // Should fall back to fallback rate when API fails
      expect(result).toEqual({
        rate: 0.709,
        source: "fallback",
        ageInHours: 0,
      });
      expect(FxRate.createFallbackRate).toHaveBeenCalled();
    });

    it("should use fallback rate when API fails", async () => {
      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);
      (global.fetch as any).mockRejectedValue(new Error("API Error"));

      const result = await currencyService.getExchangeRate("USD", "JOD");

      expect(result).toEqual({
        rate: 0.709,
        source: "fallback",
        ageInHours: 0,
      });
      expect(FxRate.createFallbackRate).toHaveBeenCalledWith("JOD", 0.709, "API unavailable");
    });

    it("should use stale cache rate before fetching from API", async () => {
      const staleRate = {
        rate: 0.7,
        source: "cache",
        ageInHours: 30,
        isFresh: () => false,
        isExpired: false,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(staleRate);

      const result = await currencyService.getExchangeRate("USD", "JOD");

      expect(result).toEqual({
        rate: 0.7,
        source: "cache",
        ageInHours: 30,
      });
    });
  });

  describe("getPricingInfo", () => {
    it("should return USD pricing directly without conversion", async () => {
      const result = await currencyService.getPricingInfo(99.99, "USD");

      expect(result).toEqual({
        currency: "USD",
        amount: 99.99,
        formatted: expect.stringContaining("$99.99"),
        isEstimated: false,
      });
    });

    it("should return pricing with conversion for JOD", async () => {
      const mockRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 1,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(mockRate);

      const result = await currencyService.getPricingInfo(100, "JOD");

      expect(result).toEqual({
        currency: "JOD",
        amount: 71,
        formatted: expect.any(String),
        exchangeRate: 0.71,
        isEstimated: false,
      });
    });

    it("should mark pricing as estimated when using fallback rate", async () => {
      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);
      (global.fetch as any).mockRejectedValue(new Error("API Error"));

      const result = await currencyService.getPricingInfo(100, "SAR");

      expect(result.isEstimated).toBe(true);
    });

    it("should mark pricing as estimated when rate is old", async () => {
      const oldRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 30,
        isFresh: () => false,
        isExpired: false,
      };

      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(oldRate);

      const result = await currencyService.getPricingInfo(100, "JOD");

      expect(result.isEstimated).toBe(true);
    });
  });

  describe("getMultiCurrencyPricing", () => {
    it("should return pricing for all currencies", async () => {
      const mockJodRate = {
        rate: 0.71,
        source: "cache",
        ageInHours: 1,
        isFresh: () => true,
      };

      const mockSarRate = {
        rate: 3.75,
        source: "cache",
        ageInHours: 1,
        isFresh: () => true,
      };

      (FxRate.getFreshRate as any)
        .mockResolvedValueOnce(mockJodRate)
        .mockResolvedValueOnce(mockSarRate);

      const result = await currencyService.getMultiCurrencyPricing(100);

      expect(result).toHaveProperty("USD");
      expect(result).toHaveProperty("JOD");
      expect(result).toHaveProperty("SAR");
      expect(result.USD!.amount).toBe(100);
      expect(result.JOD!.amount).toBe(71);
      expect(result.SAR!.amount).toBe(375);
    });

    it("should handle custom currency list", async () => {
      const result = await currencyService.getMultiCurrencyPricing(100, ["USD"]);

      expect(result).toHaveProperty("USD");
      expect(result).not.toHaveProperty("JOD");
      expect(result).not.toHaveProperty("SAR");
    });
  });

  describe("updateFallbackRates", () => {
    it("should update JOD fallback rate", async () => {
      await currencyService.updateFallbackRates({ JOD: 0.72 });

      expect(FxRate.createFallbackRate).toHaveBeenCalledWith("JOD", 0.72, "Manual update");
    });

    it("should update SAR fallback rate", async () => {
      await currencyService.updateFallbackRates({ SAR: 3.76 });

      expect(FxRate.createFallbackRate).toHaveBeenCalledWith("SAR", 3.76, "Manual update");
    });

    it("should update both rates at once", async () => {
      await currencyService.updateFallbackRates({ JOD: 0.72, SAR: 3.76 });

      expect(FxRate.createFallbackRate).toHaveBeenCalledTimes(2);
    });

    it("should skip undefined rates", async () => {
      await currencyService.updateFallbackRates({});

      expect(FxRate.createFallbackRate).not.toHaveBeenCalled();
    });
  });

  describe("getCurrencyHealth", () => {
    it("should return healthy status when all rates are fresh", async () => {
      const mockJodRate = {
        rate: 0.71,
        source: "api",
        ageInHours: 5,
        isFresh: (hours: number) => hours >= 5,
      };

      const mockSarRate = {
        rate: 3.75,
        source: "api",
        ageInHours: 3,
        isFresh: (hours: number) => hours >= 3,
      };

      (FxRate.getLatestRate as any)
        .mockResolvedValueOnce(mockJodRate)
        .mockResolvedValueOnce(mockSarRate);

      const result = await currencyService.getCurrencyHealth();

      expect(result.overallHealth).toBe("healthy");
      expect(result.rates).toHaveLength(2);
      expect(result.rates[0]!.isHealthy).toBe(true);
      expect(result.rates[1]!.isHealthy).toBe(true);
    });

    it("should return degraded status when some rates are old", async () => {
      const freshRate = {
        rate: 0.71,
        source: "api",
        ageInHours: 5,
        isFresh: (hours: number) => hours >= 5,
      };

      const staleRate = {
        rate: 3.75,
        source: "fallback",
        ageInHours: 100,
        isFresh: (_hours: number) => false,
      };

      (FxRate.getLatestRate as any)
        .mockResolvedValueOnce(freshRate)
        .mockResolvedValueOnce(staleRate);

      const result = await currencyService.getCurrencyHealth();

      expect(result.overallHealth).toBe("degraded");
    });

    it("should return critical status when all rates are unhealthy", async () => {
      (FxRate.getLatestRate as any).mockResolvedValue(null);

      const result = await currencyService.getCurrencyHealth();

      expect(result.overallHealth).toBe("critical");
      expect(result.rates[0]!.isHealthy).toBe(false);
      expect(result.rates[1]!.isHealthy).toBe(false);
    });
  });

  describe("cleanupOldRates", () => {
    it("should return number of deleted records", async () => {
      (FxRate.cleanupExpired as any).mockResolvedValue({ deletedCount: 10 });

      const result = await currencyService.cleanupOldRates();

      expect(result).toBe(10);
      expect(FxRate.cleanupExpired).toHaveBeenCalled();
    });

    it("should return 0 when no records deleted", async () => {
      (FxRate.cleanupExpired as any).mockResolvedValue({ deletedCount: 0 });

      const result = await currencyService.cleanupOldRates();

      expect(result).toBe(0);
    });

    it("should handle missing deletedCount property", async () => {
      (FxRate.cleanupExpired as any).mockResolvedValue({});

      const result = await currencyService.cleanupOldRates();

      expect(result).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("should format USD correctly", async () => {
      const result = await currencyService.getPricingInfo(99.99, "USD");

      expect(result.formatted).toMatch(/\$99\.99/);
    });

    it("should format amounts with 2 decimal places", async () => {
      const result = await currencyService.getPricingInfo(100, "USD");

      expect(result.formatted).toMatch(/\$100\.00/);
    });
  });

  describe("fetchRateFromAPI", () => {
    it("should throw error when API key is not configured", async () => {
      const originalApiKey = process.env.EXCHANGE_RATE_API_KEY;
      delete process.env.EXCHANGE_RATE_API_KEY;

      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);

      await expect(currencyService.getExchangeRate("USD", "JOD")).resolves.toBeTruthy(); // Should use fallback

      process.env.EXCHANGE_RATE_API_KEY = originalApiKey;
    });

    it("should throw error when API responds with error status", async () => {
      process.env.EXCHANGE_RATE_API_KEY = "test-key";
      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await currencyService.getExchangeRate("USD", "JOD");

      // Should fall back to fallback rate
      expect(result.source).toBe("fallback");
    });

    it("should throw error when rate data is invalid", async () => {
      process.env.EXCHANGE_RATE_API_KEY = "test-key";
      (FxRate.getFreshRate as any).mockResolvedValue(null);
      (FxRate.getLatestRate as any).mockResolvedValue(null);
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          rates: {},
        }),
      });

      const result = await currencyService.getExchangeRate("USD", "JOD");

      // Should fall back to fallback rate
      expect(result.source).toBe("fallback");
    });
  });
});
