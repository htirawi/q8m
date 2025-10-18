<template>
  <section
    class="social-proof-bar"
    data-testid="social-proof-bar"
    aria-label="Social proof"
  >
    <div class="social-proof-bar__container">
      <!-- User count -->
      <div class="social-proof-bar__message">
        <span class="social-proof-bar__text">
          {{ t('home.socialProof.trustedBy', { count: userCount }) }}

        </span>
      </div>

      <!-- Company logos -->
      <div
        v-if="showLogos"
        class="social-proof-bar__logos"
        role="list"
        aria-label="Companies using our platform"
      >
        <div
          v-for="company in companyLogos"
          :key="company.id"
          class="social-proof-bar__logo-wrapper"
          role="listitem"
          @mouseenter="handleLogoHover(company)"
        >
          <img
            :src="company.logo"
            :alt="company.alt"
            :title="company.name"
            class="social-proof-bar__logo"
            loading="lazy"
            :width="logoWidth"
            :height="logoHeight"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ISocialProofBarProps as Props } from "@/types/components/home";
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHomepageAnalytics } from '@/composables/useHomepageAnalytics';
import type { ISocialProofCompany } from '@/types/homepage';



withDefaults(defineProps<Props>(), {
  userCount: '12,000+',
  showLogos: true,
  logoWidth: 80,
  logoHeight: 32,
});

const { t } = useI18n();
const { trackSocialProofInteraction } = useHomepageAnalytics();

// Company logos (replace with actual logo paths)
const companyLogos = computed<ISocialProofCompany[]>(() => [
  {
    id: 'google',
    name: 'Google',
    logo: '/assets/logos/google.svg',
    alt: 'Google logo',
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '/assets/logos/meta.svg',
    alt: 'Meta logo',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '/assets/logos/amazon.svg',
    alt: 'Amazon logo',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '/assets/logos/microsoft.svg',
    alt: 'Microsoft logo',
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '/assets/logos/apple.svg',
    alt: 'Apple logo',
  },
]);

// Analytics
const handleLogoHover = (company: ISocialProofCompany): void => {
  trackSocialProofInteraction({
    action: 'logo_hover',
    companyId: company.id,
    companyName: company.name,
  });
};

defineOptions({
  name: 'SocialProofBar',
});
</script>

<style scoped>
.social-proof-bar {
  @apply bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50;
  @apply dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
  @apply py-8 border-y border-gray-200 dark:border-gray-700;
}

.social-proof-bar__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  @apply flex flex-col items-center gap-6;
  @apply lg:flex-row lg:justify-between;
}

.social-proof-bar__message {
  @apply text-center lg:text-left;
}

.social-proof-bar__text {
  @apply text-base font-medium text-gray-700 dark:text-gray-300;
  @apply sm:text-lg;
}

.social-proof-bar__logos {
  @apply flex flex-wrap items-center justify-center gap-8;
  @apply lg:justify-end;
}

.social-proof-bar__logo-wrapper {
  @apply flex items-center justify-center;
  @apply transition-transform duration-200 hover:scale-110;
  @apply cursor-pointer;
}

.social-proof-bar__logo {
  @apply h-8 w-auto object-contain;
  @apply opacity-70 grayscale transition-all duration-200;
  @apply hover:opacity-100 hover:grayscale-0;
  @apply dark:brightness-0 dark:invert;
}

/* RTL support */
[dir='rtl'] .social-proof-bar__container {
  @apply lg:flex-row-reverse;
}

[dir='rtl'] .social-proof-bar__message {
  @apply lg:text-right;
}

/* Responsive adjustments */
@media (width <= 640px) {
  .social-proof-bar__logos {
    @apply gap-6;
  }

  .social-proof-bar__logo {
    @apply h-6;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .social-proof-bar__logo-wrapper,
  .social-proof-bar__logo {
    @apply transition-none;
  }
}
</style>
