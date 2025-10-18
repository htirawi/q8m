<script setup lang="ts">
import type {
  IFriendRequestsProps as Props,
  IFriendRequestsEmits as Emits,
} from "@/types/components/friends";
import { ref, computed, onMounted } from "vue";
import { useFriends } from "@/composables/useFriends";

const props = withDefaults(defineProps<Props>(), {
  initialTab: "received",
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
const activeTab = ref<"received" | "sent">(props.initialTab);
const processingRequest = ref<string | null>(null);

// Computed
const showReceivedEmpty = computed(
  () => activeTab.value === "received" && !loading.value && !hasReceivedRequests.value
);

const showSentEmpty = computed(
  () => activeTab.value === "sent" && !loading.value && !hasSentRequests.value
);

// Methods
const handleAccept = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await acceptRequest(userId);
    if (success) {
      emit("request-accepted", userId);
    }
  } finally {
    processingRequest.value = null;
  }
};

const handlereject = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await rejectRequest(userId);
    if (success) {
      emit("request-rejected", userId);
    }
  } finally {
    processingRequest.value = null;
  }
};

const handlecancel = async (userId: string) => {
  processingRequest.value = userId;
  try {
    const success = await cancelRequest(userId);
    if (success) {
      emit("request-cancelled", userId);
    }
  } finally {
    processingRequest.value = null;
  }
};

const switchtab = async (tab: "received" | "sent") => {
  activeTab.value = tab;
  if (tab === "received" && receivedRequests.value.length === 0) {
    await loadReceivedRequests();
  } else if (tab === "sent" && sentRequests.value.length === 0) {
    await loadSentRequests();
  }
};

// Lifecycle
onMounted(async () => {
  if (activeTab.value === "received") {
    await loadReceivedRequests();
  } else {
    await loadSentRequests();
  }
});
</script>

<template>
  <div class="friend-requests">
    <!-- Tabs -->
    <div class="mb-6 flex border-b border-gray-200 dark:border-gray-700">
      <button
        @click="switchTab('received')"
        :class="[
          'relative flex-1 px-4 py-3 text-sm font-medium transition-colors',
          activeTab === 'received'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          Received
          <span
            v-if="showCounts && receivedRequestsCount > 0"
            class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
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
          'relative flex-1 px-4 py-3 text-sm font-medium transition-colors',
          activeTab === 'sent'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          Sent
          <span
            v-if="showCounts && sentRequestsCount > 0"
            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-400"
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
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse rounded-lg bg-white p-4 dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Received Requests Tab -->
    <div v-else-if="activeTab === 'received'">
      <!-- Empty State -->
      <div v-if="showReceivedEmpty" class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
        <div class="mb-4 text-6xl">📭</div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No friend requests</h3>
        <p class="text-gray-600 dark:text-gray-400">You don't have any pending friend requests</p>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-4">
        <div
          v-for="request in receivedRequests"
          :key="request._id"
          class="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(request).type === 'initials'"
                :class="[
                  getAvatarColor(request.name),
                  'flex h-12 w-12 items-center justify-center rounded-full font-bold text-white',
                ]"
              >
                {{ getUserAvatar(request).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(request).value"
                :alt="request.name"
                class="h-12 w-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <h3 class="truncate font-semibold text-gray-900 dark:text-white">
                  {{ request.name }}
                </h3>
                <span :class="['text-sm', getLevelColor(request.level)]">
                  {{ getLevelBadge(request.level) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Level {{ request.level }}</div>
              <div v-if="request.requestedAt" class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {{ formatDate(request.requestedAt) }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-shrink-0 items-center gap-2">
              <button
                @click="handleAccept(request._id)"
                :disabled="processingRequest === request._id"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
              >
                Accept
              </button>
              <button
                @click="handleReject(request._id)"
                :disabled="processingRequest === request._id"
                class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
      <div v-if="showSentEmpty" class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
        <div class="mb-4 text-6xl">📤</div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          No pending requests
        </h3>
        <p class="text-gray-600 dark:text-gray-400">You haven't sent any friend requests</p>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-4">
        <div
          v-for="request in sentRequests"
          :key="request._id"
          class="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(request).type === 'initials'"
                :class="[
                  getAvatarColor(request.name),
                  'flex h-12 w-12 items-center justify-center rounded-full font-bold text-white',
                ]"
              >
                {{ getUserAvatar(request).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(request).value"
                :alt="request.name"
                class="h-12 w-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <h3 class="truncate font-semibold text-gray-900 dark:text-white">
                  {{ request.name }}
                </h3>
                <span :class="['text-sm', getLevelColor(request.level)]">
                  {{ getLevelBadge(request.level) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Level {{ request.level }}</div>
              <div class="mt-1 flex items-center gap-2">
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
                class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
