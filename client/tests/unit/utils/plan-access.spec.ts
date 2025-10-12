import { describe, it, expect } from "vitest";
import { hasAccessLevel } from "@shared/types/plan";

describe("Plan Access Control", () => {
  describe("hasAccessLevel", () => {
    it("allows everyone to access free content", () => {
      expect(hasAccessLevel("free", "free")).toBe(true);
      expect(hasAccessLevel("intermediate", "free")).toBe(true);
      expect(hasAccessLevel("advanced", "free")).toBe(true);
      expect(hasAccessLevel("pro", "free")).toBe(true);
    });

    it("blocks free users from paid content", () => {
      expect(hasAccessLevel("free", "paid")).toBe(false);
      expect(hasAccessLevel("free", "paid:intermediate")).toBe(false);
      expect(hasAccessLevel("free", "paid:advanced")).toBe(false);
      expect(hasAccessLevel("free", "paid:pro")).toBe(false);
    });

    it("allows paid users to access general paid content", () => {
      expect(hasAccessLevel("intermediate", "paid")).toBe(true);
      expect(hasAccessLevel("advanced", "paid")).toBe(true);
      expect(hasAccessLevel("pro", "paid")).toBe(true);
    });

    it("respects plan hierarchy for specific tier requirements", () => {
      // Intermediate cannot access advanced
      expect(hasAccessLevel("intermediate", "paid:advanced")).toBe(false);
      expect(hasAccessLevel("intermediate", "paid:pro")).toBe(false);

      // Advanced can access intermediate but not pro
      expect(hasAccessLevel("advanced", "paid:intermediate")).toBe(true);
      expect(hasAccessLevel("advanced", "paid:pro")).toBe(false);

      // Pro can access everything
      expect(hasAccessLevel("pro", "paid:intermediate")).toBe(true);
      expect(hasAccessLevel("pro", "paid:advanced")).toBe(true);
      expect(hasAccessLevel("pro", "paid:pro")).toBe(true);
    });

    it("allows users to access their own tier content", () => {
      expect(hasAccessLevel("intermediate", "paid:intermediate")).toBe(true);
      expect(hasAccessLevel("advanced", "paid:advanced")).toBe(true);
      expect(hasAccessLevel("pro", "paid:pro")).toBe(true);
    });
  });
});
