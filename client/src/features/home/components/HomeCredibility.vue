<script setup lang="ts">
import type { IHomeCredibilityProps as Props } from "../../../types/components/home";
import { useI18n } from "vue-i18n";
import { HOMEPAGE_CREDIBILITY } from "@/data/home";

withDefaults(defineProps<Props>(), {
  logos: () => HOMEPAGE_CREDIBILITY,
  titleKey: "home.credibility.title",
});

const { t } = useI18n();
</script>

<template>
  <section class="credibility-section" aria-labelledby="credibility-title">
    <div class="credibility-container">
      <h2 v-if="titleKey" id="credibility-title" class="credibility-title">
        {{ t(titleKey) }}
      </h2>

      <div class="credibility-logos">
        <div v-for="logo in logos" :key="logo.id" class="credibility-logo">
          <img
            v-if="logo.logoUrl"
            :src="logo.logoUrl"
            :alt="t(logo.altKey)"
            class="credibility-logo__image"
            loading="lazy"
            width="80"
            height="80"
          />
          <span v-else-if="logo.icon" class="credibility-logo__icon" :aria-label="t(logo.altKey)">
            {{ logo.icon }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.credibility-section {
  @apply bg-slate-50 py-12 dark:bg-slate-900/50 md:py-16;
}

.credibility-container {
  @apply container mx-auto px-4;
}

.credibility-title {
  @apply mb-8 text-center text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400;
}

.credibility-logos {
  @apply flex flex-wrap items-center justify-center gap-8 md:gap-12;
}

.credibility-logo {
  @apply flex flex-col items-center gap-2 opacity-70 grayscale transition-all duration-200;
  @apply hover:opacity-100 hover:grayscale-0;
}

.credibility-logo__image {
  @apply h-16 w-16 object-contain md:h-20 md:w-20;

  filter: grayscale(100%) opacity(0.6);
}

.credibility-logo:hover .credibility-logo__image {
  filter: grayscale(0%) opacity(1);
}

.credibility-logo__icon {
  @apply flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white md:h-20 md:w-20 md:text-3xl;

  filter: grayscale(100%) opacity(0.6);
}

.credibility-logo:hover .credibility-logo__icon {
  filter: grayscale(0%) opacity(1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .credibility-logo {
    @apply transition-none;
  }
}
</style>
