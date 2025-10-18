<template>
  <div class="badges-grid">
    <!-- Header with filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Badges
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ earnedCount }} of {{ totalCount }}

 earned
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategory = null"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="selectedCategory === null ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize"
          :class="selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          {{ category }}

        </button>
      </div>
    </div>

    <!-- Rarity filter -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        @click="selectedRarity = null"
        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
        :class="selectedRarity === null ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'"
      >
        All Rarities
      </button>
      <button
        v-for="rarity in rarities"
        :key="rarity"
        @click="selectedRarity = rarity"
        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize"
        :class="[
          selectedRarity === rarity ? getRaritySelectedClass(rarity) : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        ]"
      >
        {{ rarity }}

      </button>
    </div>

    <!-- Progress Stats -->
    <div v-if="showProgress" class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ earnedCount }}

</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Total Earned</div>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ commonCount }}

</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Common</div>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ rareCount }}

</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Rare+</div>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ Math.round((earnedCount / totalCount) * 100) }}%</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Completion</div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-gray-200 dark:bg-gray-800 rounded-xl h-48 animate-pulse"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredBadges.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🎖️</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No badges found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ selectedCategory || selectedRarity ? 'Try changing your filters' : 'Start earning badges by completing activities!'selectedRarity }}

      </p>
    </div>

    <!-- Badges Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <BadgeCard
        v-for="badgeData in filteredBadges"
        :key="badgeData.badge.id"
        :badge="badgeData.badge"
        :earned="badgeData.earned"
        :earned-at="badgeData.earnedAt"
        :progress="badgeData.progress"
        :clickable="true"
        @click="handleBadgeClick"
      />
    </div>

    <!-- Load more button -->
    <div v-if="hasMore" class="mt-6 text-center">
      <button
        @click="loadMore"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IBadge, IBadgeData, IBadgesGridProps as Props } from "@/types/components/gamification";
import { ref, computed } from 'vue';
import BadgeCard from './BadgeCard.vue';
import type { BadgeTier } from '@shared/types/gamification';







const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showProgress: true,
  hasMore: false,
});

const emit = defineemits<{
  badgeClick: [;badge: IBadge];
  loadMore: [];
}>();

const selectedCategory = ref<string | null>(null);
const selectedRarity = ref<string | null>(null);

const categories = ['study', 'quiz', 'streak', 'social', 'milestone'];
const rarities = ['common', 'rare', 'epic', 'legendary'];

const filteredBadges = computed(() => {
  let filtered = props.badges;

  if (selectedCategory.value) {
    filtered = filtered.filter((b) => b.badge.category === selectedCategory.value);
  }

  if (selectedRarity.value) {
    filtered = filtered.filter((b) => b.badge.rarity === selectedRarity.value);
  }

  return filtered;
});

const totalCount = computed(() => props.badges.length);
const earnedCount = computed(() => props.badges.filter((b) => b.earned).length);

const commonCount = computed(() =>
  props.badges.filter((b) => b.earned && b.badge.rarity === 'common').length
);

const rareCount = computed(() =>
  props.badges.filter((b) => b.earned && ['rare', 'epic', 'legendary'].includes(b.badge.rarity)).length
);

function getRaritySelectedClass(rarity: string): string {
  const classes = {
    common: 'bg-gray-600 text-white',
    rare: 'bg-blue-600 text-white',
    epic: 'bg-purple-600 text-white',
    legendary: 'bg-orange-600 text-white',
  };
  return classes[rarity as keyof typeof classes] || classes.common;
}

function handlebadgeclick(badge: ibadge) {
  emit('badgeClick', badge);
}

function loadMore() {
  emit('loadMore');
}

</script>

<style scoped>
.badges-grid {
  user-select: none;
}
</style>
