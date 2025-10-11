<script setup lang="ts">
import type { FinalCtaEmits } from "@/types/ui/component-props";
import { finalCtaData } from "@/components/pricing/pricing.config";

const emit = defineEmits<FinalCtaEmits>();

const handleCtaClick = () => {
  emit("cta-click");
};

defineOptions({
  name: "FinalCta",
});
</script>

<template>
  <section class="final-cta" aria-labelledby="final-cta-title">
    <div class="final-cta-container">
      <div class="final-cta-content">
        <h2 id="final-cta-title" class="final-cta-title">
          {{ $t(finalCtaData.titleKey) }}
        </h2>
        <p class="final-cta-description">
          {{ $t(finalCtaData.subtitleKey) }}
        </p>

        <div class="final-cta-actions">
          <button @click="handleCtaClick" class="final-cta-button">
            {{ $t(finalCtaData.ctaLabelKey) }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final-cta {
  @apply bg-gray-900 py-16 lg:py-24;
}

.final-cta-container {
  @apply mx-auto max-w-4xl px-4 sm:px-6 lg:px-8;
}

.final-cta-content {
  @apply text-center;
}

.final-cta-title {
  @apply text-3xl font-bold text-white sm:text-4xl;
}

.final-cta-description {
  @apply mx-auto mt-6 max-w-2xl text-xl text-gray-300;
}

.final-cta-actions {
  @apply mt-8;
}

.final-cta-button {
  @apply rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors duration-200;
  @apply hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900;
  @apply min-h-[44px];
}

/* RTL Support */
[dir="rtl"] .final-cta-button {
  @apply focus:ring-offset-gray-900;
}
</style>
