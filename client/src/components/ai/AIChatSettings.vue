<template>
  <div class="ai-settings-overlay" @click="emit('close')">
    <div class="ai-settings-modal" @click.stop>
      <div class="ai-settings-header">
        <h3 class="ai-settings-title">{{ $t("ai.settings") }}</h3>
        <button class="ai-settings-close" @click="emit('close')" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="ai-settings-content">
        <!-- Voice Settings -->
        <div class="ai-settings-section">
          <h4 class="ai-settings-section-title">Voice Settings</h4>

          <div class="ai-settings-option">
            <label class="ai-settings-label">
              <input type="checkbox" v-model="settings.voiceEnabled" class="ai-settings-checkbox" />
              <span>Enable Voice Input</span>
            </label>
          </div>

          <div class="ai-settings-option">
            <label class="ai-settings-label">
              <input type="checkbox" v-model="settings.autoSpeak" class="ai-settings-checkbox" />
              <span>Auto-read Responses</span>
            </label>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="ai-settings-section">
          <h4 class="ai-settings-section-title">Display Settings</h4>

          <div class="ai-settings-option">
            <label class="ai-settings-label">
              <input
                type="checkbox"
                v-model="settings.showSuggestions"
                class="ai-settings-checkbox"
              />
              <span>Show Quick Suggestions</span>
            </label>
          </div>

          <div class="ai-settings-option">
            <label class="ai-settings-label">
              <input type="checkbox" v-model="settings.compactMode" class="ai-settings-checkbox" />
              <span>Compact Mode</span>
            </label>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="ai-settings-section">
          <h4 class="ai-settings-section-title">Privacy</h4>

          <div class="ai-settings-option">
            <label class="ai-settings-label">
              <input type="checkbox" v-model="settings.saveHistory" class="ai-settings-checkbox" />
              <span>Save Chat History</span>
            </label>
          </div>

          <button class="ai-settings-btn ai-settings-btn--danger" @click="clearHistory">
            Clear All History
          </button>
        </div>
      </div>

      <div class="ai-settings-footer">
        <button class="ai-settings-btn ai-settings-btn--secondary" @click="resetDefaults">
          Reset to Defaults
        </button>
        <button class="ai-settings-btn ai-settings-btn--primary" @click="saveSettings">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Emits {
  (e: "close"): void;
  (e: "update", settings: any): void;
}

const emit = defineEmits<Emits>();

const settings = ref({
  voiceEnabled: true,
  autoSpeak: false,
  showSuggestions: true,
  compactMode: false,
  saveHistory: true,
});

const saveSettings = () => {
  emit("update", settings.value);
  emit("close");
};

const resetDefaults = () => {
  settings.value = {
    voiceEnabled: true,
    autoSpeak: false,
    showSuggestions: true,
    compactMode: false,
    saveHistory: true,
  };
};

const clearHistory = () => {
  if (confirm("Are you sure you want to clear all chat history?")) {
    // Clear history logic
    localStorage.removeItem("ai_chat_sessions");
  }
};
</script>

<style scoped>
.ai-settings-overlay {
  @apply fixed inset-0 z-[9999];
  @apply bg-black bg-opacity-50 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply p-4;
}

.ai-settings-modal {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl shadow-2xl;
  @apply w-full max-w-md;
  @apply max-h-[90vh] overflow-y-auto;
}

.ai-settings-header {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply border-b border-gray-200 dark:border-gray-700;
}

.ai-settings-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.ai-settings-close {
  @apply h-8 w-8 rounded-lg;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.ai-settings-close svg {
  @apply h-5 w-5;
}

.ai-settings-content {
  @apply px-6 py-4;
  @apply space-y-6;
}

.ai-settings-section {
  @apply space-y-3;
}

.ai-settings-section-title {
  @apply text-sm font-semibold text-gray-700 dark:text-gray-300;
  @apply mb-2;
}

.ai-settings-option {
  @apply flex items-center;
}

.ai-settings-label {
  @apply flex items-center gap-3;
  @apply text-sm text-gray-700 dark:text-gray-300;
  @apply cursor-pointer;
}

.ai-settings-checkbox {
  @apply h-5 w-5 rounded;
  @apply border-2 border-gray-300 dark:border-gray-600;
  @apply text-primary focus:ring-primary;
  @apply cursor-pointer;
}

.ai-settings-footer {
  @apply flex gap-3 px-6 py-4;
  @apply border-t border-gray-200 dark:border-gray-700;
}

.ai-settings-btn {
  @apply flex-1 rounded-lg px-4 py-2;
  @apply text-sm font-medium;
  @apply transition-all duration-fast;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.ai-settings-btn--primary {
  @apply bg-primary text-white;
  @apply hover:bg-primary-700;
  @apply focus:ring-primary;
}

.ai-settings-btn--secondary {
  @apply bg-gray-200 text-gray-800;
  @apply hover:bg-gray-300;
  @apply dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
}

.ai-settings-btn--danger {
  @apply mt-2 w-full rounded-lg px-4 py-2;
  @apply bg-red-50 text-red-600;
  @apply hover:bg-red-100;
  @apply dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30;
  @apply text-sm font-medium;
  @apply transition-all duration-fast;
}
</style>
