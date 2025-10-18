<script setup lang="ts">
import type { IReplyFormProps as Props, IReplyFormEmits as Emits } from "@/types/components/discussions";
import { ref, computed } from 'vue';
import { useDiscussions } from '@/composables/useDiscussions';





const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write a reply...',
});

const emit = defineEmits<Emits>();

const { validateContent } = useDiscussions();

// State
const content = ref('');
const isSubmitting = ref(false);

// Computed
const characterCount = computed(() => content.value.length);
const maxCharacters = 2000;
const remainingCharacters = computed(() => maxCharacters - characterCount.value);

const validation = computed(() => validateContent(content.value));
const canSubmit = computed(
  () => validation.value.valid && !isSubmitting.value && content.value.trim().length > 0
);

const showCharacterCount = computed(() => characterCount.value > maxCharacters * 0.8);

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
  }

 finally {
    isSubmitting.value = false;
  }
};

const handlecancel = () => {
  content.value = '';
  emit('cancel');
};

const handlekeydown = (event: KeyboardEvent) => {
  // Submit on Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
  // Cancel on Escape
  if (event.key === 'Escape') {
    handleCancel();
  }
};

</script>

<template>
  <div class="reply-form bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
    <!-- Textarea -->
    <div class="relative">
      <textarea
        v-model="content"
        :placeholder="placeholder"
        rows="3"
        class="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
        :class="[
          validation.valid || content.length === 0
            ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-transparent'
            : 'border-red-300 dark:border-red-600 focus:ring-red-500',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
        ]"
        @keydown="handleKeydown"
        autofocus
      />

      <!-- Character Count -->
      <div
        v-if="showCharacterCount"
        class="absolute bottom-2 right-2 text-xs font-medium"
        :class="characterCountColor"
      >
        {{ remainingCharacters }}

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
    <div class="flex items-center justify-between mt-3">
      <!-- Helper Text -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <kbd
          class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono"
        >
          Ctrl+Enter
        </kbd>
        <span class="ml-1">to reply</span>
        <span class="mx-2">•</span>
        <kbd
          class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono"
        >
          Esc
        </kbd>
        <span class="ml-1">to cancel</span>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
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
          <span v-else>Post Reply</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reply-form {
  @apply w-full;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}
</style>
