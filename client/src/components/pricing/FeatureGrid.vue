<template>
  <section class="feature-grid" aria-labelledby="feature-grid-title">
    <div class="feature-grid-container">
      <div class="feature-grid-header">
        <h2 id="feature-grid-title" class="feature-grid-title">
          {{ $t("pricing.features.title") }}
        </h2>
        <p class="feature-grid-description">
          {{ $t("pricing.features.description") }}
        </p>
      </div>

      <div class="feature-grid-content">
        <div v-for="feature in features" :key="feature.titleKey" class="feature-card">
          <div class="feature-card-icon">
            <component :is="getIconComponent(feature.icon)" class="feature-icon" />
          </div>
          <div class="feature-card-content">
            <h3 class="feature-card-title">
              {{ $t(feature.titleKey) }}
            </h3>
            <p class="feature-card-description">
              {{ $t(feature.descriptionKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  AcademicCapIcon,
  BoltIcon,
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";
import { features } from "./pricing.config";

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    "academic-cap": AcademicCapIcon,
    "lightning-bolt": BoltIcon,
    "chart-bar": ChartBarIcon,
    users: UsersIcon,
    "shield-check": ShieldCheckIcon,
    "device-mobile": DevicePhoneMobileIcon,
  };

  return iconMap[iconName] || AcademicCapIcon;
};

defineOptions({
  name: "FeatureGrid",
});
</script>

<style scoped>
.feature-grid {
  @apply bg-gray-50 py-16 lg:py-24;
}

.feature-grid-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.feature-grid-header {
  @apply text-center;
}

.feature-grid-title {
  @apply text-3xl font-bold text-gray-900;
}

.feature-grid-description {
  @apply mx-auto mt-4 max-w-2xl text-lg text-gray-600;
}

.feature-grid-content {
  @apply mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3;
}

.feature-card {
  @apply rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md;
}

.feature-card-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100;
}

.feature-icon {
  @apply h-6 w-6 text-blue-600;
}

.feature-card-content {
  @apply mt-4;
}

.feature-card-title {
  @apply text-lg font-semibold text-gray-900;
}

.feature-card-description {
  @apply mt-2 text-gray-600;
}

/* RTL Support */
[dir="rtl"] .feature-card-icon {
  @apply ml-4 mr-0;
}
</style>
