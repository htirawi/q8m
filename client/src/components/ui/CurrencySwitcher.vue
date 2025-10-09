<template>
  <div class="currency-switcher">
    <button
      @click="isOpen = !isOpen"
      class="currency-button"
      :class="{ 'currency-button--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-label="$t('currency.selectCurrency')"
    >
      <span class="currency-flag">{{ getCurrencyFlag(currentCurrency) }}

</span>
      <span class="currency-code">{{ currentCurrency }}</span>
      <ChevronDownIcon class="currency-chevron" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="currency-dropdown" @click.stop>
        <div class="currency-options">
          <button
            v-for="currency in currencies"
            :key="currency.code"
            @click="selectCurrency(currency.code)"
            class="currency-option"
            :class="{ 'currency-option--selected': currency.code === currentCurrency }"
          >
            <span class="currency-flag">{{ currency.flag }}

</span>
            <div class="currency-info">
              <span class="currency-name">{{ currency.name }}

</span>
              <span class="currency-code">{{ currency.code }}

</span>
            </div>
            <CheckIcon v-if="currency.code === currentCurrency" class="currency-check" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for mobile -->
    <div v-if="isOpen" class="currency-backdrop" @click="isOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChevronDownIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { usePaymentStore } from "@/stores/payment";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const paymentStore = usePaymentStore();

// State
const isOpen = ref(false);

// Computed
const currentCurrency = computed(() => paymentStore.currentCurrency);

const currencies = computed(() => [
  {
    code: "USD" as const,
    name: t("currency.usd"),
    flag: "🇺🇸",
  },
  {
    code: "JOD" as const,
    name: t("currency.jod"),
    flag: "🇯🇴",
  },
  {
    code: "SAR" as const,
    name: t("currency.sar"),
    flag: "🇸🇦",
  },
]);

// Methods
const getCurrencyFlag = (currency: string) => {
  const currencyMap: Record<string, string> = {
    USD: "🇺🇸",
    JOD: "🇯🇴",
    SAR: "🇸🇦",
  };
  return currencyMap[currency] || "💱";
};

const selectCurrency = async (currency: "USD" | "JOD" | "SAR") => {
  if (currency === currentCurrency.value) {
    isOpen.value = false;
    return;
  }

  try {
    paymentStore.setCurrentCurrency(currency);
    await paymentStore.fetchPricing(currency);
    isOpen.value = false;
  } catch (error) {
    console.error("Failed to change currency:", error);
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".currency-switcher")) {
    isOpen.value = false;
  }
};

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.currency-switcher {
  @apply relative inline-block;
}

.currency-button {
  @apply flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700;
}

.currency-button--open {
  @apply border-indigo-500 ring-2 ring-indigo-500;
}

.currency-flag {
  @apply text-lg;
}

.currency-code {
  @apply text-sm font-medium text-gray-900 dark:text-gray-100;
}

.currency-chevron {
  @apply h-4 w-4 text-gray-400 transition-transform duration-200;
}

.rotate-180 {
  @apply rotate-180;
}

.currency-dropdown {
  @apply absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800;
}

.currency-options {
  @apply py-1;
}

.currency-option {
  @apply flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700;
}

.currency-option--selected {
  @apply bg-indigo-50 dark:bg-indigo-900/20;
}

.currency-info {
  @apply flex flex-1 flex-col;
}

.currency-name {
  @apply text-sm font-medium text-gray-900 dark:text-gray-100;
}

.currency-code {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.currency-check {
  @apply h-4 w-4 text-indigo-600 dark:text-indigo-400;
}

.currency-backdrop {
  @apply fixed inset-0 z-40 bg-black bg-opacity-25;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-200 ease-out;
}

.dropdown-enter-from {
  @apply translate-y-[-8px] scale-95 opacity-0;
}

.dropdown-leave-to {
  @apply translate-y-[-8px] scale-95 opacity-0;
}

.dropdown-enter-to,
.dropdown-leave-from {
  @apply translate-y-0 scale-100 opacity-100;
}

/* Mobile responsiveness */
@media (width <= 640px) {
  .currency-dropdown {
    @apply w-56;
  }
}

/* RTL Support */
[dir="rtl"] .currency-switcher {
  @apply text-right;
}

[dir="rtl"] .currency-dropdown {
  @apply left-auto right-0;
}

[dir="rtl"] .currency-option {
  @apply text-right;
}

[dir="rtl"] .currency-info {
  @apply items-end;
}

/* Focus styles for accessibility */
.currency-button:focus-visible {
  @apply outline-none ring-2 ring-indigo-500 ring-offset-2;
}

.currency-option:focus-visible {
  @apply outline-none ring-2 ring-inset ring-indigo-500;
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .currency-button {
    @apply border-gray-600 bg-gray-800 text-gray-100;
  }

  .currency-button:hover {
    @apply bg-gray-700;
  }

  .currency-dropdown {
    @apply border-gray-600 bg-gray-800;
  }

  .currency-option:hover {
    @apply bg-gray-700;
  }
}
</style>
