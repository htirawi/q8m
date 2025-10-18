<script setup lang="ts">
import { computed, ref } from "vue";

import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";

import { useDropdown } from "../../composables/useDropdown";
import { usePaymentStore } from "../../stores/payment";

const { t } = useI18n();
const paymentStore = usePaymentStore();

const currencySwitcherRef = ref<HTMLElement | null>(null);
const { isOpen, toggle, close } = useDropdown(currencySwitcherRef);

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
    close();
    return;
  }

  try {
    paymentStore.setCurrentCurrency(currency);
    await paymentStore.fetchPricing(currency);
    close();
  } catch (error) {
    console.error("Failed to change currency:", error);
  }
};
</script>

<template>
  <div class="currency-switcher" ref="currencySwitcherRef">
    <button
      @click="toggle"
      class="currency-button"
      :class="{ 'currency-button--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-label="$t('currency.selectCurrency')"
    >
      <span class="currency-flag">{{ getCurrencyFlag(currentCurrency) }} </span>
      <span class="currency-code">{{ currentCurrency }}</span>
      <ChevronDownIcon class="currency-chevron" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="currency-dropdown" role="menu" @click.stop>
        <div class="currency-options">
          <button
            v-for="currency in currencies"
            :key="currency.code"
            @click="selectCurrency(currency.code)"
            class="currency-option"
            :class="{ 'currency-option--selected': currency.code === currentCurrency }"
            role="menuitem"
            :aria-label="$t('currency.selectCurrency') + ': ' + currency.name"
          >
            <span class="currency-flag">{{ currency.flag }} </span>
            <div class="currency-info">
              <span class="currency-name">{{ currency.name ?? "" }} </span>
              <span class="currency-code">{{ currency.code }} </span>
            </div>
            <CheckIcon v-if="currency.code === currentCurrency" class="currency-check" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for mobile -->
    <div v-if="isOpen" class="currency-backdrop" @click="close" />
  </div>
</template>

<style scoped>
/* Component-specific styles */
.currency-switcher {
  @apply relative inline-block;
}

.currency-button {
  @apply flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700;
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

/* Dropdown overrides for currency switcher */
.currency-dropdown {
  @apply left-0 mt-1 w-64;
}

.currency-options {
  @apply py-1;
}

.currency-option {
  @apply flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700;
  @apply min-h-[44px];
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

.currency-check {
  @apply h-4 w-4 text-indigo-600 dark:text-indigo-400;
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
</style>
