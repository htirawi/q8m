/**
 * Pricing Service Tests
 * Tests for pricing calculations, currency conversions, and plan pricing logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { pricingService } from "../../services/pricing";
import { currencyService } from "../../services/currency";

// Mock currency service
vi.mock("../../services/currency", () => ({
  currencyService: {
    getPricingInfo: vi.fn(),
    convertAmount: vi.fn(),
  },
}));

describe("PricingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPricingForCurrency", () => {
    it("should return pricing for USD", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "USD",
        amount: 29.99,
        formatted: "$29.99",
        isEstimated: false,
      });

      const pricing = await pricingService.getPricingForCurrency("USD");

      expect(pricing).toBeDefined();
      expect(Array.isArray(pricing)).toBe(true);
      expect(pricing.length).toBeGreaterThan(0);
    });

    it("should return pricing for JOD", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "JOD",
        amount: 21.25,
        formatted: "21.25 د.أ",
        isEstimated: false,
      });

      const pricing = await pricingService.getPricingForCurrency("JOD");

      expect(pricing).toBeDefined();
      expect(Array.isArray(pricing)).toBe(true);
    });

    it("should return pricing for SAR", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "SAR",
        amount: 112.47,
        formatted: "112.47 ريال",
        isEstimated: false,
      });

      const pricing = await pricingService.getPricingForCurrency("SAR");

      expect(pricing).toBeDefined();
      expect(Array.isArray(pricing)).toBe(true);
    });

    it("should include free tier without conversion", async () => {
      const pricing = await pricingService.getPricingForCurrency("USD");
      
      const freeTier = pricing.find((p) => p.planId === "JUNIOR");
      expect(freeTier).toBeDefined();
      expect(freeTier?.usdPrice).toBe(0);
    });
  });

  describe("getPlanPricing", () => {
    it("should return JUNIOR plan pricing", async () => {
      const pricing = await pricingService.getPlanPricing("JUNIOR", "USD");

      expect(pricing.planId).toBe("JUNIOR");
      expect(pricing.usdPrice).toBe(0);
    });

    it("should return INTERMEDIATE plan pricing", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "USD",
        amount: 29.99,
        formatted: "$29.99",
        isEstimated: false,
      });

      const pricing = await pricingService.getPlanPricing("INTERMEDIATE", "USD");

      expect(pricing.planId).toBe("INTERMEDIATE");
    });

    it("should return SENIOR plan pricing", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "USD",
        amount: 49.99,
        formatted: "$49.99",
        isEstimated: false,
      });

      const pricing = await pricingService.getPlanPricing("SENIOR", "USD");

      expect(pricing.planId).toBe("SENIOR");
    });

    it("should return BUNDLE plan pricing", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "USD",
        amount: 79.99,
        formatted: "$79.99",
        isEstimated: false,
      });

      const pricing = await pricingService.getPlanPricing("BUNDLE", "USD");

      expect(pricing.planId).toBe("BUNDLE");
    });
  });

  describe("getPricingTiers", () => {
    it("should return all pricing tiers for USD", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "USD",
        amount: 29.99,
        formatted: "$29.99",
        isEstimated: false,
      });

      const tiers = await pricingService.getPricingTiers("USD");

      expect(tiers).toBeDefined();
      expect(Array.isArray(tiers)).toBe(true);
      expect(tiers.length).toBeGreaterThan(0);
    });

    it("should return tiers for JOD", async () => {
      (currencyService.getPricingInfo as any).mockResolvedValue({
        currency: "JOD",
        amount: 21.25,
        formatted: "21.25 د.أ",
        isEstimated: false,
      });

      const tiers = await pricingService.getPricingTiers("JOD");

      expect(Array.isArray(tiers)).toBe(true);
    });
  });

  describe("calculateYearlyDiscount", () => {
    it("should calculate yearly savings percentage", () => {
      const discount = pricingService.calculateYearlyDiscount(29.99, 299.99);

      // Returns percentage: (359.88 - 299.99) / 359.88 * 100 ≈ 17%
      expect(discount).toBeGreaterThan(0);
      expect(discount).toBeCloseTo(17, 0);
    });

    it("should return 0 for no discount", () => {
      const discount = pricingService.calculateYearlyDiscount(10, 120);
      expect(discount).toBe(0);
    });
  });

  describe("getRecommendedPlan", () => {
    it("should recommend JUNIOR for individual", () => {
      const recommendation = pricingService.getRecommendedPlan("individual");
      expect(recommendation).toBeDefined();
    });

    it("should recommend plan for team", () => {
      const recommendation = pricingService.getRecommendedPlan("team");
      expect(recommendation).toBeDefined();
    });

    it("should recommend plan for enterprise", () => {
      const recommendation = pricingService.getRecommendedPlan("enterprise");
      expect(recommendation).toBeDefined();
    });
  });

  describe("comparePlans", () => {
    it("should compare two plans", () => {
      const comparison = pricingService.comparePlans("JUNIOR", "INTERMEDIATE");

      expect(comparison).toBeDefined();
      expect(comparison.plan1Features).toBeDefined();
      expect(comparison.plan2Features).toBeDefined();
    });

    it("should identify common and unique features", () => {
      const comparison = pricingService.comparePlans("INTERMEDIATE", "SENIOR");

      expect(comparison.commonFeatures).toBeDefined();
      expect(comparison.plan1Only).toBeDefined();
      expect(comparison.plan2Only).toBeDefined();
      expect(Array.isArray(comparison.commonFeatures)).toBe(true);
    });
  });

  describe("validatePricing", () => {
    it("should validate pricing configuration", () => {
      const validation = pricingService.validatePricing();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("getPricingStats", () => {
    it("should return pricing statistics", () => {
      const stats = pricingService.getPricingStats();

      expect(stats.totalPlans).toBeGreaterThan(0);
      expect(stats.paidPlans).toBeGreaterThan(0);
    });
  });
});

