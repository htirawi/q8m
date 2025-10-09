<template>
  <div class="home-page">
    <!-- Subscription Banner -->
    <SubscriptionBanner />

    <!-- Hero Section -->
    <HeroSection />

    <!-- Features Grid -->
    <FeaturesGrid />

    <!-- Testimonials Section -->
    <TestimonialsSection />

    <!-- Learning Path Section -->
    <LearningPathSection />

    <!-- Footer CTA -->
    <FooterCta />

    <!-- Design System Demo -->
    <DesignSystemDemo />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import SubscriptionBanner from "@/features/home/components/SubscriptionBanner.vue";
import HeroSection from "@/features/home/components/HeroSection.vue";
import FeaturesGrid from "@/features/home/components/FeaturesGrid.vue";
import TestimonialsSection from "@/features/home/components/TestimonialsSection.vue";
import LearningPathSection from "@/features/home/components/LearningPathSection.vue";
import FooterCta from "@/features/home/components/FooterCta.vue";
import DesignSystemDemo from "@/features/home/components/DesignSystemDemo.vue";

// SEO Meta
useHead({
  title: "q8m - Master Frontend Development Interviews",
  meta: [
    {
      name: "description",
      content:
        "Master frontend development with 500+ curated interview questions. Interactive learning, real-time feedback, and expert-level content for Vue, React, Angular, and more.",
    },
    {
      name: "keywords",
      content:
        "frontend development, interview preparation, Vue.js, React, Angular, JavaScript, TypeScript, quiz platform",
    },
    {
      property: "og:title",
      content: "q8m - Master Frontend Development Interviews",
    },
    {
      property: "og:description",
      content:
        "Master frontend development with 500+ curated interview questions. Interactive learning, real-time feedback, and expert-level content.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
  ],
});
</script>

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
</style>
