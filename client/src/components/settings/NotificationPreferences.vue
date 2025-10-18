<template>
  <div class="notification-preferences">
    <div class="preferences-header">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ t("settings.notifications?.title", "Push Notifications") }}
      </h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {{ t("settings.notifications?.subtitle", "Manage your notification preferences") }}
      </p>
    </div>

    <!-- Notification Support Check -->
    <div
      v-if="!isSupported"
      class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
    >
      <div class="flex items-start gap-3">
        <svg
          class="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            {{
              t(
                "settings.notifications?.unsupported",
                "Notifications are not supported in your browser"
              )
            }}
          </p>
          <p class="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
            Try using a modern browser like Chrome, Firefox, or Edge
          </p>
        </div>
      </div>
    </div>

    <!-- Main Enable/Disable Toggle -->
    <div v-else class="space-y-6">
      <div
        class="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications?.enable", "Enable Push Notifications") }}
              </h4>
              <span
                v-if="permissionGranted"
                class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                Active
              </span>
              <span
                v-else-if="permissionDenied"
                class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
              >
                Blocked
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications?.enableDescription",
                  "Get notified about streaks, challenges, and achievements"
                )
              }}
            </p>
          </div>

          <button
            v-if="!permissionGranted && !permissionDenied"
            type="button"
            class="ml-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            :disabled="isLoading"
            @click="handleEnableNotifications"
          >
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
              Enabling...
            </span>
            <span v-else> Enable </span>
          </button>

          <span
            v-else-if="permissionGranted"
            class="ml-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Enabled
          </span>

          <span v-else-if="permissionDenied" class="ml-4 text-sm text-red-600 dark:text-red-400">
            Blocked - Enable in browser settings
          </span>
        </div>
      </div>

      <!-- Notification Types -->
      <div v-if="permissionGranted" class="space-y-4">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ t("settings.notifications?.types", "Notification Types") }}
        </h4>

        <!-- Streak Reminders -->
        <label
          class="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <input
            v-model="preferences.streak"
            type="checkbox"
            class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @change="savePreferences"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">🔥</span>
              <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications.streak?.title", "Streak Reminders") }}
              </h5>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications.streak?.description",
                  "Daily reminders to maintain your learning streak"
                )
              }}
            </p>
          </div>
        </label>

        <!-- New Content -->
        <label
          class="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <input
            v-model="preferences.content"
            type="checkbox"
            class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @change="savePreferences"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">✨</span>
              <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications.content?.title", "New Content") }}
              </h5>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications.content?.description",
                  "Alerts when new quizzes or questions are added"
                )
              }}
            </p>
          </div>
        </label>

        <!-- Challenges -->
        <label
          class="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <input
            v-model="preferences.challenges"
            type="checkbox"
            class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @change="savePreferences"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">⚔️</span>
              <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications.challenges?.title", "Challenges") }}
              </h5>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications.challenges?.description",
                  "When friends challenge you to beat their scores"
                )
              }}
            </p>
          </div>
        </label>

        <!-- Achievements -->
        <label
          class="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <input
            v-model="preferences.achievements"
            type="checkbox"
            class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @change="savePreferences"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏆</span>
              <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications.achievements?.title", "Achievements") }}
              </h5>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications.achievements?.description",
                  "When you unlock badges, level up, or hit milestones"
                )
              }}
            </p>
          </div>
        </label>

        <!-- Trial/Subscription Alerts -->
        <label
          class="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
        >
          <input
            v-model="preferences.subscription"
            type="checkbox"
            class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @change="savePreferences"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">💎</span>
              <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t("settings.notifications.subscription?.title", "Account & Subscription") }}
              </h5>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{
                t(
                  "settings.notifications.subscription?.description",
                  "Trial ending reminders and subscription updates"
                )
              }}
            </p>
          </div>
        </label>
      </div>

      <!-- Frequency Settings -->
      <div
        v-if="permissionGranted"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <h4 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          {{ t("settings.notifications?.frequency", "Notification Frequency") }}
        </h4>
        <select
          v-model="preferences.frequency"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="savePreferences"
        >
          <option value="realtime">Real-time (as they happen)</option>
          <option value="daily">Daily Digest (once per day)</option>
          <option value="weekly">Weekly Summary (once per week)</option>
        </select>
      </div>

      <!-- Quiet Hours -->
      <div
        v-if="permissionGranted"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ t("settings.notifications?.quietHours", "Quiet Hours") }}
          </h4>
          <label class="flex cursor-pointer items-center">
            <input
              v-model="preferences.quietHoursEnabled"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              @change="savePreferences"
            />
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable</span>
          </label>
        </div>
        <div v-if="preferences.quietHoursEnabled" class="flex items-center gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs text-gray-600 dark:text-gray-400">From</label>
            <input
              v-model="preferences.quietHoursStart"
              type="time"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="savePreferences"
            />
          </div>
          <div class="flex-1">
            <label class="mb-1 block text-xs text-gray-600 dark:text-gray-400">To</label>
            <input
              v-model="preferences.quietHoursEnd"
              type="time"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="savePreferences"
            />
          </div>
        </div>
      </div>

      <!-- Test Notification -->
      <div v-if="permissionGranted" class="flex justify-end">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showTestNotification"
        >
          🔔 Send Test Notification
        </button>
      </div>

      <!-- Save Success Message -->
      <div
        v-if="showSuccess"
        class="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
      >
        <div class="flex items-center gap-2">
          <svg
            class="h-5 w-5 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm font-medium text-green-800 dark:text-green-300">
            {{ t("settings.notifications?.saved", "Preferences saved successfully") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { INotificationPreferences } from "@/types/components/notifications";
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/composables/useNotifications";

const { t } = useI18n();

const {
  isSupported,
  permissionGranted,
  permissionDenied,
  isLoading,
  requestPermission,
  showTestNotification: testNotification,
  permissionGranted,
  permissionDenied,
  isLoading,
  requestPermission,
  showTestNotification,
} = useNotifications();

const showSuccess = ref(false);

const preferences = reactive<INotificationPreferences>({
  streak: true,
  content: true,
  challenges: true,
  achievements: true,
  subscription: true,
  frequency: "realtime",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
});

const handleEnableNotifications = async () => {
  const granted = await requestPermission();
  if (granted) {
    // Load preferences after enabling
    await loadPreferences();
  }
};

const loadPreferences = async () => {
  try {
    const response = await fetch("/api/v1/notifications/preferences", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.preferences) {
        Object.assign(preferences, data.preferences);
      }
    }
  } catch (error) {
    console.error("Failed to load notification preferences:", error);
  }
};

const savePreferences = async () => {
  try {
    const response = await fetch("/api/v1/notifications/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ preferences }),
    });

    if (response.ok) {
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("Failed to save notification preferences:", error);
  }
};

const showTestNotification = () => {
  testNotification();
};

onMounted(() => {
  if (permissionGranted.value) {
    loadPreferences();
  }
});
</script>

<style scoped>
.notification-preferences {
  @apply space-y-6;
}

.preferences-header {
  @apply border-b border-gray-200 pb-4 dark:border-gray-700;
}
</style>
