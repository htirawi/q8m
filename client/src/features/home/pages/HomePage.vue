<script setup lang="ts">
import { onMounted } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useABTest } from '@/composables/useABTest';
import { useScrollTracking } from '@/composables/useScrollTracking';
import { useHomepageAnalytics } from '@/composables/useHomepageAnalytics';
import HeroSection from '@/features/home/components/HeroSection.vue';
import FeaturesGrid from '@/features/home/components/FeaturesGrid.vue';
import LearningPathSection from '@/features/home/components/LearningPathSection.vue';
import HomepagePricingTeaser from '@/features/home/components/HomepagePricingTeaser.vue';
import TestimonialsSection from '@/features/home/components/TestimonialsSection.vue';
import FaqSection from '@/features/home/components/FaqSection.vue';
import FooterCta from '@/features/home/components/FooterCta.vue';
import MobileStickyBar from '@/features/home/components/MobileStickyBar.vue';

const route = useRoute();
const { t, locale } = useI18n();

// A/B Test: Hero headline variants
const { variant: headlineVariant, trackAssignment: trackHeadlineAssignment } = useABTest({
  testId: 'homepage_hero_headline_v1',
  variants: ['control', 'variant_a', 'variant_b'],
  weights: [0.34, 0.33, 0.33],
});

// Scroll tracking (enables milestone analytics)
useScrollTracking({
  milestones: [25, 50, 75, 100],
  debounceMs: 100,
});

// Homepage analytics
const { setupSectionObserver } = useHomepageAnalytics();

// Lifecycle
onMounted(() => {
  // Track A/B test assignment
  trackHeadlineAssignment();

  // Setup section view tracking
  setupSectionObserver();
});

// SEO Meta
const currentLocale = route.params.locale as string || locale.value;
const canonicalUrl = `https://q8m.com/${currentLocale}`;

useHead({
  title: t('home.meta.title'),
  meta: [
    {
      name: 'description',
      content: t('home.meta.description'),
    },
    {
      name: 'keywords',
      content: t('home.meta.keywords'),
    },
    {
      property: 'og:title',
      content: t('home.meta.ogTitle'),
    },
    {
      property: 'og:description',
      content: t('home.meta.ogDescription'),
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: canonicalUrl,
    },
    {
      property: 'og:locale',
      content: currentLocale === 'ar' ? 'ar_SA' : 'en_US',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: t('home.meta.ogTitle'),
    },
    {
      name: 'twitter:description',
      content: t('home.meta.ogDescription'),
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
    {
      rel: 'alternate',
      hreflang: 'en',
      href: 'https://q8m.com/en',
    },
    {
      rel: 'alternate',
      hreflang: 'ar',
      href: 'https://q8m.com/ar',
    },
  ],
});
</script>

<template>
  <div class="home-page">
    <!-- Hero Section with A/B test variant -->
    <HeroSection
      data-section="hero"
      :headline-variant="headlineVariant"
    />

    <!-- Features Grid (Benefits) -->
    <FeaturesGrid data-section="benefits" />

    <!-- Learning Path Section -->
    <LearningPathSection data-section="learning-path" />

    <!-- Homepage Pricing Teaser (Inline 3-card pricing) -->
    <HomepagePricingTeaser data-section="pricing-teaser" />

    <!-- Testimonials Section -->
    <TestimonialsSection data-section="testimonials" />

    <!-- FAQ Section -->
    <FaqSection data-section="faq" />

    <!-- Footer CTA (Final conversion attempt) -->
    <FooterCta data-section="final-cta" />

    <!-- Mobile Sticky Bar (mobile only, scroll-triggered) -->
    <MobileStickyBar />
  </div>
</template>

<style scoped>
.home-page {
  @apply min-h-screen;
}

/* Smooth scrolling for better UX */
.home-page {
  scroll-behavior: smooth;
}

/* Add subtle animations to page sections */
.home-page > * {
  animation: fadeInUp 0.8s ease-out forwards;
}

.home-page > *:nth-child(1) {
  animation-delay: 0.1s;
}
.home-page > *:nth-child(2) {
  animation-delay: 0.2s;
}
.home-page > *:nth-child(3) {
  animation-delay: 0.3s;
}
.home-page > *:nth-child(4) {
  animation-delay: 0.4s;
}
.home-page > *:nth-child(5) {
  animation-delay: 0.5s;
}
.home-page > *:nth-child(6) {
  animation-delay: 0.6s;
}
.home-page > *:nth-child(7) {
  animation-delay: 0.7s;
}
.home-page > *:nth-child(8) {
  animation-delay: 0.8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .home-page {
    scroll-behavior: auto;
  }

  .home-page > * {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
