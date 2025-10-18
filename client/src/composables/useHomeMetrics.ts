import { computed } from "vue";
import type { ComputedRef } from "vue";

/**
 * Homepage Metrics Composable
 *
 * Provides computed KPIs and metrics for the homepage.
 * In a real application, these would come from a store or API.
 */

export interface IHomeMetrics {
  totalQuestions: ComputedRef<number>;
  totalFrameworks: ComputedRef<number>;
  successRate: ComputedRef<number>;
  activeUsers: ComputedRef<number>;
  totalLearners: ComputedRef<number>;
  avgSalaryIncrease: ComputedRef<string>;
}

export function useHomeMetrics(): IHomeMetrics {
  // In a real app, fetch from store/API
  const totalQuestions = computed(() => 500);

  const totalFrameworks = computed(() => 10);

  const successRate = computed(() => 95);

  const activeUsers = computed(() => 2547); // Example live counter

  const totalLearners = computed(() => 15000);

  const avgSalaryIncrease = computed(() => "$25K+");

  return {
    totalQuestions,
    totalFrameworks,
    successRate,
    activeUsers,
    totalLearners,
    avgSalaryIncrease,
  };
}
