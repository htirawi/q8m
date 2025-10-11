<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/outline";
import { heroData, trustBadges } from "@/components/pricing/pricing.config";

defineOptions({
  name: "PricingHero",
});
</script>

<template>
  <section class="pricing-hero" aria-labelledby="pricing-hero-title">
    <div class="pricing-hero-container">
      <div class="pricing-hero-content">
        <h1 id="pricing-hero-title" class="pricing-hero-title">
          {{ $t(heroData.titleKey) }}
        </h1>
        <p class="pricing-hero-subtitle">
          {{ $t(heroData.subtitleKey) }}
        </p>

        <!-- Value Props -->
        <div class="pricing-hero-value-props">
          <div
            v-for="(valuePropKey, index) in heroData.valuePropsKeys"
            :key="index"
            class="pricing-hero-value-prop"
          >
            <CheckIcon class="pricing-hero-check-icon" aria-hidden="true" />
            <span>{{ $t(valuePropKey) }}</span>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="pricing-hero-trust">
          <p class="pricing-hero-trust-text">
            {{ $t("pricing.hero.trustedBy") }}
          </p>
          <div class="pricing-hero-trust-badges">
            <div v-for="badge in trustBadges" :key="badge.name" class="pricing-hero-trust-badge">
              <img :src="badge.logo" :alt="$t(badge.altKey)" class="pricing-hero-trust-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-hero {
  @apply bg-white py-16 lg:py-24;
}

.pricing-hero-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.pricing-hero-content {
  @apply text-center;
}

.pricing-hero-title {
  @apply text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl;
}

.pricing-hero-subtitle {
  @apply mx-auto mt-6 max-w-2xl text-xl text-gray-600;
}

.pricing-hero-value-props {
  @apply mt-8 flex flex-wrap justify-center gap-6;
}

.pricing-hero-value-prop {
  @apply flex items-center gap-2 text-sm font-medium text-gray-700;
}

.pricing-hero-check-icon {
  @apply h-5 w-5 text-green-500;
}

.pricing-hero-trust {
  @apply mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6;
}

.pricing-hero-trust-text {
  @apply text-sm font-medium text-gray-500;
}

.pricing-hero-trust-badges {
  @apply mt-4 flex justify-center gap-8;
}

.pricing-hero-trust-badge {
  @apply flex items-center;
}

.pricing-hero-trust-logo {
  @apply h-12 w-auto opacity-80 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0;
}

/* RTL Support */
[dir="rtl"] .pricing-hero-value-prop {
  @apply flex-row-reverse;
}

[dir="rtl"] .pricing-hero-value-prop .pricing-hero-check-icon {
  @apply ml-2 mr-0;
}
</style>
