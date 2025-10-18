<template>
  <Teleport to="body">
    <TransitionGroup name="badge-notification">
      <div v-for="badge in visibleBadges" :key="badge.id"
        class="fixed z-[9999] flex items-start gap-3 rounded-xl border-2 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95"
        :style="getNotificationStyle(badge)">
        <!-- IBadge Icon with Glow -->
        <div class="relative flex-shrink-0">
          <div
            class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 shadow-lg">
            <div class="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
            <span class="relative z-10 text-4xl">{{ badge.icon }} </span>
          </div>
          <!-- Sparkles -->
          <div class="pointer-events-none absolute inset-0">
            <div v-for="i in 6" :key="i" class="sparkle-particle" :style="getSparkleStyle(i)"></div>
          </div>
        </div>

        <!-- IBadge Info -->
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center gap-2">
            <span class="text-sm font-bold uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
              IBadge Unlocked!
            </span>
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
              :class="getRarityClass(badge.rarity)">
              {{ badge.rarity }}
            </span>
          </div>
          <h4 class="mb-1 font-bold text-gray-900 dark:text-white">
            {{ badge.name ?? "" }}
          </h4>
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {{ badge.description ?? "" }}
          </p>
          <div class="flex items-center gap-3 text-sm">
            <div class="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
              <span>⭐</span>
              <span>+{{ badge.xpReward }} XP</span>
            </div>
            <button v-if="badge.shareable" @click="shareBadge(badge)"
              class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>

        <!-- Close Button -->
        <button @click="dismissBadge(badge.id)"
          class="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Progress Bar -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div class="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all"
            :style="{ width: `${badge.progress}%` }"></div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import type { IBadgeUnlockNotificationBadge as IBadge } from "@/types/components/gamification";
import { ref, computed, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
    duration?: number;
    maxVisible?: number;
    stackSpacing?: number;
  }>(),
  {
    position: "top-right",
    duration: 5000,
    maxVisible: 3,
    stackSpacing: 16,
  }
);

const emit = defineEmits<{
  share: [badge: IBadge];
  dismiss: [badgeId: string];
}>();

const badges = ref<(IBadge & { progress: number; timestamp: number })[]>([]);
const timers = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map());

const visibleBadges = computed(() => badges.value.slice(0, props.maxVisible));

function getNotificationStyle(badge: IBadge & { timestamp: number }) {
  const index = badges.value.findIndex((b) => b.id === badge.id);
  const offset = index * (80 + props.stackSpacing); // 80px height + spacing

  const positionStyles: Record<string, string> = {
    "top-right": `top: ${16 + offset}

`,
    "top-left": `top: ${16 + offset}

`,
    "bottom-right": `bottom: ${16 + offset}

px; right: 16px;

`,
    "bottom-left": `bottom: ${16 + offset}

`,
    "top-center": `top: ${16 + offset}

px; left: 50%;

`,
    "bottom-center": `bottom: ${16 + offset}

px; left: 50%; transform: translateX(-50%);`,
  };

  return positionStyles[props.position] || positionStyles["top-right"];
}

function getRarityClass(rarity: string): string {
  const classes = {
    common: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    rare: "bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    epic: "bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    legendary: "bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };
  return classes[rarity as keyof typeof classes] || classes.common;
}

function getSparkleStyle(index: number) {
  const angle = index * 60 - 30; // Distribute around circle
  const distance = 25;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const delay = index * 0.1;
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${delay}s`,
  };
}

function shareBadge(badge: IBadge) {
  emit("share", badge);

  const shareText = `I just unlocked the "${badge.name}" badge! ${badge.description}`;

  if (navigator.share) {
    navigator
      .share({
        title: `IBadge Unlocked: ${badge.name}`,
        text: shareText,
        url: window.location.origin,
      })
      .catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
      });
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
  }
}

function dismissBadge(badgeId: string) {
  const timer = timers.value.get(badgeId);
  if (timer) {
    clearTimeout(timer);
    timers.value.delete(badgeId);
  }

  const index = badges.value.findIndex((b) => b.id === badgeId);
  if (index !== -1) {
    badges.value.splice(index, 1);
  }

  emit("dismiss", badgeId);
}

function showBadge(badge: IBadge) {
  // Add progress tracking
  const badgeWithProgress = {
    ...badge,
    progress: 100,
    timestamp: Date.now(),
  };

  badges.value.push(badgeWithProgress);

  // Animate progress bar
  setTimeout(() => {
    const badgeIndex = badges.value.findIndex((b) => b.id === badge.id);
    if (badgeIndex !== -1) {
      badges.value[badgeIndex].progress = 0;
    }
  }, 100);

  // Auto-dismiss after duration
  const timer = setTimeout(() => {
    dismissBadge(badge.id);
  }, props.duration);

  timers.value.set(badge.id, timer);
}

function showBadges(newBadges: IBadge[]) {
  newBadges.forEach((badge, index) => {
    setTimeout(() => {
      showBadge(badge);
    }, index * 300); // Stagger by 300ms
  });
}

function clearAll() {
  timers.value.forEach((timer) => clearTimeout(timer));
  timers.value.clear();
  badges.value = [];
}

// Expose methods for parent components
defineExpose({
  showBadge,
  showBadges,
  clearAll,
});

// Cleanup on unmount
onUnmounted(() => {
  timers.value.forEach((timer) => clearTimeout(timer));
  timers.value.clear();
});
</script>

<style scoped>
/* IBadge notification transitions */
.badge-notification-enter-active {
  animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-notification-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

/* Sparkle particles */
.sparkle-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle-shine 1.5s infinite;
  pointer-events: none;
}

@keyframes sparkle-shine {

  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Notification box shadow by rarity */
.badge-notification-enter-active[data-rarity="legendary"] {
  box-shadow: 0 10px 40px rgb(251, 146, 60, 0.5);
}

.badge-notification-enter-active[data-rarity="epic"] {
  box-shadow: 0 10px 40px rgb(168, 85, 247, 0.5);
}

.badge-notification-enter-active[data-rarity="rare"] {
  box-shadow: 0 10px 40px rgb(59, 130, 246, 0.5);
}
</style>
