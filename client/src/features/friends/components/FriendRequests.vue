<script setup lang="ts">
import type { IFriendRequestsProps as Props, IFriendRequestsEmits as Emits } from "@/types/components/friends";
import { ref, computed, onMounted } from 'vue';
import { useFriends } from '@/composables/useFriends';





const props = withDefaults(defineProps<Props>(), {
  initialTab: 'received',
  showCounts: true,
});

const emit = defineEmits<Emits>();

const {
  receivedRequests,
  sentRequests,
  loading,
  error,
  hasReceivedRequests,
  hasSentRequests,
  receivedRequestsCount,
  sentRequestsCount,
  loadReceivedRequests,
  loadSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getUserAvatar,
  getAvatarColor,
  getLevelColor,
  getLevelBadge,
  formatDate,
} = useFriends();

// State
const activeTab = ref<'received' | 'sent'>(props.initialTab);
const processingRequest = ref<string | null>(null);

// Computed
const showReceivedEmpty = computed(
  () => activeTab.value === 'received' && !loading.value && !hasReceivedRequests.value
);

const showSentEmpty = computed(
  () => activeTab.value === 'sent' && !loading.value && !hasSentRequests.value
);

// Methods
const handleAccept = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await acceptRequest(userId);
    if (success) {
      emit('request-accepted', userId);
    }
  }

 finally {
    processingRequest.value = null;
  }
};

const handlereject = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await rejectRequest(userId);
    if (success) {
      emit('request-rejected', userId);
    }
  }

 finally {
    processingRequest.value = null;
  }
};

const handlecancel = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await cancelRequest(userId);
    if (success) {
      emit('request-cancelled', userId);
    }
  }

 finally {
    processingRequest.value = null;
  }
};

const switchtab = async (tab: 'received' | 'sent') => {
  activeTab.value = tab;
  if (tab === 'received' && receivedRequests.value.length === 0) {
    await loadReceivedRequests();
  } else if (tab === 'sent' && sentRequests.value.length === 0) {
    await loadSentRequests();
  }
};

// Lifecycle
onMounted(async () => {
  if (activeTab.value === 'received') {
    await loadReceivedRequests();
  } else {
    await loadSentRequests();
  }
});
</script>

<template>
  <div class="friend-requests">
    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        @click="switchTab('received')"
        :class="[
          'flex-1 py-3 px-4 font-medium text-sm transition-colors relative',
          activeTab === 'received'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          Received
          <span
            v-if="showCounts && receivedRequestsCount > 0"
            class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold"
          >
            {{ receivedRequestsCount }}

          </span>
        </span>
        <div
          v-if="activeTab === 'received'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
        ></div>
      </button>

      <button
        @click="switchTab('sent')"
        :class="[
          'flex-1 py-3 px-4 font-medium text-sm transition-colors relative',
          activeTab === 'sent'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          Sent
          <span
            v-if="showCounts && sentRequestsCount > 0"
            class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold"
          >
            {{ sentRequestsCount }}

          </span>
        </span>
        <div
          v-if="activeTab === 'sent'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
        ></div>
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Received Requests Tab -->
    <div v-else-if="activeTab === 'received'">
      <!-- Empty State -->
      <div
        v-if="showReceivedEmpty"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
      >
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No friend requests
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          You don't have any pending friend requests
        </p>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-4">
        <div
          v-for="request in receivedRequests"
          :key="request._id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(request).type === 'initials'"
                :class="[
                  getAvatarColor(request.name),
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                ]"
              >
                {{ getUserAvatar(request).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(request).value"
                :alt="request.name"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ request.name }}
                </h3>
                <span :class="['text-sm', getLevelColor(request.level)]">
                  {{ getLevelBadge(request.level) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Level {{ request.level }}
              </div>
              <div
                v-if="request.requestedAt"
                class="text-xs text-gray-500 dark:text-gray-500 mt-1"
              >
                {{ formatDate(request.requestedAt) }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0 flex items-center gap-2">
              <button
                @click="handleAccept(request._id)"
                :disabled="processingRequest === request._id"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Accept
              </button>
              <button
                @click="handleReject(request._id)"
                :disabled="processingRequest === request._id"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sent Requests Tab -->
    <div v-else-if="activeTab === 'sent'">
      <!-- Empty State -->
      <div
        v-if="showSentEmpty"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
      >
        <div class="text-6xl mb-4">📤</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No pending requests
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          You haven't sent any friend requests
        </p>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-4">
        <div
          v-for="request in sentRequests"
          :key="request._id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(request).type === 'initials'"
                :class="[
                  getAvatarColor(request.name),
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                ]"
              >
                {{ getUserAvatar(request).value }}

              </div>
              <img
                v-else
                :src="getUserAvatar(request).value"
                :alt="request.name"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ request.name }}

                </h3>
                <span :class="['text-sm', getLevelColor(request.level)]">
                  {{ getLevelBadge(request.level) }}

                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Level {{ request.level }}

              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-500">
                  Sent {{ formatDate(request.sentAt!) }}

                </span>
                <span class="text-xs text-yellow-600 dark:text-yellow-400">• Pending</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0">
              <button
                @click="handleCancel(request._id)"
                :disabled="processingRequest === request._id"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-requests {
  @apply w-full;
}
</style>
