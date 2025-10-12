/**
 * Unit tests for plan-to-mode mapping module
 * Tests canonical mappings, intent handling, and Bundle behavior
 */

import { describe, it, expect } from "vitest";
import {
  getStudyTargetFor,
  getQuizTargetFor,
  isBundlePlan,
  getAccessibleStudyDifficulties,
  getAccessibleQuizLevels,
  buildIntentRedirectUrl,
  decodeIntentFromUrl,
  resolvePostLoginTarget,
} from "@/utils/planMapping";
import type { PlanTier } from "@shared/types/plan";

describe("planMapping", () => {
  describe("getStudyTargetFor", () => {
    it("maps free to easy study", () => {
      expect(getStudyTargetFor("free", "en")).toBe("/en/study/easy");
    });

    it("maps intermediate to medium study", () => {
      expect(getStudyTargetFor("intermediate", "en")).toBe("/en/study/medium");
    });

    it("maps advanced to hard study", () => {
      expect(getStudyTargetFor("advanced", "en")).toBe("/en/study/hard");
    });

    it("maps pro (Bundle) to medium study as default", () => {
      expect(getStudyTargetFor("pro", "en")).toBe("/en/study/medium");
    });

    it("preserves locale in route", () => {
      expect(getStudyTargetFor("free", "ar")).toBe("/ar/study/easy");
    });
  });

  describe("getQuizTargetFor", () => {
    it("maps free to junior quiz", () => {
      expect(getQuizTargetFor("free", "en")).toBe("/en/quiz/junior");
    });

    it("maps intermediate to intermediate quiz", () => {
      expect(getQuizTargetFor("intermediate", "en")).toBe("/en/quiz/intermediate");
    });

    it("maps advanced to senior quiz", () => {
      expect(getQuizTargetFor("advanced", "en")).toBe("/en/quiz/senior");
    });

    it("maps pro (Bundle) to intermediate quiz as default", () => {
      expect(getQuizTargetFor("pro", "en")).toBe("/en/quiz/intermediate");
    });

    it("preserves locale in route", () => {
      expect(getQuizTargetFor("free", "ar")).toBe("/ar/quiz/junior");
    });
  });

  describe("isBundlePlan", () => {
    it("returns true for pro tier", () => {
      expect(isBundlePlan("pro")).toBe(true);
    });

    it("returns false for other tiers", () => {
      expect(isBundlePlan("free")).toBe(false);
      expect(isBundlePlan("intermediate")).toBe(false);
      expect(isBundlePlan("advanced")).toBe(false);
    });
  });

  describe("getAccessibleStudyDifficulties", () => {
    it("free plan only accesses easy", () => {
      expect(getAccessibleStudyDifficulties("free")).toEqual(["easy"]);
    });

    it("intermediate plan accesses easy and medium", () => {
      expect(getAccessibleStudyDifficulties("intermediate")).toEqual(["easy", "medium"]);
    });

    it("advanced plan accesses all levels", () => {
      expect(getAccessibleStudyDifficulties("advanced")).toEqual(["easy", "medium", "hard"]);
    });

    it("pro (Bundle) plan accesses all levels", () => {
      expect(getAccessibleStudyDifficulties("pro")).toEqual(["easy", "medium", "hard"]);
    });
  });

  describe("getAccessibleQuizLevels", () => {
    it("free plan only accesses junior", () => {
      expect(getAccessibleQuizLevels("free")).toEqual(["junior"]);
    });

    it("intermediate plan accesses junior and intermediate", () => {
      expect(getAccessibleQuizLevels("intermediate")).toEqual(["junior", "intermediate"]);
    });

    it("advanced plan accesses all levels", () => {
      expect(getAccessibleQuizLevels("advanced")).toEqual(["junior", "intermediate", "senior"]);
    });

    it("pro (Bundle) plan accesses all levels", () => {
      expect(getAccessibleQuizLevels("pro")).toEqual(["junior", "intermediate", "senior"]);
    });
  });

  describe("buildIntentRedirectUrl", () => {
    it("builds study intent URL with locale", () => {
      const url = buildIntentRedirectUrl("study", "medium", "en");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fstudy%2Fmedium");
    });

    it("builds quiz intent URL with locale", () => {
      const url = buildIntentRedirectUrl("quiz", "senior", "en");
      expect(url).toBe("/en/login?signInSuccessUrl=%2Fen%2Fquiz%2Fsenior");
    });

    it("handles bundle intent with locale", () => {
      const url = buildIntentRedirectUrl("study", "bundle", "ar");
      expect(url).toBe("/ar/login?signInSuccessUrl=%2Far%2Fstudy%2Fbundle");
    });

    it("returns relative path only (safe from open redirect)", () => {
      const url = buildIntentRedirectUrl("study", "easy", "en");
      expect(url.startsWith("/")).toBe(true);
      expect(url.includes("://")).toBe(false);
    });
  });

  describe("decodeIntentFromUrl", () => {
    it("decodes study intent from URL", () => {
      const intent = decodeIntentFromUrl("/en/study/medium");
      expect(intent).toEqual({
        mode: "study",
        desired: "medium",
        locale: "en",
      });
    });

    it("decodes quiz intent from URL", () => {
      const intent = decodeIntentFromUrl("/ar/quiz/senior");
      expect(intent).toEqual({
        mode: "quiz",
        desired: "senior",
        locale: "ar",
      });
    });

    it("decodes bundle intent", () => {
      const intent = decodeIntentFromUrl("/en/study/bundle");
      expect(intent).toEqual({
        mode: "study",
        desired: "bundle",
        locale: "en",
      });
    });

    it("returns null for invalid URLs", () => {
      expect(decodeIntentFromUrl("https://evil.com/study/easy")).toBeNull();
      expect(decodeIntentFromUrl("//example.com/study/easy")).toBeNull();
      expect(decodeIntentFromUrl("/invalid")).toBeNull();
      expect(decodeIntentFromUrl("/en/invalid/mode")).toBeNull();
    });
  });

  describe("resolvePostLoginTarget", () => {
    it("uses default landing when no intent", () => {
      const target = resolvePostLoginTarget("free", null, "en");
      expect(target).toBe("/en/study/easy");
    });

    it("resolves bundle intent for pro users", () => {
      const intent = { mode: "study" as const, desired: "bundle" as const, locale: "en" };
      const target = resolvePostLoginTarget("pro", intent, "en");
      expect(target).toBe("/en/study/medium"); // Bundle defaults to medium
    });

    it("redirects non-bundle users with bundle intent to their default", () => {
      const intent = { mode: "study" as const, desired: "bundle" as const, locale: "en" };
      const target = resolvePostLoginTarget("intermediate", intent, "en");
      expect(target).toBe("/en/study/medium"); // Intermediate default
    });

    it("respects specific intent when not bundle", () => {
      const intent = { mode: "quiz" as const, desired: "senior" as const, locale: "ar" };
      const target = resolvePostLoginTarget("advanced", intent, "ar");
      expect(target).toBe("/ar/quiz/senior");
    });

    it("allows intent navigation even if access will be denied (guards handle it)", () => {
      // Free user wants hard - should route there, guard will show paywall
      const intent = { mode: "study" as const, desired: "hard" as const, locale: "en" };
      const target = resolvePostLoginTarget("free", intent, "en");
      expect(target).toBe("/en/study/hard");
    });
  });
});
