<script setup lang="ts">
import type { ITestimonialCardProps as Props } from "@/types/components/home";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

defineProps<Props>();

const { t } = useI18n();

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
</script>

<template>
  <figure class="testimonial-card" :data-testimonial-id="testimonial.id">
    <blockquote class="testimonial-card__quote">
      <p class="testimonial-card__text">"{{ t(testimonial.quoteKey) }}"</p>
    </blockquote>

    <figcaption class="testimonial-card__author">
      <div class="testimonial-card__avatar-wrapper">
        <img
          v-if="testimonial.avatarUrl"
          :src="testimonial.avatarUrl"
          :alt="t(testimonial.nameKey)"
          class="testimonial-card__avatar"
          loading="lazy"
          width="48"
          height="48"
        />
        <div v-else class="testimonial-card__avatar-fallback" :aria-label="t(testimonial.nameKey)">
          {{ getInitials(t(testimonial.nameKey)) }}
        </div>
      </div>

      <div class="testimonial-card__author-info">
        <cite class="testimonial-card__name">
          {{ t(testimonial.nameKey) }}
        </cite>
        <p class="testimonial-card__role">
          {{ t(testimonial.roleKey) }}
          <span v-if="testimonial.companyKey"> · {{ t(testimonial.companyKey) }}</span>
        </p>
      </div>

      <div
        v-if="testimonial.rating"
        class="testimonial-card__rating"
        :aria-label="`${testimonial.rating} out of 5 stars`"
      >
        <svg
          v-for="star in testimonial.rating"
          :key="star"
          class="testimonial-card__star"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </div>
    </figcaption>
  </figure>
</template>

<style scoped>
.testimonial-card {
  @apply rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 transition-shadow duration-200;
  @apply dark:bg-slate-800 dark:ring-slate-700;
  @apply hover:shadow-xl;
}

.testimonial-card__quote {
  @apply mb-6;
}

.testimonial-card__text {
  @apply text-lg leading-relaxed text-slate-700 dark:text-slate-300;
}

.testimonial-card__author {
  @apply flex items-center gap-4;
}

.testimonial-card__avatar-wrapper {
  @apply flex-shrink-0;
}

.testimonial-card__avatar {
  @apply h-12 w-12 rounded-full object-cover ring-2 ring-primary-500;
}

.testimonial-card__avatar-fallback {
  @apply flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-sm font-bold text-white ring-2 ring-primary-500;
}

.testimonial-card__author-info {
  @apply flex-1;
}

.testimonial-card__name {
  @apply block text-sm font-bold not-italic text-slate-900 dark:text-white;
}

.testimonial-card__role {
  @apply mt-1 text-sm text-slate-600 dark:text-slate-400;
}

.testimonial-card__rating {
  @apply flex gap-1;
}

.testimonial-card__star {
  @apply h-5 w-5 text-yellow-400;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .testimonial-card {
    @apply transition-none;
  }
}
</style>
