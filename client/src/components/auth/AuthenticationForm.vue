<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from "vue";

import { useI18n } from "vue-i18n";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import { ZodError } from "zod";

import { useAuthStore } from "@/stores/auth";
import {
  emailStepSchema,
  loginFormSchema,
  registerFormSchema,
  passwordSchema,
  nameSchema,
} from "@/schemas/auth";
import type {
  AuthenticationFormData,
  FormErrors,
  AuthenticationFormEmits,
  PasswordRequirements,
  PasswordStrength,
} from "@/types/ui/component-props";

const emit = defineEmits<AuthenticationFormEmits>();
const { t } = useI18n();
const authStore = useAuthStore();

// Reactive data
const formData = reactive<AuthenticationFormData>({
  email: "",
  name: "",
  password: "",
  acceptTerms: false,
});

const errors = ref<FormErrors>({});
const showPassword = ref(false);
const emailConfirmed = ref(false);
const emailFocused = ref(false);
const authMode = ref<"login" | "register" | null>(null);
const isCheckingEmail = ref(false);
const passwordStrength = ref<PasswordStrength>({
  score: 0,
  level: "weak",
  text: "",
});

// Password requirements tracking
const passwordRequirements = reactive<PasswordRequirements>({
  minLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasNumber: false,
});

// Template refs for auto-focus
const passwordInputRef = ref<HTMLInputElement | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);

// Debounce timer for email validation
let emailValidationTimer: NodeJS.Timeout | null = null;

// Watch for mode changes and auto-focus the first field
watch([emailConfirmed, authMode], async ([confirmed, mode]) => {
  if (confirmed && mode) {
    await nextTick();
    if (mode === "login" && passwordInputRef.value) {
      passwordInputRef.value.focus();
    } else if (mode === "register" && nameInputRef.value) {
      nameInputRef.value.focus();
    }
  }
});

// Watch for terms checkbox changes
watch(
  () => formData.acceptTerms,
  (accepted) => {
    if (errors.value.acceptTerms && accepted) {
      errors.value.acceptTerms = undefined;
    }
  }
);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

const getButtonText = computed(() => {
  if (!emailConfirmed.value) {
    return t("auth.unified.continue");
  }
  return authMode.value === "login" ? t("auth.unified.signIn") : t("auth.unified.signUp");
});

const getLoadingText = computed(() => {
  if (isCheckingEmail.value) {
    return t("auth.unified.checking");
  }
  if (authMode.value === "login") {
    return t("auth.unified.signingIn");
  }
  return t("auth.unified.creatingAccount");
});

// Methods
const handleOAuthLogin = (provider: "google") => {
  emit("oauth-login", provider);
};

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (!password) return { score: 0, level: "weak", text: "" };

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  let level = "weak";
  let text = t("auth.validation.passwordStrength.weak");

  if (score >= 3) {
    level = "medium";
    text = t("auth.validation.passwordStrength.medium");
  }
  if (score >= 4) {
    level = "strong";
    text = t("auth.validation.passwordStrength.strong");
  }

  return { score, level, text };
}

function updatePasswordStrength() {
  passwordStrength.value = calculatePasswordStrength(formData.password);
}

// Real-time validation handlers
function handleEmailInput() {
  // Clear any existing timer
  if (emailValidationTimer) {
    clearTimeout(emailValidationTimer);
  }

  // Clear error if email is empty
  if (!formData.email) {
    errors.value.email = undefined;
    return;
  }

  // Validate email format in real-time
  try {
    emailStepSchema.parse({ email: formData.email });
    errors.value.email = undefined;
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      if (firstError) {
        errors.value.email = t(firstError.message);
      }
    }
  }
}

function handleNameInput() {
  // Clear error if name is empty
  if (!formData.name) {
    errors.value.name = undefined;
    return;
  }

  // Validate name in real-time
  try {
    nameSchema.parse(formData.name);
    errors.value.name = undefined;
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      if (firstError) {
        errors.value.name = t(firstError.message);
      }
    }
  }
}

function handlePasswordInput() {
  // Update password requirements
  passwordRequirements.minLength = formData.password.length >= 8;
  passwordRequirements.hasUppercase = /[A-Z]/.test(formData.password);
  passwordRequirements.hasLowercase = /[a-z]/.test(formData.password);
  passwordRequirements.hasNumber = /[0-9]/.test(formData.password);

  // Update password strength for display
  updatePasswordStrength();

  // Clear error if password is empty
  if (!formData.password) {
    errors.value.password = undefined;
    return;
  }

  // Validate password in real-time
  try {
    passwordSchema.parse(formData.password);
    errors.value.password = undefined;
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      if (firstError) {
        errors.value.password = t(firstError.message);
      }
    }
  }
}

function validateEmail(): boolean {
  errors.value.email = undefined;
  try {
    emailStepSchema.parse({ email: formData.email });
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      if (firstError) {
        errors.value.email = t(firstError.message);
      }
    }
    return false;
  }
}

function handleEmailBlur() {
  emailFocused.value = false;
  if (formData.email && !emailConfirmed.value) {
    validateEmail();
  }
}

async function checkEmailExists(email: string): Promise<boolean> {
  isCheckingEmail.value = true;
  try {
    const response = await authStore.checkEmailExists(email);
    return response;
  } catch (err) {
    console.warn("Email check endpoint not implemented, using mock");
    return false;
  } finally {
    isCheckingEmail.value = false;
  }
}

async function handleEmailStep() {
  if (!validateEmail()) {
    return;
  }

  const emailExists = await checkEmailExists(formData.email);

  emailConfirmed.value = true;
  authMode.value = emailExists ? "login" : "register";
  emailExists;

  formData.password = "";
  formData.name = "";
  formData.acceptTerms = false;
  errors.value = {};
}

function resetEmailStep() {
  emailConfirmed.value = false;
  authMode.value = null;
  formData.password = "";
  formData.name = "";
  formData.acceptTerms = false;
  errors.value = {};
}

function validateLoginForm(): boolean {
  errors.value = {};

  try {
    loginFormSchema.parse({
      email: formData.email,
      password: formData.password,
    });
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (field && !errors.value[field]) {
          errors.value[field] = t(err.message);
        }
      });
    }
    return false;
  }
}

function validateRegisterForm(): boolean {
  errors.value = {};

  try {
    registerFormSchema.parse({
      email: formData.email,
      name: formData.name,
      password: formData.password,
      acceptTerms: formData.acceptTerms,
    });
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (field && !errors.value[field]) {
          errors.value[field] = t(err.message);
        }
      });
    }
    return false;
  }
}

async function handleLoginSubmit(): Promise<void> {
  if (!validateLoginForm()) {
    return;
  }

  const success = await authStore.login({
    email: formData.email,
    password: formData.password,
  });

  if (success) {
    emit("login-success");
    formData.email = "";
    formData.password = "";
    emailConfirmed.value = false;
    authMode.value = null;
    errors.value = {};
  }
}

async function handleRegisterSubmit(): Promise<void> {
  if (!validateRegisterForm()) {
    return;
  }

  // Double-check email doesn't exist before submitting
  try {
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      errors.value.email = t("auth.validation.emailAlreadyRegistered");
      // Reset to email step so user can change email
      emailConfirmed.value = false;
      authMode.value = null;
      return;
    }
  } catch (err) {
    console.warn("Email check failed, proceeding with registration");
  }

  const success = await authStore.register({
    name: formData.name.trim(),
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.password,
    acceptTerms: formData.acceptTerms,
  });

  if (success) {
    emit("registration-success", formData.email);
    formData.email = "";
    formData.name = "";
    formData.password = "";
    formData.acceptTerms = false;
    emailConfirmed.value = false;
    authMode.value = null;
    errors.value = {};
  }
}

async function handleSubmit(): Promise<void> {
  if (!emailConfirmed.value) {
    await handleEmailStep();
  } else if (authMode.value === "login") {
    await handleLoginSubmit();
  } else if (authMode.value === "register") {
    await handleRegisterSubmit();
  }
}
</script>

<template>
  <div class="unified-auth-form">
    <!-- OAuth Buttons (Top) -->
    <div class="oauth-section">
      <button
        type="button"
        @click="handleOAuthLogin('google')"
        :disabled="isLoading"
        class="oauth-button"
      >
        <svg class="oauth-icon" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{{ $t("auth.unified.continueWithGoogle") }}</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="form-divider">
      <div class="divider-line"></div>
      <span class="divider-text">{{ $t("auth.unified.or") }}</span>
      <div class="divider-line"></div>
    </div>

    <!-- Progressive Form -->
    <form @submit.prevent="handleSubmit" novalidate class="progressive-form">
      <!-- Email Field with Floating Label -->
      <div
        class="form-group"
        :class="{ 'has-value': formData.email, 'is-disabled': emailConfirmed }"
      >
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          :disabled="emailConfirmed"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          placeholder=" "
          @focus="emailFocused = true"
          @blur="handleEmailBlur"
          @input="handleEmailInput"
        />
        <label for="email" class="floating-label">
          {{ $t("auth.fields.email") }}
        </label>
        <button
          v-if="emailConfirmed"
          type="button"
          @click="resetEmailStep"
          class="change-email-btn"
          :aria-label="$t('auth.unified.changeEmail')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>{{ $t("auth.unified.change") }}</span>
        </button>
        <transition name="fade">
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </transition>
      </div>

      <!-- Login Flow (Email exists) -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="emailConfirmed && authMode === 'login'" key="login" class="auth-fields">
          <!-- Password Field -->
          <div class="form-group" :class="{ 'has-value': formData.password }">
            <div class="password-wrapper">
              <input
                ref="passwordInputRef"
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                placeholder=" "
                @input="handlePasswordInput"
              />
              <label for="password" class="floating-label">
                {{ $t("auth.fields.password") }}
              </label>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :aria-label="
                  showPassword ? $t('auth.unified.hidePassword') : $t('auth.unified.showPassword')
                "
              >
                <EyeIcon v-if="!showPassword" class="icon" />
                <EyeSlashIcon v-else class="icon" />
              </button>
            </div>

            <!-- Password Requirements Checklist (Login) -->
            <transition name="fade">
              <div v-if="formData.password && errors.password" class="password-requirements">
                <div class="requirement-item" :class="{ met: passwordRequirements.minLength }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.minLength") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasUppercase }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.uppercase") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasLowercase }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.lowercase") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasNumber }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.number") }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Forgot Password -->
          <div class="forgot-password-wrapper">
            <button
              type="button"
              @click="emit('show-forgot-password')"
              class="forgot-password-link"
            >
              {{ $t("auth.unified.forgotPassword") }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Register Flow (Email doesn't exist) -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="emailConfirmed && authMode === 'register'" key="register" class="auth-fields">
          <!-- Name Field -->
          <div class="form-group" :class="{ 'has-value': formData.name }">
            <input
              ref="nameInputRef"
              id="name"
              v-model="formData.name"
              type="text"
              autocomplete="name"
              class="form-input"
              :class="{ 'input-error': errors.name }"
              placeholder=" "
              @input="handleNameInput"
            />
            <label for="name" class="floating-label">
              {{ $t("auth.fields.name") }}
            </label>
            <transition name="fade">
              <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
            </transition>
          </div>

          <!-- Password Field with Strength Indicator -->
          <div class="form-group" :class="{ 'has-value': formData.password }">
            <div class="password-wrapper">
              <input
                id="register-password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                placeholder=" "
                @input="handlePasswordInput"
              />
              <label for="register-password" class="floating-label">
                {{ $t("auth.fields.password") }}
              </label>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :aria-label="
                  showPassword ? $t('auth.unified.hidePassword') : $t('auth.unified.showPassword')
                "
              >
                <EyeIcon v-if="!showPassword" class="icon" />
                <EyeSlashIcon v-else class="icon" />
              </button>
            </div>

            <!-- Password Requirements Checklist -->
            <transition name="fade">
              <div
                v-if="formData.password && authMode === 'register'"
                class="password-requirements"
              >
                <div class="requirement-item" :class="{ met: passwordRequirements.minLength }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.minLength") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasUppercase }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.uppercase") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasLowercase }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.lowercase") }}</span>
                </div>
                <div class="requirement-item" :class="{ met: passwordRequirements.hasNumber }">
                  <svg class="requirement-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t("auth.validation.passwordRequirements.number") }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Terms Checkbox -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label group">
              <input
                v-model="formData.acceptTerms"
                type="checkbox"
                class="checkbox-input"
                :class="{ 'input-error': errors.acceptTerms }"
              />
              <span class="checkbox-box">
                <svg
                  v-if="formData.acceptTerms"
                  class="checkmark"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="checkbox-text">
                {{ $t("auth.register.agreeToTerms") }}

                <a href="/terms" target="_blank" class="link" @click.stop>
                  {{ $t("auth.register.termsOfService") }}
                </a>
                {{ $t("auth.register.and") }}

                <a href="/privacy" target="_blank" class="link" @click.stop>
                  {{ $t("auth.register.privacyPolicy") }}
                </a>
              </span>
            </label>
            <transition name="fade">
              <p v-if="errors.acceptTerms" class="form-error">{{ errors.acceptTerms }}</p>
            </transition>
          </div>
        </div>
      </transition>

      <!-- Error Message -->
      <transition name="slide-fade">
        <div v-if="error" class="error-alert">
          <svg
            class="error-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </transition>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading || isCheckingEmail"
        class="submit-btn"
        :class="{ 'btn-loading': isLoading || isCheckingEmail }"
      >
        <span v-if="isLoading || isCheckingEmail" class="btn-content">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ getLoadingText }} </span>
        </span>
        <span v-else class="btn-content">
          {{ getButtonText }}
        </span>
      </button>
    </form>

    <!-- Trust Indicators -->
    <div class="trust-section">
      <div class="trust-item">
        <svg
          class="trust-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>{{ $t("auth.unified.secureEncrypted") }} </span>
      </div>
      <div class="trust-item">
        <svg
          class="trust-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
        <span>{{ $t("auth.unified.joinThousands") }} </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.unified-auth-form {
  @apply w-full space-y-6;
}

/* OAuth Section */
.oauth-section {
  @apply w-full;
}

.oauth-button {
  @apply flex w-full items-center justify-center gap-3;
  @apply rounded-xl px-6 py-3.5;
  @apply border-2 border-gray-200 bg-white;
  @apply text-base font-semibold text-gray-700;
  @apply transition-all duration-200;
  @apply hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50;
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200;
}

.oauth-icon {
  @apply h-5 w-5 flex-shrink-0;
}

/* Divider */
.form-divider {
  @apply my-6 flex items-center gap-4;
}

.divider-line {
  @apply h-px flex-1 bg-gray-200;
  @apply dark:bg-gray-700;
}

.divider-text {
  @apply text-sm font-medium uppercase tracking-wide text-gray-400;
  @apply dark:text-gray-500;
}

/* Form */
.progressive-form {
  @apply space-y-5;
}

.auth-fields {
  @apply space-y-5;
}

/* Form Group with Floating Labels */
.form-group {
  @apply relative;
}

.form-input {
  @apply w-full rounded-xl px-4 py-4;
  @apply border-2 border-gray-200 bg-white;
  @apply text-base text-gray-900;
  @apply transition-all duration-200;
  @apply focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10;
  @apply focus:outline-none;
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100;
  @apply dark:focus:border-primary-400;
  @apply placeholder-transparent;
  @apply leading-6;
}

.form-group.has-value .form-input,
.form-input:focus {
  @apply pb-2 pt-6;
}

.form-input:disabled {
  @apply cursor-not-allowed bg-gray-50 text-gray-500;
  @apply dark:bg-gray-700/50 dark:text-gray-400;
}

.form-group.is-disabled .form-input {
  @apply pr-24;
}

.input-error {
  @apply border-2 border-red-500 focus:border-red-600 focus:ring-red-500/20;
  @apply dark:border-red-400 dark:focus:border-red-500;
}

/* Floating Labels - Vertically centered when empty */
.floating-label {
  @apply absolute left-4;

  top: 1.125rem; /* Center within input: border(2px) + padding-top(16px) + half line-height(12px) - half font(8px) */

  @apply text-base text-gray-500;
  @apply transition-all duration-200;
  @apply pointer-events-none;
  @apply dark:text-gray-400;
}

.form-group.has-value .floating-label,
.form-input:focus ~ .floating-label,
.form-input:not(:placeholder-shown) ~ .floating-label {
  top: 0.5rem; /* Float to top */

  @apply text-xs font-medium;
  @apply text-primary-600;
  @apply dark:text-primary-400;
}

.form-group.is-disabled .floating-label {
  @apply text-gray-400;
  @apply dark:text-gray-500;
}

.form-input.input-error ~ .floating-label {
  @apply text-red-600;
  @apply dark:text-red-400;
}

/* Change Email Button */
.change-email-btn {
  @apply absolute right-3 top-1/2 -translate-y-1/2;
  @apply flex items-center gap-1.5;
  @apply rounded-lg px-3 py-1.5;
  @apply text-sm font-medium text-primary-600;
  @apply border border-primary-200 bg-primary-50;
  @apply transition-all duration-200;
  @apply hover:border-primary-300 hover:bg-primary-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-400;
  @apply dark:hover:bg-primary-900/30;
}

/* Password Wrapper */
.password-wrapper {
  @apply relative;
}

.password-toggle {
  @apply absolute right-3 top-1/2 -translate-y-1/2;
  @apply rounded-lg p-2;
  @apply text-gray-400 transition-all duration-200;
  @apply hover:bg-gray-100 hover:text-gray-600;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300;
}

.password-toggle .icon {
  @apply h-5 w-5;
}

/* Password Requirements */
.password-requirements {
  @apply mt-3 space-y-2;
}

.requirement-item {
  @apply flex items-center gap-2;
  @apply text-sm text-gray-500 transition-all duration-200;
  @apply dark:text-gray-400;
}

.requirement-item.met {
  @apply text-green-600;
  @apply dark:text-green-400;
}

.requirement-icon {
  @apply h-5 w-5 flex-shrink-0;
  @apply transition-all duration-200;
}

.requirement-item:not(.met) .requirement-icon {
  @apply text-gray-300;
  @apply dark:text-gray-600;
}

.requirement-item.met .requirement-icon {
  @apply text-green-500;
  @apply dark:text-green-400;
}

/* Password Strength (kept for login mode) */
.password-strength {
  @apply mt-2 space-y-1.5;
}

.strength-bars {
  @apply flex gap-1.5;
}

.strength-bar {
  @apply h-1 flex-1 rounded-full bg-gray-200 transition-all duration-300;
  @apply dark:bg-gray-700;
}

.strength-bar.active.weak {
  @apply bg-red-500;
}

.strength-bar.active.medium {
  @apply bg-yellow-500;
}

.strength-bar.active.strong {
  @apply bg-green-500;
}

.strength-text {
  @apply text-xs font-medium;
}

.strength-text.strength-weak {
  @apply text-red-600 dark:text-red-400;
}

.strength-text.strength-medium {
  @apply text-yellow-600 dark:text-yellow-400;
}

.strength-text.strength-strong {
  @apply text-green-600 dark:text-green-400;
}

/* Checkbox */
.checkbox-group {
  @apply mt-4;
}

.checkbox-label {
  @apply flex cursor-pointer items-start gap-3;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-box {
  @apply relative mt-0.5 h-5 w-5 flex-shrink-0;
  @apply rounded border-2 border-gray-300;
  @apply bg-white transition-all duration-200;
  @apply group-hover:border-primary-400;
  @apply dark:border-gray-600 dark:bg-gray-800;
}

.checkbox-input:checked ~ .checkbox-box {
  @apply border-primary-600 bg-primary-600;
  @apply dark:border-primary-500 dark:bg-primary-500;
}

.checkbox-input:focus ~ .checkbox-box {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.checkbox-input.input-error ~ .checkbox-box {
  @apply border-red-500;
  @apply dark:border-red-400;
}

.checkmark {
  @apply absolute inset-0 h-full w-full text-white;
}

.checkbox-text {
  @apply text-sm leading-relaxed text-gray-600;
  @apply dark:text-gray-300;
}

.link {
  @apply font-medium text-primary-600 underline decoration-primary-600/30;
  @apply transition-all duration-200;
  @apply hover:text-primary-700 hover:decoration-primary-700;
  @apply dark:text-primary-400 dark:hover:text-primary-300;
}

/* Forgot Password */
.forgot-password-wrapper {
  @apply -mt-1 flex justify-end;
}

.forgot-password-link {
  @apply text-sm font-medium text-primary-600;
  @apply transition-all duration-200;
  @apply hover:text-primary-700 hover:underline;
  @apply rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply dark:text-primary-400 dark:hover:text-primary-300;
}

/* Error Alert */
.error-alert {
  @apply flex items-center gap-3 rounded-xl p-4;
  @apply border border-red-200 bg-red-50 text-red-700;
  @apply dark:border-red-800 dark:bg-red-900/20 dark:text-red-400;
}

.error-icon {
  @apply h-5 w-5 flex-shrink-0;
}

.form-error {
  @apply mt-1.5 text-sm font-medium text-red-600;
  @apply dark:text-red-400;
}

/* Submit Button */
.submit-btn {
  @apply w-full rounded-xl py-3.5;
  @apply bg-gradient-to-r from-primary-600 to-primary-700;
  @apply text-base font-semibold text-white;
  @apply shadow-lg shadow-primary-500/30;
  @apply transition-all duration-200;
  @apply hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40;
  @apply focus:outline-none focus:ring-4 focus:ring-primary-500/50;
  @apply disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50;
  @apply dark:from-primary-500 dark:to-primary-600;
}

.btn-loading {
  @apply opacity-90;
}

.btn-content {
  @apply flex items-center justify-center gap-2;
}

.spinner {
  @apply h-5 w-5 animate-spin;
}

/* Trust Section */
.trust-section {
  @apply mt-6 border-t border-gray-100 pt-6;
  @apply flex items-center justify-center gap-6;
  @apply dark:border-gray-700;
}

.trust-item {
  @apply flex items-center gap-2;
  @apply text-xs font-medium text-gray-500;
  @apply dark:text-gray-400;
}

.trust-icon {
  @apply h-4 w-4;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-200;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.slide-fade-enter-active {
  @apply transition-all duration-300 ease-out;
}

.slide-fade-leave-active {
  @apply transition-all duration-200 ease-in;
}

.slide-fade-enter-from {
  @apply translate-y-2 opacity-0;
}

.slide-fade-leave-to {
  @apply -translate-y-2 opacity-0;
}

/* Responsive */
@media (width <= 640px) {
  .oauth-button {
    @apply py-3 text-sm;
  }

  .form-input {
    @apply py-3 text-sm;
  }

  .form-group.has-value .form-input,
  .form-input:focus {
    @apply pb-2 pt-5;
  }

  .floating-label {
    top: 0.875rem; /* Center within smaller mobile input */

    @apply text-sm;
  }

  .form-group.has-value .floating-label,
  .form-input:focus ~ .floating-label,
  .form-input:not(:placeholder-shown) ~ .floating-label {
    top: 0.5rem; /* Float to top on mobile */

    @apply text-xs;
  }

  .submit-btn {
    @apply py-3 text-sm;
  }

  .trust-section {
    @apply flex-col gap-3;
  }
}
</style>
}
