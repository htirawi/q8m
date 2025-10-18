<script setup lang="ts">
import type {
  IFriendCardProps as Props,
  IFriendCardEmits as Emits,
} from "@/types/components/friends";
import { computed } from "vue";
import { useFriends } from "@/composables/useFriends";
import type { Friend } from "@/stores/friends";

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  compact: false,
});

const emit = defineEmits<Emits>();

const { getLevelColor, getLevelBadge, getLevelTitle, formatDate, getUserAvatar, getAvatarColor } =
  useFriends();

// Computed
const avatar = computed(() => getUserAvatar(props.friend));
const levelColor = computed(() => getLevelColor(props.friend.level));
const levelBadge = computed(() => getLevelBadge(props.friend.level));
const levelTitle = computed(() => getLevelTitle(props.friend.level));
const avatarColor = computed(() => getAvatarColor(props.friend.name));
const friendSinceText = computed(() =>
  props.friend.friendSince ? formatDate(props.friend.friendSince as Date | string) : "Recently"
);

// Methods
const handleUnfriend = () => {
  emit("unfriend", props.friend._id);
};

const handleBlock = () => {
  emit("block", props.friend._id);
};

const handleView = () => {
  emit("view", props.friend._id);
};
</script>

<template>
  <div
    class="friend-card rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    :class="{ 'p-4': !compact, 'p-3': compact }"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          v-if="avatar.type === 'initials'"
          :class="[
            avatarColor,
            'flex items-center justify-center rounded-full font-bold text-white',
            compact ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base',
          ]"
        >
          {{ avatar.value ?? 0 }}
        </div>
        <img
          v-else
          :src="avatar.value"
          :alt="friend.name"
          :class="['rounded-full object-cover', compact ? 'h-10 w-10' : 'h-12 w-12']"
        />
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex items-center gap-2">
          <h3
            class="truncate font-semibold text-gray-900 dark:text-white"
            :class="compact ? 'text-sm' : 'text-base'"
          >
            {{ friend.name ?? "" }}
          </h3>
          <span :class="['text-sm', levelColor]" :title="levelTitle">
            {{ levelBadge }}
          </span>
        </div>

        <div
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400"
          :class="compact ? 'text-xs' : 'text-sm'"
        >
          <span>Level {{ friend.level ?? 0 }} </span>
          <span>•</span>
          <span
            >{{ friend.xp?.toLocaleString() }}

            XP</span
          >
        </div>

        <div
          v-if="!compact && friend.friendSince"
          class="mt-1 text-xs text-gray-500 dark:text-gray-500"
        >
          Friends since {{ friendSinceText }}
        </div>

        <div
          v-if="!compact && friend.mutualFriends && friend.mutualFriends > 0"
          class="mt-1 text-xs text-indigo-600 dark:text-indigo-400"
        >
          {{ friend.mutualFriends }}

          mutual friend{{ friend.mutualFriends > 1 ? "s" : "" }}
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex flex-shrink-0 items-center gap-2">
        <button
          @click="handleView"
          class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
          title="View profile"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        <!-- More Actions Menu -->
        <div class="group relative">
          <button
            class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            title="More actions"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            class="invisible absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800"
          >
            <button
              @click="handleUnfriend"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Remove Friend
            </button>
            <button
              @click="handleBlock"
              class="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Block User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-card {
  @apply transition-all duration-200;
}

.friend-card:hover {
  @apply scale-[1.02] transform;
}
</style>
