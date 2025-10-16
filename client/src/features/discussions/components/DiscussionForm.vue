<script setup lang="ts">
import type { IDiscussionFormProps as Props, IDiscussionFormEmits as Emits } from "@/types/components/discussions";
import { ref, computed } from 'vue';
import { useDiscussions } from '@/composables/useDiscussions';





const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start a discussion...',
  minRows: 3,
  maxRows: 10,
  showCancel: false,
});

const emit = defineEmits<Emits>();

const { validateContent } = useDiscussions();

// State
const content = ref('');
const isFocused = ref(false);
const isSubmitting = ref(false);

// Computed
const characterCount = computed(() => content.value.length);
const maxCharacters = 2000;
const remainingCharacters = computed(() => maxCharacters - characterCount.value);

const validation = computed(() => validateContent(content.value));
const canSubmit = computed(
  () => validation.value.valid && !isSubmitting.value && content.value.trim().length > 0
);

const showCharacterCount = computed(
  () => isFocused.value || characterCount.value > maxCharacters * 0.8
);

const characterCountColor = computed(() => {
  const percentage = characterCount.value / maxCharacters;
  if (percentage >= 1) return 'text-red-600 dark:text-red-400';
  if (percentage >= 0.9) return 'text-orange-600 dark:text-orange-400';
  if (percentage >= 0.8) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-500 dark:text-gray-400';
});

// Methods
const handleSubmit = async () => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;
  try {
    emit('submit', content.value.trim());
    content.value = '';
    isFocused.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  content.value = '';
  isFocused.value = false;
  emit('cancel');
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleKeydown = (event: KeyboardEvent) => {
  // Submit on Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <div class="discussion-form">
    <!-- Textarea -->
    <div class="relative">
      <textarea
        v-model="content"
        :placeholder="placeholder"
        :rows="minRows"
        class="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
        :class="[
          validation.valid || content.length === 0
            ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-transparent'
            : 'border-red-300 dark:border-red-600 focus:ring-red-500',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
        ]"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Character Count -->
      <div
        v-if="showCharacterCount"
        class="absolute bottom-2 right-2 text-xs font-medium"
        :class="characterCountColor"
      >
        {{ remainingCharacters }} characters remaining
      </div>
    </div>

    <!-- Validation Error -->
    <div
      v-if="!validation.valid && content.length > 0"
      class="mt-2 text-sm text-red-600 dark:text-red-400"
    >
      {{ validation.error }}
    </div>

    <!-- Actions -->
    <div
      v-if="isFocused || content.length > 0"
      class="flex items-center justify-between mt-3"
    >
      <!-- Helper Text -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <span class="hidden sm:inline">Press</span>
        <kbd
          class="mx-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono"
        >
          Ctrl+Enter
        </kbd>
        <span class="hidden sm:inline">to submit</span>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          v-if="showCancel"
          @click="handleCancel"
          type="button"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit"
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="[
            canSubmit
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',
          ]"
        >
          <span v-if="isSubmitting">Posting...</span>
          <span v-else>Post Discussion</span>
        </button>
      </div>
    </div>

    <!-- Guidelines (when focused and empty) -->
    <div
      v-if="isFocused && content.length === 0"
      class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <p class="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
        Discussion Guidelines:
      </p>
      <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-disc">
        <li>Be respectful and constructive</li>
        <li>Focus on the question and its concepts</li>
        <li>Share insights and alternative approaches</li>
        <li>Ask clarifying questions if needed</li>
        <li>Keep discussions relevant and helpful</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.discussion-form {
  @apply w-full;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}
</style>
