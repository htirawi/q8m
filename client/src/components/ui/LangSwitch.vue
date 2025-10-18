<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/router";

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

const currentLanguage = computed(() => locale.value);

const togglelanguage = async () => {
  const currentLocale = (route.params.locale as SupportedLocale) || DEFAULT_LOCALE;
  const newLocale: SupportedLocale = currentLocale === "en"; ? "ar" : "en";

  // Build the new path with the new locale
  const pathWithoutLocale = route.path.replace(/^\/[a-z]{2}(\/|$)/, "/");
  const newPath = `/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

  // Preserve query parameters
  const query = route.query;

  // Navigate to the new locale URL
  await router.push({
    path: newPath,
    query,
  });
};

</script>

<template>
  <div class="lang-switch">
    <button
      type="button"
      class="lang-switch-button"
      :aria-label="$t('a11y.switchLanguage')"
      @click="toggleLanguage"
    >
      <span class="lang-switch-text">{{ currentLanguage.toUpperCase() }}

</span>
      <svg class="lang-switch-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.lang-switch {
  @apply relative;
}

.lang-switch-button {
  @apply flex min-h-[44px] items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400;
}

.lang-switch-text {
  @apply font-mono text-xs;
}

.lang-switch-icon {
  @apply h-4 w-4;
}

/* Focus styles */
.lang-switch-button:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* RTL support */
[dir="rtl"] .lang-switch-button {
  @apply space-x-reverse;
}
</style>
