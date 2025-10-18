<script setup lang="ts">
import type { ITierCardProps as Props } from "@/types/components/home";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const props = withDefaults(defineProps<Props>(), {
  highlighted: false,
});

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

const currentLocale = computed(() => (route.params.locale as string) || locale.value);

const handleCTAClick = (): void => {
  if (props.tier.ctaHref) {
    router.push({
      path: `/${currentLocale.value}${props.tier.ctaHref}`,
      query: { plan: props.tier.id, source: "homepage-pricing-teaser" },
    });
  }
};
</script>

<template>
  <article
    :class="[
      'tier-card',
      {
        'tier-card--highlighted': highlighted || tier.popular,
      },
    ]"
    :data-tier-id="tier.id"
  >
    <div v-if="tier.popular" class="tier-card__badge">
      {{ t("home.pricing?.popular") }}
    </div>

    <div class="tier-card__header">
      <h3 class="tier-card__title">
        {{ t(tier.titleKey) }}
      </h3>
      <p class="tier-card__description">
        {{ t(tier.descriptionKey) }}
      </p>
    </div>

    <div class="tier-card__price">
      <span class="tier-card__price-amount">{{ t(tier.priceKey) }} </span>
    </div>

    <ul class="tier-card__bullets" role="list">
      <li v-for="(bulletKey, idx) in tier.bulletsKey" :key="idx" class="tier-card__bullet">
        <svg
          class="tier-card__bullet-icon"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ t(bulletKey) }}</span>
      </li>
    </ul>

    <button
      type="button"
      class="tier-card__cta"
      @click="handleCTAClick"
      :aria-label="`${t(tier.ctaKey)} - ${t(tier.titleKey)}`"
    >
      {{ t(tier.ctaKey) }}
    </button>
  </article>
</template>

<style scoped>
.tier-card {
  @apply relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 transition-all duration-200;
  @apply dark:bg-slate-800 dark:ring-slate-700;
  @apply hover:shadow-2xl hover:ring-primary-300 dark:hover:ring-primary-600;
}

.tier-card--highlighted {
  @apply scale-105 shadow-2xl ring-2 ring-primary-500;
}

.tier-card__badge {
  @apply absolute -top-4 left-1/2 -translate-x-1/2 transform;
  @apply rounded-full bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-1 text-sm font-bold text-white shadow-md;
}

.tier-card__header {
  @apply mb-6 space-y-2;
}

.tier-card__title {
  @apply text-2xl font-bold text-slate-900 dark:text-white;
}

.tier-card__description {
  @apply text-sm text-slate-600 dark:text-slate-400;
}

.tier-card__price {
  @apply mb-8 border-b border-slate-200 pb-6 dark:border-slate-700;
}

.tier-card__price-amount {
  @apply text-4xl font-extrabold text-slate-900 dark:text-white;
}

.tier-card__bullets {
  @apply mb-8 space-y-4;
}

.tier-card__bullet {
  @apply flex items-start gap-3;
}

.tier-card__bullet-icon {
  @apply mt-1 h-5 w-5 flex-shrink-0 text-green-500;
}

.tier-card__bullet span {
  @apply text-sm text-slate-700 dark:text-slate-300;
}

.tier-card__cta {
  @apply w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-bold text-white transition-all duration-200;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply dark:focus:ring-offset-slate-800;
}

.tier-card--highlighted .tier-card__cta {
  @apply bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tier-card,
  .tier-card__cta {
    @apply transition-none;
  }

  .tier-card--highlighted {
    @apply scale-100;
  }
}
</style>
