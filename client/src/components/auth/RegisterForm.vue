<script setup lang="ts">
import { ref, computed, reactive } from "vue";

import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import FormDivider from "@/components/ui/FormDivider.vue";
import { useFormValidation } from "@/composables/useFormValidation";
import EmailStep from "@/features/auth/components/EmailStep.vue";
import OAuthButtons from "@/features/auth/components/OAuthButtons.vue";
import ProfileStep from "@/features/auth/components/ProfileStep.vue";
import { useAuthStore } from "@/stores/auth";
import type { RegisterFormData, FormErrors } from "@/types/ui/component-props";

useI18n();
const authStore = useAuthStore();
const route = useRoute();
const { validateEmail, validateName, validatePassword, validateAcceptance } = useFormValidation();

// Emits
const emit = defineEmits<{
  "oauth-login": [provider: "google"];
  "registration-success": [email: string];
}>();

// Progressive form state
const currentStep = ref(1);

// Reactive data
const formData = reactive<RegisterFormData>({
  email: "",
  name: "",
  password: "",
  acceptTerms: false,
});

const errors = ref<FormErrors>({});

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

// Generate login route with locale preservation
const loginRoute = computed(() => {
  const locale = route.params.locale || "en";
  return {
    name: "login",
    params: { locale },
  };
});

// Methods
const handleOAuthLogin = (provider: "google") => {
  emit("oauth-login", provider);
};

function proceedToStep2() {
  currentStep.value = 2;
  errors.value = {};
}

function goBackToStep1() {
  currentStep.value = 1;
  errors.value = {};
}

function validateForm(): boolean {
  errors.value = {};

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.value.email = emailError;
  }

  const nameError = validateName(formData.name);
  if (nameError) {
    errors.value.name = nameError;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.value.password = passwordError;
  }

  const acceptTermsError = validateAcceptance(formData.acceptTerms, "acceptTerms");
  if (acceptTermsError) {
    errors.value.acceptTerms = acceptTermsError;
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return;
  }

  const success = await authStore.register({
    name: formData.name.trim(),
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.password,
    acceptTerms: formData.acceptTerms,
  });

  if (success) {
    // Emit success event with email for verification
    emit("registration-success", formData.email);

    // Reset form
    formData.email = "";
    formData.name = "";
    formData.password = "";
    formData.acceptTerms = false;
    errors.value = {};
    currentStep.value = 1;
  }
}
</script>

<template>
  <div class="register-form">
    <!-- OAuth Buttons (Top) -->
    <OAuthButtons :is-loading="isLoading" @oauth-login="handleOAuthLogin" />

    <!-- Divider -->
    <FormDivider>{{ $t("auth.register.or") }}</FormDivider>

    <!-- Progressive Form -->
    <form @submit.prevent="handleSubmit" class="progressive-form">
      <!-- Step 1: Email Only -->
      <EmailStep v-if="currentStep === 1" v-model:email="formData.email" :is-loading="isLoading"
        @continue="proceedToStep2" />

      <!-- Step 2: Additional Fields -->
      <ProfileStep v-if="currentStep === 2" v-model:name="formData.name" v-model:password="formData.password"
        v-model:accept-terms="formData.acceptTerms" :name-error="errors.name" :password-error="errors.password"
        :terms-error="errors.acceptTerms" :is-loading="isLoading" @back="goBackToStep1" />

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        {{ error }}
      </div>
    </form>

    <!-- Sign In Link -->
    <div class="signin-link">
      <p class="signin-text">
        {{ $t("auth.register.alreadyHaveAccount") }}
        <router-link :to="loginRoute" class="signin-button">
          {{ $t("auth.register.signIn") }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Form Container */
.register-form {
  @apply w-full space-y-6;
}

/* Progressive Form */
.progressive-form {
  @apply space-y-6;
}

/* Error Message */
.error-message {
  @apply flex items-center gap-3 rounded-xl p-4;
  @apply border border-red-200 bg-red-50 text-red-700;
  @apply dark:border-red-800 dark:bg-red-900/20 dark:text-red-400;
}

.error-icon {
  @apply h-5 w-5 flex-shrink-0;
}

/* Sign In Link */
.signin-link {
  @apply mt-8 text-center;
}

.signin-text {
  @apply text-sm text-gray-600;
  @apply dark:text-gray-400;
}

.signin-button {
  @apply font-semibold text-primary-600 hover:text-primary-700;
  @apply transition-colors duration-200;
  @apply dark:text-primary-400 dark:hover:text-primary-300;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply underline decoration-transparent hover:decoration-current;
}
</style>
