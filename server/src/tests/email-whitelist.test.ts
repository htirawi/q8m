import { describe, it, expect } from "vitest";
import { isEmailWhitelisted, getWhitelistedEmails } from "../utils/email-whitelist.js";

describe("Email Whitelist", () => {
  describe("isEmailWhitelisted", () => {
    it("should return true for dev@example.com (configured in .env)", () => {
      expect(isEmailWhitelisted("dev@example.com")).toBe(true);
    });

    it("should return false for non-whitelisted emails", () => {
      expect(isEmailWhitelisted("user@example.com")).toBe(false);
      expect(isEmailWhitelisted("admin@test.com")).toBe(false);
      expect(isEmailWhitelisted("random@email.com")).toBe(false);
    });

    it("should handle case insensitive emails", () => {
      expect(isEmailWhitelisted("DEV@EXAMPLE.COM")).toBe(true);
      expect(isEmailWhitelisted("Dev@Example.Com")).toBe(true);
    });

    it("should trim whitespace", () => {
      expect(isEmailWhitelisted(" dev@example.com ")).toBe(true);
      expect(isEmailWhitelisted("\tDEV@EXAMPLE.COM\n")).toBe(true);
    });
  });

  describe("getWhitelistedEmails", () => {
    it("should return list containing dev@example.com", () => {
      const emails = getWhitelistedEmails();
      expect(emails).toContain("dev@example.com");
      expect(emails.length).toBeGreaterThan(0);
    });
  });
});
