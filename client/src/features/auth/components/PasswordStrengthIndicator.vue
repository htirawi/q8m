<script setup lang="ts">
import { computed } from "vue";

import { useI18n } from "vue-i18n";

import type { PasswordStrengthIndicatorProps } from "@/types/ui/component-props";

const props = defineProps<PasswordStrengthIndicatorProps>();
const { t } = useI18n();

const strength = computed(() => {
  let score = 0;
  const pwd = props.password;

  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  return Math.min(score, 4);
});

const strengthText = computed(() => {
  switch (strength.value) {
    case 1:
      return t("auth.validation.passwordStrength.weak");
    case 4:
      return t("auth.validation.passwordStrength.strong");
    default:
      return "";
  }
});

const getStrengthClass = (level: number): string => {
  if (level <= strength.value) {
    if (strength.value <= 2) return "bg-error-500";
    if (strength.value <= 3) return "bg-warning-500";
    return "bg-success-500";
  }

  return "bg-gray-200 dark:bg-gray-600";
};
</script>

<template>
  <div v-if="password" class="password-strength">
    <div class="strength-bars">
      <div
        v-for="level in 4"
        :key="level"
        class="strength-bar"
        :class="getStrengthClass(level)"
      ></div>
    </div>
    <span class="strength-text">{{ strengthText }} </span>
  </div>
</template>

<style scoped>
/* Password Strength */
.password-strength {
  @apply mt-3 space-y-2;
}

.strength-bars {
  @apply flex gap-1;
}

.strength-bar {
  @apply h-2 flex-1 rounded-full transition-all duration-300;
  @apply bg-gray-200 dark:bg-gray-600;
}

.strength-bar.bg-error-500 {
  @apply bg-red-500;
}

.strength-bar.bg-warning-500 {
  @apply bg-yellow-500;
}

.strength-bar.bg-success-500 {
  @apply bg-green-500;
}

.strength-text {
  @apply text-xs font-medium text-gray-500;
  @apply dark:text-gray-400;
}
</style>
