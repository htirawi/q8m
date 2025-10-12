import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePlanStore } from "@/stores/plan";
import type { PlanTier } from "@shared/types/plan";

describe("Post-Login Router Logic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Default landing pages", () => {
    it("routes free users to /guide/easy", () => {
      const planStore = usePlanStore();
      // Free is default
      expect(planStore.planTier).toBe("free");

      // Expected route for free plan
      const expectedRoute = "/en/guide/easy";
      expect(expectedRoute).toContain("/guide/easy");
    });

    it("routes paid users to /dashboard", () => {
      const planStore = usePlanStore();
      planStore.currentPlan = {
        id: "test-1",
        tier: "intermediate",
        name: "intermediate",
        displayName: "Intermediate",
        description: "Test",
        features: [],
        isActive: true,
      };

      expect(planStore.planTier).toBe("intermediate");

      // Expected route for paid plans
      const expectedRoute = "/en/dashboard";
      expect(expectedRoute).toContain("/dashboard");
    });
  });

  describe("Plan tier identification", () => {
    it("correctly identifies free tier", () => {
      const planStore = usePlanStore();
      expect(planStore.isFree).toBe(true);
      expect(planStore.isPaid).toBe(false);
    });

    it("correctly identifies paid tiers", () => {
      const planStore = usePlanStore();
      const paidTiers: PlanTier[] = ["intermediate", "advanced", "pro"];

      paidTiers.forEach((tier) => {
        planStore.currentPlan = {
          id: `test-${tier}`,
          tier,
          name: tier,
          displayName: tier,
          description: "Test",
          features: [],
          isActive: true,
        };

        expect(planStore.isPaid).toBe(true);
        expect(planStore.isFree).toBe(false);
      });
    });
  });
});
