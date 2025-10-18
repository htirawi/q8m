<template>
  <div class="badges-grid">
    <!-- Header with filters -->
    <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Badges</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ earnedCount }} of {{ totalCount }}

          earned
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategory = null"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            selectedCategory === null
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          "
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors"
          :class="
            selectedCategory === category
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          "
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Rarity filter -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        @click="selectedRarity = null"
        class="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        :class="
          selectedRarity === null
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
      >
        All Rarities
      </button>
      <button
        v-for="rarity in rarities"
        :key="rarity"
        @click="selectedRarity = rarity"
        class="rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors"
        :class="[
          selectedRarity === rarity
            ? getRaritySelectedClass(rarity)
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        ]"
      >
        {{ rarity }}
      </button>
    </div>

    <!-- Progress Stats -->
    <div v-if="showProgress" class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        class="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
      >
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ earnedCount }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Total Earned</div>
      </div>
      <div
        class="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-900/30"
      >
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ commonCount }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Common</div>
      </div>
      <div
        class="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-900/30"
      >
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ rareCount }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Rare+</div>
      </div>
      <div
        class="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-900/30"
      >
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ Math.round((earnedCount / totalCount) * 100) }}%
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Completion</div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
      ></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredBadges.length === 0" class="py-12 text-center">
      <div class="mb-4 text-6xl">🎖️</div>
      <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No badges found</h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{
          selectedCategory || selectedRarity
            ? "Try changing your filters"
            : "Start earning badges by completing activities!"
        }}
      </p>
    </div>

    <!-- Badges Grid -->
    <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        class="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  IBadge,
  IBadgeData,
  IBadgesGridProps as Props,
} from "@/types/components/gamification";
import { ref, computed } from "vue";
import BadgeCard from "./BadgeCard.vue";
import type { BadgeTier } from "@shared/types/gamification";

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showProgress: true,
  hasMore: false,
});

const emit = defineEmits<{
  badgeClick: [badge: IBadge];
  loadMore: [];
}>();

const selectedCategory = ref<string | null>(null);
const selectedRarity = ref<string | null>(null);

const categories = ["study", "quiz", "streak", "social", "milestone"];
const rarities = ["common", "rare", "epic", "legendary"];

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

const commonCount = computed(
  () => props.badges.filter((b) => b.earned && b.badge.rarity === "common").length
);

const rareCount = computed(
  () =>
    props.badges.filter((b) => b.earned && ["rare", "epic", "legendary"].includes(b.badge.rarity))
      .length
);

function getRaritySelectedClass(rarity: string): string {
  const classes = {
    common: "bg-gray-600 text-white",
    rare: "bg-blue-600 text-white",
    epic: "bg-purple-600 text-white",
    legendary: "bg-orange-600 text-white",
  };
  return classes[rarity as keyof typeof classes] || classes.common;
}

function handleBadgeClick(badge: ibadge) {
  emit("badgeClick", badge);
}

function loadMore() {
  emit("loadMore");
}
</script>

<style scoped>
.badges-grid {
  user-select: none;
}
</style>
