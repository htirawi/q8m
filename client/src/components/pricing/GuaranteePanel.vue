<template>
  <section class="guarantee-panel" aria-labelledby="guarantee-title">
    <div class="guarantee-panel-container">
      <div class="guarantee-panel-content">
        <div class="guarantee-panel-icon">
          <ShieldCheckIcon class="guarantee-icon" aria-hidden="true" />
        </div>

        <div class="guarantee-panel-text">
          <h2 id="guarantee-title" class="guarantee-panel-title">
            {{ $t(guaranteeData.titleKey) }}
          </h2>
          <p class="guarantee-panel-description">
            {{ $t(guaranteeData.descriptionKey) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheckIcon } from "@heroicons/vue/24/outline";
import { guaranteeData } from "@/components/pricing/pricing.config";

defineOptions({
  name: "GuaranteePanel",
});
</script>

<style scoped>
.guarantee-panel {
  @apply bg-green-50 py-12;
}

.guarantee-panel-container {
  @apply mx-auto max-w-4xl px-4 sm:px-6 lg:px-8;
}

.guarantee-panel-content {
  @apply flex items-center justify-center gap-6;
}

.guarantee-panel-icon {
  @apply flex h-16 w-16 items-center justify-center rounded-full bg-green-100;
}

.guarantee-icon {
  @apply h-8 w-8 text-green-600;
}

.guarantee-panel-text {
  @apply text-center;
}

.guarantee-panel-title {
  @apply text-2xl font-bold text-gray-900;
}

.guarantee-panel-description {
  @apply mt-2 text-lg text-gray-700;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .guarantee-panel-content {
    @apply flex-col;
  }
}

/* RTL Support */
[dir="rtl"] .guarantee-panel-content {
  @apply flex-row-reverse;
}
</style>
