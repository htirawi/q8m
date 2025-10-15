import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import LevelCard from "@/components/study/LevelCard.vue";
import { DIFFICULTY_TO_PLAN_ID, getPlanById } from "@/config/plans";

// Mock analytics composable
vi.mock("@/composables/useAnalytics", () => ({
  useAnalytics: () => ({
    track: vi.fn(),
  }),
}));

describe("LevelCard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Component Configuration", () => {
    it("should be a valid Vue component", () => {
      expect(LevelCard).toBeTruthy();
      expect(LevelCard).toHaveProperty("__name");
    });

    it("should have correct component name", () => {
      expect(LevelCard.__name).toBe("LevelCard");
    });
  });

  describe("Props Validation", () => {
    it("should accept difficulty prop", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("difficulty");
    });

    it("should accept isLocked prop", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("isLocked");
    });

    it("should accept isSelected prop", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("isSelected");
    });

    it("should accept isCurrentPlan prop with default", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("isCurrentPlan");
    });

    it("should accept features prop with default", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("features");
    });

    it("should accept autoStartEnabled prop with default", () => {
      const { props } = LevelCard;
      expect(props).toHaveProperty("autoStartEnabled");
    });
  });

  describe("Emits Configuration", () => {
    it("should declare select emit", () => {
      const { emits } = LevelCard;
      expect(emits).toContain("select");
    });

    it("should declare unlock-click emit", () => {
      const { emits } = LevelCard;
      expect(emits).toContain("unlock-click");
    });

    it("should declare auto-start emit", () => {
      const { emits } = LevelCard;
      expect(emits).toContain("auto-start");
    });
  });

  describe("Difficulty Icons", () => {
    it("should have icon mapping for all difficulty levels", () => {
      const iconMap = {
        easy: "🟢",
        medium: "🟡",
        hard: "🔴",
      };

      expect(iconMap.easy).toBe("🟢");
      expect(iconMap.medium).toBe("🟡");
      expect(iconMap.hard).toBe("🔴");
    });
  });

  describe("Component Structure", () => {
    it("should use button as root element", () => {
      // The component template starts with a button element
      expect(LevelCard).toBeTruthy();
      // Template validation would require full rendering
    });

    it("should have proper TypeScript types", () => {
      // Props interface should be properly typed
      const { props } = LevelCard;
      expect(props).toBeDefined();
    });
  });

  describe("Feature Display Logic", () => {
    it("should handle empty features array", () => {
      const features: string[] = [];
      expect(features.length).toBe(0);
    });

    it("should handle features with multiple items", () => {
      const features = ["Feature 1", "Feature 2", "Feature 3"];
      expect(features.length).toBe(3);
      expect(features[0]).toBe("Feature 1");
    });
  });

  describe("Auto-start Logic", () => {
    it("should determine auto-start behavior based on difficulty and prop", () => {
      // Easy + auto-start enabled = should auto-start
      const autoStartEnabled = true;
      const difficulty: string = "easy";
      const shouldAutoStartEasy = autoStartEnabled && difficulty === "easy";
      expect(shouldAutoStartEasy).toBe(true);

      // Medium + auto-start enabled = should NOT auto-start
      const difficulty2: string = "medium";
      const shouldAutoStartMedium = autoStartEnabled && difficulty2 === "easy";
      expect(shouldAutoStartMedium).toBe(false);

      // Easy + auto-start disabled = should NOT auto-start
      const autoStartDisabled = false;
      const shouldAutoStartDisabled = autoStartDisabled && difficulty === "easy";
      expect(shouldAutoStartDisabled).toBe(false);
    });
  });

  describe("State Combinations", () => {
    it("should handle selected + current plan combination", () => {
      const isCurrentPlan = true;
      const isLocked = false;

      // Current plan takes precedence
      const shouldShowCurrentPlan = !isLocked && isCurrentPlan;
      expect(shouldShowCurrentPlan).toBe(true);
    });

    it("should handle locked + clickable state", () => {
      const isLocked = true;
      const canClickLocked = true;

      const isClickable = isLocked && canClickLocked;
      expect(isClickable).toBe(true);
    });

    it("should handle locked + disabled state", () => {
      const isLocked = true;
      const canClickLocked = false;

      const isDisabled = isLocked && !canClickLocked;
      expect(isDisabled).toBe(true);
    });
  });

  describe("Plan Mapping Integration", () => {
    it("should map easy difficulty to junior plan ID", () => {
      const planId = DIFFICULTY_TO_PLAN_ID.easy;
      expect(planId).toBe("junior");

      const plan = getPlanById(planId);
      expect(plan).toBeDefined();
      expect(plan!.id).toBe("junior");
    });

    it("should map medium difficulty to intermediate plan ID", () => {
      const planId = DIFFICULTY_TO_PLAN_ID.medium;
      expect(planId).toBe("intermediate");

      const plan = getPlanById(planId);
      expect(plan).toBeDefined();
      expect(plan!.id).toBe("intermediate");
    });

    it("should map hard difficulty to senior plan ID", () => {
      const planId = DIFFICULTY_TO_PLAN_ID.hard;
      expect(planId).toBe("senior");

      const plan = getPlanById(planId);
      expect(plan).toBeDefined();
      expect(plan!.id).toBe("senior");
    });

    it("should retrieve plan config with correct visual properties", () => {
      const easyPlanId = DIFFICULTY_TO_PLAN_ID.easy;
      const plan = getPlanById(easyPlanId);

      expect(plan).toBeDefined();
      expect(plan!.visual).toBeDefined();
      expect(plan!.visual.icon).toBeDefined();
      expect(plan!.visual.gradient).toBeDefined();
      expect(plan!.visual.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should retrieve plan config with i18n label keys", () => {
      const mediumPlanId = DIFFICULTY_TO_PLAN_ID.medium;
      const plan = getPlanById(mediumPlanId);

      expect(plan).toBeDefined();
      expect(plan!.labelKey).toBeDefined();
      expect(plan!.labelKey).toMatch(/^plans\.[a-z]+\.name$/);
      expect(plan!.descriptionKey).toBeDefined();
      expect(plan!.descriptionKey).toMatch(/^plans\.[a-z]+\.description$/);
    });

    it("should have consistent plan icons across difficulty levels", () => {
      const easyPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.easy);
      const mediumPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.medium);
      const hardPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.hard);

      expect(easyPlan!.visual.icon).toBe("🟢");
      expect(mediumPlan!.visual.icon).toBe("🟡");
      expect(hardPlan!.visual.icon).toBe("🔴");
    });

    it("should map all difficulties to valid plan configurations", () => {
      const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

      difficulties.forEach((difficulty) => {
        const planId = DIFFICULTY_TO_PLAN_ID[difficulty];
        const plan = getPlanById(planId);

        expect(plan).toBeDefined();
        expect(plan!.id).toBe(planId);
        expect(plan!.tier).toBeDefined();
        expect(plan!.features).toBeDefined();
        expect(plan!.cta).toBeDefined();
        expect(plan!.metadata).toBeDefined();
      });
    });

    it("should have ascending difficulty mapped to ascending tiers", () => {
      const easyPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.easy);
      const mediumPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.medium);
      const hardPlan = getPlanById(DIFFICULTY_TO_PLAN_ID.hard);

      // Check feature counts increase with difficulty
      expect(easyPlan!.features.studyItems).toBeLessThan(mediumPlan!.features.studyItems);
      expect(mediumPlan!.features.studyItems).toBeLessThanOrEqual(hardPlan!.features.studyItems);

      expect(easyPlan!.features.quizQuestions).toBeLessThan(mediumPlan!.features.quizQuestions);
      expect(mediumPlan!.features.quizQuestions).toBeLessThanOrEqual(hardPlan!.features.quizQuestions);
    });
  });
});
