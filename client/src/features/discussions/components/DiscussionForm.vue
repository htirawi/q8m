<script setup lang="ts">
import type {
  IDiscussionFormProps as Props,
  IDiscussionFormEmits as Emits,
} from "../../../types/components/discussions";
import { ref, computed } from "vue";
import { useDiscussions } from "../../../composables/useDiscussions";

withDefaults(defineProps<Props>(), {
  placeholder: "Start a discussion...",
  minRows: 3,
  maxRows: 10,
  showCancel: false,
});

const emit = defineEmits<Emits>();

const { validateContent } = useDiscussions();

// State
const content = ref("");
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
  if (percentage >= 1) return "text-red-600 dark:text-red-400";
  if (percentage >= 0.9) return "text-orange-600 dark:text-orange-400";
  if (percentage >= 0.8) return "text-yellow-600 dark:text-yellow-400";
  return "text-gray-500 dark:text-gray-400";
});

// Methods
const handleSubmit = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  try {
    emit("submit", content.value.trim());
    content.value = "";
    isFocused.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  content.value = "";
  isFocused.value = false;
  emit("cancel");
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleKeydown = (event: KeyboardEvent) => {
  // Submit on Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
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
        class="w-full resize-none rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2"
        :class="[
          validation.valid || content.length === 0
            ? 'border-gray-300 focus:border-transparent focus:ring-indigo-500 dark:border-gray-600'
            : 'border-red-300 focus:ring-red-500 dark:border-red-600',
          'bg-white text-gray-900 dark:bg-gray-800 dark:text-white',
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
        {{ remainingCharacters }}

        characters remaining
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
    <div v-if="isFocused || content.length > 0" class="mt-3 flex items-center justify-between">
      <!-- Helper Text -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <span class="hidden sm:inline">Press</span>
        <kbd
          class="mx-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-700"
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
          class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit"
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          :class="[
            canSubmit
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
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
      class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
    >
      <p class="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
        Discussion Guidelines:
      </p>
      <ul class="ml-4 list-disc space-y-1 text-xs text-blue-700 dark:text-blue-400">
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
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}
</style>
