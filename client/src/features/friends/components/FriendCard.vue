<script setup lang="ts">
import type { IFriendCardProps as Props, IFriendCardEmits as Emits } from "@/types/components/friends";
import { computed } from 'vue';
import { useFriends } from '@/composables/useFriends';
import type { Friend } from '@/stores/friends';





const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  compact: false,
});

const emit = defineEmits<Emits>();

const {
  getLevelColor,
  getLevelBadge,
  getLevelTitle,
  formatDate,
  getUserAvatar,
  getAvatarColor,
} = useFriends();

// Computed
const avatar = computed(() => getUserAvatar(props.friend));
const levelColor = computed(() => getLevelColor(props.friend.level));
const levelBadge = computed(() => getLevelBadge(props.friend.level));
const levelTitle = computed(() => getLevelTitle(props.friend.level));
const avatarColor = computed(() => getAvatarColor(props.friend.name));
const friendSinceText = computed(() =>
  props.friend.friendSince ? formatDate(props.friend.friendSince) : 'Recently'
);

// Methods
const handleUnfriend = () => {
  emit('unfriend', props.friend._id);
};

const handleBlock = () => {
  emit('block', props.friend._id);
};

const handleView = () => {
  emit('view', props.friend._id);
};
</script>

<template>
  <div
    class="friend-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
    :class="{ 'p-4': !compact, 'p-3': compact }"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          v-if="avatar.type === 'initials'"
          :class="[
            avatarColor,
            'rounded-full flex items-center justify-center text-white font-bold',
            compact ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base',
          ]"
        >
          {{ avatar.value }}
        </div>
        <img
          v-else
          :src="avatar.value"
          :alt="friend.name"
          :class="[
            'rounded-full object-cover',
            compact ? 'w-10 h-10' : 'w-12 h-12',
          ]"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3
            class="font-semibold text-gray-900 dark:text-white truncate"
            :class="compact ? 'text-sm' : 'text-base'"
          >
            {{ friend.name }}
          </h3>
          <span :class="['text-sm', levelColor]" :title="levelTitle">
            {{ levelBadge }}
          </span>
        </div>

        <div
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400"
          :class="compact ? 'text-xs' : 'text-sm'"
        >
          <span>Level {{ friend.level }}</span>
          <span>•</span>
          <span>{{ friend.xp.toLocaleString() }} XP</span>
        </div>

        <div
          v-if="!compact && friend.friendSince"
          class="text-xs text-gray-500 dark:text-gray-500 mt-1"
        >
          Friends since {{ friendSinceText }}
        </div>

        <div
          v-if="!compact && friend.mutualFriends && friend.mutualFriends > 0"
          class="text-xs text-indigo-600 dark:text-indigo-400 mt-1"
        >
          {{ friend.mutualFriends }} mutual friend{{
            friend.mutualFriends > 1 ? 's' : ''
          }}
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex-shrink-0 flex items-center gap-2">
        <button
          @click="handleView"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="View profile"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        <!-- More Actions Menu -->
        <div class="relative group">
          <button
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More actions"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
          >
            <button
              @click="handleUnfriend"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Remove Friend
            </button>
            <button
              @click="handleBlock"
              class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
  @apply transform scale-[1.02];
}
</style>
