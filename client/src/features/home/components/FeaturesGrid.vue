<script setup lang="ts">
import type { IFeaturesGridProps as Props } from "../../../types/components/home";
import { HOMEPAGE_FEATURES } from "@/data/home";
import SectionHeader from "../../../components/ui/SectionHeader.vue";
import FeatureCard from "../../../components/ui/FeatureCard.vue";

withDefaults(defineProps<Props>(), {
  features: () => HOMEPAGE_FEATURES,
});
</script>

<template>
  <section class="features-section" aria-labelledby="features-title">
    <div class="features-container">
      <SectionHeader title-key="home.features.title" subtitle-key="home.features.subtitle" />

      <div class="features-grid">
        <FeatureCard
          v-for="(feature, index) in features"
          :key="feature.id"
          :feature="feature"
          :index="index"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  @apply bg-gradient-to-b from-white to-slate-50 py-16 dark:from-slate-900 dark:to-slate-800 md:py-24;
}

.features-container {
  @apply container mx-auto px-4;
}

.features-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

/* Responsive adjustments */
@media (width <=768px) {
  .features-grid {
    @apply gap-6;
  }
}
</style>
