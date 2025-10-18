<script setup lang="ts">
import type { IFeatureCardProps as Props } from "../../types/components/home";
import { useI18n } from "vue-i18n";

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <article class="feature-card" :data-feature-id="feature.id">
    <div class="feature-card__icon-wrapper">
      <component :is="feature.icon" class="feature-card__icon" aria-hidden="true" />
    </div>
    <h3 class="feature-card__title">
      {{ t(feature.titleKey) }}
    </h3>
    <p class="feature-card__body">
      {{ t(feature.bodyKey) }}
    </p>
  </article>
</template>

<style scoped>
.feature-card {
  @apply rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all duration-200;
  @apply hover:shadow-xl hover:ring-primary-300 dark:bg-slate-800 dark:ring-slate-700 dark:hover:ring-primary-600;
}

.feature-card:focus-within {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.feature-card__icon-wrapper {
  @apply mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40;
}

.feature-card__icon {
  @apply h-8 w-8 text-primary-600 dark:text-primary-400;
}

.feature-card__title {
  @apply mb-3 text-xl font-bold text-slate-900 dark:text-white;
}

.feature-card__body {
  @apply text-base leading-relaxed text-slate-600 dark:text-slate-300;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    @apply transition-none;
  }
}
</style>
