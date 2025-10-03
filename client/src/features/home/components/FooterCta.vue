<template>
  <section class="footer-cta-section" aria-labelledby="cta-title">
    <div class="footer-cta-container">
      <div class="footer-cta-content">
        <h2 id="cta-title" class="footer-cta-title">
          {{ $t('home.cta.title') }}
        </h2>
        <p class="footer-cta-description">
          {{ $t('home.cta.description') }}
        </p>
        <div class="footer-cta-actions">
          <Button
            variant="primary"
            size="lg"
            :to="{ name: 'register' }"
            class="cta-primary"
          >
            {{ $t('home.cta.getStarted') }}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            :to="{ name: 'pricing' }"
            class="cta-secondary"
          >
            {{ $t('home.cta.learnMore') }}
          </Button>
        </div>
        <div class="footer-cta-trust">
          <p class="trust-text">{{ $t('home.cta.trust') }}</p>
          <div class="trust-badges">
            <div class="trust-badge">
              <ShieldCheckIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t('home.cta.secure') }}</span>
            </div>
            <div class="trust-badge">
              <ClockIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t('home.cta.instant') }}</span>
            </div>
            <div class="trust-badge">
              <UserGroupIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t('home.cta.support') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { 
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
</script>

<style scoped>
.footer-cta-section {
  @apply py-16 md:py-24 bg-primary-600 dark:bg-primary-700;
}

.footer-cta-container {
  @apply container mx-auto px-4;
}

.footer-cta-content {
  @apply text-center max-w-4xl mx-auto;
}

.footer-cta-title {
  @apply text-3xl md:text-4xl font-bold text-white mb-6;
}

.footer-cta-description {
  @apply text-lg md:text-xl text-primary-100 mb-8 leading-relaxed;
}

.footer-cta-actions {
  @apply flex flex-col sm:flex-row gap-4 justify-center mb-12;
}

.cta-primary {
  @apply min-h-[44px] px-8;
}

.cta-secondary {
  @apply min-h-[44px] px-8 bg-white text-primary-600 hover:bg-primary-50;
}

.footer-cta-trust {
  @apply space-y-6;
}

.trust-text {
  @apply text-primary-200 text-sm font-medium uppercase tracking-wide;
}

.trust-badges {
  @apply flex flex-wrap justify-center gap-8;
}

.trust-badge {
  @apply flex items-center space-x-2 text-primary-100;
}

.trust-icon {
  @apply w-5 h-5;
}

/* Focus styles */
.cta-primary:focus,
.cta-secondary:focus {
  @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-primary-600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .trust-badges {
    @apply gap-6;
  }
  
  .trust-badge {
    @apply text-sm;
  }
}
</style>
