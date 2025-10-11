<script setup lang="ts">
import { computed } from "vue";

import Card from "@/components/ui/Card.vue";
import {
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";

const features = computed(() => [
  {
    id: "comprehensive",
    icon: AcademicCapIcon,
    titleKey: "home.features.comprehensive.title",
    descriptionKey: "home.features.comprehensive.description",
  },
  {
    id: "interactive",
    icon: ClockIcon,
    titleKey: "home.features.interactive.title",
    descriptionKey: "home.features.interactive.description",
  },
  {
    id: "analytics",
    icon: ChartBarIcon,
    titleKey: "home.features.analytics.title",
    descriptionKey: "home.features.analytics.description",
  },
  {
    id: "community",
    icon: UserGroupIcon,
    titleKey: "home.features.community.title",
    descriptionKey: "home.features.community.description",
  },
  {
    id: "secure",
    icon: ShieldCheckIcon,
    titleKey: "home.features.secure.title",
    descriptionKey: "home.features.secure.description",
  },
  {
    id: "mobile",
    icon: DevicePhoneMobileIcon,
    titleKey: "home.features.mobile.title",
    descriptionKey: "home.features.mobile.description",
  },
]);
</script>

<template>
  <section class="features-section" aria-labelledby="features-title">
    <div class="features-container">
      <div class="features-header">
        <h2 id="features-title" class="features-title">
          {{ $t("home.features.title") }}
        </h2>
        <p class="features-description">
          {{ $t("home.features.description") }}
        </p>
      </div>

      <div class="features-grid">
        <Card
          v-for="feature in features"
          :key="feature.id"
          class="feature-card"
          :aria-labelledby="`feature-${feature.id}-title`"
        >
          <template #header>
            <div class="feature-icon" :aria-hidden="true">
              <component
                :is="feature.icon"
                class="h-8 w-8 text-primary-600 dark:text-primary-400"
              />
            </div>
            <h3 :id="`feature-${feature.id}-title`" class="feature-title">
              {{ $t(feature.titleKey) }}
            </h3>
          </template>

          <template #default>
            <p class="feature-description">
              {{ $t(feature.descriptionKey) }}
            </p>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  @apply bg-gradient-to-b from-white to-slate-50 py-20 dark:from-slate-900 dark:to-slate-800 md:py-32;
}

.features-container {
  @apply container mx-auto px-4;
}

.features-header {
  @apply mb-20 text-center;
}

.features-title {
  @apply mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .features-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-description {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.features-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

.feature-card {
  @apply h-full transition-all duration-300 hover:scale-105 hover:shadow-xl;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 2rem;
}

.dark .feature-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.8);
}

.feature-icon {
  @apply mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30;
}

.feature-title {
  @apply mb-4 text-2xl font-bold text-slate-900 dark:text-white;
}

.feature-description {
  @apply leading-relaxed text-slate-600 dark:text-slate-300;
}

/* Focus styles */
.feature-card:focus-within {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .features-grid {
    @apply gap-6;
  }

  .feature-card {
    @apply hover:scale-100;
  }

  .features-title {
    @apply text-3xl;
  }

  .features-description {
    @apply text-lg;
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

.feature-card {
  animation: slideInUp 0.6s ease-out forwards;
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}
.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}
.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}
.feature-card:nth-child(4) {
  animation-delay: 0.4s;
}
.feature-card:nth-child(5) {
  animation-delay: 0.5s;
}
.feature-card:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
