import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { SupportedLocale } from "@/router";

/**
 * Composable for handling authentication redirects
 * Validates and sanitizes redirect URLs to prevent open redirect vulnerabilities
 */
export function useAuthRedirect() {
  const route = useRoute();
  const router = useRouter();

  /**
   * Validates if a redirect URL is safe (relative path only)
   * Rejects absolute URLs and external links
   */
  const isValidRedirectUrl = (url: string): boolean => {
    if (!url || typeof url !== "string") {
      return false;
    }

    // Must start with / (relative path)
    if (!url.startsWith("/")) {
      return false;
    }

    // Reject protocol-relative URLs (//example.com)
    if (url.startsWith("//")) {
      return false;
    }

    // Reject URLs with protocols
    if (url.includes("://")) {
      return false;
    }

    // Reject URLs with @ symbol (credential injection)
    if (url.includes("@")) {
      return false;
    }

    return true;
  };

  /**
   * Gets the validated redirect URL from query params
   * Returns default path if invalid or missing
   */
  const getValidatedRedirectUrl = (paramName = "signInSuccessUrl", defaultPath = "/"): string => {
    const redirectParam = route.query[paramName];
    const redirectUrl = typeof redirectParam === "string" ? redirectParam : redirectParam?.[0];

    if (!redirectUrl || !isValidRedirectUrl(redirectUrl)) {
      return defaultPath;
    }

    return redirectUrl;
  };

  /**
   * Gets the current locale from route params
   */
  const getCurrentLocale = (): SupportedLocale => {
    return (route.params.locale as SupportedLocale) || "en";
  };

  /**
   * Builds a redirect URL with locale preservation
   * If the target URL doesn't include a locale, prepend the current locale
   */
  const buildLocalizedRedirectUrl = (targetPath: string): string => {
    const locale = getCurrentLocale();

    // If the path already includes a locale prefix, return as-is
    if (targetPath.match(/^\/[a-z]{2}\//)) {
      return targetPath;
    }

    // If it's just "/" or doesn't have locale, add the locale prefix
    if (targetPath === "/") {
      return `/${locale}`;
    }

    // Remove leading slash if present, then add locale prefix
    const pathWithoutLeadingSlash = targetPath.replace(/^\//, "");
    return `/${locale}/${pathWithoutLeadingSlash}`;
  };

  /**
   * Navigate to the validated redirect URL with locale preservation
   * Uses router.replace to avoid adding to history
   */
  const redirectAfterAuth = async (
    paramName = "signInSuccessUrl",
    defaultPath = "/"
  ): Promise<void> => {
    const validatedPath = getValidatedRedirectUrl(paramName, defaultPath);
    const localizedPath = buildLocalizedRedirectUrl(validatedPath);

    await router.replace(localizedPath);
  };

  /**
   * Computed property for the validated redirect URL
   */
  const validatedRedirectUrl = computed(() => {
    return getValidatedRedirectUrl();
  });

  return {
    isValidRedirectUrl,
    getValidatedRedirectUrl,
    getCurrentLocale,
    buildLocalizedRedirectUrl,
    redirectAfterAuth,
    validatedRedirectUrl,
  };
}
