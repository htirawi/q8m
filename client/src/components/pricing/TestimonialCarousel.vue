<template>
  <div class="testimonial-carousel">
    <div class="testimonial-carousel-container">
      <!-- Header -->
      <div class="testimonial-header">
        <h2 class="testimonial-title">{{ $t('pricing.testimonials.title') }}</h2>
        <p class="testimonial-subtitle">{{ $t('pricing.testimonials.subtitle') }}</p>
      </div>

      <!-- Carousel -->
      <div class="testimonial-slider">
        <!-- Navigation Buttons -->
        <button
          v-if="testimonials.length > 1"
          @click="prev"
          class="testimonial-nav testimonial-nav-prev"
          :aria-label="$t('pricing.testimonials.previous')"
          :disabled="isTransitioning"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- ITestimonial Cards -->
        <div class="testimonial-track">
          <TransitionGroup name="testimonial-slide" tag="div" class="testimonial-wrapper">
            <div
              v-for="(testimonial, index) in visibleTestimonials"
              :key="testimonial.id"
              v-show="index === currentIndex"
              class="testimonial-card"
            >
              <!-- Quote Icon -->
              <div class="testimonial-quote-icon">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
              </div>

              <!-- ITestimonial Content -->
              <blockquote class="testimonial-content">
                <p class="testimonial-text">{{ testimonial.text }}</p>
              </blockquote>

              <!-- Author Info -->
              <div class="testimonial-author">
                <div class="testimonial-author-avatar">
                  <img
                    v-if="testimonial.avatar"
                    :src="testimonial.avatar"
                    :alt="testimonial.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="testimonial-author-initials">
                    {{ getInitials(testimonial.name) }}
                  </div>
                </div>
                <div class="testimonial-author-info">
                  <div class="testimonial-author-name">{{ testimonial.name }}</div>
                  <div class="testimonial-author-title">{{ testimonial.title }}</div>
                  <div v-if="testimonial.company" class="testimonial-author-company">
                    {{ testimonial.company }}
                  </div>
                </div>
              </div>

              <!-- Rating Stars -->
              <div class="testimonial-rating">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="testimonial-star"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <!-- IBadge (if applicable) -->
              <div v-if="testimonial.badge" class="testimonial-badge">
                {{ testimonial.badge }}
              </div>
            </div>
          </TransitionGroup>
        </div>

        <button
          v-if="testimonials.length > 1"
          @click="next"
          class="testimonial-nav testimonial-nav-next"
          :aria-label="$t('pricing.testimonials.next')"
          :disabled="isTransitioning"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Dots Indicator -->
      <div v-if="testimonials.length > 1" class="testimonial-dots">
        <button
          v-for="(_, index) in testimonials"
          :key="index"
          @click="goTo(index)"
          class="testimonial-dot"
          :class="{ 'testimonial-dot-active': index === currentIndex }"
          :aria-label="`Go to testimonial ${index + 1}`"
          :aria-current="index === currentIndex"
        />
      </div>

      <!-- Statistics -->
      <div class="testimonial-stats">
        <div class="testimonial-stat">
          <div class="testimonial-stat-value">15,000+</div>
          <div class="testimonial-stat-label">{{ $t('pricing.stats.developers') }}</div>
        </div>
        <div class="testimonial-stat">
          <div class="testimonial-stat-value">4.9/5</div>
          <div class="testimonial-stat-label">{{ $t('pricing.stats.rating') }}</div>
        </div>
        <div class="testimonial-stat">
          <div class="testimonial-stat-value">98%</div>
          <div class="testimonial-stat-label">{{ $t('pricing.stats.satisfaction') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITestimonial, ITestimonialCarouselProps as Props } from "@/types/components/pricing";
import { ref, computed, onMounted, onUnmounted } from 'vue';





const props = withDefaults(defineProps<Props>(), {
  testimonials: () => [
    {
      id: '1',
      text: "Q8M helped me land my dream job at Google! The questions are incredibly well-crafted and mirror real interview scenarios. The spaced repetition system ensured I retained everything.",
      name: 'Sarah Johnson',
      title: 'Senior Frontend Developer',
      company: 'Google',
      badge: 'Got hired at FAANG',
    },
    {
      id: '2',
      text: "I've tried many platforms, but Q8M stands out with its AI-powered explanations and gamification. Learning feels like playing a game, and I've mastered React in just 3 months!",
      name: 'Mohammed Al-Rashid',
      title: 'Full Stack Developer',
      company: 'Amazon',
    },
    {
      id: '3',
      text: "The learning paths are phenomenal! Instead of randomly studying, I followed the React Mastery path and it structured my learning perfectly. Got my certificate and immediately got promoted.",
      name: 'Emily Chen',
      title: 'Tech Lead',
      company: 'Microsoft',
      badge: 'Promoted after completion',
    },
    {
      id: '4',
      text: "As someone new to coding, Q8M's onboarding and experience-based recommendations were a game changer. The community discussions helped me understand concepts I was struggling with.",
      name: 'David Martinez',
      title: 'Junior Developer',
      company: 'Startup Inc',
    },
    {
      id: '5',
      text: "The streak system kept me accountable. 90 days straight of learning, and I went from knowing basic JavaScript to confidently building full-stack applications. Worth every penny!",
      name: 'Aisha Khan',
      title: 'Software Engineer',
      company: 'Meta',
      badge: '90-day streak master',
    },
  ],
  autoplay: true,
  autoplayInterval: 5000,
});

const currentIndex = ref(0);
const isTransitioning = ref(false);
let autoplayTimer: ReturnType<typeof setTimeout> | null = null;

const visibleTestimonials = computed(() => props.testimonials);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function next() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % props.testimonials.length;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
  resetAutoplay();
}

function prev() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = currentIndex.value === 0 ? props.testimonials.length - 1 : currentIndex.value - 1;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
  resetAutoplay();
}

function goTo(index: number) {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
  resetAutoplay();
}

function startAutoplay() {
  if (!props.autoplay || props.testimonials.length <= 1) return;
  autoplayTimer = setTimeout(() => {
    next();
    startAutoplay();
  }, props.autoplayInterval);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<style scoped>
.testimonial-carousel {
  @apply py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800;
}

.testimonial-carousel-container {
  @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Header */
.testimonial-header {
  @apply text-center mb-12;
}

.testimonial-title {
  @apply text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.testimonial-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

/* Slider */
.testimonial-slider {
  @apply relative mb-8;
}

.testimonial-track {
  @apply overflow-hidden;
}

.testimonial-wrapper {
  @apply relative min-h-[400px] flex items-center justify-center;
}

.testimonial-card {
  @apply max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10;
  @apply border-2 border-gray-100 dark:border-gray-700;
  @apply absolute inset-0;
}

/* Quote Icon */
.testimonial-quote-icon {
  @apply text-blue-500 dark:text-blue-400 mb-6 opacity-20;
}

/* Content */
.testimonial-content {
  @apply mb-6;
}

.testimonial-text {
  @apply text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed;
  @apply font-medium;
}

/* Author */
.testimonial-author {
  @apply flex items-center gap-4 mb-4;
}

.testimonial-author-avatar {
  @apply w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600;
  @apply flex items-center justify-center shadow-lg;
}

.testimonial-author-initials {
  @apply text-white font-bold text-lg;
}

.testimonial-author-info {
  @apply flex-1;
}

.testimonial-author-name {
  @apply text-lg font-bold text-gray-900 dark:text-white;
}

.testimonial-author-title {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.testimonial-author-company {
  @apply text-xs text-blue-600 dark:text-blue-400 font-semibold;
}

/* Rating */
.testimonial-rating {
  @apply flex gap-1 mb-4;
}

.testimonial-star {
  @apply w-5 h-5 text-yellow-400;
}

/* IBadge */
.testimonial-badge {
  @apply inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500;
  @apply text-white text-xs font-bold rounded-full shadow-lg;
}

/* Navigation */
.testimonial-nav {
  @apply absolute top-1/2 -translate-y-1/2 z-10;
  @apply w-12 h-12 rounded-full;
  @apply bg-white dark:bg-gray-800;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply shadow-lg hover:shadow-xl;
  @apply transition-all duration-200;
  @apply hover:scale-110 active:scale-95;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
  @apply flex items-center justify-center;
}

.testimonial-nav-prev {
  @apply -left-6 sm:-left-16;
}

.testimonial-nav-next {
  @apply -right-6 sm:-right-16;
}

/* Dots */
.testimonial-dots {
  @apply flex justify-center gap-2 mb-8;
}

.testimonial-dot {
  @apply w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600;
  @apply transition-all duration-200;
  @apply hover:scale-125;
}

.testimonial-dot-active {
  @apply bg-blue-600 dark:bg-blue-400;
  @apply w-8;
}

/* Stats */
.testimonial-stats {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-6;
  @apply pt-8 border-t-2 border-gray-200 dark:border-gray-700;
}

.testimonial-stat {
  @apply text-center;
}

.testimonial-stat-value {
  @apply text-3xl sm:text-4xl font-bold;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply bg-clip-text text-transparent;
}

.testimonial-stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1;
}

/* Transitions */
.testimonial-slide-enter-active,
.testimonial-slide-leave-active {
  transition: all 0.3s ease;
}

.testimonial-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.testimonial-slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* RTL Support */
[dir='rtl'] .testimonial-author {
  @apply flex-row-reverse;
}

[dir='rtl'] .testimonial-nav-prev {
  @apply -right-6 sm:-right-16 left-auto;
  @apply rotate-180;
}

[dir='rtl'] .testimonial-nav-next {
  @apply -left-6 sm:-left-16 right-auto;
  @apply rotate-180;
}

/* Responsive */
@media (max-width: 640px) {
  .testimonial-card {
    @apply p-6;
  }

  .testimonial-text {
    @apply text-base;
  }

  .testimonial-nav {
    @apply w-10 h-10;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .testimonial-slide-enter-active,
  .testimonial-slide-leave-active,
  .testimonial-nav {
    transition: none;
  }

  .testimonial-nav:hover {
    @apply scale-100;
  }
}
</style>
