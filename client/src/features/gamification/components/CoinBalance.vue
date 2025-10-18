<template>
  <div class="coin-balance">
    <!-- Compact view (for header) -->
    <div v-if="props.variant === 'compact'" class="compact-view">
      <button
        @click="$emit('click')"
        class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 shadow-md transition-all hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg"
      >
        <span class="text-2xl">🪙</span>
        <div class="font-bold text-white">
          {{ formatNumber(coins.total) }}
        </div>
      </button>
    </div>

    <!-- IBadge view (inline display) -->
    <div v-else-if="props.variant === 'badge'" class="badge-view">
      <div
        class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 shadow-md"
      >
        <span class="text-xl">🪙</span>
        <span class="font-bold text-white">{{ formatNumber(coins.total) }} </span>
      </div>
    </div>

    <!-- Card view (for dashboard) -->
    <div v-else-if="props.variant === 'card'" class="card-view">
      <div
        class="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg dark:border-yellow-700 dark:from-yellow-900/20 dark:to-orange-900/20"
      >
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span class="text-3xl">🪙</span>
            Coins
          </h3>
        </div>

        <!-- Balance -->
        <div class="mb-6 text-center">
          <div
            class="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-5xl font-bold text-transparent"
          >
            {{ formatNumber(coins.total) }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Total Balance</div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-lg bg-white/50 p-3 text-center dark:bg-gray-800/50">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              +{{ formatNumber(coins.earned) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Earned</div>
          </div>
          <div class="rounded-lg bg-white/50 p-3 text-center dark:bg-gray-800/50">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              -{{ formatNumber(coins.spent) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Spent</div>
          </div>
        </div>

        <!-- Earning Info -->
        <div class="mt-4 rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
          <div class="mb-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Ways to Earn Coins:
          </div>
          <ul class="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
            <li>• Complete quizzes: 10 coins</li>
            <li>• Perfect quiz score: 25 coins</li>
            <li>• Daily login: 5 coins</li>
            <li>• Streak milestones: 50-2,500 coins</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Detailed view (for modal) -->
    <div v-else class="detailed-view">
      <div class="space-y-6">
        <!-- Hero Section -->
        <div class="text-center">
          <div class="mb-4 text-6xl">🪙</div>
          <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(coins.total) }}

            Coins
          </h2>
          <p class="text-gray-600 dark:text-gray-400">Your virtual currency balance</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-4">
          <div
            class="rounded-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 text-center dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20"
          >
            <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ formatNumber(coins.total) }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div
            class="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
          >
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">
              +{{ formatNumber(coins.earned) }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Earned</div>
          </div>
          <div
            class="rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 text-center dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
          >
            <div class="text-3xl font-bold text-red-600 dark:text-red-400">
              -{{ formatNumber(coins.spent) }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Spent</div>
          </div>
        </div>

        <!-- Ways to Earn -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Ways to Earn Coins
          </h3>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">✅</span>
                <span class="text-sm text-gray-900 dark:text-white">Complete a quiz</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+10</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🎯</span>
                <span class="text-sm text-gray-900 dark:text-white">Perfect quiz score</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+25</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">📅</span>
                <span class="text-sm text-gray-900 dark:text-white">Daily login</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+5</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🔥</span>
                <span class="text-sm text-gray-900 dark:text-white">7-day streak</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+50</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <span class="text-sm text-gray-900 dark:text-white">30-day streak</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+200</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">👑</span>
                <span class="text-sm text-gray-900 dark:text-white">365-day streak</span>
              </div>
              <span class="font-bold text-yellow-600 dark:text-yellow-400">+2,500</span>
            </div>
          </div>
        </div>

        <!-- Ways to Spend -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Ways to Spend Coins
          </h3>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🛡️</span>
                <span class="text-sm text-gray-900 dark:text-white">Streak freeze</span>
              </div>
              <span class="font-bold text-red-600 dark:text-red-400">-100</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 opacity-50 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">💡</span>
                <span class="text-sm text-gray-900 dark:text-white">Quiz hint (coming soon)</span>
              </div>
              <span class="font-bold text-red-600 dark:text-red-400">-50</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 opacity-50 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🎨</span>
                <span class="text-sm text-gray-900 dark:text-white"
                  >Profile customization (coming soon)</span
                >
              </div>
              <span class="font-bold text-red-600 dark:text-red-400">-200</span>
            </div>
          </div>
        </div>

        <!-- Tip -->
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <div class="flex items-start gap-3">
            <span class="text-2xl">💡</span>
            <div>
              <div class="mb-1 font-semibold text-blue-900 dark:text-blue-100">Pro Tip</div>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                Build a long streak to earn massive coin bonuses! A 365-day streak earns you 2,500
                coins.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICoinBalanceProps as Props } from "@/types/components/gamification";
import { useStreak } from "@/composables/useStreak";

const props = withDefaults(defineProps<Props>(), {
  variant: "card",
});

defineEmits<{
  click: [];
}>();

const { coins } = useStreak();

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
</script>

<style scoped>
.coin-balance {
  user-select: none;
}
</style>
