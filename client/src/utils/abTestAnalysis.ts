/**
 * A/B Test Analysis Utilities
 * Provides statistical analysis for study flow variants
 *
 * Usage:
 * 1. Export analytics data from your telemetry system (e.g., Mixpanel, Amplitude)
 * 2. Filter for `study_flow_conversion` and `study_ab_test_assigned` events
 * 3. Use these utilities to calculate conversion rates and statistical significance
 */

export interface IABTestResults {
  variant: "autostart" | "manual";
  totalAssigned: number; // Users assigned to this variant
  conversions: number; // Users who completed study_flow_conversion
  conversionRate: number; // Percentage (0-100)
  avgDurationMs?: number; // Average time to conversion (if available)
}

export interface IStatisticalSignificance {
  pValue: number; // Statistical significance (< 0.05 is typically significant)
  confidenceLevel: number; // Percentage (e.g., 95)
  isSignificant: boolean; // True if p-value < 0.05
  zScore: number; // Z-score for two-proportion test
  winner: "autostart" | "manual" | "inconclusive";
  uplift: number; // Percentage difference (positive = autostart wins, negative = manual wins)
}

/**
 * Calculate conversion rate for a variant
 */
export function calculateConversionRate(conversions: number, totalAssigned: number): number {
  if (totalAssigned === 0) return 0;
  return (conversions / totalAssigned) * 100;
}

/**
 * Perform two-proportion z-test to determine statistical significance
 * H0: No difference between variants
 * H1: Difference exists between variants
 *
 * @param autostart - Results for autostart variant
 * @param manual - Results for manual variant
 * @returns Statistical significance analysis
 */
export function calculateSignificance(
  autostart: IABTestResults,
  manual: IABTestResults
): IStatisticalSignificance {
  const n1 = autostart.totalAssigned;
  const n2 = manual.totalAssigned;
  const p1 = autostart.conversions / n1;
  const p2 = manual.conversions / n2;

  // Pooled proportion
  const pPool = (autostart.conversions + manual.conversions) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

  // Z-score
  const zScore = (p1 - p2) / se;

  // P-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Determine winner
  let winner: "autostart" | "manual" | "inconclusive" = "inconclusive";
  if (pValue < 0.05) {
    winner = p1 > p2 ? "autostart" : "manual";
  }

  // Calculate uplift
  const uplift = ((p1 - p2) / p2) * 100;

  return {
    pValue,
    confidenceLevel: (1 - pValue) * 100,
    isSignificant: pValue < 0.05,
    zScore,
    winner,
    uplift,
  };
}

/**
 * Normal cumulative distribution function (CDF)
 * Approximation using error function
 */
function normalCDF(z: number): number {
  // Approximation of the cumulative distribution function for standard normal distribution
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - prob : prob;
}

/**
 * Format A/B test results as a human-readable report
 */
export function formatABTestReport(
  autostart: IABTestResults,
  manual: IABTestResults,
  significance: IStatisticalSignificance
): string {
  return `
=== Study Flow A/B Test Results ===

Variant: Autostart (immediate navigation)
- Total Assigned: ${autostart.totalAssigned}
- Conversions: ${autostart.conversions}
- Conversion Rate: ${autostart.conversionRate.toFixed(2)}%
- Avg Duration: ${autostart.avgDurationMs ? `${autostart.avgDurationMs}ms` : "N/A"}

Variant: Manual (requires button click)
- Total Assigned: ${manual.totalAssigned}
- Conversions: ${manual.conversions}
- Conversion Rate: ${manual.conversionRate.toFixed(2)}%
- Avg Duration: ${manual.avgDurationMs ? `${manual.avgDurationMs}ms` : "N/A"}

Statistical Analysis:
- P-Value: ${significance.pValue.toFixed(4)}
- Confidence Level: ${significance.confidenceLevel.toFixed(2)}%
- Z-Score: ${significance.zScore.toFixed(4)}
- Is Significant: ${significance.isSignificant ? "YES" : "NO"}
- Winner: ${significance.winner.toUpperCase()}
- Uplift: ${significance.uplift >= 0 ? "+" : ""}${significance.uplift.toFixed(2)}%

Interpretation:
${
  significance.isSignificant
    ? `The ${significance.winner} variant shows a statistically significant ${Math.abs(significance.uplift).toFixed(2)}% ${significance.uplift > 0 ? "increase" : "decrease"} in conversion rate.`
    : "No statistically significant difference between variants. Continue testing or gather more data."
}
`.trim();
}

/**
 * Calculate required sample size for desired statistical power
 *
 * @param baselineConversionRate - Current conversion rate (0-1)
 * @param minimumDetectableEffect - Minimum effect size to detect (e.g., 0.05 = 5%)
 * @param alpha - Significance level (default 0.05 = 95% confidence)
 * @param power - Statistical power (default 0.8 = 80%)
 * @returns Required sample size per variant
 */
export function calculateSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number,
  _alpha: number = 0.05,
  _power: number = 0.8
): number {
  // Z-scores for alpha and power
  const zAlpha = 1.96; // For alpha = 0.05 (two-tailed)
  const zBeta = 0.84; // For power = 0.8

  const p1 = baselineConversionRate;
  const p2 = p1 * (1 + minimumDetectableEffect);

  const pooledP = (p1 + p2) / 2;

  const numerator =
    Math.pow(zAlpha * Math.sqrt(2 * pooledP * (1 - pooledP)), 2) +
    Math.pow(zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);

  const denominator = Math.pow(p1 - p2, 2);

  return Math.ceil(numerator / denominator);
}

/**
 * Example usage for analyzing exported analytics data
 */
export function analyzeExportedData(
  events: Array<{
    eventName: string;
    properties: Record<string, unknown>;
    timestamp: number;
  }>
): {
  autostart: IABTestResults;
  manual: IABTestResults;
  significance: IStatisticalSignificance;
} {
  // Count assignments
  const assignments = events.filter((e) => e.eventName === "study_ab_test_assigned");
  const autostartAssignments = assignments.filter(
    (e) => e.properties.variant === "autostart"
  ).length;
  const manualAssignments = assignments.filter((e) => e.properties.variant === "manual").length;

  // Count conversions
  const conversions = events.filter((e) => e.eventName === "study_flow_conversion");
  const autostartConversions = conversions.filter((e) => e.properties.variant === "autostart");
  const manualConversions = conversions.filter((e) => e.properties.variant === "manual");

  // Calculate average duration
  const autostartDurations = autostartConversions
    .map((e) => e.properties.durationMs as number)
    .filter((d) => d !== undefined);
  const avgAutostartDuration =
    autostartDurations.length > 0
      ? autostartDurations.reduce((a, b) => a + b, 0) / autostartDurations.length
      : undefined;

  const manualDurations = manualConversions
    .map((e) => e.properties.durationMs as number)
    .filter((d) => d !== undefined);
  const avgManualDuration =
    manualDurations.length > 0
      ? manualDurations.reduce((a, b) => a + b, 0) / manualDurations.length
      : undefined;

  // Build results
  const autostart: IABTestResults = {
    variant: "autostart",
    totalAssigned: autostartAssignments,
    conversions: autostartConversions.length,
    conversionRate: calculateConversionRate(autostartConversions.length, autostartAssignments),
    avgDurationMs: avgAutostartDuration,
  };

  const manual: IABTestResults = {
    variant: "manual",
    totalAssigned: manualAssignments,
    conversions: manualConversions.length,
    conversionRate: calculateConversionRate(manualConversions.length, manualAssignments),
    avgDurationMs: avgManualDuration,
  };

  const significance = calculateSignificance(autostart, manual);

  return { autostart, manual, significance };
}
