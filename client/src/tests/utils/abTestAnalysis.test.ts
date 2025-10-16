import { describe, it, expect } from "vitest";
import {
  calculateConversionRate,
  calculateSignificance,
  formatABTestReport,
  calculateSampleSize,
  analyzeExportedData,
  type IABTestResults,
  type IStatisticalSignificance,
} from "@/utils/abTestAnalysis";

describe("A/B Test Analysis", () => {
  describe("calculateConversionRate", () => {
    it("should calculate conversion rate correctly", () => {
      expect(calculateConversionRate(50, 100)).toBe(50);
      expect(calculateConversionRate(25, 100)).toBe(25);
      expect(calculateConversionRate(75, 100)).toBe(75);
      expect(calculateConversionRate(1, 100)).toBe(1);
      expect(calculateConversionRate(99, 100)).toBe(99);
    });

    it("should return 0 when total assigned is 0", () => {
      expect(calculateConversionRate(0, 0)).toBe(0);
      expect(calculateConversionRate(10, 0)).toBe(0);
    });

    it("should handle fractional results", () => {
      expect(calculateConversionRate(1, 3)).toBeCloseTo(33.333, 2);
      expect(calculateConversionRate(2, 3)).toBeCloseTo(66.667, 2);
      expect(calculateConversionRate(1, 7)).toBeCloseTo(14.286, 2);
    });

    it("should handle edge cases", () => {
      expect(calculateConversionRate(0, 100)).toBe(0);
      expect(calculateConversionRate(100, 100)).toBe(100);
    });
  });

  describe("calculateSignificance", () => {
    const createTestResults = (
      variant: "autostart" | "manual",
      totalAssigned: number,
      conversions: number,
      avgDurationMs?: number
    ): IABTestResults => ({
      variant,
      totalAssigned,
      conversions,
      conversionRate: calculateConversionRate(conversions, totalAssigned),
      avgDurationMs,
    });

    it("should calculate significance for equal results", () => {
      const autostart = createTestResults("autostart", 1000, 100);
      const manual = createTestResults("manual", 1000, 100);

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(false);
      expect(result.winner).toBe("inconclusive");
      expect(result.uplift).toBeCloseTo(0, 2);
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    it("should detect significant difference with large samples", () => {
      const autostart = createTestResults("autostart", 10000, 1200); // 12%
      const manual = createTestResults("manual", 10000, 1000); // 10%

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("autostart");
      expect(result.uplift).toBeCloseTo(20, 1); // 20% uplift
      expect(result.pValue).toBeLessThan(0.05);
    });

    it("should detect significant difference favoring manual", () => {
      const autostart = createTestResults("autostart", 10000, 1000); // 10%
      const manual = createTestResults("manual", 10000, 1200); // 12%

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("manual");
      expect(result.uplift).toBeCloseTo(-16.67, 1); // Negative uplift
      expect(result.pValue).toBeLessThan(0.05);
    });

    it("should handle small samples (not significant)", () => {
      const autostart = createTestResults("autostart", 100, 15); // 15%
      const manual = createTestResults("manual", 100, 10); // 10%

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(false);
      expect(result.winner).toBe("inconclusive");
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    it("should handle zero conversions", () => {
      const autostart = createTestResults("autostart", 1000, 0);
      const manual = createTestResults("manual", 1000, 50);

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("manual");
      expect(result.uplift).toBe(-100); // -100% (no conversions vs some)
    });

    it("should handle perfect conversion", () => {
      const autostart = createTestResults("autostart", 100, 100);
      const manual = createTestResults("manual", 100, 90);

      const result = calculateSignificance(autostart, manual);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("autostart");
      expect(result.uplift).toBeCloseTo(11.11, 1); // 11.11% uplift
    });

    it("should calculate z-score correctly", () => {
      const autostart = createTestResults("autostart", 10000, 1000); // 10%
      const manual = createTestResults("manual", 10000, 1100); // 11%

      const result = calculateSignificance(autostart, manual);

      expect(typeof result.zScore).toBe("number");
      expect(result.zScore).not.toBeNaN();
      expect(Number.isFinite(result.zScore)).toBe(true);
    });

    it("should calculate confidence level correctly", () => {
      const autostart = createTestResults("autostart", 1000, 100);
      const manual = createTestResults("manual", 1000, 110);

      const result = calculateSignificance(autostart, manual);

      expect(result.confidenceLevel).toBe((1 - result.pValue) * 100);
      expect(result.confidenceLevel).toBeGreaterThan(0);
      expect(result.confidenceLevel).toBeLessThan(100);
    });
  });

  describe("formatABTestReport", () => {
    const createTestResults = (
      variant: "autostart" | "manual",
      totalAssigned: number,
      conversions: number,
      avgDurationMs?: number
    ): IABTestResults => ({
      variant,
      totalAssigned,
      conversions,
      conversionRate: calculateConversionRate(conversions, totalAssigned),
      avgDurationMs,
    });

    it("should format report correctly for significant results", () => {
      const autostart = createTestResults("autostart", 1000, 120, 5000);
      const manual = createTestResults("manual", 1000, 100, 6000);
      const significance: IStatisticalSignificance = {
        pValue: 0.03,
        confidenceLevel: 97,
        isSignificant: true,
        zScore: 2.1,
        winner: "autostart",
        uplift: 20,
      };

      const report = formatABTestReport(autostart, manual, significance);

      expect(report).toContain("=== Study Flow A/B Test Results ===");
      expect(report).toContain("Variant: Autostart (immediate navigation)");
      expect(report).toContain("Variant: Manual (requires button click)");
      expect(report).toContain("Total Assigned: 1000");
      expect(report).toContain("Conversions: 120");
      expect(report).toContain("Conversion Rate: 12.00%");
      expect(report).toContain("Avg Duration: 5000ms");
      expect(report).toContain("P-Value: 0.0300");
      expect(report).toContain("Confidence Level: 97.00%");
      expect(report).toContain("Z-Score: 2.1000");
      expect(report).toContain("Is Significant: YES");
      expect(report).toContain("Winner: AUTOSTART");
      expect(report).toContain("Uplift: +20.00%");
      expect(report).toContain("statistically significant");
    });

    it("should format report correctly for non-significant results", () => {
      const autostart = createTestResults("autostart", 1000, 105);
      const manual = createTestResults("manual", 1000, 100);
      const significance: IStatisticalSignificance = {
        pValue: 0.15,
        confidenceLevel: 85,
        isSignificant: false,
        zScore: 0.5,
        winner: "inconclusive",
        uplift: 5,
      };

      const report = formatABTestReport(autostart, manual, significance);

      expect(report).toContain("Is Significant: NO");
      expect(report).toContain("Winner: INCONCLUSIVE");
      expect(report).toContain("Uplift: +5.00%");
      expect(report).toContain("No statistically significant difference");
    });

    it("should handle missing average duration", () => {
      const autostart = createTestResults("autostart", 1000, 120);
      const manual = createTestResults("manual", 1000, 100);
      const significance: IStatisticalSignificance = {
        pValue: 0.03,
        confidenceLevel: 97,
        isSignificant: true,
        zScore: 2.1,
        winner: "autostart",
        uplift: 20,
      };

      const report = formatABTestReport(autostart, manual, significance);

      expect(report).toContain("Avg Duration: N/A");
    });

    it("should handle negative uplift", () => {
      const autostart = createTestResults("autostart", 1000, 100);
      const manual = createTestResults("manual", 1000, 120);
      const significance: IStatisticalSignificance = {
        pValue: 0.03,
        confidenceLevel: 97,
        isSignificant: true,
        zScore: -2.1,
        winner: "manual",
        uplift: -16.67,
      };

      const report = formatABTestReport(autostart, manual, significance);

      expect(report).toContain("Winner: MANUAL");
      expect(report).toContain("Uplift: -16.67%");
    });
  });

  describe("calculateSampleSize", () => {
    it("should calculate sample size for typical conversion rates", () => {
      const sampleSize = calculateSampleSize(0.1, 0.05); // 10% baseline, 5% MDE

      expect(sampleSize).toBeGreaterThan(0);
      expect(sampleSize).toBeLessThan(100000); // Reasonable upper bound
      expect(Number.isInteger(sampleSize)).toBe(true);
    });

    it("should require larger samples for smaller effect sizes", () => {
      const largeMDE = calculateSampleSize(0.1, 0.1); // 10% MDE
      const smallMDE = calculateSampleSize(0.1, 0.02); // 2% MDE

      expect(smallMDE).toBeGreaterThan(largeMDE);
    });

    it("should require larger samples for lower baseline rates", () => {
      const highBaseline = calculateSampleSize(0.2, 0.05); // 20% baseline
      const lowBaseline = calculateSampleSize(0.05, 0.05); // 5% baseline

      expect(lowBaseline).toBeGreaterThan(highBaseline);
    });

    it("should handle edge cases", () => {
      expect(calculateSampleSize(0.01, 0.01)).toBeGreaterThan(0);
      expect(calculateSampleSize(0.5, 0.01)).toBeGreaterThan(0);
      expect(calculateSampleSize(0.1, 0.001)).toBeGreaterThan(0);
    });

    it("should return reasonable values for common scenarios", () => {
      const scenarios = [
        { baseline: 0.05, mde: 0.02 }, // 5% baseline, 2% MDE
        { baseline: 0.1, mde: 0.05 }, // 10% baseline, 5% MDE
        { baseline: 0.2, mde: 0.1 }, // 20% baseline, 10% MDE
      ];

      scenarios.forEach(({ baseline, mde }) => {
        const sampleSize = calculateSampleSize(baseline, mde);
        expect(sampleSize).toBeGreaterThan(100); // Minimum reasonable sample
        expect(sampleSize).toBeLessThan(500000); // Maximum reasonable sample
      });
    });
  });

  describe("analyzeExportedData", () => {
    const createEvent = (eventName: string, variant: string, durationMs?: number) => ({
      eventName,
      properties: { variant, durationMs },
      timestamp: Date.now(),
    });

    it("should analyze complete dataset correctly", () => {
      const events = [
        // Assignments
        ...Array.from({ length: 10000 }, () => createEvent("study_ab_test_assigned", "autostart")),
        ...Array.from({ length: 10000 }, () => createEvent("study_ab_test_assigned", "manual")),

        // Conversions - larger difference for significance
        ...Array.from({ length: 1500 }, () =>
          createEvent("study_flow_conversion", "autostart", 5000)
        ),
        ...Array.from({ length: 1200 }, () => createEvent("study_flow_conversion", "manual", 6000)),
      ];

      const result = analyzeExportedData(events);

      expect(result.autostart.totalAssigned).toBe(10000);
      expect(result.autostart.conversions).toBe(1500);
      expect(result.autostart.conversionRate).toBe(15);
      expect(result.autostart.avgDurationMs).toBe(5000);

      expect(result.manual.totalAssigned).toBe(10000);
      expect(result.manual.conversions).toBe(1200);
      expect(result.manual.conversionRate).toBe(12);
      expect(result.manual.avgDurationMs).toBe(6000);

      expect(result.significance.isSignificant).toBe(true);
      expect(result.significance.winner).toBe("autostart");
    });

    it("should handle empty dataset", () => {
      const events: any[] = [];
      const result = analyzeExportedData(events);

      expect(result.autostart.totalAssigned).toBe(0);
      expect(result.autostart.conversions).toBe(0);
      expect(result.autostart.conversionRate).toBe(0);
      expect(result.autostart.avgDurationMs).toBeUndefined();

      expect(result.manual.totalAssigned).toBe(0);
      expect(result.manual.conversions).toBe(0);
      expect(result.manual.conversionRate).toBe(0);
      expect(result.manual.avgDurationMs).toBeUndefined();
    });

    it("should handle missing duration data", () => {
      const events = [
        createEvent("study_ab_test_assigned", "autostart"),
        createEvent("study_ab_test_assigned", "manual"),
        createEvent("study_flow_conversion", "autostart"), // No duration
        createEvent("study_flow_conversion", "manual"), // No duration
      ];

      const result = analyzeExportedData(events);

      expect(result.autostart.avgDurationMs).toBeUndefined();
      expect(result.manual.avgDurationMs).toBeUndefined();
    });

    it("should handle partial duration data", () => {
      const events = [
        createEvent("study_ab_test_assigned", "autostart"),
        createEvent("study_ab_test_assigned", "manual"),
        createEvent("study_flow_conversion", "autostart", 5000),
        createEvent("study_flow_conversion", "autostart"), // No duration
        createEvent("study_flow_conversion", "manual", 6000),
      ];

      const result = analyzeExportedData(events);

      expect(result.autostart.avgDurationMs).toBe(5000); // Only one has duration
      expect(result.manual.avgDurationMs).toBe(6000);
    });

    it("should handle mixed event types", () => {
      const events = [
        createEvent("study_ab_test_assigned", "autostart"),
        createEvent("study_ab_test_assigned", "manual"),
        createEvent("study_flow_conversion", "autostart", 5000),
        createEvent("study_flow_conversion", "manual", 6000),
        createEvent("other_event", "autostart"), // Should be ignored
        createEvent("study_flow_conversion", "autostart", 4000),
      ];

      const result = analyzeExportedData(events);

      expect(result.autostart.conversions).toBe(2); // Only conversion events
      expect(result.manual.conversions).toBe(1);
      expect(result.autostart.avgDurationMs).toBe(4500); // (5000 + 4000) / 2
    });

    it("should filter events correctly", () => {
      const events = [
        createEvent("study_ab_test_assigned", "autostart"),
        createEvent("study_ab_test_assigned", "manual"),
        createEvent("study_flow_conversion", "autostart"),
        createEvent("study_flow_conversion", "manual"),
        createEvent("wrong_event", "autostart"),
        createEvent("study_ab_test_assigned", "wrong_variant"),
        createEvent("study_flow_conversion", "wrong_variant"),
      ];

      const result = analyzeExportedData(events);

      expect(result.autostart.totalAssigned).toBe(1);
      expect(result.manual.totalAssigned).toBe(1);
      expect(result.autostart.conversions).toBe(1);
      expect(result.manual.conversions).toBe(1);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle extreme conversion rates", () => {
      const autostart = {
        variant: "autostart" as const,
        totalAssigned: 1000000,
        conversions: 999999,
        conversionRate: 99.9999,
      };
      const manual = {
        variant: "manual" as const,
        totalAssigned: 1000000,
        conversions: 1000000,
        conversionRate: 100,
      };

      const result = calculateSignificance(autostart, manual);

      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
      expect(Number.isFinite(result.zScore)).toBe(true);
      expect(result.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(result.confidenceLevel).toBeLessThanOrEqual(100);
    });

    it("should handle very large sample sizes", () => {
      const autostart = {
        variant: "autostart" as const,
        totalAssigned: 10000000,
        conversions: 1000000,
        conversionRate: 10,
      };
      const manual = {
        variant: "manual" as const,
        totalAssigned: 10000000,
        conversions: 1001000,
        conversionRate: 10.01,
      };

      const result = calculateSignificance(autostart, manual);

      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
      expect(Number.isFinite(result.zScore)).toBe(true);
    });
  });
});
