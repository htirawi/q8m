<script setup lang="ts">
import type { BillingCycle } from "@/types/domain/billing";
import type { BillingToggleEmits, BillingToggleProps } from "@/types/ui/component-props";

defineProps<BillingToggleProps>();
const emit = defineEmits<BillingToggleEmits>();

const setBillingCycle = (cycle: BillingCycle) => {
  emit("update:modelValue", cycle);
};

defineOptions({
  name: "BillingToggle",
});
</script>

<template>
  <div class="billing-toggle" role="group" aria-labelledby="billing-toggle-label">
    <div class="billing-toggle-container">
      <span id="billing-toggle-label" class="billing-toggle-label">
        {{ $t("pricing.billing?.label") }}
      </span>

      <div class="billing-toggle-switch">
        <button
          @click="setBillingCycle('monthly')"
          class="billing-toggle-option"
          :class="{ 'billing-toggle-option--active': modelValue === 'monthly' }"
          :aria-pressed="modelValue === 'monthly'"
          type="button"
        >
          {{ $t("pricing.billing?.monthly") }}
        </button>

        <button
          @click="setBillingCycle('annual')"
          class="billing-toggle-option billing-toggle-option--annual"
          :class="{ 'billing-toggle-option--active': modelValue === 'annual' }"
          :aria-pressed="modelValue === 'annual'"
          type="button"
        >
          {{ $t("pricing.billing?.yearly") }}

          <span v-if="modelValue === 'annual'" class="billing-toggle-save-badge">
            {{ $t("pricing.billing?.savePercent", { percent: 17 }) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.billing-toggle {
  @apply flex justify-center;
}

.billing-toggle-container {
  @apply flex flex-col items-center gap-4;
}

.billing-toggle-label {
  @apply text-sm font-medium text-gray-700;
}

.billing-toggle-switch {
  @apply relative inline-flex rounded-lg bg-gray-100 p-1;
}

.billing-toggle-option {
  @apply relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200;
  @apply text-gray-700 hover:text-gray-900;
  @apply min-h-[44px];
}

.billing-toggle-option--active {
  @apply bg-white text-gray-900 shadow-sm;
}

.billing-toggle-save-badge {
  @apply rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800;
}

/* RTL Support */
[dir="rtl"] .billing-toggle-save-badge {
  @apply ml-0 mr-2;
}
</style>
