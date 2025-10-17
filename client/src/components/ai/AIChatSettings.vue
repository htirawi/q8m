<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ $t('ai.settings.title', 'AI Settings') }}</h2>
            <button class="modal-close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Settings Tabs -->
          <div class="settings-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="settings-tab"
              :class="{ 'settings-tab--active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" class="settings-tab__icon" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Settings Content -->
          <div class="settings-content">
            <!-- General Settings -->
            <div v-if="activeTab === 'general'" class="settings-panel">
              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.provider') }}</h3>
                <div class="settings-group__content">
                  <select v-model="settings.provider" class="settings-select">
                    <option value="openai">OpenAI (GPT-4)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="local">Local Model</option>
                  </select>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.model') }}</h3>
                <div class="settings-group__content">
                  <select v-model="settings.model" class="settings-select">
                    <option v-for="model in availableModels" :key="model" :value="model">
                      {{ model }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.apiKey') }}</h3>
                <div class="settings-group__content">
                  <input
                    v-model="settings.apiKey"
                    type="password"
                    class="settings-input"
                    :placeholder="$t('ai.settings.apiKeyPlaceholder')"
                  />
                  <p class="settings-hint">
                    {{ $t('ai.settings.apiKeyHint') }}
                  </p>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.temperature') }}</h3>
                <div class="settings-group__content">
                  <div class="settings-slider">
                    <input
                      v-model.number="settings.temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      class="settings-slider__input"
                    />
                    <span class="settings-slider__value">{{ settings.temperature }}</span>
                  </div>
                  <p class="settings-hint">
                    {{ $t('ai.settings.temperatureHint') }}
                  </p>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.features') }}</h3>
                <div class="settings-group__content">
                  <label class="settings-toggle">
                    <input v-model="settings.streamResponses" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.streamResponses') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="settings.autoSave" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.autoSave') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="settings.codeExecutionEnabled" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.codeExecution') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Voice Settings -->
            <div v-if="activeTab === 'voice'" class="settings-panel">
              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.voiceEnabled') }}</h3>
                <div class="settings-group__content">
                  <label class="settings-toggle">
                    <input v-model="voiceSettings.enabled" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.enableVoice') }}</span>
                  </label>
                </div>
              </div>

              <div v-if="voiceSettings.enabled" class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.voiceLanguage') }}</h3>
                <div class="settings-group__content">
                  <select v-model="voiceSettings.language" class="settings-select">
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="ar-SA">Arabic</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                    <option value="ja-JP">Japanese</option>
                  </select>
                </div>
              </div>

              <div v-if="voiceSettings.enabled" class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.voiceSpeed') }}</h3>
                <div class="settings-group__content">
                  <div class="settings-slider">
                    <input
                      v-model.number="voiceSettings.rate"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      class="settings-slider__input"
                    />
                    <span class="settings-slider__value">{{ voiceSettings.rate }}x</span>
                  </div>
                </div>
              </div>

              <div v-if="voiceSettings.enabled" class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.voiceOptions') }}</h3>
                <div class="settings-group__content">
                  <label class="settings-toggle">
                    <input v-model="voiceSettings.autoPlayResponses" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.autoPlay') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="voiceSettings.enableWakeWord" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.wakeWord') }}</span>
                  </label>

                  <input
                    v-if="voiceSettings.enableWakeWord"
                    v-model="voiceSettings.wakeWord"
                    type="text"
                    class="settings-input"
                    :placeholder="$t('ai.settings.wakeWordPlaceholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Appearance Settings -->
            <div v-if="activeTab === 'appearance'" class="settings-panel">
              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.theme') }}</h3>
                <div class="settings-group__content">
                  <div class="theme-options">
                    <button
                      v-for="theme in themes"
                      :key="theme.id"
                      class="theme-option"
                      :class="{ 'theme-option--active': appearanceSettings.theme === theme.id }"
                      @click="appearanceSettings.theme = theme.id"
                    >
                      <div class="theme-option__preview" :style="theme.style"></div>
                      <span>{{ theme.name }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.position') }}</h3>
                <div class="settings-group__content">
                  <select v-model="appearanceSettings.position" class="settings-select">
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.size') }}</h3>
                <div class="settings-group__content">
                  <div class="size-options">
                    <button
                      v-for="size in sizes"
                      :key="size.id"
                      class="size-option"
                      :class="{ 'size-option--active': appearanceSettings.size === size.id }"
                      @click="appearanceSettings.size = size.id"
                    >
                      {{ size.name }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.options') }}</h3>
                <div class="settings-group__content">
                  <label class="settings-toggle">
                    <input v-model="appearanceSettings.showSuggestions" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.showSuggestions') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="appearanceSettings.showTypingIndicator" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.showTyping') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="appearanceSettings.playSound" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.playSound') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div v-if="activeTab === 'privacy'" class="settings-panel">
              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.dataStorage') }}</h3>
                <div class="settings-group__content">
                  <label class="settings-toggle">
                    <input v-model="privacySettings.saveHistory" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.saveHistory') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="privacySettings.saveToCloud" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.saveToCloud') }}</span>
                  </label>

                  <label class="settings-toggle">
                    <input v-model="privacySettings.shareAnonymousData" type="checkbox" />
                    <span class="settings-toggle__label">{{ $t('ai.settings.shareData') }}</span>
                  </label>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.dataManagement') }}</h3>
                <div class="settings-group__content">
                  <button class="settings-button settings-button--warning" @click="clearHistory">
                    {{ $t('ai.settings.clearHistory') }}
                  </button>

                  <button class="settings-button" @click="exportData">
                    {{ $t('ai.settings.exportData') }}
                  </button>

                  <button class="settings-button settings-button--danger" @click="deleteAllData">
                    {{ $t('ai.settings.deleteAllData') }}
                  </button>
                </div>
              </div>

              <div class="settings-group">
                <h3 class="settings-group__title">{{ $t('ai.settings.retention') }}</h3>
                <div class="settings-group__content">
                  <select v-model="privacySettings.retentionPeriod" class="settings-select">
                    <option value="1">1 day</option>
                    <option value="7">1 week</option>
                    <option value="30">1 month</option>
                    <option value="90">3 months</option>
                    <option value="365">1 year</option>
                    <option value="0">Forever</option>
                  </select>
                  <p class="settings-hint">
                    {{ $t('ai.settings.retentionHint') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="modal-button modal-button--secondary" @click="resetToDefaults">
              {{ $t('ai.settings.resetDefaults') }}
            </button>
            <div class="modal-footer__actions">
              <button class="modal-button modal-button--cancel" @click="close">
                {{ $t('common.cancel') }}
              </button>
              <button class="modal-button modal-button--primary" @click="save">
                {{ $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IAIConfig, IVoiceSettings } from '@/types/ai';

// Emits
const emit = defineEmits<{
  close: [];
  update: [settings: any];
}>();

// i18n
const { t } = useI18n();

// State
const activeTab = ref('general');

// Settings
const settings = reactive<IAIConfig>({
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  streamResponses: true,
  enableVoice: false,
  autoSave: true,
  codeExecutionEnabled: false
});

const voiceSettings = reactive<IVoiceSettings>({
  enabled: false,
  language: 'en-US',
  voice: 'default',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlayResponses: false,
  enableWakeWord: false,
  wakeWord: 'Hey Q8M'
});

const appearanceSettings = reactive({
  theme: 'default',
  position: 'bottom-right',
  size: 'medium',
  showSuggestions: true,
  showTypingIndicator: true,
  playSound: true
});

const privacySettings = reactive({
  saveHistory: true,
  saveToCloud: false,
  shareAnonymousData: false,
  retentionPeriod: 30
});

// Tab configuration
const tabs = [
  {
    id: 'general',
    label: t('ai.settings.tabs.general'),
    icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24' })
    ])
  },
  {
    id: 'voice',
    label: t('ai.settings.tabs.voice'),
    icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' }),
      h('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' })
    ])
  },
  {
    id: 'appearance',
    label: t('ai.settings.tabs.appearance'),
    icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
    ])
  },
  {
    id: 'privacy',
    label: t('ai.settings.tabs.privacy'),
    icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
    ])
  }
];

// Available models based on provider
const availableModels = computed(() => {
  switch (settings.provider) {
    case 'openai':
      return ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    case 'anthropic':
      return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
    case 'gemini':
      return ['gemini-pro', 'gemini-pro-vision'];
    default:
      return ['llama2', 'mistral', 'phi-2'];
  }
});

// Theme options
const themes = [
  {
    id: 'default',
    name: 'Default',
    style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  },
  {
    id: 'dark',
    name: 'Dark',
    style: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }
  },
  {
    id: 'light',
    name: 'Light',
    style: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    style: { background: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' }
  }
];

// Size options
const sizes = [
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' }
];

// Methods
const close = () => {
  emit('close');
};

const save = () => {
  const allSettings = {
    ...settings,
    voice: voiceSettings,
    appearance: appearanceSettings,
    privacy: privacySettings
  };

  emit('update', allSettings);
  close();
};

const resetToDefaults = () => {
  settings.provider = 'openai';
  settings.model = 'gpt-4-turbo-preview';
  settings.temperature = 0.7;
  settings.maxTokens = 2048;
  settings.streamResponses = true;
  settings.autoSave = true;
  settings.codeExecutionEnabled = false;

  voiceSettings.enabled = false;
  voiceSettings.rate = 1.0;

  appearanceSettings.theme = 'default';
  appearanceSettings.size = 'medium';

  privacySettings.saveHistory = true;
  privacySettings.retentionPeriod = 30;
};

const clearHistory = () => {
  if (confirm(t('ai.settings.confirmClearHistory'))) {
    // Clear chat history
    localStorage.removeItem('ai_chat_sessions');
  }
};

const exportData = () => {
  // Export chat data
  const data = localStorage.getItem('ai_chat_sessions');
  if (data) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_chat_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }
};

const deleteAllData = () => {
  if (confirm(t('ai.settings.confirmDeleteAll'))) {
    // Delete all AI-related data
    localStorage.removeItem('ai_chat_sessions');
    localStorage.removeItem('ai_settings');
  }
};
</script>

<style scoped>
/* Modal overlay */
.modal-overlay {
  @apply fixed inset-0 z-[9999];
  @apply bg-black/50 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply p-4;
}

/* Modal content */
.modal-content {
  @apply w-full max-w-4xl max-h-[90vh];
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl shadow-2xl;
  @apply flex flex-col;
  @apply overflow-hidden;
}

/* Modal header */
.modal-header {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply w-8 h-8 rounded-lg;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.modal-close svg {
  @apply w-5 h-5;
}

/* Settings tabs */
.settings-tabs {
  @apply flex gap-2 px-6 py-3;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border-b border-gray-200 dark:border-gray-700;
  @apply overflow-x-auto;
}

.settings-tab {
  @apply flex items-center gap-2;
  @apply px-4 py-2 rounded-lg;
  @apply text-sm font-medium;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
  @apply transition-all duration-fast;
  @apply whitespace-nowrap;
}

.settings-tab--active {
  @apply bg-white dark:bg-gray-800;
  @apply text-primary;
  @apply shadow-sm;
}

.settings-tab__icon {
  @apply w-4 h-4;
}

/* Settings content */
.settings-content {
  @apply flex-1 overflow-y-auto;
  @apply p-6;
}

.settings-panel {
  @apply space-y-6;
}

/* Settings group */
.settings-group {
  @apply space-y-2;
}

.settings-group__title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.settings-group__content {
  @apply space-y-3;
}

/* Form elements */
.settings-input,
.settings-select {
  @apply w-full px-3 py-2;
  @apply bg-gray-100 dark:bg-gray-900;
  @apply border border-gray-200 dark:border-gray-700;
  @apply rounded-lg;
  @apply text-sm text-gray-900 dark:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50;
  @apply transition-all duration-fast;
}

.settings-hint {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

/* Toggle */
.settings-toggle {
  @apply flex items-center gap-3;
  @apply cursor-pointer;
}

.settings-toggle input[type="checkbox"] {
  @apply w-4 h-4 rounded;
  @apply text-primary;
  @apply border-gray-300 dark:border-gray-600;
  @apply focus:ring-2 focus:ring-primary/50;
}

.settings-toggle__label {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

/* Slider */
.settings-slider {
  @apply flex items-center gap-3;
}

.settings-slider__input {
  @apply flex-1;
}

.settings-slider__value {
  @apply w-12 text-center;
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

/* Theme options */
.theme-options {
  @apply grid grid-cols-4 gap-3;
}

.theme-option {
  @apply flex flex-col items-center gap-2;
  @apply p-3 rounded-lg;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply hover:border-primary;
  @apply transition-all duration-fast;
  @apply cursor-pointer;
}

.theme-option--active {
  @apply border-primary bg-primary-50 dark:bg-primary-900/20;
}

.theme-option__preview {
  @apply w-full h-16 rounded;
}

/* Size options */
.size-options {
  @apply flex gap-2;
}

.size-option {
  @apply px-4 py-2 rounded-lg;
  @apply border border-gray-200 dark:border-gray-700;
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
  @apply hover:border-primary;
  @apply transition-all duration-fast;
  @apply cursor-pointer;
}

.size-option--active {
  @apply border-primary bg-primary-50 dark:bg-primary-900/20;
  @apply text-primary;
}

/* Buttons */
.settings-button {
  @apply px-4 py-2 rounded-lg;
  @apply text-sm font-medium;
  @apply transition-all duration-fast;
}

.settings-button {
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
}

.settings-button--warning {
  @apply bg-yellow-100 dark:bg-yellow-900/20;
  @apply text-yellow-700 dark:text-yellow-400;
  @apply hover:bg-yellow-200 dark:hover:bg-yellow-900/30;
}

.settings-button--danger {
  @apply bg-red-100 dark:bg-red-900/20;
  @apply text-red-700 dark:text-red-400;
  @apply hover:bg-red-200 dark:hover:bg-red-900/30;
}

/* Modal footer */
.modal-footer {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply border-t border-gray-200 dark:border-gray-700;
}

.modal-footer__actions {
  @apply flex gap-3;
}

.modal-button {
  @apply px-4 py-2 rounded-lg;
  @apply text-sm font-medium;
  @apply transition-all duration-fast;
}

.modal-button--primary {
  @apply bg-primary text-white;
  @apply hover:bg-primary-700;
}

.modal-button--secondary {
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
}

.modal-button--cancel {
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-fast;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  @apply scale-95;
}
</style>