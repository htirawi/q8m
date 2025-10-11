<template>
  <div class="form-section">
    <h3 class="section-title">{{ $t("checkout.paymentMethod") }}</h3>

    <div class="payment-methods">
      <div v-for="method in availableMethods" :key="method.id" class="payment-method"
        :class="{ 'payment-method--selected': selectedMethod === method.id }" @click="selectMethod(method.id)">
        <div class="payment-method-content">
          <div class="payment-method-icon">
            <component :is="method.icon" class="h-8 w-8" />
          </div>
          <div class="payment-method-info">
            <h4 class="payment-method-name">{{ method.name }}

            </h4>
            <p class="payment-method-description">{{ method.description }}

            </p>
          </div>
          <div class="payment-method-radio">
            <input :id="method.id" v-model="selectedMethod" type="radio" :value="method.id" class="radio-input" />
            <span class="radio-checkmark" />
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method Specific Content -->
    <div v-if="selectedMethod" class="payment-method-details">
      <div v-if="selectedMethod === 'paypal'" class="paypal-info">
        <div class="info-box">
          <CheckCircleIcon class="h-5 w-5 text-green-500" />
          <p>{{ $t("checkout.paypalInfo") }}

          </p>
        </div>
      </div>

      <div v-if="selectedMethod === 'aps'" class="aps-info">
        <div class="info-box">
          <CheckCircleIcon class="h-5 w-5 text-green-500" />
          <p>{{ $t("checkout.apsInfo") }}

          </p>
        </div>
      </div>

      <div v-if="selectedMethod === 'hyperpay'" class="hyperpay-info">
        <div class="info-box">
          <CheckCircleIcon class="h-5 w-5 text-green-500" />
          <p>{{ $t("checkout.hyperpayInfo") }}

          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";
import type { PaymentMethodSelectorProps, PaymentMethod } from "@/types/ui/component-props";

const props = defineProps<PaymentMethodSelectorProps>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();

const selectedMethod = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const availableMethods = computed((): PaymentMethod[] => {
  const methods: PaymentMethod[] = [
    {
      id: "paypal",
      name: "PayPal",
      description: t("checkout.paypalDescription"),
      icon: "div", // Replace with actual PayPal icon
      available: true,
    },
    {
      id: "aps",
      name: "Amazon Payment Services",
      description: t("checkout.apsDescription"),
      icon: "div", // Replace with actual APS icon
      available: true,
    },
    {
      id: "hyperpay",
      name: "HyperPay",
      description: t("checkout.hyperpayDescription"),
      icon: "div", // Replace with actual HyperPay icon
      available: true,
    },
  ];

  return methods.filter((method) => method.available);
});

const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId;
};

</script>

<style scoped>
.form-section {
  @apply mb-8;
}

.section-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.payment-methods {
  @apply space-y-3;
}

.payment-method {
  @apply cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600;
}

.payment-method--selected {
  @apply border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20;
}

.payment-method-content {
  @apply flex items-center gap-4;
}

.payment-method-icon {
  @apply flex-shrink-0;
}

.payment-method-info {
  @apply flex-1;
}

.payment-method-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.payment-method-description {
  @apply text-xs text-gray-600 dark:text-gray-300;
}

.payment-method-radio {
  @apply flex-shrink-0;
}

.radio-input {
  @apply sr-only;
}

.radio-checkmark {
  @apply block h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600;
}

.payment-method--selected .radio-checkmark {
  @apply border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400;
}

.payment-method--selected .radio-checkmark::after {
  @apply absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white;

  content: "";
}

.payment-method-details {
  @apply mt-4;
}

.info-box {
  @apply flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20;
}

.info-box p {
  @apply text-sm text-green-800 dark:text-green-200;
}
</style>
