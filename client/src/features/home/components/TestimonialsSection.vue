<script setup lang="ts">
import { computed } from "vue";
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

const testimonials = computed(() => [
  {
    id: "sarah",
    textKey: "home.testimonials.sarah.text",
    nameKey: "home.testimonials.sarah.name",
    roleKey: "home.testimonials.sarah.role",
    companyKey: "home.testimonials.sarah.company",
    initials: "SC",
  },
  {
    id: "michael",
    textKey: "home.testimonials.michael.text",
    nameKey: "home.testimonials.michael.name",
    roleKey: "home.testimonials.michael.role",
    companyKey: "home.testimonials.michael.company",
    initials: "MR",
  },
  {
    id: "emma",
    textKey: "home.testimonials.emma.text",
    nameKey: "home.testimonials.emma.name",
    roleKey: "home.testimonials.emma.role",
    companyKey: "home.testimonials.emma.company",
    initials: "ET",
  },
]);
</script>

<template>
  <section class="testimonials-section" aria-labelledby="testimonials-title">
    <div class="testimonials-container">
      <div class="testimonials-header">
        <h2 id="testimonials-title" class="testimonials-title">
          {{ $t("home.testimonials.title") }}
        </h2>
        <p class="testimonials-description">
          {{ $t("home.testimonials.description") }}
        </p>
      </div>

      <div class="testimonials-grid">
        <div v-for="testimonial in testimonials" :key="testimonial.id" class="testimonial-card">
          <div class="testimonial-content">
            <div class="testimonial-quote">
              <ChatBubbleLeftRightIcon class="quote-icon" aria-hidden="true" />
            </div>
            <blockquote class="testimonial-text">
              {{ $t(testimonial.textKey) }}
            </blockquote>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">
              <span class="avatar-text">{{ testimonial.initials }}</span>
            </div>
            <div class="author-info">
              <div class="author-name">{{ $t(testimonial.nameKey) }}</div>
              <div class="author-role">{{ $t(testimonial.roleKey) }}</div>
              <div class="author-company">{{ $t(testimonial.companyKey) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  @apply bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-800 dark:to-slate-900 md:py-32;
}

.testimonials-container {
  @apply container mx-auto px-4;
}

.testimonials-header {
  @apply mb-20 text-center;
}

.testimonials-title {
  @apply mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .testimonials-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.testimonials-description {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.testimonials-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

.testimonial-card {
  @apply relative rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-slate-800;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.dark .testimonial-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.8);
}

.testimonial-content {
  @apply mb-6;
}

.testimonial-quote {
  @apply mb-4;
}

.quote-icon {
  @apply h-8 w-8 text-primary-500;
}

.testimonial-text {
  @apply text-lg leading-relaxed text-slate-700 dark:text-slate-300;
  font-style: italic;
}

.testimonial-author {
  @apply flex items-center gap-4;
}

.author-avatar {
  @apply flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
}

.author-info {
  @apply flex-1;
}

.author-name {
  @apply font-semibold text-slate-900 dark:text-white;
}

.author-role {
  @apply text-sm text-slate-600 dark:text-slate-400;
}

.author-company {
  @apply text-sm font-medium text-primary-600 dark:text-primary-400;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .testimonials-grid {
    @apply gap-6;
  }

  .testimonials-title {
    @apply text-3xl;
  }

  .testimonials-description {
    @apply text-lg;
  }

  .testimonial-card {
    @apply p-6;
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.testimonial-card {
  animation: slideInUp 0.6s ease-out forwards;
}

.testimonial-card:nth-child(1) {
  animation-delay: 0.1s;
}
.testimonial-card:nth-child(2) {
  animation-delay: 0.2s;
}
.testimonial-card:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
