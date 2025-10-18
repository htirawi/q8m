<template>
  <div
    class="gamification-dashboard min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <!-- Animated Background Blobs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -left-4 top-20 h-72 w-72 animate-blob rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-blue-600 dark:opacity-10"
      ></div>
      <div
        class="animation-delay-2000 absolute right-4 top-40 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600 dark:opacity-10"
      ></div>
      <div
        class="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-pink-600 dark:opacity-10"
      ></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1
          class="mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 sm:text-5xl"
        >
          Your Progress Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Track your learning journey, earn rewards, and compete with others
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[500px] items-center justify-center">
        <div class="text-center">
          <div
            class="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400"
          ></div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading your progress...
          </p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Quick Stats Row -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Current Streak -->
          <div
            class="overflow-hidden rounded-2xl border-2 border-orange-200 bg-white/90 shadow-lg backdrop-blur-sm dark:border-orange-800 dark:bg-gray-800/90"
          >
            <div
              class="bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-3xl">🔥</span>
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300"
                  >Streak</span
                >
              </div>
              <div class="text-3xl font-black text-orange-600 dark:text-orange-400">
                {{ streakData?.currentStreak || 0 }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Days in a row</div>
            </div>
          </div>

          <!-- Total XP -->
          <div
            class="overflow-hidden rounded-2xl border-2 border-purple-200 bg-white/90 shadow-lg backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/90"
          >
            <div
              class="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:from-purple-900/20 dark:to-indigo-900/20"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-3xl">⭐</span>
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300"
                  >XP</span
                >
              </div>
              <div class="text-3xl font-black text-purple-600 dark:text-purple-400">
                {{ formatNumber(userProgress?.xp || 0) }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Total experience</div>
            </div>
          </div>

          <!-- Level -->
          <div
            class="overflow-hidden rounded-2xl border-2 border-blue-200 bg-white/90 shadow-lg backdrop-blur-sm dark:border-blue-800 dark:bg-gray-800/90"
          >
            <div
              class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-900/20 dark:to-cyan-900/20"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-3xl">🎯</span>
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300"
                  >Level</span
                >
              </div>
              <div class="text-3xl font-black text-blue-600 dark:text-blue-400">
                {{ userProgress?.level || 1 }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ levelTitle }}
              </div>
            </div>
          </div>

          <!-- Coins -->
          <div
            class="overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white/90 shadow-lg backdrop-blur-sm dark:border-yellow-800 dark:bg-gray-800/90"
          >
            <div
              class="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 dark:from-yellow-900/20 dark:to-amber-900/20"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-3xl">🪙</span>
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-300"
                  >Coins</span
                >
              </div>
              <div class="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                {{ coinsData?.total || 0 }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Virtual currency</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column (2/3 width) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- XP & Level Progress Card -->
            <div
              class="overflow-hidden rounded-2xl border-2 border-purple-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-purple-700 dark:bg-gray-800/90"
            >
              <XPDisplay
                v-if="userProgress"
                :xp="userProgress.xp"
                :level="userProgress.level"
                :level-title="levelTitle"
                :xp-to-next-level="xpToNextLevel"
                :level-progress="levelProgress"
                variant="card"
              />
            </div>

            <!-- Badges Section -->
            <div
              class="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90"
            >
              <div
                class="border-b border-gray-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 p-6 dark:border-gray-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
              >
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  🏆 IBadge Collection
                </h2>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Unlock achievements by completing activities
                </p>
              </div>
              <div class="p-6">
                <BadgesGrid
                  :badges="badgesData"
                  :loading="isLoadingBadges"
                  :show-progress="true"
                  @badge-click="handleBadgeClick"
                />
              </div>
            </div>
          </div>

          <!-- Right Column (1/3 width) -->
          <div class="space-y-6">
            <!-- Streak Card -->
            <div
              class="overflow-hidden rounded-2xl border-2 border-orange-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-orange-800 dark:bg-gray-800/90"
            >
              <StreakDisplay v-if="streakData" variant="card" @click="showStreakModal = true" />
            </div>

            <!-- Coins Card -->
            <div
              class="overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-yellow-800 dark:bg-gray-800/90"
            >
              <CoinBalance v-if="coinsData" variant="card" @click="showCoinsModal = true" />
            </div>

            <!-- Quick Actions -->
            <div
              class="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90"
            >
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-800 dark:to-gray-900"
              >
                <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                <div class="space-y-2">
                  <button
                    @click="$router.push('/quiz')"
                    class="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-left font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">📝</span>
                      <div>
                        <div class="text-sm">Take a Quiz</div>
                        <div class="text-xs opacity-80">Earn XP and maintain streak</div>
                      </div>
                    </div>
                  </button>
                  <button
                    @click="$router.push('/study')"
                    class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 text-left font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">📚</span>
                      <div>
                        <div class="text-sm">Study Mode</div>
                        <div class="text-xs opacity-80">Learn at your own pace</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Section (Full Width) -->
        <div
          class="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90"
        >
          <div
            class="border-b border-gray-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6 dark:border-gray-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
          >
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              See how you rank against other learners
            </p>
          </div>
          <div class="p-6">
            <Leaderboard
              :entries="leaderboardData"
              :user-rank="userRank"
              :current-user-id="authStore.user?.id"
              :loading="isLoadingLeaderboard"
              :last-updated="leaderboardLastUpdated"
              @period-change="handlePeriodChange"
              @scope-change="handleScopeChange"
            />
          </div>
        </div>

        <!-- IAchievement Timeline Section (Full Width) -->
        <div
          class="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90"
        >
          <div
            class="border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 dark:border-gray-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
          >
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              📜 IAchievement History
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Your journey of learning and progress
            </p>
          </div>
          <div class="p-6">
            <AchievementTimeline
              :achievements="achievementsData"
              :loading="isLoading"
              :show-header="false"
              :show-filters="true"
              :items-per-page="10"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Streak Detail Modal -->
      <div
        v-if="showStreakModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click="showStreakModal = false"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Streak Details</h3>
            <button
              @click="showStreakModal = false"
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
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
          <div class="p-6">
            <StreakDisplay v-if="streakData" variant="detailed" />
          </div>
        </div>
      </div>

      <!-- Coins Detail Modal -->
      <div
        v-if="showCoinsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click="showCoinsModal = false"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Coins Details</h3>
            <button
              @click="showCoinsModal = false"
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
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
          <div class="p-6">
            <CoinBalance v-if="coinsData" variant="detailed" />
          </div>
        </div>
      </div>

      <!-- IBadge Detail Modal -->
      <div
        v-if="showBadgeModal && selectedBadge"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click="showBadgeModal = false"
      >
        <div
          class="w-full max-w-md rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">IBadge Details</h3>
            <button
              @click="showBadgeModal = false"
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
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
          <BadgeCard
            :badge="selectedBadge"
            :earned="selectedBadgeEarned"
            :earned-at="selectedBadgeEarnedAt"
            :progress="selectedBadgeProgress"
            variant="default"
            :clickable="false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useStreakStore } from "@/stores/streak";
import XPDisplay from "../components/XPDisplay.vue";
import BadgesGrid from "../components/BadgesGrid.vue";
import BadgeCard from "../components/BadgeCard.vue";
import Leaderboard from "../components/Leaderboard.vue";
import StreakDisplay from "../components/StreakDisplay.vue";
import CoinBalance from "../components/CoinBalance.vue";
import AchievementTimeline from "../components/AchievementTimeline.vue";

const authStore = useAuthStore();
const streakStore = useStreakStore();

// State
const isLoading = ref(true);
const isLoadingBadges = ref(false);
const isLoadingLeaderboard = ref(false);

// Modals
const showStreakModal = ref(false);
const showCoinsModal = ref(false);
const showBadgeModal = ref(false);
const selectedBadge = ref<any>(null);
const selectedBadgeEarned = ref(false);
const selectedBadgeEarnedAt = ref<Date | undefined>(undefined);
const selectedBadgeProgress = ref(0);

// Data
const userProgress = ref<{
  xp: number;
  level: number;
} | null>(null);

const badgesData = ref<any[]>([]);
const leaderboardData = ref<any[]>([]);
const userRank = ref<any>(null);
const leaderboardLastUpdated = ref(new Date());
const achievementsData = ref<any[]>([]);

// Computed
const streakData = computed(() => streakStore.streak);
const coinsData = computed(() => streakStore.coins);

const levelTitle = computed(() => {
  if (!userProgress.value) return "Beginner";
  return getLevelTitle(userProgress.value.level);
});

const xpToNextLevel = computed(() => {
  if (!userProgress.value) return 100;
  // Simple formula: next level requires (level * 100) XP
  const nextLevelXP = (userProgress.value.level + 1) * 100;
  const currentLevelXP = userProgress.value.level * 100;
  const progressInLevel = userProgress.value.xp - currentLevelXP;
  return nextLevelXP - currentLevelXP - progressInLevel;
});

const levelProgress = computed(() => {
  if (!userProgress.value) return 0;
  const nextLevelXP = (userProgress.value.level + 1) * 100;
  const currentLevelXP = userProgress.value.level * 100;
  const xpInLevel = userProgress.value.xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.round((xpInLevel / xpNeededForLevel) * 100));
});

// Methods
function getLevelTitle(level: number): string {
  const levelTitles = [
    { min: 1, max: 5, title: "Beginner" },
    { min: 6, max: 10, title: "Learner" },
    { min: 11, max: 20, title: "Apprentice" },
    { min: 21, max: 30, title: "Practitioner" },
    { min: 31, max: 40, title: "Skilled" },
    { min: 41, max: 50, title: "Expert" },
    { min: 51, max: 75, title: "Master" },
    { min: 76, max: 100, title: "Grandmaster" },
    { min: 101, max: Infinity, title: "Legend" },
  ];
  const titleObj = levelTitles.find((t) => level >= t.min && level <= t.max);
  return titleObj ? titleObj.title : "Legend";
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function handleBadgeClick(badge: any) {
  selectedBadge.value = badge.badge;
  selectedBadgeEarned.value = badge.earned;
  selectedBadgeEarnedAt.value = badge.earnedAt;
  selectedBadgeProgress.value = badge.progress;
  showBadgeModal.value = true;
}

function handlePeriodChange(period: string) {
  console.log("Period changed:", period);
  // TODO: Fetch leaderboard data for new periodTODO
}

function handleScopeChange(scope: string) {
  console.log("Scope changed:", scope);
  // TODO: Fetch leaderboard data for new scopeTODO
}

async function loadDashboardData() {
  isLoading.value = true;
  try {
    // Load user progress from auth store
    if (authStore.user?.gamification) {
      userprogress.value = {
        xp: authStore.user.gamification.xp || 0,
        level: authStore.user.gamification.level || 1,
      };
    }

    // Load streak and coins data
    await streakStore.fetchStreak();

    // Load badges from API
    await loadBadges();

    // Load leaderboard from API
    await loadLeaderboard();

    // Load achievements from API
    await loadAchievements();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
}

// Real API loading functions
async function loadBadges() {
  try {
    const response = await fetch("/api/v1/gamification/badges", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      badgesData.value = data.badges || [];
    } else {
      console.error("Failed to load badges:", response.statusText);
      badgesData.value = [];
    }
  } catch (error) {
    console.error("Error loading badges:", error);
    badgesData.value = [];
  }
}

async function loadLeaderboard() {
  try {
    const response = await fetch("/api/v1/gamification/leaderboard/all_time?scope=global", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      leaderboardData.value = data.leaderboard?.rankings || [];

      // Load user rank
      const rankResponse = await fetch(
        "/api/v1/gamification/leaderboard/all_time/rank?scope=global",
        {
          credentials: "include",
        }
      );

      if (rankResponse.ok) {
        const rankData = await rankResponse.json();
        userRank.value = rankData;
      }
    } else {
      console.error("Failed to load leaderboard:", response.statusText);
      leaderboardData.value = [];
    }
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    leaderboardData.value = [];
  }
}

async function loadAchievements() {
  try {
    const response = await fetch("/api/v1/gamification/badges/earned", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      // Convert earned badges to achievement format
      achievementsData.value = data.badges.map((badge: any) => ({
        id: badge._id,
        type: "badge",
        icon: badge.icon,
        title: badge.name,
        description: badge.description,
        date: new Date(badge.earnedAt),
        xp: badge.xpReward,
        rarity: badge.rarity,
        category: badge.category,
        tier: badge.tier,
      }));
    } else {
      console.error("Failed to load achievements:", response.statusText);
      achievementsData.value = [];
    }
  } catch (error) {
    console.error("Error loading achievements:", error);
    achievementsData.value = [];
  }
}

function generateMockBadges() {
  const badges = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "🎯",
      category: "quiz",
      rarity: "common",
      xpReward: 50,
      tier: undefined,
    },
    {
      id: "2",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      category: "streak",
      rarity: "rare",
      xpReward: 150,
      tier: "bronze",
    },
    {
      id: "3",
      name: "Perfect Score",
      description: "Get 100% on a quiz",
      icon: "💯",
      category: "quiz",
      rarity: "epic",
      xpReward: 200,
      tier: "silver",
    },
    {
      id: "4",
      name: "Study Master",
      description: "Complete 50 study sessions",
      icon: "📚",
      category: "study",
      rarity: "rare",
      xpReward: 100,
      tier: "bronze",
    },
    {
      id: "5",
      name: "Social Butterfly",
      description: "Refer 5 friends",
      icon: "🦋",
      category: "social",
      rarity: "epic",
      xpReward: 250,
      tier: "gold",
    },
    {
      id: "6",
      name: "Level 10",
      description: "Reach level 10",
      icon: "⭐",
      category: "milestone",
      rarity: "legendary",
      xpReward: 500,
      tier: "platinum",
    },
    {
      id: "7",
      name: "Quick Learner",
      description: "Complete a quiz in under 5 minutes",
      icon: "⚡",
      category: "quiz",
      rarity: "common",
      xpReward: 75,
      tier: undefined,
    },
    {
      id: "8",
      name: "Dedicated",
      description: "Maintain a 30-day streak",
      icon: "🏆",
      category: "streak",
      rarity: "legendary",
      xpReward: 1000,
      tier: "platinum",
    },
  ];

  return badges.map((badge) => ({
    badge,
    earned: Math.random() > 0.5,
    earnedAt:
      Math.random() > 0.5
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        : undefined,
    progress: Math.floor(Math.random() * 100),
  }));
}

function generateMockLeaderboard() {
  const names = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "Diana Prince",
    "Eve Wilson",
    "Frank Miller",
    "Grace Lee",
    "Henry Davis",
    "Ivy Chen",
    "Jack Ryan",
  ];

  return names.map((name, index) => ({
    rank: index + 1,
    userId: `user_${index + 1}`,
    displayName: name,
    score: 10000 - index * 1000 + Math.floor(Math.random() * 500),
    level: 20 - index,
    streak: Math.floor(Math.random() * 30) + 1,
    badges: Array.from({ length: Math.floor(Math.random() * 8) + 1 }, (_, i) => `badge_${i}`),
  }));
}

function generateMockAchievements() {
  const achievements = [
    {
      id: "1",
      type: "badge",
      icon: "💯",
      title: "Perfect Score",
      description: "Achieved 100% on a quiz",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      xp: 200,
      rarity: "epic",
      category: "quiz",
    },
    {
      id: "2",
      type: "level",
      icon: "⭐",
      title: "Level 5 Reached",
      description: "Advanced to Beginner tier",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      xp: 0,
      category: "progression",
    },
    {
      id: "3",
      type: "streak",
      icon: "🔥",
      title: "7-Day Streak",
      description: "Maintained learning streak for a week",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      xp: 150,
      rarity: "rare",
      category: "streak",
    },
    {
      id: "4",
      type: "badge",
      icon: "🎯",
      title: "First Steps",
      description: "Completed your first quiz",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      xp: 50,
      rarity: "common",
      category: "quiz",
    },
    {
      id: "5",
      type: "milestone",
      icon: "🏆",
      title: "100 Questions Answered",
      description: "Answered 100 questions correctly",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      xp: 250,
      category: "milestone",
    },
    {
      id: "6",
      type: "badge",
      icon: "⚡",
      title: "Speed Demon",
      description: "Completed a quiz in under 5 minutes",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      xp: 100,
      rarity: "rare",
      category: "quiz",
    },
  ];

  return achievements as any[];
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
