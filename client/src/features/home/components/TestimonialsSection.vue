<script setup lang="ts">
import type { ITestimonialsSectionProps as Props } from "../../../types/components/home";
import { HOMEPAGE_TESTIMONIALS } from "@/data/home";
import SectionHeader from "../../../components/ui/SectionHeader.vue";
import TestimonialCard from "../../../components/ui/TestimonialCard.vue";

withDefaults(defineProps<Props>(), {
  testimonials: () => HOMEPAGE_TESTIMONIALS,
});
</script>

<template>
  <section class="testimonials-section" aria-labelledby="testimonials-title">
    <div class="testimonials-container">
      <SectionHeader
        title-key="home.testimonials.title"
        subtitle-key="home.testimonials.subtitle"
      />

      <div class="testimonials-grid">
        <TestimonialCard
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          :testimonial="testimonial"
          :index="index"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  @apply bg-gradient-to-b from-slate-50 to-white py-16 dark:from-slate-800 dark:to-slate-900 md:py-24;
}

.testimonials-container {
  @apply container mx-auto px-4;
}

.testimonials-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

/* Responsive adjustments */
@media (width <=768px) {
  .testimonials-grid {
    @apply gap-6;
  }
}
</style>
