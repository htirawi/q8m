<template>
  <div class="form-section">
    <h3 class="section-title">{{ $t("checkout.billingInformation") }}</h3>

    <div class="form-grid">
      <!-- Name -->
      <div class="form-group">
        <label for="name" class="form-label"> {{ $t("checkout.fullName") }} * </label>
        <input id="name" v-model="formData.name" type="text" required class="form-input"
          :class="{ 'form-input--error': errors.name }" :placeholder="$t('checkout.namePlaceholder')" />
        <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label"> {{ $t("checkout.email") }} * </label>
        <input id="email" v-model="formData.email" type="email" required class="form-input"
          :class="{ 'form-input--error': errors.email }" :placeholder="$t('checkout.emailPlaceholder')" />
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <!-- Street Address -->
      <div class="form-group">
        <label for="street" class="form-label"> {{ $t("checkout.streetAddress") }} * </label>
        <input id="street" v-model="formData.street" type="text" required class="form-input"
          :class="{ 'form-input--error': errors.street }" :placeholder="$t('checkout.streetPlaceholder')" />
        <p v-if="errors.street" class="form-error">{{ errors.street }}</p>
      </div>

      <!-- City -->
      <div class="form-group">
        <label for="city" class="form-label"> {{ $t("checkout.city") }} * </label>
        <input id="city" v-model="formData.city" type="text" required class="form-input"
          :class="{ 'form-input--error': errors.city }" :placeholder="$t('checkout.cityPlaceholder')" />
        <p v-if="errors.city" class="form-error">{{ errors.city }}</p>
      </div>

      <!-- State/Province -->
      <div class="form-group">
        <label for="state" class="form-label"> {{ $t("checkout.state") }} * </label>
        <input id="state" v-model="formData.state" type="text" required class="form-input"
          :class="{ 'form-input--error': errors.state }" :placeholder="$t('checkout.statePlaceholder')" />
        <p v-if="errors.state" class="form-error">{{ errors.state }}</p>
      </div>

      <!-- Postal Code -->
      <div class="form-group">
        <label for="postalCode" class="form-label"> {{ $t("checkout.postalCode") }} * </label>
        <input id="postalCode" v-model="formData.postalCode" type="text" required class="form-input"
          :class="{ 'form-input--error': errors.postalCode }" :placeholder="$t('checkout.postalCodePlaceholder')" />
        <p v-if="errors.postalCode" class="form-error">{{ errors.postalCode }}</p>
      </div>

      <!-- Country -->
      <div class="form-group">
        <label for="country" class="form-label"> {{ $t("checkout.country") }} * </label>
        <select id="country" v-model="formData.country" required class="form-input"
          :class="{ 'form-input--error': errors.country }">
          <option value="">{{ $t("checkout.selectCountry") }}</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="ES">Spain</option>
          <option value="IT">Italy</option>
          <option value="NL">Netherlands</option>
          <option value="AU">Australia</option>
          <option value="JP">Japan</option>
          <option value="KR">South Korea</option>
          <option value="CN">China</option>
          <option value="IN">India</option>
          <option value="BR">Brazil</option>
          <option value="MX">Mexico</option>
          <option value="AR">Argentina</option>
          <option value="SA">Saudi Arabia</option>
          <option value="AE">United Arab Emirates</option>
          <option value="JO">Jordan</option>
          <option value="EG">Egypt</option>
          <option value="ZA">South Africa</option>
        </select>
        <p v-if="errors.country" class="form-error">{{ errors.country }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import type { BillingFormProps, BillingFormData } from "@/types/ui/component-props";

const props = defineProps<BillingFormProps>();

const emit = defineEmits<{
  "update:modelValue": [value: BillingFormData];
}>();

useI18n();

// Destructure props with proper reactivity
const { modelValue } = toRefs(props);

const formData = reactive({ ...modelValue.value });

watch(
  formData,
  (newValue) => {
    emit("update:modelValue", { ...newValue });
  },
  { deep: true }
);

watch(
  modelValue,
  (newValue) => {
    Object.assign(formData, newValue);
  },
  { deep: true }
);
</script>

<style scoped>
.form-section {
  @apply mb-8;
}

.section-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.form-grid {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500;
}

.form-input--error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

.form-error {
  @apply text-sm text-red-600 dark:text-red-400;
}
</style>
