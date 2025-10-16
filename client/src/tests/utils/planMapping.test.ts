import { describe, it, expect } from "vitest";
import {
  isBundlePlan,
  getDefaultLandingPage,
  getStudyTargetFor,
  getQuizTargetFor,
  getAccessibleStudyDifficulties,
  getAccessibleQuizLevels,
  buildIntentRedirectUrl,
  decodeIntentFromUrl,
  resolvePostLoginTarget,
  type PlanIntent,
  type IntentMode,
} from "@/utils/planMapping";
import type { PlanTier } from "@shared/types/plan";
import type { DifficultyLevel, ExperienceLevel } from "@/types/plan/access";

describe("Plan Mapping", () => {
  describe("isBundlePlan", () => {
    it("should return true for pro plan", () => {
      expect(isBundlePlan("pro")).toBe(true);
    });

    it("should return false for non-pro plans", () => {
      expect(isBundlePlan("free")).toBe(false);
      expect(isBundlePlan("intermediate")).toBe(false);
      expect(isBundlePlan("advanced")).toBe(false);
    });
  });

  describe("getDefaultLandingPage", () => {
    it("should return default landing page with en locale", () => {
      expect(getDefaultLandingPage()).toBe("/en/select");
    });

    it("should return default landing page with custom locale", () => {
      expect(getDefaultLandingPage("ar")).toBe("/ar/select");
      expect(getDefaultLandingPage("fr")).toBe("/fr/select");
      expect(getDefaultLandingPage("es")).toBe("/es/select");
    });
  });

  describe("getStudyTargetFor", () => {
    it("should return correct study routes for each plan", () => {
      expect(getStudyTargetFor("free")).toBe("/en/study/easy");
      expect(getStudyTargetFor("intermediate")).toBe("/en/study/medium");
      expect(getStudyTargetFor("advanced")).toBe("/en/study/hard");
      expect(getStudyTargetFor("pro")).toBe("/en/study/medium"); // Bundle default
    });

    it("should return correct study routes with custom locale", () => {
      expect(getStudyTargetFor("free", "ar")).toBe("/ar/study/easy");
      expect(getStudyTargetFor("intermediate", "fr")).toBe("/fr/study/medium");
      expect(getStudyTargetFor("advanced", "es")).toBe("/es/study/hard");
      expect(getStudyTargetFor("pro", "de")).toBe("/de/study/medium");
    });
  });

  describe("getQuizTargetFor", () => {
    it("should return correct quiz routes for each plan", () => {
      expect(getQuizTargetFor("free")).toBe("/en/quiz/junior");
      expect(getQuizTargetFor("intermediate")).toBe("/en/quiz/intermediate");
      expect(getQuizTargetFor("advanced")).toBe("/en/quiz/senior");
      expect(getQuizTargetFor("pro")).toBe("/en/quiz/intermediate"); // Bundle default
    });

    it("should return correct quiz routes with custom locale", () => {
      expect(getQuizTargetFor("free", "ar")).toBe("/ar/quiz/junior");
      expect(getQuizTargetFor("intermediate", "fr")).toBe("/fr/quiz/intermediate");
      expect(getQuizTargetFor("advanced", "es")).toBe("/es/quiz/senior");
      expect(getQuizTargetFor("pro", "de")).toBe("/de/quiz/intermediate");
    });
  });

  describe("getAccessibleStudyDifficulties", () => {
    it("should return correct difficulties for free plan", () => {
      const difficulties = getAccessibleStudyDifficulties("free");
      expect(difficulties).toEqual(["easy"]);
    });

    it("should return correct difficulties for intermediate plan", () => {
      const difficulties = getAccessibleStudyDifficulties("intermediate");
      expect(difficulties).toEqual(["easy", "medium"]);
    });

    it("should return correct difficulties for advanced plan", () => {
      const difficulties = getAccessibleStudyDifficulties("advanced");
      expect(difficulties).toEqual(["easy", "medium", "hard"]);
    });

    it("should return correct difficulties for pro plan (bundle)", () => {
      const difficulties = getAccessibleStudyDifficulties("pro");
      expect(difficulties).toEqual(["easy", "medium", "hard"]);
    });

    it("should return easy as default for unknown plans", () => {
      const difficulties = getAccessibleStudyDifficulties("unknown" as PlanTier);
      expect(difficulties).toEqual(["easy"]);
    });
  });

  describe("getAccessibleQuizLevels", () => {
    it("should return correct levels for free plan", () => {
      const levels = getAccessibleQuizLevels("free");
      expect(levels).toEqual(["junior"]);
    });

    it("should return correct levels for intermediate plan", () => {
      const levels = getAccessibleQuizLevels("intermediate");
      expect(levels).toEqual(["junior", "intermediate"]);
    });

    it("should return correct levels for advanced plan", () => {
      const levels = getAccessibleQuizLevels("advanced");
      expect(levels).toEqual(["junior", "intermediate", "senior"]);
    });

    it("should return correct levels for pro plan (bundle)", () => {
      const levels = getAccessibleQuizLevels("pro");
      expect(levels).toEqual(["junior", "intermediate", "senior"]);
    });

    it("should return junior as default for unknown plans", () => {
      const levels = getAccessibleQuizLevels("unknown" as PlanTier);
      expect(levels).toEqual(["junior"]);
    });
  });

  describe("buildIntentRedirectUrl", () => {
    it("should build study intent redirect URL", () => {
      const url = buildIntentRedirectUrl("study", "medium", "en");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fstudy%2Fmedium");
    });

    it("should build quiz intent redirect URL", () => {
      const url = buildIntentRedirectUrl("quiz", "senior", "en");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fquiz%2Fsenior");
    });

    it("should build bundle intent redirect URL", () => {
      const url = buildIntentRedirectUrl("study", "bundle", "en");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fstudy%2Fbundle");
    });

    it("should use default locale when not provided", () => {
      const url = buildIntentRedirectUrl("study", "easy");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fstudy%2Feasy");
    });

    it("should handle different locales", () => {
      const url = buildIntentRedirectUrl("quiz", "intermediate", "ar");
      expect(url).toBe("/ar/login?signInSuccessUrl=%2Far%2Fquiz%2Fintermediate");
    });

    it("should properly encode special characters", () => {
      const url = buildIntentRedirectUrl("study", "medium", "en");
      const decodedTarget = decodeURIComponent(url.split("=")[1]);
      expect(decodedTarget).toBe("/en/study/medium");
    });
  });

  describe("decodeIntentFromUrl", () => {
    it("should decode valid study URL", () => {
      const intent = decodeIntentFromUrl("/en/study/medium");
      expect(intent).toEqual({
        mode: "study",
        desired: "medium",
        locale: "en",
      });
    });

    it("should decode valid quiz URL", () => {
      const intent = decodeIntentFromUrl("/ar/quiz/senior");
      expect(intent).toEqual({
        mode: "quiz",
        desired: "senior",
        locale: "ar",
      });
    });

    it("should decode bundle URL", () => {
      const intent = decodeIntentFromUrl("/fr/study/bundle");
      expect(intent).toEqual({
        mode: "study",
        desired: "bundle",
        locale: "fr",
      });
    });

    it("should return null for invalid URLs", () => {
      expect(decodeIntentFromUrl("invalid")).toBeNull();
      expect(decodeIntentFromUrl("/invalid")).toBeNull();
      expect(decodeIntentFromUrl("/en/invalid/medium")).toBeNull();
      expect(decodeIntentFromUrl("/en/study")).toBeNull();
      expect(decodeIntentFromUrl("/study/medium")).toBeNull();
    });

    it("should return null for URLs not starting with /", () => {
      expect(decodeIntentFromUrl("en/study/medium")).toBeNull();
      expect(decodeIntentFromUrl("http://example.com/en/study/medium")).toBeNull();
    });

    it("should return null for invalid modes", () => {
      expect(decodeIntentFromUrl("/en/invalid/medium")).toBeNull();
      expect(decodeIntentFromUrl("/en/test/medium")).toBeNull();
    });

    it("should handle different locales", () => {
      const locales = ["en", "ar", "fr", "es", "de", "zh"];
      locales.forEach((locale) => {
        const intent = decodeIntentFromUrl(`/${locale}/study/easy`);
        expect(intent).toEqual({
          mode: "study",
          desired: "easy",
          locale,
        });
      });
    });

    it("should handle different difficulties and levels", () => {
      const studyDifficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
      const quizLevels: ExperienceLevel[] = ["junior", "intermediate", "senior"];

      studyDifficulties.forEach((difficulty) => {
        const intent = decodeIntentFromUrl(`/en/study/${difficulty}`);
        expect(intent).toEqual({
          mode: "study",
          desired: difficulty,
          locale: "en",
        });
      });

      quizLevels.forEach((level) => {
        const intent = decodeIntentFromUrl(`/en/quiz/${level}`);
        expect(intent).toEqual({
          mode: "quiz",
          desired: level,
          locale: "en",
        });
      });
    });
  });

  describe("resolvePostLoginTarget", () => {
    describe("with no intent", () => {
      it("should return default landing page", () => {
        const target = resolvePostLoginTarget("free", null, "en");
        expect(target).toBe("/en/select");
      });

      it("should return default landing page with custom locale", () => {
        const target = resolvePostLoginTarget("pro", null, "ar");
        expect(target).toBe("/ar/select");
      });
    });

    describe("with bundle intent", () => {
      it("should route pro users to bundle defaults", () => {
        const studyIntent: PlanIntent = {
          mode: "study",
          desired: "bundle",
          locale: "en",
        };
        const quizIntent: PlanIntent = {
          mode: "quiz",
          desired: "bundle",
          locale: "en",
        };

        expect(resolvePostLoginTarget("pro", studyIntent, "en")).toBe("/en/study/medium");
        expect(resolvePostLoginTarget("pro", quizIntent, "en")).toBe("/en/quiz/intermediate");
      });

      it("should route non-bundle users to their plan defaults", () => {
        const studyIntent: PlanIntent = {
          mode: "study",
          desired: "bundle",
          locale: "en",
        };
        const quizIntent: PlanIntent = {
          mode: "quiz",
          desired: "bundle",
          locale: "en",
        };

        expect(resolvePostLoginTarget("free", studyIntent, "en")).toBe("/en/study/easy");
        expect(resolvePostLoginTarget("intermediate", studyIntent, "en")).toBe("/en/study/medium");
        expect(resolvePostLoginTarget("advanced", studyIntent, "en")).toBe("/en/study/hard");

        expect(resolvePostLoginTarget("free", quizIntent, "en")).toBe("/en/quiz/junior");
        expect(resolvePostLoginTarget("intermediate", quizIntent, "en")).toBe(
          "/en/quiz/intermediate"
        );
        expect(resolvePostLoginTarget("advanced", quizIntent, "en")).toBe("/en/quiz/senior");
      });
    });

    describe("with specific intent", () => {
      it("should route to specific study targets", () => {
        const intent: PlanIntent = {
          mode: "study",
          desired: "hard",
          locale: "en",
        };

        expect(resolvePostLoginTarget("pro", intent, "en")).toBe("/en/study/hard");
        expect(resolvePostLoginTarget("free", intent, "en")).toBe("/en/study/hard");
      });

      it("should route to specific quiz targets", () => {
        const intent: PlanIntent = {
          mode: "quiz",
          desired: "senior",
          locale: "en",
        };

        expect(resolvePostLoginTarget("pro", intent, "en")).toBe("/en/quiz/senior");
        expect(resolvePostLoginTarget("free", intent, "en")).toBe("/en/quiz/senior");
      });

      it("should handle different locales", () => {
        const intent: PlanIntent = {
          mode: "study",
          desired: "medium",
          locale: "ar",
        };

        expect(resolvePostLoginTarget("intermediate", intent, "ar")).toBe("/ar/study/medium");
      });
    });

    describe("edge cases", () => {
      it("should handle all plan tiers", () => {
        const plans: PlanTier[] = ["free", "intermediate", "advanced", "pro"];
        const intent: PlanIntent = {
          mode: "study",
          desired: "easy",
          locale: "en",
        };

        plans.forEach((plan) => {
          const target = resolvePostLoginTarget(plan, intent, "en");
          expect(target).toBe("/en/study/easy");
        });
      });

      it("should handle all intent modes", () => {
        const modes: IntentMode[] = ["study", "quiz"];
        const studyIntent: PlanIntent = {
          mode: "study",
          desired: "medium",
          locale: "en",
        };
        const quizIntent: PlanIntent = {
          mode: "quiz",
          desired: "intermediate",
          locale: "en",
        };

        expect(resolvePostLoginTarget("intermediate", studyIntent, "en")).toBe("/en/study/medium");
        expect(resolvePostLoginTarget("intermediate", quizIntent, "en")).toBe(
          "/en/quiz/intermediate"
        );
      });
    });
  });

  describe("type safety", () => {
    it("should handle all valid PlanTier values", () => {
      const tiers: PlanTier[] = ["free", "intermediate", "advanced", "pro"];

      tiers.forEach((tier) => {
        expect(() => getStudyTargetFor(tier)).not.toThrow();
        expect(() => getQuizTargetFor(tier)).not.toThrow();
        expect(() => getAccessibleStudyDifficulties(tier)).not.toThrow();
        expect(() => getAccessibleQuizLevels(tier)).not.toThrow();
      });
    });

    it("should handle all valid IntentMode values", () => {
      const modes: IntentMode[] = ["study", "quiz"];

      modes.forEach((mode) => {
        expect(() => buildIntentRedirectUrl(mode, "easy", "en")).not.toThrow();
      });
    });
  });
});
