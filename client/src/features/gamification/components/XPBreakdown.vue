<template>
  <div class="xp-breakdown">
    <!-- Compact View (for inline display) -->
    <div v-if="variant === 'compact'" class="space-y-2">
      <div
        v-for="(source, index) in breakdownItems"
        :key="index"
        class="flex items-center justify-between text-sm"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ source.icon }} </span>
          <span class="text-gray-700 dark:text-gray-300">{{ source.label }} </span>
        </div>
        <span class="font-bold text-purple-600 dark:text-purple-400">
          +{{ source.xp ?? 0 }} XP
        </span>
      </div>
    </div>

    <!-- Card View (for modal/detailed display) -->
    <div v-else-if="variant === 'card'" class="space-y-4">
      <!-- Total XP Header -->
      <div
        class="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20"
      >
        <div
          class="animate-bounce-subtle mb-2 text-6xl font-black text-purple-600 dark:text-purple-400"
        >
          +
          <AnimatedCounter
            :value="totalXP"
            :duration="2000"
            :format="(value) => Math.round(value).toString()"
          />
        </div>
        <div
          class="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300"
        >
          Total XP Earned
        </div>
      </div>

      <!-- Breakdown List -->
      <div class="space-y-2">
        <h4 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          XP Sources
        </h4>
        <TransitionGroup name="xp-item">
          <div
            v-for="(source, index) in breakdownItems"
            :key="index"
            class="group flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-2xl dark:bg-purple-900/30"
              >
                {{ source.icon }}
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ source.label }}
                </div>
                <div v-if="source.description" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ source.description ?? "" }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-2xl font-black text-purple-600 dark:text-purple-400">
                +{{ source.xp ?? 0 }}
              </div>
              <span class="text-xs font-medium text-purple-500 dark:text-purple-400">XP</span>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Multipliers (if any) -->
      <div
        v-if="hasMultipliers"
        class="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
      >
        <div
          class="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-800 dark:text-yellow-300"
        >
          <span class="text-xl">⚡</span>
          <span>Active Multipliers</span>
        </div>
        <div class="space-y-1">
          <div
            v-for="(multiplier, index) in multipliers"
            :key="index"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-yellow-700 dark:text-yellow-400">{{ multiplier.label }} </span>
            <span class="font-bold text-yellow-600 dark:text-yellow-300"
              >×{{ multiplier.value ?? 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tips for earning more XP -->
      <div
        v-if="showTips"
        class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
      >
        <div
          class="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100"
        >
          <span class="text-xl">💡</span>
          <span>Pro Tips</span>
        </div>
        <ul class="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
            <span>Answer correctly on the first try for bonus XP</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
            <span>Complete quizzes faster for time bonus</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
            <span>Maintain your daily streak for multipliers</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
            <span>Perfect scores grant significant bonus XP</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Detailed View (for full page display) -->
    <div v-else class="space-y-6">
      <!-- Hero Stats -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div
          class="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-900/30"
        >
          <div class="mb-2 text-4xl font-black text-purple-600 dark:text-purple-400">
            +{{ totalXP }}
          </div>
          <div
            class="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300"
          >
            Total XP
          </div>
        </div>
        <div
          class="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center dark:border-green-800 dark:from-green-900/20 dark:to-green-900/30"
        >
          <div class="mb-2 text-4xl font-black text-green-600 dark:text-green-400">
            {{ breakdownItems.length ?? 0 }}
          </div>
          <div
            class="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300"
          >
            XP Sources
          </div>
        </div>
        <div
          class="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-900/30"
        >
          <div class="mb-2 text-4xl font-black text-blue-600 dark:text-blue-400">
            {{ averageXP }}
          </div>
          <div
            class="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300"
          >
            Avg per Source
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div>
        <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">XP Breakdown</h3>
        <div class="space-y-3">
          <div
            v-for="(source, index) in breakdownItems"
            :key="index"
            class="group overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700"
          >
            <div class="flex items-center justify-between p-5">
              <div class="flex items-center gap-4">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-3xl dark:from-purple-900/30 dark:to-indigo-900/30"
                >
                  {{ source.icon }}
                </div>
                <div>
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ source.label }}
                  </div>
                  <div v-if="source.description" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ source.description ?? "" }}
                  </div>
                  <div
                    v-if="source.detail"
                    class="mt-1 text-xs text-purple-600 dark:text-purple-400"
                  >
                    {{ source.detail }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-black text-purple-600 dark:text-purple-400">
                  +{{ source.xp ?? 0 }}
                </div>
                <div class="text-xs font-medium text-purple-500 dark:text-purple-400">XP</div>
                <div v-if="source.percentage" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ source.percentage }}% of total
                </div>
              </div>
            </div>
            <!-- Progress bar showing contribution -->
            <div class="h-1 bg-gray-100 dark:bg-gray-700">
              <div
                class="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                :style="{ width: `${source.percentage || 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Multipliers and Tips (same as card view) -->
      <div
        v-if="hasMultipliers"
        class="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20"
      >
        <div class="mb-3 flex items-center gap-2 font-bold text-yellow-800 dark:text-yellow-300">
          <span class="text-2xl">⚡</span>
          <span>Active Multipliers</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="(multiplier, index) in multipliers"
            :key="index"
            class="flex items-center justify-between rounded-lg bg-yellow-100 px-4 py-3 dark:bg-yellow-900/30"
          >
            <span class="font-medium text-yellow-700 dark:text-yellow-400"
              >{{ multiplier.label }}
            </span>
            <span class="text-xl font-black text-yellow-600 dark:text-yellow-300"
              >×{{ multiplier.value ?? 0 }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="showTips"
        class="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20"
      >
        <div class="mb-3 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
          <span class="text-2xl">💡</span>
          <span>How to Earn More XP</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex items-start gap-3 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
            <span class="text-2xl">🎯</span>
            <div>
              <div class="font-semibold text-blue-900 dark:text-blue-100">First Try Bonus</div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                Answer correctly on first attempt
              </div>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
            <span class="text-2xl">⚡</span>
            <div>
              <div class="font-semibold text-blue-900 dark:text-blue-100">Speed Bonus</div>
              <div class="text-sm text-blue-700 dark:text-blue-300">Complete quizzes quickly</div>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
            <span class="text-2xl">🔥</span>
            <div>
              <div class="font-semibold text-blue-900 dark:text-blue-100">Streak IMultiplier</div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                Maintain daily learning streak
              </div>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
            <span class="text-2xl">💯</span>
            <div>
              <div class="font-semibold text-blue-900 dark:text-blue-100">Perfect Score</div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                Get 100% accuracy for massive bonus
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  IXPSource,
  IXPBreakdownProps as Props,
} from "../../../types/components/gamification";
import { computed } from "vue";
import AnimatedCounter from "../../../components/AnimatedCounter.vue";

const props = withDefaults(defineProps<Props>(), {
  sources: () => [],
  multipliers: () => [],
  variant: "card",
  showTips: true,
  breakdown: () => ({}),
});

const sourceLabels: Record<string, { label: string; icon: string; description?: string }> = {
  base: { label: "Quiz Completion", icon: "📝", description: "Base XP for completing the quiz" },
  accuracy: { label: "Accuracy Bonus", icon: "🎯", description: "Bonus for correct answers" },
  perfect: { label: "Perfect Score", icon: "💯", description: "All questions correct!" },
  speed: { label: "Speed Bonus", icon: "⚡", description: "Completed quickly" },
  streak: { label: "Streak Bonus", icon: "🔥", description: "Daily streak maintained" },
  firstTry: { label: "First Try Bonus", icon: "✨", description: "Correct on first attempt" },
  difficulty: { label: "Difficulty Bonus", icon: "💪", description: "Higher difficulty questions" },
  badge: { label: "IBadge IReward", icon: "🏆", description: "Earned from new badges" },
  milestone: { label: "IMilestone IReward", icon: "🎖️", description: "IAchievement milestone" },
};

const breakdownItems = computed<(IXPSource & { percentage?: number })[]>(() => {
  if (!props.breakdown) return [];
  return Object.entries(props.breakdown)
    .map(([key, xp]) => {
      const sourceInfo = sourceLabels[key] || { label: key, icon: "⭐" };
      const total = totalXP.value;
      const percentage =
        props.variant === "detailed" && total > 0 ? Math.round((xp / total) * 100) : undefined;

      return {
        label: sourceInfo.label,
        amount: xp,
        xp,
        icon: sourceInfo.icon,
        description: sourceInfo.description,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount); // Sort by XP descending
});

const totalXP = computed<number>(() => {
  if (!props.breakdown) return props.totalXP ?? 0;
  return Object.values(props.breakdown).reduce((sum, xp) => (sum as number) + (xp as number), 0) as number;
});

const averageXP = computed(() => {
  const count = breakdownItems.value.length;
  return count > 0 ? Math.round(totalXP.value / count) : 0;
});

const hasMultipliers = computed(() => {
  return props.multipliers && props.multipliers.length > 0;
});
</script>

<style scoped>
/* XP item transitions */
.xp-item-enter-active {
  animation: slideInUp 0.4s ease-out;
}

.xp-item-leave-active {
  animation: slideOutUp 0.3s ease-in;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Bounce animation for total XP */
@keyframes bounce-subtle {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
</style>
