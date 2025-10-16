<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFriends } from '@/composables/useFriends';
import FriendList from '../components/FriendList.vue';
import FriendRequests from '../components/FriendRequests.vue';
import UserSearch from '../components/UserSearch.vue';
import FriendSuggestions from '../components/FriendSuggestions.vue';
import FriendCard from '../components/FriendCard.vue';

type TabType = 'friends' | 'requests' | 'search' | 'suggestions' | 'blocked';

const route = useRoute();
const router = useRouter();

const {
  friends,
  blockedUsers,
  loading,
  error,
  receivedRequestsCount,
  sentRequestsCount,
  loadBlockedUsers,
  unblock,
} = useFriends();

// State
const activeTab = ref<TabType>('friends');

// Computed
const totalRequestsCount = computed(() => receivedRequestsCount.value + sentRequestsCount.value);

const tabs = computed(() => [
  {
    id: 'friends' as TabType,
    label: 'Friends',
    icon: '👥',
    count: friends.value.length,
    showCount: true,
  },
  {
    id: 'requests' as TabType,
    label: 'Requests',
    icon: '📬',
    count: totalRequestsCount.value,
    showCount: true,
    highlight: totalRequestsCount.value > 0,
  },
  {
    id: 'search' as TabType,
    label: 'Find Friends',
    icon: '🔍',
    count: 0,
    showCount: false,
  },
  {
    id: 'suggestions' as TabType,
    label: 'Suggestions',
    icon: '✨',
    count: 0,
    showCount: false,
  },
  {
    id: 'blocked' as TabType,
    label: 'Blocked',
    icon: '🚫',
    count: blockedUsers.value.length,
    showCount: blockedUsers.value.length > 0,
  },
]);


// Methods
const switchTab = (tabId: TabType) => {
  activeTab.value = tabId;

  // Update URL without reloading
  router.push({
    name: 'friends',
    query: { tab: tabId }
  });

  // Load data for specific tabs
  if (tabId === 'blocked' && blockedUsers.value.length === 0) {
    loadBlockedUsers();
  }
};

const handleUnblock = async (userId: string) => {
  const success = await unblock(userId);
  if (success) {
    // Refresh blocked users list
    await loadBlockedUsers();
  }
};

const handleViewFriend = (userId: string) => {
  // Navigate to user profile or friend details page
  // For now, we'll just log it
  console.log('View friend:', userId);
  // TODO: Implement friend profile page
  // router.push({ name: 'friend-profile', params: { userId } });
};

const handleViewAllSuggestions = () => {
  switchTab('suggestions');
};

// Lifecycle
onMounted(() => {
  // Check URL query for tab
  const tabQuery = route.query.tab as TabType;
  if (tabQuery && ['friends', 'requests', 'search', 'suggestions', 'blocked'].includes(tabQuery)) {
    activeTab.value = tabQuery;
  }

  // Load blocked users if on blocked tab
  if (activeTab.value === 'blocked') {
    loadBlockedUsers();
  }
});
</script>

<template>
  <div class="friends-page min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Friends
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Connect with other learners and build your network
        </p>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav class="flex space-x-1 min-w-max" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.id" @click="switchTab(tab.id)" :class="[
            'flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative whitespace-nowrap',
            activeTab === tab.id
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
          ]">
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span v-if="tab.showCount && tab.count > 0" :class="[
              'px-2 py-0.5 rounded-full text-xs font-bold',
              tab.highlight
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            ]">
              {{ tab.count }}
            </span>
            <div v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
          </button>
        </nav>
      </div>

      <!-- Error State -->
      <div v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p class="text-red-700 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Friends Tab -->
        <div v-if="activeTab === 'friends'">
          <FriendList :show-search="true" :show-filters="true" initial-sort="recent" @view-friend="handleViewFriend" />
        </div>

        <!-- Requests Tab -->
        <div v-else-if="activeTab === 'requests'">
          <FriendRequests initial-tab="received" :show-counts="true" />
        </div>

        <!-- Find Friends Tab -->
        <div v-else-if="activeTab === 'search'">
          <UserSearch placeholder="Search users by name or email..." :auto-focus="true" :show-suggestions="true" />
        </div>

        <!-- Suggestions Tab -->
        <div v-else-if="activeTab === 'suggestions'">
          <FriendSuggestions :limit="12" layout="grid" :show-mutual-friends="true"
            @view-all="handleViewAllSuggestions" />
        </div>

        <!-- Blocked Tab -->
        <div v-else-if="activeTab === 'blocked'">
          <div>
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Blocked Users
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Users you've blocked won't be able to send you friend requests
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="blockedUsers.length === 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
              <div class="text-6xl mb-4">✅</div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No blocked users
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                You haven't blocked anyone yet
              </p>
            </div>

            <!-- Blocked Users List -->
            <div v-else class="space-y-4">
              <div v-for="user in blockedUsers" :key="user._id"
                class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center justify-between">
                  <FriendCard :friend="user" :show-actions="false" :compact="true" />
                  <button @click="handleUnblock(user._id)"
                    class="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                    Unblock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friends-page {
  @apply min-h-screen;
}

/* Ensure smooth transitions between tabs */
.tab-content {
  animation: fadeIn 200ms ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
