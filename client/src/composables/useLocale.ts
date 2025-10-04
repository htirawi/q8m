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
    params: any = {}
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
    console.log("Initializing locale:", urlLocale);
    console.log("Current i18n locale:", locale.value);

    // Set i18n locale
    if (locale.value !== urlLocale) {
      console.log("Setting i18n locale from", locale.value, "to", urlLocale);
      locale.value = urlLocale;
      console.log("i18n locale set to:", locale.value);
    }

    // Update HTML attributes
    document.documentElement.dir = urlLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = urlLocale;
    console.log("HTML attributes set:", {
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
    });
  };

  // Watch for locale changes and update HTML attributes
  watch(
    currentLocale,
    (newLocale) => {
      console.log("Locale changed to:", newLocale);
      console.log("Current i18n locale:", locale.value);

      // Update i18n locale
      if (locale.value !== newLocale) {
        console.log("Updating i18n locale from", locale.value, "to", newLocale);
        locale.value = newLocale;
        console.log("i18n locale updated to:", locale.value);
      }

      // Update HTML attributes
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;
      console.log("HTML attributes updated:", {
        dir: document.documentElement.dir,
        lang: document.documentElement.lang,
      });
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
