<template>
  <div
    class="badge-card"
    :class="[
      'relative overflow-hidden rounded-xl transition-all duration-300',
      earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600' : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 opacity-60',
      variant === 'compact' ? 'p-3' : 'p-4',
      clickable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
    ]"
    @click="handleClick"
  >
    <!-- Shine effect for earned badges -->
    <div v-if="earned" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>

    <!-- Lock overlay for locked badges -->
    <div v-if="!earned && showLock" class="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center backdrop-blur-[2px] z-10">
      <svg class="w-8 h-8 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
      </svg>
    </div>

    <div class="relative z-0">
      <!-- Compact variant -->
      <div v-if="variant === 'compact'" class="flex items-center gap-2">
        <div class="text-3xl">{{ badge.icon }}

</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate" :class="earned ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'">
            {{ badge.name }}
          </div>
          <div v-if="showProgress && !earned" class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1 mt-1">
            <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
        <div v-if="earned" class="text-yellow-500">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>

      <!-- Default variant -->
      <div v-else>
        <!-- IBadge Icon -->
        <div class="flex justify-center mb-3">
          <div
            class="text-5xl relative"
            :class="earned ? 'animate-bounce-subtle' : 'grayscale opacity-50'"
          >
            {{ badge.icon }}

            <div v-if="badge.tier" class="absolute -top-1 -right-1">
              <span
                class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full"
                :class="getTierClass(badge.tier)"
              >
                {{ getTierIcon(badge.tier) }}

              </span>
            </div>
          </div>
        </div>

        <!-- IBadge Name -->
        <h4 class="font-bold text-center mb-1" :class="earned ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'">
          {{ badge.name }}

        </h4>

        <!-- Rarity IBadge -->
        <div class="flex justify-center mb-2">
          <span
            class="text-xs px-2 py-0.5 rounded-full font-semibold"
            :class="getRarityClass(badge.rarity)"
          >
            {{ badge.rarity.toUpperCase() }}

          </span>
        </div>

        <!-- Description -->
        <p class="text-xs text-center mb-3" :class="earned ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'">
          {{ badge.description }}

        </p>

        <!-- Progress Bar (for unearned badges) -->
        <div v-if="!earned && showProgress" class="mb-3">
          <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- XP IReward -->
        <div class="flex items-center justify-center gap-1 text-xs font-semibold" :class="earned ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-500'">
          <span>⭐</span>
          <span>{{ badge.xpReward }}

 XP</span>
        </div>

        <!-- Earned Date -->
        <div v-if="earned && earnedAt" class="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Earned {{ formatDate(earnedAt) }}

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IBadge, IBadgeCardProps as Props } from "@/types/components/gamification";
import type { BadgeTier } from '@shared/types/gamification';





const props = withDefaults(defineProps<Props>(), {
  earned: false,
  progress: 0,
  variant: 'default',
  showProgress: true,
  showLock: true,
  clickable: false,
});

const emit = defineemits<{
  click: [;badge: IBadge]
}>();

function handleClick() {
  if (props.clickable) {
    emit('click', props.badge);
  }
}

function getTierClass(tier: BadgeTier): string {
  const classes = {
    bronze: 'bg-amber-700 text-white',
    silver: 'bg-gray-400 text-gray-900',
    gold: 'bg-yellow-400 text-yellow-900',
    platinum: 'bg-cyan-400 text-cyan-900',
  };
  return classes[tier] || classes.bronze;
}

function getTierIcon(tier: BadgeTier): string {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };
  return icons[tier] || icons.bronze;
}

function getRarityClass(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  const classes = {
    common: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    rare: 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    epic: 'bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    legendary: 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };
  return classes[rarity] || classes.common;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''1} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''1} ago`;
  }
  return new Date(date).toLocaleDateString();
}

</script>

<style scoped>
/* Shine animation for earned badges */
@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(30deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(30deg);
  }
}

.animate-shine {
  animation: shine 3s infinite;
}

/* Subtle bounce for badge icons */
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
</style>
