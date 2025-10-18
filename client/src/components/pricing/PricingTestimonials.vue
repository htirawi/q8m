<script setup lang="ts">
import { StarIcon } from "@heroicons/vue/24/solid";

defineOptions({
  name: "PricingTestimonials",
});
</script>

<template>
  <section class="pricing-testimonials" aria-labelledby="testimonials-title">
    <div class="pricing-testimonials__container">
      <div class="pricing-testimonials__header">
        <h2 id="testimonials-title" class="pricing-testimonials__title">
          {{ $t("pricing.testimonials?.title") }}
        </h2>
        <p class="pricing-testimonials__subtitle">
          {{ $t("pricing.testimonials?.subtitle") }}
        </p>
      </div>

      <div class="pricing-testimonials__grid">
        <!-- Sarah's ITestimonial -->
        <div class="testimonial-card">
          <div class="testimonial-card__rating">
            <StarIcon v-for="i in 5" :key="i" class="testimonial-card__star" aria-hidden="true" />
          </div>
          <blockquote class="testimonial-card__quote">
            {{ $t("pricing.testimonials.items.sarah?.quote") }}
          </blockquote>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">
              <div class="testimonial-card__avatar-placeholder">SC</div>
            </div>
            <div class="testimonial-card__author-info">
              <cite class="testimonial-card__name">{{
                $t("pricing.testimonials.items.sarah?.name")
              }}</cite>
              <p class="testimonial-card__role">
                {{ $t("pricing.testimonials.items.sarah?.role") }} at
                {{ $t("pricing.testimonials.items.sarah?.company") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Michael's ITestimonial -->
        <div class="testimonial-card testimonial-card--featured">
          <div class="testimonial-card__badge">Featured</div>
          <div class="testimonial-card__rating">
            <StarIcon v-for="i in 5" :key="i" class="testimonial-card__star" aria-hidden="true" />
          </div>
          <blockquote class="testimonial-card__quote">
            {{ $t("pricing.testimonials.items.michael?.quote") }}
          </blockquote>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">
              <div class="testimonial-card__avatar-placeholder">MR</div>
            </div>
            <div class="testimonial-card__author-info">
              <cite class="testimonial-card__name"
                >{{ $t("pricing.testimonials.items.michael?.name") }}
              </cite>
              <p class="testimonial-card__role">
                {{ $t("pricing.testimonials.items.michael?.role") }}

                at
                {{ $t("pricing.testimonials.items.michael?.company") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Emma's ITestimonial -->
        <div class="testimonial-card">
          <div class="testimonial-card__rating">
            <StarIcon v-for="i in 5" :key="i" class="testimonial-card__star" aria-hidden="true" />
          </div>
          <blockquote class="testimonial-card__quote">
            {{ $t("pricing.testimonials.items.emma?.quote") }}
          </blockquote>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">
              <div class="testimonial-card__avatar-placeholder">ET</div>
            </div>
            <div class="testimonial-card__author-info">
              <cite class="testimonial-card__name">{{
                $t("pricing.testimonials.items.emma?.name")
              }}</cite>
              <p class="testimonial-card__role">
                {{ $t("pricing.testimonials.items.emma?.role") }} at
                {{ $t("pricing.testimonials.items.emma?.company") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-testimonials {
  @apply py-16 lg:py-20;
  @apply bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50;
  @apply dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20;
}

.pricing-testimonials__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.pricing-testimonials__header {
  @apply mb-12 text-center;
}

.pricing-testimonials__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
  @apply sm:text-4xl lg:text-5xl;
  @apply mb-4;

  letter-spacing: -0.02em;
}

.pricing-testimonials__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300;
  @apply mx-auto max-w-2xl;
}

.pricing-testimonials__grid {
  @apply grid grid-cols-1 gap-8;
  @apply md:grid-cols-3;
  @apply lg:gap-10;
}

.testimonial-card {
  @apply relative;
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl p-8;
  @apply border border-gray-100 dark:border-gray-700;
  @apply shadow-xl hover:shadow-2xl;
  @apply transition-all duration-300;
  @apply hover:-translate-y-1;
  @apply flex flex-col;
}

.testimonial-card--featured {
  @apply border-2 border-blue-500 dark:border-blue-400;
  @apply bg-gradient-to-b from-blue-50/50 via-white to-white;
  @apply dark:from-blue-900/10 dark:via-gray-800 dark:to-gray-800;
  @apply shadow-2xl shadow-blue-500/20;
  @apply lg:scale-105;
  @apply ring-2 ring-blue-500/20 dark:ring-blue-400/20;
}

.testimonial-card__badge {
  @apply absolute -top-3 left-1/2 -translate-x-1/2;
  @apply rounded-full px-4 py-1.5;
  @apply text-[10px] font-bold uppercase tracking-wider text-white;
  @apply bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600;
  @apply shadow-lg shadow-blue-500/50;
  @apply animate-pulse;
}

.testimonial-card__rating {
  @apply mb-4 flex gap-1;
}

.testimonial-card__star {
  @apply h-5 w-5 text-yellow-400;
  @apply drop-shadow-sm;
}

.testimonial-card__quote {
  @apply text-base text-gray-700 dark:text-gray-300;
  @apply mb-6 leading-relaxed;
  @apply flex-grow;
  @apply font-medium;
  @apply italic;
}

.testimonial-card__quote::before {
  content: '"';

  @apply text-4xl text-blue-500 dark:text-blue-400;
  @apply font-serif;
  @apply mr-1;
}

.testimonial-card__quote::after {
  content: '"';

  @apply text-4xl text-blue-500 dark:text-blue-400;
  @apply font-serif;
  @apply ml-1;
}

.testimonial-card__author {
  @apply flex items-center gap-4;
  @apply border-t border-gray-100 pt-6 dark:border-gray-700;
}

.testimonial-card__avatar {
  @apply flex-shrink-0;
}

.testimonial-card__avatar-placeholder {
  @apply h-12 w-12 rounded-full;
  @apply bg-gradient-to-br from-blue-500 to-purple-600;
  @apply flex items-center justify-center;
  @apply text-sm font-bold text-white;
  @apply shadow-lg;
}

.testimonial-card__author-info {
  @apply flex flex-col;
}

.testimonial-card__name {
  @apply text-base font-bold text-gray-900 dark:text-white;
  @apply not-italic;
}

.testimonial-card__role {
  @apply text-sm text-gray-600 dark:text-gray-400;
  @apply mt-1;
}

/* RTL Support */
[dir="rtl"] .testimonial-card__author {
  @apply flex-row-reverse;
}

[dir="rtl"] .testimonial-card__quote::before {
  @apply ml-1 mr-0;
}

[dir="rtl"] .testimonial-card__quote::after {
  @apply ml-0 mr-1;
}

/* Responsive */
@media (width <= 768px) {
  .testimonial-card--featured {
    @apply scale-100;
  }

  .testimonial-card {
    @apply p-6;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .testimonial-card {
    @apply transition-none hover:translate-y-0;
  }

  .testimonial-card--featured {
    @apply scale-100;
  }

  .testimonial-card__badge {
    @apply animate-none;
  }
}
</style>
