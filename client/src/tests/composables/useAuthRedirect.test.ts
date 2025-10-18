import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthRedirect } from "@/composables/useAuthRedirect";
import { useRoute, useRouter } from "vue-router";

// Mock vue-router
vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}));

describe("useAuthRedirect", () => {
  const mockRoute = {
    query: {},
    params: { locale: "en" },
  };

  const mockRouter = {
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRoute).mockReturnValue(mockRoute as any);
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  describe("isValidRedirectUrl", () => {
    it("should accept valid relative paths", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("/")).toBe(true);
      expect(isValidRedirectUrl("/dashboard")).toBe(true);
      expect(isValidRedirectUrl("/en/dashboard")).toBe(true);
      expect(isValidRedirectUrl("/pricing")).toBe(true);
    });

    it("should reject absolute URLs", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("http://example.com")).toBe(false);
      expect(isValidRedirectUrl("https://example.com")).toBe(false);
      expect(isValidRedirectUrl("//example.com")).toBe(false);
    });

    it("should reject URLs with protocols", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("javascript:alert(1)")).toBe(false);
      expect(isValidRedirectUrl("data:text/html")).toBe(false);
    });

    it("should reject URLs with @ symbol (credential injection)", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("/path@example.com")).toBe(false);
      expect(isValidRedirectUrl("/@admin")).toBe(false);
    });

    it("should reject non-string or empty values", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("")).toBe(false);
      expect(isValidRedirectUrl(null as any)).toBe(false);
      expect(isValidRedirectUrl(undefined as any)).toBe(false);
    });

    it("should reject URLs not starting with /", () => {
      const { isValidRedirectUrl } = useAuthRedirect();

      expect(isValidRedirectUrl("dashboard")).toBe(false);
      expect(isValidRedirectUrl("pricing/plan")).toBe(false);
    });
  });

  describe("getValidatedRedirectUrl", () => {
    it("should return the validated URL when param is valid", () => {
      mockRoute.query = { signInSuccessUrl: "/dashboard" };
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl()).toBe("/dashboard");
    });

    it("should return default path when param is invalid", () => {
      mockRoute.query = { signInSuccessUrl: "http://evil.com" };
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl()).toBe("/");
    });

    it("should return default path when param is missing", () => {
      mockRoute.query = {};
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl()).toBe("/");
    });

    it("should use custom param name", () => {
      mockRoute.query = { customRedirect: "/pricing" };
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl("customRedirect")).toBe("/pricing");
    });

    it("should use custom default path", () => {
      mockRoute.query = {};
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl("signInSuccessUrl", "/home")).toBe("/home");
    });

    it("should handle array query param values", () => {
      mockRoute.query = { signInSuccessUrl: ["/dashboard", "/pricing"] };
      const { getValidatedRedirectUrl } = useAuthRedirect();

      expect(getValidatedRedirectUrl()).toBe("/dashboard");
    });
  });

  describe("getCurrentLocale", () => {
    it("should return current locale from route params", () => {
      mockRoute.params = { locale: "ar" };
      const { getCurrentLocale } = useAuthRedirect();

      expect(getCurrentLocale()).toBe("ar");
    });

    it("should return 'en' when locale is not in params", () => {
      mockRoute.params = {};
      const { getCurrentLocale } = useAuthRedirect();

      expect(getCurrentLocale()).toBe("en");
    });
  });

  describe("buildLocalizedRedirectUrl", () => {
    it("should prepend locale to root path", () => {
      mockRoute.params = { locale: "en" };
      const { buildLocalizedRedirectUrl } = useAuthRedirect();

      expect(buildLocalizedRedirectUrl("/")).toBe("/en");
    });

    it("should prepend locale to paths without locale", () => {
      mockRoute.params = { locale: "ar" };
      const { buildLocalizedRedirectUrl } = useAuthRedirect();

      expect(buildLocalizedRedirectUrl("/dashboard")).toBe("/ar/dashboard");
    });

    it("should not modify paths that already have locale", () => {
      mockRoute.params = { locale: "en" };
      const { buildLocalizedRedirectUrl } = useAuthRedirect();

      expect(buildLocalizedRedirectUrl("/en/dashboard")).toBe("/en/dashboard");
      expect(buildLocalizedRedirectUrl("/ar/pricing")).toBe("/ar/pricing");
    });

    it("should handle paths with query params", () => {
      mockRoute.params = { locale: "en" };
      const { buildLocalizedRedirectUrl } = useAuthRedirect();

      // Note: This is a simple implementation, query params should be preserved as-is
      expect(buildLocalizedRedirectUrl("/dashboard?tab=settings")).toBe(
        "/en/dashboard?tab=settings"
      );
    });
  });

  describe("redirectAfterAuth", () => {
    it("should redirect to validated and localized URL", async () => {
      mockRoute.query = { signInSuccessUrl: "/dashboard" };
      mockRoute.params = { locale: "en" };
      const { redirectAfterAuth } = useAuthRedirect();

      await redirectAfterAuth();

      expect(mockRouter.replace).toHaveBeenCalledWith("/en/dashboard");
    });

    it("should redirect to default path when param is invalid", async () => {
      mockRoute.query = { signInSuccessUrl: "http://evil.com" };
      mockRoute.params = { locale: "en" };
      const { redirectAfterAuth } = useAuthRedirect();

      await redirectAfterAuth();

      expect(mockRouter.replace).toHaveBeenCalledWith("/en");
    });

    it("should use custom param name and default path", async () => {
      mockRoute.query = { customParam: "/pricing" };
      mockRoute.params = { locale: "ar" };
      const { redirectAfterAuth } = useAuthRedirect();

      await redirectAfterAuth("customParam", "/home");

      expect(mockRouter.replace).toHaveBeenCalledWith("/ar/pricing");
    });

    it("should preserve locale in URL", async () => {
      mockRoute.query = { signInSuccessUrl: "/quiz" };
      mockRoute.params = { locale: "ar" };
      const { redirectAfterAuth } = useAuthRedirect();

      await redirectAfterAuth();

      expect(mockRouter.replace).toHaveBeenCalledWith("/ar/quiz");
    });
  });
});
