import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "@/router";

export function useLocale() {
  const { locale } = useI18n();
  const route = useRoute();
  const router = useRouter();

  // Get current locale from route params
  const currentLocale = computed(() => {
    return (route.params.locale as SupportedLocale) || DEFAULT_LOCALE;
  });

  // Get current path without locale prefix
  const pathWithoutLocale = computed(() => {
    return route.path.replace(/^\/[a-z]{2}(\/|$)/, "/");
  });

  // Check if current route is localized
  const isLocalizedRoute = computed(() => {
    return Boolean(route.params.locale);
  });

  // Get locale-specific URL for current route
  const getLocalizedUrl = (targetLocale: SupportedLocale) => {
    const path = pathWithoutLocale.value === "/" ? "" : pathWithoutLocale.value;
    return `/${targetLocale}${path}`;
  };

  // Get locale-specific URL for a specific route name
  const getLocalizedRouteUrl = (
    routeName: string,
    targetLocale: SupportedLocale,
    params: Record<string, string | number> = {}
  ) => {
    const { href } = router.resolve({
      name: routeName,
      params: { locale: targetLocale, ...params },
    });
    return href;
  };

  // Switch to a specific locale while staying on the same page
  const switchLocale = async (targetLocale: SupportedLocale) => {
    if (targetLocale === currentLocale.value) return;

    const newPath = getLocalizedUrl(targetLocale);
    const { query } = route;

    await router.push({
      path: newPath,
      query,
    });
  };

  // Initialize locale from URL on app start
  const initializeLocale = () => {
    const urlLocale = currentLocale.value;
    // Initialize locale from URL

    // Set i18n locale
    if (locale.value !== urlLocale) {
      locale.value = urlLocale;
    }

    // Update HTML attributes
    document.documentElement.dir = urlLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = urlLocale;
    // HTML attributes updated for locale
  };

  // Watch for locale changes and update HTML attributes
  watch(
    currentLocale,
    (newLocale) => {
      // Locale changed, updating i18n and HTML

      // Update i18n locale
      if (locale.value !== newLocale) {
        locale.value = newLocale;
      }

      // Update HTML attributes
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;
      // HTML attributes updated for new locale
    },
    { immediate: true }
  );

  return {
    currentLocale,
    pathWithoutLocale,
    isLocalizedRoute,
    getLocalizedUrl,
    getLocalizedRouteUrl,
    switchLocale,
    initializeLocale,
    SUPPORTED_LOCALES,
    DEFAULT_LOCALE,
  };
}
