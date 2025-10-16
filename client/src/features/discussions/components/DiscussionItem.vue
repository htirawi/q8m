<script setup lang="ts">
import type { IDiscussionItemProps as Props } from "@/types/components/discussions";
import { ref, computed } from 'vue';
import { useDiscussions } from '@/composables/useDiscussions';
import { useAuthStore } from '@/stores/auth';
import type { Discussion } from '@/stores/discussions';
import DiscussionActions from './DiscussionActions.vue';
import ReplyForm from './ReplyForm.vue';



const props = withDefaults(defineProps<Props>(), {
  isReply: false,
});

const authStore = useAuthStore();
const {
  createReply,
  editDiscussion,
  formatDate,
  getReplyCount,
  getLevelColor,
  getLevelBadge,
  canEdit,
  canDelete,
} = useDiscussions();

// State
const showReplyForm = ref(false);
const showReplies = ref(true);
const isEditing = ref(false);
const editContent = ref(props.discussion.content);

// Computed
const replyCount = computed(() => getReplyCount(props.discussion));
const userLevel = computed(() => props.discussion.userId.gamification?.level || 0);
const levelColor = computed(() => getLevelColor(userLevel.value));
const levelBadge = computed(() => getLevelBadge(userLevel.value));
const timeAgo = computed(() => formatDate(props.discussion.createdAt));

const canEditDiscussion = computed(() =>
  canEdit(props.discussion, authStore.user?.userId, authStore.user?.role)
);

const canDeleteDiscussion = computed(() =>
  canDelete(props.discussion, authStore.user?.userId, authStore.user?.role)
);

// Methods
const handleReply = async (content: string) => {
  await createReply(props.questionId, props.discussion._id, content);
  showReplyForm.value = false;
  showReplies.value = true;
};

const handleEdit = async () => {
  if (editContent.value.trim() === props.discussion.content) {
    isEditing.value = false;
    return;
  }

  const success = await editDiscussion(props.discussion._id, editContent.value);
  if (success) {
    isEditing.value = false;
  }
};

const cancelEdit = () => {
  editContent.value = props.discussion.content;
  isEditing.value = false;
};

const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value;
  if (showReplyForm.value) {
    showReplies.value = true;
  }
};

const toggleReplies = () => {
  showReplies.value = !showReplies.value;
};
</script>

<template>
  <div
    :class="[
      'discussion-item',
      'bg-white dark:bg-gray-800 rounded-lg p-6 transition-all',
      {
        'border-2 border-yellow-400 dark:border-yellow-500': discussion.isPinned,
        'border-2 border-green-400 dark:border-green-500': discussion.isBestAnswer,
        'border border-gray-200 dark:border-gray-700':
          !discussion.isPinned && !discussion.isBestAnswer,
        'ml-12': isReply,
        'opacity-50': discussion.isReported,
      },
    ]"
  >
    <!-- Header -->
    <div class="flex items-start gap-4 mb-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold"
        >
          {{ discussion.userId.name.charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- User Info -->
        <div class="flex items-center gap-2 mb-2">
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ discussion.userId.name }}
          </span>
          <span :class="['text-sm', levelColor]">
            {{ levelBadge }} Level {{ userLevel }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">•</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ timeAgo }}
          </span>
          <span
            v-if="discussion.isEdited"
            class="text-sm text-gray-400 dark:text-gray-500"
            title="Edited"
          >
            (edited)
          </span>
        </div>

        <!-- Badges -->
        <div v-if="discussion.isPinned || discussion.isBestAnswer" class="flex gap-2 mb-2">
          <span
            v-if="discussion.isPinned"
            class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded"
          >
            📌 Pinned
          </span>
          <span
            v-if="discussion.isBestAnswer"
            class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded"
          >
            ✓ Best Answer
          </span>
        </div>

        <!-- Content (Edit Mode) -->
        <div v-if="isEditing" class="mb-4">
          <textarea
            v-model="editContent"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Edit your discussion..."
          />
          <div class="flex gap-2 mt-2">
            <button
              @click="handleEdit"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              @click="cancelEdit"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Content (View Mode) -->
        <div
          v-else
          class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words mb-4"
        >
          {{ discussion.content }}
        </div>

        <!-- Actions -->
        <DiscussionActions
          v-if="!isEditing"
          :discussion="discussion"
          :question-creator-id="questionCreatorId"
          :can-edit="canEditDiscussion"
          :can-delete="canDeleteDiscussion"
          @reply="toggleReplyForm"
          @edit="isEditing = true"
        />
      </div>
    </div>

    <!-- Reply Form -->
    <div v-if="showReplyForm" class="mt-4 ml-14">
      <ReplyForm
        @submit="handleReply"
        @cancel="showReplyForm = false"
        :placeholder="`Reply to ${discussion.userId.name}...`"
      />
    </div>

    <!-- Replies -->
    <div v-if="discussion.replies && discussion.replies.length > 0" class="mt-4">
      <!-- Toggle Replies Button -->
      <button
        @click="toggleReplies"
        class="ml-14 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium mb-2"
      >
        <span v-if="showReplies">
          ▼ Hide {{ replyCount }} {{ replyCount === 1 ? 'reply' : 'replies' }}
        </span>
        <span v-else>
          ▶ Show {{ replyCount }} {{ replyCount === 1 ? 'reply' : 'replies' }}
        </span>
      </button>

      <!-- Replies List -->
      <div v-show="showReplies" class="space-y-4">
        <DiscussionItem
          v-for="reply in discussion.replies"
          :key="reply._id"
          :discussion="reply"
          :question-id="questionId"
          :question-creator-id="questionCreatorId"
          :is-reply="true"
        />
      </div>
    </div>

    <!-- Reported Notice -->
    <div
      v-if="discussion.isReported"
      class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <p class="text-sm text-red-700 dark:text-red-400">
        ⚠️ This discussion has been reported and is under review.
      </p>
    </div>
  </div>
</template>

<style scoped>
.discussion-item {
  @apply transition-all duration-200;
}

.discussion-item:hover {
  @apply shadow-md;
}
</style>
