<script setup lang="ts">
import { useI18n } from "vue-i18n";

useI18n();

</script>

<template>
  <div class="checkout-header">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ $t("checkout.title") }}

    </h2>
    <p class="text-gray-600 dark:text-gray-300">
      {{ $t("checkout.subtitle") }}

    </p>
  </div>
</template>

<style scoped>
.checkout-header {
  @apply mb-8 text-center;
}

.checkout-header h2 {
  @apply mb-2;
}

.checkout-header p {
  @apply text-sm;
}
</style>
