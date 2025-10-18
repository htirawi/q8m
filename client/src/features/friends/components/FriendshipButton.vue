<script setup lang="ts">
import type { IFriendshipButtonProps as Props } from "../../../types/components/friends";
import { ref, computed, onMounted } from "vue";
import { useFriends } from "../../../composables/useFriends";
import type { FriendStatus } from "../../../stores/friends";

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showIcon: true,
});

const {
  getFriendshipStatus,
  sendRequest,
  acceptRequest,
  cancelRequest,
  unfriend,
  getActionLabel,
  getActionColor,
  loading,
} = useFriends();

// State
const status = ref<FriendStatus | null>(null);
const isProcessing = ref(false);

// Computed
const buttonLabel = computed(() => {
  if (!status.value) return "Loading...";
  return getActionLabel(status.value);
});

const buttonColor = computed(() => {
  if (!status.value) return "bg-gray-400";
  return getActionColor(status.value);
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "px-3 py-1.5 text-sm";
    case "lg":
      return "px-6 py-3 text-base";
    default:
      return "px-4 py-2 text-sm";
  }
});

const isDisabled = computed(() => {
  return (
    isProcessing.value ||
    loading.value ||
    !status.value ||
    (status.value.status === "blocked" && !status.value.canUnblock)
  );
});

// Methods
const loadStatus = async () => {
  status.value = await getFriendshipStatus(props.userId);
};

const handleClick = async () => {
  if (!status.value || isProcessing.value) return;
  isProcessing.value = true;
  try {
    let success = false;

    if (status.value.status === "none") {
      // Send friend request
      success = await sendRequest(props.userId);
    } else if (status.value.status === "pending") {
      if (status.value.canAccept) {
        // Accept request
        success = await acceptRequest(props.userId);
      } else if (status.value.canCancel) {
        // Cancel sent request
        success = await cancelRequest(props.userId);
      }
    } else if (status.value.status === "friends") {
      // Unfriend
      success = await unfriend(props.userId);
    }

    if (success) {
      // Reload status
      await loadStatus();
    }
  } finally {
    isProcessing.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadStatus();
});
</script>

<template>
  <button
    @click="handleClick"
    :disabled="isDisabled"
    :class="[
      'friendship-button rounded-lg font-medium text-white transition-all',
      'flex items-center justify-center gap-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'hover:shadow-md active:scale-95',
      buttonColor,
      sizeClasses,
    ]"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="isProcessing || loading"
      class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Icons -->
    <span v-else-if="showIcon">
      <!-- Add Friend Icon -->
      <svg
        v-if="status?.status === 'none'"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>

      <!-- Accept Icon -->
      <svg
        v-else-if="status?.canAccept"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>

      <!-- Cancel/Remove Icon -->
      <svg
        v-else-if="status?.canCancel || status?.canUnfriend"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </span>

    <!-- Label -->
    <span>{{ buttonLabel }} </span>
  </button>
</template>

<style scoped>
.friendship-button {
  @apply transition-all duration-200;
}

.friendship-button:not(:disabled):hover {
  @apply -translate-y-0.5 transform;
}
</style>
