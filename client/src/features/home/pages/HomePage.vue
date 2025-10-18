<script setup lang="ts">
import { onMounted } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useABTest } from "../../../composables/useABTest";
import { useScrollTracking } from "../../../composables/useScrollTracking";
import { useHomepageAnalytics } from "../../../composables/useHomepageAnalytics";
import { useSEO } from "../../../composables/useSEO";
import { HOMEPAGE_FAQS } from "@/data/home";
import HeroSection from "../../../features/home/components/HeroSection.vue";
import HomeCredibility from "../../../features/home/components/HomeCredibility.vue";
import FeaturesGrid from "../../../features/home/components/FeaturesGrid.vue";
import HomeHowItWorks from "../../../features/home/components/HomeHowItWorks.vue";
import HomepagePricingTeaser from "../../../features/home/components/HomepagePricingTeaser.vue";
import TestimonialsSection from "../../../features/home/components/TestimonialsSection.vue";
import FaqSection from "../../../features/home/components/FaqSection.vue";
import FooterCta from "../../../features/home/components/FooterCta.vue";
import MobileStickyBar from "../../../features/home/components/MobileStickyBar.vue";

const route = useRoute();
const { t, locale } = useI18n();

// A/B Test: Hero headline variants
const { variant: headlineVariant, trackAssignment: trackHeadlineAssignment } = useABTest({
  testId: "homepage_hero_headline_v1",
  variants: ["control", "variant_a", "variant_b"],
  weights: [0.34, 0.33, 0.33],
});

// Scroll tracking (enables milestone analytics)
useScrollTracking({
  milestones: [25, 50, 75, 100],
  debounceMs: 100,
});

// Homepage analytics
const { setupSectionObserver } = useHomepageAnalytics();

// SEO with structured data
const {
  generateWebSiteStructuredData,
  generateOrganizationStructuredData,
  generateFAQPageStructuredData,
} = useSEO();

// Lifecycle
onMounted(() => {
  // Track A/B test assignment
  trackHeadlineAssignment?.();

  // Setup section view tracking
  setupSectionObserver?.();

  // Add structured data
  if (typeof document !== "undefined") {
    // WebSite schema
    const websiteSchema = generateWebSiteStructuredData();
    addStructuredData(websiteSchema, "website-schema");

    // Organization schema
    const orgSchema = generateOrganizationStructuredData();
    addStructuredData(orgSchema, "organization-schema");

    // FAQPage schema
    const faqSchema = generateFAQPageStructuredData(
      HOMEPAGE_FAQS.map((faq) => ({
        question: t(faq.qKey),
        answer: t(faq.aKey),
      }))
    );
    addStructuredData(faqSchema, "faq-schema");
  }
});

const addStructuredData = (data: object, id: string): void => {
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// SEO Meta
const currentLocale = (route.params.locale as string) || locale.value;
const canonicalUrl = `https://q8m.com/${currentLocale}`;

useHead({
  title: t("home.meta.title"),
  meta: [
    {
      name: "description",
      content: t("home.meta.description"),
    },
    {
      name: "keywords",
      content: t("home.meta.keywords"),
    },
    {
      property: "og:title",
      content: t("home.meta.ogTitle"),
    },
    {
      property: "og:description",
      content: t("home.meta.ogDescription"),
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: canonicalUrl,
    },
    {
      property: "og:locale",
      content: currentLocale === "ar" ? "ar_SA" : "en_US",
    },
    {
      property: "og:image",
      content: "https://q8m.com/images/og-home.jpg",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: t("home.meta.ogTitle"),
    },
    {
      name: "twitter:description",
      content: t("home.meta.ogDescription"),
    },
    {
      name: "twitter:image",
      content: "https://q8m.com/images/og-home.jpg",
    },
  ],
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
    {
      rel: "alternate",
      hreflang: "en",
      href: "https://q8m.com/en",
    },
    {
      rel: "alternate",
      hreflang: "ar",
      href: "https://q8m.com/ar",
    },
    {
      rel: "alternate",
      hreflang: "x-default",
      href: "https://q8m.com/en",
    },
    // Preload critical resources for LCP optimization
    {
      rel: "preload",
      as: "font",
      href: "/fonts/inter-var.woff2",
      type: "font/woff2",
      crossorigin: "anonymous",
    },
  ],
});
</script>

<template>
  <!-- Skip to main content link (a11y) -->
  <a href="#main-content" class="skip-to-main">
    {{ $t("a11y.skipToMain") }}
  </a>

  <main id="main-content" class="home-page">
    <!-- Hero Section with A/B test variant -->
    <HeroSection
      data-section="hero"
      :headline-variant="headlineVariant as 'control' | 'variant_a' | 'variant_b'"
    />

    <!-- Credibility / Trust Badges -->
    <HomeCredibility data-section="credibility" />

    <!-- Features Grid (Value Propositions) -->
    <FeaturesGrid data-section="features" />

    <!-- How It Works (3-step process) -->
    <HomeHowItWorks data-section="how-it-works" />

    <!-- Homepage Pricing Teaser (3-tier cards) -->
    <HomepagePricingTeaser data-section="pricing-teaser" />

    <!-- Testimonials Section (Social Proof) -->
    <TestimonialsSection data-section="testimonials" />

    <!-- FAQ Section (Objection Handling) -->
    <FaqSection data-section="faq" />

    <!-- Footer CTA (Final conversion attempt) -->
    <FooterCta data-section="final-cta" />

    <!-- Mobile Sticky Bar (mobile only, scroll-triggered) -->
    <MobileStickyBar />
  </main>
</template>

<style scoped>
/* Skip to main content (a11y) */
.skip-to-main {
  @apply sr-only focus:not-sr-only;
  @apply fixed left-4 top-4 z-[9999];
  @apply rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white;
  @apply focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-600;
}

.home-page {
  @apply min-h-screen bg-white dark:bg-slate-900;
}

/* Smooth scrolling for better UX */
.home-page {
  scroll-behavior: smooth;
}

/* Add subtle animations to page sections */
.home-page > * {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.home-page > *:nth-child(1) {
  animation-delay: 0.05s;
}

.home-page > *:nth-child(2) {
  animation-delay: 0.1s;
}

.home-page > *:nth-child(3) {
  animation-delay: 0.15s;
}

.home-page > *:nth-child(4) {
  animation-delay: 0.2s;
}

.home-page > *:nth-child(5) {
  animation-delay: 0.25s;
}

.home-page > *:nth-child(6) {
  animation-delay: 0.3s;
}

.home-page > *:nth-child(7) {
  animation-delay: 0.35s;
}

.home-page > *:nth-child(8) {
  animation-delay: 0.4s;
}

.home-page > *:nth-child(9) {
  animation-delay: 0.45s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
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

/* Performance: Contain layout shifts */
.home-page > * {
  contain: layout style paint;
}
</style>
