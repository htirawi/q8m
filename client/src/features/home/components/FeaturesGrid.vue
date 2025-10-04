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
          <p class="feature-description">
            {{ $t(feature.descriptionKey) }}

          </p>
        </Card>
      </div>
    </div>
  </section>
</template>

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

<style scoped>
.features-section {
  @apply bg-white py-16 dark:bg-gray-900 md:py-24;
}

.features-container {
  @apply container mx-auto px-4;
}

.features-header {
  @apply mb-16 text-center;
}

.features-title {
  @apply mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl;
}

.features-description {
  @apply mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300;
}

.features-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

.feature-card {
  @apply h-full transition-transform duration-200 hover:scale-105;
}

.feature-icon {
  @apply mb-4;
}

.feature-title {
  @apply mb-3 text-xl font-semibold text-gray-900 dark:text-white;
}

.feature-description {
  @apply leading-relaxed text-gray-600 dark:text-gray-300;
}

/* Focus styles */
.feature-card:focus-within {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .features-grid {
    @apply gap-6;
  }

  .feature-card {
    @apply hover:scale-100;
  }
}
</style>
