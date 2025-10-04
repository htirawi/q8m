<template>
  <div class="home-page">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Features Grid -->
    <FeaturesGrid />

    <!-- Pricing Teaser -->
    <PricingTeaser />

    <!-- Footer CTA -->
    <FooterCta />

    <!-- Design System Demo -->
    <DesignSystemDemo />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import HeroSection from "../components/HeroSection.vue";
import FeaturesGrid from "../components/FeaturesGrid.vue";
import PricingTeaser from "../components/PricingTeaser.vue";
import FooterCta from "../components/FooterCta.vue";
import DesignSystemDemo from "../components/DesignSystemDemo.vue";

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
</style>
