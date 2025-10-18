<template>
  <!-- Only show if notifications are supported, not granted, and not denied -->
  <div v-if="shouldShow" :class="variantClass">
    <div class="prompt-content">
      <!-- Icon -->
      <div class="prompt-icon">
        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>

      <!-- Content -->
      <div class="prompt-text">
        <h4 class="prompt-title">
          {{ title || t("notificationPrompt.title", "Enable Notifications") }}
        </h4>
        <p class="prompt-description">
          {{
            description ||
            t(
              "notificationPrompt.description",
              "Stay on track with your learning goals. Get reminders for streaks, achievements, and challenges."
            )
          }}
        </p>

        <!-- Benefits List (optional) -->
        <ul v-if="showBenefits" class="prompt-benefits">
          <li>
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("notificationPrompt.benefit1", "Never miss your streak") }} </span>
          </li>
          <li>
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("notificationPrompt.benefit2", "Get challenges from friends") }} </span>
          </li>
          <li>
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("notificationPrompt.benefit3", "Celebrate achievements") }} </span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="prompt-actions">
        <button type="button" class="btn-primary" :disabled="isLoading" @click="handleEnable">
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ t("notificationPrompt.enabling", "Enabling...") }}
          </span>
          <span v-else>
            {{ t("notificationPrompt.enable", "Enable Notifications") }}
          </span>
        </button>
        <button v-if="dismissible" type="button" class="btn-secondary" @click="handleDismiss">
          {{ t("notificationPrompt.later", "Maybe Later") }}
        </button>
      </div>

      <!-- Close button for banner variant -->
      <button
        v-if="variant === 'banner' && dismissible"
        type="button"
        class="prompt-close"
        @click="handleDismiss"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { INotificationPromptProps as Props } from "@/types/components/notifications";
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/composables/useNotifications";

const props = withDefaults(defineProps<Props>(), {
  variant: "banner",
  dismissible: true,
  showBenefits: false,
  autoDismissDelay: 0,
});

const emit = defineEmits<{
  enabled: [];
  dismissed: [];
}>();

const { t } = useI18n();

const { isSupported, permissionGranted, permissionDenied, isLoading, requestPermission } =
  useNotifications();

const isDismissed = ref(false);
const STORAGE_KEY = "notification_prompt_dismissed";

const shouldShow = computed(() => {
  if (!isSupported.value) return false;
  if (permissionGranted.value) return false;
  if (permissionDenied.value) return false;
  if (isDismissed.value) return false;

  // Check if user has dismissed this prompt before
  const dismissedTime = localStorage.getItem(STORAGE_KEY);
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    // Show again after 7 days
    if (daysSinceDismissed < 7) {
      isDismissed.value = true;
      return false;
    }
  }

  return true;
});

const variantClass = computed(() => {
  const base = "notification-prompt";
  return `${base} ${base}--${props.variant}`;
});

const _handleenable = async () => {
  const granted = await requestPermission();
  if (granted) {
    emit("enabled");
    isDismissed.value = true;
    localStorage.removeItem(STORAGE_KEY);
  }
};

const handleDismiss = () => {
  isDismissed.value = true;
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
  emit("dismissed");
};

onMounted(() => {
  // Auto-dismiss after delay if configured
  if (props.autoDismissDelay > 0 && shouldShow.value) {
    setTimeout(() => {
      if (!permissionGranted.value) {
        handleDismiss();
      }
    }, props.autoDismissDelay);
  }
});
</script>

<style scoped>
/* Base Styles */
.notification-prompt {
  @apply relative overflow-hidden;
}

.prompt-content {
  @apply relative flex items-start gap-4;
}

.prompt-icon {
  @apply flex flex-shrink-0 items-center justify-center;
}

.prompt-text {
  @apply flex-1;
}

.prompt-title {
  @apply text-base font-semibold;
}

.prompt-description {
  @apply mt-1 text-sm;
}

.prompt-benefits {
  @apply mt-3 space-y-2;
}

.prompt-benefits li {
  @apply flex items-center gap-2 text-xs;
}

.prompt-actions {
  @apply flex gap-3;
}

.btn-primary {
  @apply rounded-lg px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

.btn-secondary {
  @apply rounded-lg px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2;
}

.prompt-close {
  @apply flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200;
}

/* Banner Variant */
.notification-prompt--banner {
  @apply sticky top-0 z-40 border-b shadow-sm backdrop-blur-sm;
  @apply bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50;
  @apply dark:from-gray-800 dark:via-gray-800 dark:to-gray-800;
  @apply border-blue-200 dark:border-gray-700;
}

.notification-prompt--banner .prompt-content {
  @apply px-4 py-3 md:px-6 md:py-4;
}

.notification-prompt--banner .prompt-icon {
  @apply h-10 w-10 rounded-full md:h-12 md:w-12;
  @apply bg-blue-100 dark:bg-blue-900/30;
  @apply text-blue-600 dark:text-blue-400;
}

.notification-prompt--banner .prompt-title {
  @apply text-gray-900 dark:text-white;
}

.notification-prompt--banner .prompt-description {
  @apply text-gray-600 dark:text-gray-400;
}

.notification-prompt--banner .btn-primary {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 text-white;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply text-sm;
}

.notification-prompt--banner .btn-secondary {
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:text-gray-800 dark:hover:text-gray-200;
  @apply text-sm;
}

.notification-prompt--banner .prompt-close {
  @apply absolute right-4 top-4;
}

/* Card Variant */
.notification-prompt--card {
  @apply rounded-2xl border-2 shadow-lg;
  @apply bg-white dark:bg-gray-800;
  @apply border-blue-200 dark:border-blue-700;
}

.notification-prompt--card .prompt-content {
  @apply p-6;
  @apply flex-col items-start;
}

.notification-prompt--card .prompt-icon {
  @apply h-16 w-16 rounded-2xl;
  @apply bg-gradient-to-br from-blue-500 to-purple-600;
  @apply text-white;
  @apply shadow-lg;
}

.notification-prompt--card .prompt-title {
  @apply text-lg text-gray-900 dark:text-white;
}

.notification-prompt--card .prompt-description {
  @apply text-gray-600 dark:text-gray-400;
}

.notification-prompt--card .prompt-actions {
  @apply w-full flex-col sm:flex-row;
}

.notification-prompt--card .btn-primary {
  @apply flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply shadow-md hover:shadow-lg;
}

.notification-prompt--card .btn-secondary {
  @apply flex-1 bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
}

/* Modal Variant */
.notification-prompt--modal {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black/60 backdrop-blur-sm;
  @apply p-4;
}

.notification-prompt--modal .prompt-content {
  @apply w-full max-w-md rounded-2xl shadow-2xl;
  @apply bg-white dark:bg-gray-800;
  @apply p-8;
  @apply flex-col items-center text-center;
  @apply animate-fade-in-up;
}

.notification-prompt--modal .prompt-icon {
  @apply h-20 w-20 rounded-full;
  @apply bg-gradient-to-br from-blue-500 to-purple-600;
  @apply text-white;
  @apply shadow-2xl;
  @apply mb-6;
}

.notification-prompt--modal .prompt-title {
  @apply text-2xl text-gray-900 dark:text-white;
}

.notification-prompt--modal .prompt-description {
  @apply text-gray-600 dark:text-gray-400;
}

.notification-prompt--modal .prompt-actions {
  @apply w-full flex-col;
}

.notification-prompt--modal .btn-primary {
  @apply w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white;
  @apply hover:scale-105 hover:from-blue-700 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply shadow-lg;
  @apply py-3 text-base;
}

.notification-prompt--modal .btn-secondary {
  @apply w-full text-gray-600 dark:text-gray-400;
  @apply hover:text-gray-800 dark:hover:text-gray-200;
}

/* Animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}

/* Responsive */
@media (width <= 640px) {
  .notification-prompt--banner .prompt-content {
    @apply flex-col;
  }

  .notification-prompt--banner .prompt-actions {
    @apply mt-4 w-full flex-col;
  }

  .notification-prompt--banner .btn-primary,
  .notification-prompt--banner .btn-secondary {
    @apply w-full;
  }
}
</style>
