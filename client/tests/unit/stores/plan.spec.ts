import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";

describe("Plan Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("defaults to free plan", () => {
    const planStore = usePlanStore();
    expect(planStore.planTier).toBe("free");
    expect(planStore.isFree).toBe(true);
    expect(planStore.isPaid).toBe(false);
  });

  it("computes plan display name correctly", () => {
    const planStore = usePlanStore();
    expect(planStore.planDisplayName).toBe("Free");
  });

  it("identifies intermediate plan correctly", () => {
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
    expect(planStore.isIntermediate).toBe(true);
    expect(planStore.isPaid).toBe(true);
    expect(planStore.isFree).toBe(false);
  });

  it("identifies advanced plan correctly", () => {
    const planStore = usePlanStore();
    planStore.currentPlan = {
      id: "test-2",
      tier: "advanced",
      name: "advanced",
      displayName: "Advanced",
      description: "Test",
      features: [],
      isActive: true,
    };

    expect(planStore.planTier).toBe("advanced");
    expect(planStore.isAdvanced).toBe(true);
    expect(planStore.isPaid).toBe(true);
  });

  it("identifies pro plan correctly", () => {
    const planStore = usePlanStore();
    planStore.currentPlan = {
      id: "test-3",
      tier: "pro",
      name: "pro",
      displayName: "Pro",
      description: "Test",
      features: [],
      isActive: true,
    };

    expect(planStore.planTier).toBe("pro");
    expect(planStore.isPro).toBe(true);
    expect(planStore.isPaid).toBe(true);
  });

  it("resets plan data", () => {
    const planStore = usePlanStore();
    planStore.currentPlan = {
      id: "test-4",
      tier: "pro",
      name: "pro",
      displayName: "Pro",
      description: "Test",
      features: [],
      isActive: true,
    };

    planStore.reset();

    expect(planStore.currentPlan).toBeNull();
    expect(planStore.isLoading).toBe(false);
    expect(planStore.error).toBeNull();
  });

  it("falls back to user plan tier from auth store", () => {
    const planStore = usePlanStore();
    const authStore = useAuthStore();

    authStore.setUser({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      permissions: [],
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      planTier: "advanced",
    });

    expect(planStore.planTier).toBe("advanced");
  });
});
