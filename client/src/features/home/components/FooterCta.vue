<script setup lang="ts">
import { ClockIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/vue/24/outline";

import Button from "@/components/ui/Button.vue";
</script>

<template>
  <section class="footer-cta-section" aria-labelledby="cta-title">
    <div class="footer-cta-container">
      <div class="footer-cta-content">
        <h2 id="cta-title" class="footer-cta-title">
          {{ $t("home.cta.title") }}

        </h2>
        <p class="footer-cta-description">
          {{ $t("home.cta.description") }}
        </p>
        <div class="footer-cta-actions">
          <Button variant="primary" size="lg" :to="{ name: 'subscribe' }" class="cta-primary">
            {{ $t("home.cta.getStarted") }}
          </Button>
          <Button variant="secondary" size="lg" :to="{ name: 'register' }" class="cta-secondary">
            {{ $t("home.cta.learnMore") }}

          </Button>
        </div>
        <div class="footer-cta-trust">
          <p class="trust-text">{{ $t("home.cta.trust") }}

</p>
          <div class="trust-badges">
            <div class="trust-badge">
              <ShieldCheckIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t("home.cta.secure") }}

 </span>
            </div>
            <div class="trust-badge">
              <ClockIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t("home.cta.instant") }}

 </span>
            </div>
            <div class="trust-badge">
              <UserGroupIcon class="trust-icon" aria-hidden="true" />
              <span>{{ $t("home.cta.support") }}

</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.footer-cta-section {
  @apply bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-20 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 md:py-32;

  position: relative;
  overflow: hidden;
}

.footer-cta-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 70%, rgb(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgb(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.footer-cta-container {
  @apply container mx-auto px-4;

  position: relative;
  z-index: 1;
}

.footer-cta-content {
  @apply mx-auto max-w-5xl text-center;
}

.footer-cta-title {
  @apply mb-8 text-4xl font-bold text-white md:text-5xl lg:text-6xl;

  text-shadow: 0 2px 4px rgb(0, 0, 0, 0.1);
}

.footer-cta-description {
  @apply mb-12 text-xl leading-relaxed text-primary-100 md:text-2xl;
}

.footer-cta-actions {
  @apply mb-16 flex flex-col justify-center gap-6 sm:flex-row;
}

.cta-primary {
  @apply min-h-[56px] px-10 text-lg font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl;
}

.cta-secondary {
  @apply min-h-[56px] bg-white px-10 text-lg font-semibold text-primary-600 shadow-xl transition-all duration-300 hover:bg-primary-50 hover:shadow-2xl;
}

.footer-cta-trust {
  @apply space-y-8;
}

.trust-text {
  @apply text-sm font-semibold uppercase tracking-wider text-primary-200;
}

.trust-badges {
  @apply flex flex-wrap justify-center gap-12;
}

.trust-badge {
  @apply flex items-center space-x-3 text-primary-100 transition-all duration-300 hover:scale-105 hover:text-white;
}

.trust-icon {
  @apply h-6 w-6;
}

/* Focus styles */
.cta-primary:focus,
.cta-secondary:focus {
  @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-primary-600;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .trust-badges {
    @apply gap-8;
  }

  .trust-badge {
    @apply text-sm;
  }

  .footer-cta-title {
    @apply text-3xl;
  }

  .footer-cta-description {
    @apply text-lg;
  }
}

/* Animation */
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

.footer-cta-content > * {
  animation: fadeInUp 0.6s ease-out forwards;
}

.footer-cta-content > *:nth-child(1) {
  animation-delay: 0.1s;
}

.footer-cta-content > *:nth-child(2) {
  animation-delay: 0.2s;
}

.footer-cta-content > *:nth-child(3) {
  animation-delay: 0.3s;
}

.footer-cta-content > *:nth-child(4) {
  animation-delay: 0.4s;
}
</style>
