<script setup lang="ts">
import type {
  IDiscussionActionsProps as Props,
  IDiscussionActionsEmits as Emits,
} from "@/types/components/discussions";
import { ref, computed } from "vue";
import { useDiscussions } from "@/composables/useDiscussions";
import { useAuthStore } from "@/stores/auth";
import type { Discussion } from "@/stores/discussions";

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  canDelete: false,
});

const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const { likeDiscussion, removeDiscussion, pin, setBestAnswer, report, canPin, canMarkBestAnswer } =
  useDiscussions();

// State
const showDeleteConfirm = ref(false);
const showReportModal = ref(false);
const reportReason = ref("");
const isProcessing = ref(false);

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userId = computed(() => authStore.user?.userId);
const userRole = computed(() => authStore.user?.role);

const canPinDiscussion = computed(() => canPin(userRole.value));
const canSetBestAnswer = computed(() =>
  canMarkBestAnswer(props.questionCreatorId, userId.value, userRole.value)
);

// Methods
const handleLike = async () => {
  if (!isAuthenticated.value) {
    // Redirect to login or show message
    return;
  }
  await likeDiscussion(props.discussion._id);
};

const handleReply = () => {
  if (!isAuthenticated.value) {
    // Redirect to login or show message
    return;
  }
  emit("reply");
};

const handleEdit = () => {
  emit("edit");
};

const handleDelete = async () => {
  if (!showDeleteConfirm.value) {
    showDeleteConfirm.value = true;
    return;
  }

  isProcessing.value = true;
  try {
    await removeDiscussion(props.discussion._id);
    showDeleteConfirm.value = false;
  } finally {
    isProcessing.value = false;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};

const handlePin = async () => {
  isProcessing.value = true;
  try {
    await pin(props.discussion._id);
  } finally {
    isProcessing.value = false;
  }
};

const handleBestAnswer = async () => {
  isProcessing.value = true;
  try {
    await setBestAnswer(props.discussion._id);
  } finally {
    isProcessing.value = false;
  }
};

const handleReport = async () => {
  if (!reportReason.value.trim()) {
    return;
  }

  isProcessing.value = true;
  try {
    await report(props.discussion._id, reportReason.value);
    showReportModal.value = false;
    reportReason.value = "";
  } finally {
    isProcessing.value = false;
  }
};

const cancelReport = () => {
  showReportModal.value = false;
  reportReason.value = "";
};
</script>

<template>
  <div class="discussion-actions">
    <!-- Main Actions -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- Like Button -->
      <button
        @click="handleLike"
        :disabled="!isAuthenticated"
        class="group flex items-center gap-1 transition-colors"
        :class="[
          discussion.likedByCurrentUser
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400',
          !isAuthenticated && 'cursor-not-allowed opacity-50',
        ]"
      >
        <svg
          class="h-5 w-5"
          :class="discussion.likedByCurrentUser ? 'fill-current' : 'fill-none'"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span class="text-sm font-medium">{{ discussion.likesCount }} </span>
      </button>

      <!-- Reply Button -->
      <button
        @click="handleReply"
        :disabled="!isAuthenticated"
        class="flex items-center gap-1 text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        :class="!isAuthenticated && 'cursor-not-allowed opacity-50'"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <span class="text-sm font-medium">Reply</span>
      </button>

      <!-- Edit Button -->
      <button
        v-if="canEdit"
        @click="handleEdit"
        class="flex items-center gap-1 text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span class="text-sm font-medium">Edit</span>
      </button>

      <!-- Delete Button -->
      <button
        v-if="canDelete"
        @click="handleDelete"
        :disabled="isProcessing"
        class="flex items-center gap-1 text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
        :class="isProcessing && 'cursor-not-allowed opacity-50'"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span class="text-sm font-medium">Delete</span>
      </button>

      <!-- Pin Button (Admin Only) -->
      <button
        v-if="canPinDiscussion"
        @click="handlePin"
        :disabled="isProcessing"
        class="flex items-center gap-1 transition-colors"
        :class="[
          discussion.isPinned
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400',
          isProcessing && 'cursor-not-allowed opacity-50',
        ]"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span class="text-sm font-medium">
          {{ discussion.isPinned ? "Unpin" : "Pin" }}
        </span>
      </button>

      <!-- Best Answer Button -->
      <button
        v-if="canSetBestAnswer"
        @click="handleBestAnswer"
        :disabled="isProcessing"
        class="flex items-center gap-1 transition-colors"
        :class="[
          discussion.isBestAnswer
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400',
          isProcessing && 'cursor-not-allowed opacity-50',
        ]"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm font-medium">
          {{ discussion.isBestAnswer ? "Remove Best Answer" : "Mark as Best Answer" }}
        </span>
      </button>

      <!-- Report Button -->
      <button
        v-if="isAuthenticated && !discussion.isReported"
        @click="showReportModal = true"
        class="flex items-center gap-1 text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span class="text-sm font-medium">Report</span>
      </button>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="showDeleteConfirm"
      class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
    >
      <p class="mb-3 text-sm text-red-700 dark:text-red-400">
        Are you sure you want to delete this discussion? This action cannot be undone.
      </p>
      <div class="flex gap-2">
        <button
          @click="handleDelete"
          :disabled="isProcessing"
          class="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
        >
          {{ isProcessing ? "Deleting..." : "Yes, Delete" }}
        </button>
        <button
          @click="cancelDelete"
          class="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Report Modal -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      @click.self="cancelReport"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800" @click.stop>
        <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Report Discussion</h3>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Please provide a reason for reporting this discussion. Our moderators will review it.
        </p>
        <textarea
          v-model="reportReason"
          rows="4"
          class="mb-4 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Describe the issue..."
        />
        <div class="flex justify-end gap-2">
          <button
            @click="cancelReport"
            class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            @click="handleReport"
            :disabled="!reportReason.trim() || isProcessing"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="[
              reportReason.trim() && !isProcessing
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
            ]"
          >
            {{ isProcessing ? "Reporting..." : "Submit Report" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discussion-actions {
  @apply w-full;
}
</style>
