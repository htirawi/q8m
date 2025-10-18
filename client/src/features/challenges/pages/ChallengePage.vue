<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span>🎮</span>
          Quiz Challenges
        </h1>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center gap-2"
        >
          <span>+</span>
          New Challenge
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</div>
          <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ winRate.toFixed(1) }}%
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Wins</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ stats.wins }}

          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Score</div>
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ stats.bestScore.toFixed(1) }}%
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</div>
          <div :class="['text-2xl font-bold', getPerformanceColor()]">
            {{ getPerformanceRating() }}

          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-6 py-4 font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
            ]"
          >
            <span class="flex items-center justify-center gap-2">
              <span>{{ tab.icon }}

</span>
              <span>{{ tab.label }}

</span>
              <span
                v-if="tab.count > 0"
                :class="[
                  'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold',
                  activeTab === tab.id && tab.highlight
                    ? 'bg-indigo-600 text-white'
                    : tab.highlight
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                ]"
              >
                {{ tab.count }}

              </span>
            </span>
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div>
      <!-- All Challenges -->
      <div v-if="activeTab === 'all'">
        <ChallengeList
          :challenges="challenges"
          :loading="loading"
          :pagination="pagination"
          empty-state-title="No challenges yet"
          empty-state-message="Create a challenge to get started!"
          @accept="handleAccept"
          @reject="handleReject"
          @start="handleStart"
          @view-details="handleViewDetails"
          @load-more="handleLoadMore"
          @create-challenge="showCreateModal = true"
        />
      </div>

      <!-- Received Challenges -->
      <div v-if="activeTab === 'received'">
        <ChallengeList
          :challenges="receivedChallenges"
          :loading="loading"
          :pagination="pagination"
          empty-state-title="No received challenges"
          empty-state-message="You haven't received any challenges yet"
          :show-create-button="false"
          @accept="handleAccept"
          @reject="handleReject"
          @start="handleStart"
          @view-details="handleViewDetails"
          @load-more="handleLoadMore"
        />
      </div>

      <!-- Sent Challenges -->
      <div v-if="activeTab === 'sent'">
        <ChallengeList
          :challenges="sentChallenges"
          :loading="loading"
          :pagination="pagination"
          empty-state-title="No sent challenges"
          empty-state-message="Challenge your friends to a quiz battle!"
          @start="handleStart"
          @view-details="handleViewDetails"
          @load-more="handleLoadMore"
          @create-challenge="showCreateModal = true"
        />
      </div>

      <!-- Active Challenges -->
      <div v-if="activeTab === 'active'">
        <ChallengeList
          :challenges="activeChallenges"
          :loading="loading"
          :pagination="pagination"
          empty-state-title="No active challenges"
          empty-state-message="Accept a challenge to get started!"
          :show-create-button="false"
          @start="handleStart"
          @view-details="handleViewDetails"
          @load-more="handleLoadMore"
        />
      </div>

      <!-- Completed Challenges -->
      <div v-if="activeTab === 'completed'">
        <ChallengeList
          :challenges="completedChallenges"
          :loading="loading"
          :pagination="pagination"
          empty-state-title="No completed challenges"
          empty-state-message="Complete a challenge to see results here"
          :show-create-button="false"
          @view-details="handleViewDetails"
          @load-more="handleLoadMore"
        />
      </div>
    </div>

    <!-- Create Challenge Modal -->
    <CreateChallengeModal
      :is-open="showCreateModal"
      :friends="friends"
      :loading="createLoading"
      @close="showCreateModal = false"
      @submit="handleCreateChallenge"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChallenges } from '@/composables/useChallenges';
import { useFriends } from '@/composables/useFriends';
import ChallengeList from '../components/ChallengeList.vue';
import CreateChallengeModal from '../components/CreateChallengeModal.vue';
import type { CreateChallengeData } from '@/stores/challenges';

type TabType = 'all' | 'received' | 'sent' | 'active' | 'completed';

const router = useRouter();
const route = useRoute();

const {
  challenges,
  stats,
  loading,
  pagination,
  receivedChallenges,
  sentChallenges,
  activeChallenges,
  completedChallenges,
  winRate,
  loadChallenges,
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  loadStats,
  loadMore,
  getPerformanceRating,
  getPerformanceColor,
} = useChallenges();

const { friends, loadFriends } = useFriends();

const activeTab = ref<TabType>('all');
const showCreateModal = ref(false);
const createLoading = ref(false);

const tabs = computed(() => [
  {
    id: 'all' as TabType,
    label: 'All',
    icon: '📋',
    count: challenges.value.length,
    highlight: false,
  },
  {
    id: 'received' as TabType,
    label: 'Received',
    icon: '📥',
    count: receivedChallenges.value.length,
    highlight: receivedChallenges.value.length > 0,
  },
  {
    id: 'sent' as TabType,
    label: 'Sent',
    icon: '📤',
    count: sentChallenges.value.length,
    highlight: false,
  },
  {
    id: 'active' as TabType,
    label: 'Active',
    icon: '🎯',
    count: activeChallenges.value.length,
    highlight: activeChallenges.value.length > 0,
  },
  {
    id: 'completed' as TabType,
    label: 'History',
    icon: '🏆',
    count: completedChallenges.value.length,
    highlight: false,
  },
]);

const handleaccept = async (challengeId: string) => {
  const success = await acceptChallenge(challengeId);
  if (success) {
    await loadChallenges();
  }
};

const handlereject = async (challengeId: string) => {
  const success = await rejectChallenge(challengeId);
  if (success) {
    await loadChallenges();
  }
};

const handlestart = (challengeId: string) => {
  router.push(`/challenges/${challengeId}/take`);
};

const handleviewdetails = (challengeId: string) => {
  router.push(`/challenges/${challengeId}`);
};

const handleloadmore = async () => {
  await loadMore();
};

const handlecreatechallenge = async (data: CreateChallengeData) => {
  createLoading.value = true;
  const success = await createChallenge(data);
  createLoading.value = false;

  if (success) {
    showCreateModal.value = false;
    await loadChallenges();
  }
};


onMounted(async () => {
  // Load initial data
  await Promise.all([loadChallenges(), loadFriends(), loadStats()]);

  // Set active tab from query params
  const tab = route.query.tab as TabType;
  if (tab && ['all', 'received', 'sent', 'active', 'completed'].includes(tab)) {
    activeTab.value = tab;
  }
});
</script>
