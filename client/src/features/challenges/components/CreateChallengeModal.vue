<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"
          >
            <h2 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
              <span>🎮</span>
              Create Challenge
            </h2>
            <button
              @click="close"
              class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
            <!-- Select Friend -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Challenge Friend <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.challengedUserId"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a friend...</option>
                <option v-for="friend in friends" :key="friend._id" :value="friend._id">
                  {{ friend.name }} (Level {{ friend.level }})
                </option>
              </select>
            </div>

            <!-- Difficulty -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="diff in difficulties"
                  :key="diff.value"
                  type="button"
                  @click="formData.difficulty = diff.value"
                  :class="[
                    'rounded-lg border-2 p-4 transition-all',
                    formData.difficulty === diff.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600',
                  ]"
                >
                  <div class="mb-1 text-2xl">{{ diff.emoji }}</div>
                  <div class="font-medium capitalize text-gray-900 dark:text-white">
                    {{ diff.value }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Framework -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Framework (Optional)
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="fw in frameworks"
                  :key="fw.value"
                  type="button"
                  @click="
                    formData.framework = formData.framework === fw.value ? undefined : fw.value
                  "
                  :class="[
                    'rounded-lg border-2 p-4 transition-all',
                    formData.framework === fw.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600',
                  ]"
                >
                  <div class="mb-1 text-2xl">{{ fw.emoji }}</div>
                  <div class="font-medium capitalize text-gray-900 dark:text-white">
                    {{ fw.label }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Question Count -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Questions: {{ formData.questionCount }}
              </label>
              <input
                v-model.number="formData.questionCount"
                type="range"
                min="5"
                max="20"
                step="5"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-700"
              />
              <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>5 questions</span>
                <span>10 questions</span>
                <span>15 questions</span>
                <span>20 questions</span>
              </div>
            </div>

            <!-- Time Limit -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Limit: {{ formatTimeLimit(formData.timeLimit) }}
              </label>
              <input
                v-model.number="formData.timeLimit"
                type="range"
                min="300"
                max="1800"
                step="300"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-700"
              />
              <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>5 min</span>
                <span>10 min</span>
                <span>15 min</span>
                <span>20 min</span>
                <span>25 min</span>
                <span>30 min</span>
              </div>
            </div>

            <!-- Message -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message (Optional)
              </label>
              <textarea
                v-model="formData.message"
                rows="3"
                maxlength="200"
                placeholder="Add a friendly message..."
                class="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              ></textarea>
              <p class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                {{ formData.message?.length || 0 }}

                /200
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
            >
              <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="close"
                :disabled="loading"
                class="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading || !isFormValid"
                class="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ loading ? "Creating..." : "Send Challenge" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ICreateChallengeModalProps as Props } from "@/types/components/challenges";
import { ref, computed, watch } from 'vue';
import type { Friend } from '@/stores/friends';
import type { CreateChallengeData } from '@/stores/challenges';
import { useChallenges } from '@/composables/useChallenges';



const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  close: [];
  submit: [;data: CreateChallengeData]
}>();

const { validateChallengeData } = useChallenges();

const formData = ref<CreateChallengeData>({
  challengedUserId: '',
  difficulty: 'medium',
  framework: undefined,
  questionCount: 10,
  timeLimit: 600,
  message: '',
});

const errorMessage = ref('');

const difficulties = [
  { value: 'easy' as const, emoji: '🟢', label: 'Easy' },
  { value: 'medium' as const, emoji: '🟡', label: 'Medium' },
  { value: 'hard' as const, emoji: '🔴', label: 'Hard' },
];

const frameworks = [
  { value: 'angular' as const, emoji: '🅰️', label: 'Angular' },
  { value: 'react' as const, emoji: '⚛️', label: 'React' },
  { value: 'nextjs' as const, emoji: '▲', label: 'Next.js' },
  { value: 'redux' as const, emoji: '🔄', label: 'Redux' },
  { value: 'random' as const, emoji: '🎲', label: 'Random' },
];

const isFormValid = computed(() => {
  return formData.value.challengedUserId && formData.value.difficulty;
});

const formatTimeLimit = (seconds: number): string => {
  const minutes = seconds / 60;
  return `${minutes} minutes`;
};

const close = () => {
  if (!props.loading) {
    emit('close');
    resetForm();
  }
};

const resetform = () => {
  formdata.value = {
    challengedUserId: '',
    difficulty: 'medium',
    framework: undefined,
    questionCount: 10,
    timeLimit: 600,
    message: '',
  };
  errorMessage.value = '';
};

const handlesubmit = () => {
  errorMessage.value = '';

  const validation = validateChallengeData(formData.value);
  if (!validation.valid) {
    errorMessage.value = validation.error || 'Invalid form data';
    return;
  }

  emit('submit', { ...formData.value });
};

// Reset form when modal closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      setTimeout(resetForm, 300); // Wait for transition
    }
  }
);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
