<template>
  <section class="hero-section" :class="{ 'hero-section--animated': animateEntrance }">
    <div class="hero-section__background">
      <!-- Animated gradient orbs -->
      <div class="hero-section__orb hero-section__orb--1"></div>
      <div class="hero-section__orb hero-section__orb--2"></div>
      <div class="hero-section__orb hero-section__orb--3"></div>
    </div>

    <div class="hero-section__content">
      <!-- Left: Greeting and subtitle -->
      <div class="hero-section__text">
        <h1 class="hero-section__greeting">
          <span class="hero-section__greeting-text">{{ greeting }} </span>
          <span class="hero-section__greeting-emoji" v-if="showEmoji"
            >{{ getTimeBasedEmoji() }}
          </span>
        </h1>
        <p class="hero-section__subtitle">{{ subtitle }}</p>

        <!-- Quick stats (mobile) -->
        <div
          class="hero-section__quick-stats hero-section__quick-stats--mobile"
          v-if="showStats && stats"
        >
          <div class="quick-stat">
            <span class="quick-stat__icon">🔥</span>
            <span class="quick-stat__value">{{ stats.streak }} </span>
            <span class="quick-stat__label">{{ $t("stats.dayStreak") }} </span>
          </div>
          <div class="quick-stat">
            <span class="quick-stat__icon">💰</span>
            <span class="quick-stat__value">{{ formatNumber(stats.coins) }} </span>
            <span class="quick-stat__label">{{ $t("stats.coins") }} </span>
          </div>
        </div>

        <!-- Motivational message -->
        <Transition name="fade-up" mode="out-in">
          <p class="hero-section__motivation" :key="motivationalMessage">
            {{ motivationalMessage }}
          </p>
        </Transition>
      </div>

      <!-- Right: Stats cards (desktop) -->
      <div class="hero-section__stats" v-if="showStats && stats">
        <!-- Streak card -->
        <div class="stat-card stat-card--streak">
          <div class="stat-card__header">
            <div class="stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <span class="stat-card__label">{{ $t("stats.streak") }}</span>
          </div>
          <div class="stat-card__value">
            <AnimatedCounter
              :value="stats.streak"
              :format="(value) => Math.round(value).toString()"
            />
            <span class="stat-card__unit">{{ $t("stats.days") }}</span>
          </div>
          <div class="stat-card__progress">
            <div class="stat-card__progress-bar">
              <div
                class="stat-card__progress-fill stat-card__progress-fill--streak"
                :style="{ width: `${getStreakProgress()}%` }"
              ></div>
            </div>
            <span class="stat-card__progress-text">{{ getStreakMessage() }} </span>
          </div>
        </div>

        <!-- Coins card -->
        <div class="stat-card stat-card--coins">
          <div class="stat-card__header">
            <div class="stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M9 8.5a2.5 2.5 0 005 0M9 15.5a2.5 2.5 0 005 0" />
              </svg>
            </div>
            <span class="stat-card__label">{{ $t("stats.coins") }}</span>
          </div>
          <div class="stat-card__value">
            <AnimatedCounter
              :value="stats.coins"
              :format="(value) => Math.round(value).toString()"
            />
          </div>
          <div class="stat-card__trend" v-if="coinTrend > 0">
            <svg
              class="stat-card__trend-icon"
              :class="{ 'stat-card__trend-icon--up': coinTrend > 0 }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline
                :points="
                  coinTrend > 0 ? '22 17 13.5 8.5 8.5 13.5 2 7' : '22 7 13.5 15.5 8.5 10.5 2 17'
                "
              />
            </svg>
            <span class="stat-card__trend-value">{{ Math.abs(coinTrend) }}%</span>
          </div>
        </div>

        <!-- Level/Progress card -->
        <div class="stat-card stat-card--level">
          <div class="stat-card__header">
            <div class="stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <span class="stat-card__label">{{ $t("stats.level") }} </span>
          </div>
          <div class="stat-card__value">
            <span
              >{{ currentDifficulty ? $t(`levels.${currentDifficulty}.title`) : $t('levels.junior.title')$t }}
            </span>
          </div>
          <div class="stat-card__badges">
            <span
              v-for="badge in recentBadges"
              :key="badge.id"
              class="stat-card__badge"
              :title="badge.name"
            >
              {{ badge.emoji }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating action button (mobile) -->
    <button
      v-if="showFloatingAction"
      class="hero-section__fab"
      @click="$emit('fab-click')"
      :aria-label="$t('actions.startLearning')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { IHeroSection } from "@/types/design-system";
import AnimatedCounter from "@/components/ui/AnimatedCounter.vue";

interface props extends iherosection {
  coinTrend?: number;
  currentDifficulty?: "junior" | "intermediate" | "senior";
  recentBadges?: Array<{ id: string; name: string; emoji: string }>;

  showEmoji?: boolean;
  showFloatingAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  greeting: "Welcome back",
  subtitle: "Continue your learning journey",
  showStats: true,
  animateEntrance: true,
  showEmoji: true,
  showFloatingAction: false,
  currentDifficulty: "junior",
  recentBadges: () => [],
});

const emit = defineEmits<{}>();

const { t, locale } = useI18n();

// Motivational messages that rotate
const motivationalMessages = [
  "Your consistency is paying off! Keep going! 💪",
  "Every expert was once a beginner. You're doing great!",
  "Small progress is still progress. Stay focused!",
  "Your future self will thank you for not giving up.",
  "Learning is a journey, not a race. Enjoy it!",
];

const currentMessageIndex = ref(0);

const motivationalMessage = computed(() => {
  return t(
    `motivation.message${currentMessageIndex.value}`,
    motivationalMessages[currentMessageIndex.value]
  );
});

// Methods
const getTimeBasedEmoji = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "☀️"; // Morning
  if (hour >= 12 && hour < 17) return "🌤️"; // Afternoon
  if (hour >= 17 && hour < 21) return "🌆"; // Evening
  return "🌙"; // Night
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const getstreakprogress = () => {
  if (!props.stats?.streak) return 0;
  // Progress towards next milestone (7, 14, 30, 60, 100, 365 days)
  const milestones = [7, 14, 30, 60, 100, 365];
  const currentMilestone = milestones.find((m) => m > props.stats!.streak!) || 365;
  const previousMilestone = milestones[milestones.indexOf(currentMilestone) - 1] || 0;

  return Math.min(
    100,
    ((props.stats.streak - previousMilestone) / (currentMilestone - previousMilestone)) * 100
  );
};

const getstreakmessage = () => {
  if (!props.stats?.streak) return "";

  const streak = props.stats.streak;
  if (streak >= 365) return t("stats.streakLegendary");
  if (streak >= 100) return t("stats.streakMaster");
  if (streak >= 60) return t("stats.streakExpert");
  if (streak >= 30) return t("stats.streakDedicated");
  if (streak >= 14) return t("stats.streakConsistent");
  if (streak >= 7) return t("stats.streakWeekWarrior");
  return t("stats.streakBuildingMomentum");
};

// Rotate motivational messages
onMounted(() => {
  setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % motivationalMessages.length;
  }, 10000); // Change every 10 seconds
});
</script>

<style scoped>
/* Container */
.hero-section {
  @apply relative overflow-hidden;
  @apply w-full px-4 py-12 md:px-6 lg:px-8;
  @apply bg-gradient-to-br from-gray-50 via-white to-gray-50;
  @apply dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
  @apply border-b border-gray-200 dark:border-gray-700;
}

/* Animated background */
.hero-section__background {
  @apply absolute inset-0 overflow-hidden;

  pointer-events: none;
}

.hero-section__orb {
  @apply absolute rounded-full opacity-20 blur-3xl dark:opacity-10;

  animation: float 20s ease-in-out infinite;
}

.hero-section__orb--1 {
  @apply -left-48 -top-48 h-96 w-96;
  @apply bg-gradient-to-br from-primary to-secondary;

  animation-duration: 25s;
}

.hero-section__orb--2 {
  @apply right-0 top-0 h-64 w-64;
  @apply bg-gradient-to-br from-secondary to-success;

  animation-duration: 20s;
  animation-delay: -5s;
}

.hero-section__orb--3 {
  @apply -bottom-40 right-1/3 h-80 w-80;
  @apply bg-gradient-to-br from-warning to-primary;

  animation-duration: 30s;
  animation-delay: -10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Content layout */
.hero-section__content {
  @apply relative z-10;
  @apply mx-auto max-w-7xl;
  @apply flex flex-col gap-8 md:flex-row md:items-center md:justify-between;
}

/* Text content */
.hero-section__text {
  @apply flex-1;
}

.hero-section__greeting {
  @apply text-4xl font-bold md:text-5xl;
  @apply bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300;
  @apply bg-clip-text text-transparent;
  @apply mb-2;

  animation: fade-in-up 0.6s ease-out;
}

.hero-section__greeting-emoji {
  @apply ml-3 inline-block text-4xl;

  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-10deg);
  }

  75% {
    transform: rotate(10deg);
  }
}

.hero-section__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-400 md:text-xl;
  @apply mb-6;

  animation: fade-in-up 0.6s ease-out 0.1s backwards;
}

.hero-section__motivation {
  @apply text-sm text-gray-700 dark:text-gray-300 md:text-base;
  @apply bg-gradient-to-r from-primary-50 to-secondary-50;
  @apply dark:from-primary-900/20 dark:to-secondary-900/20;
  @apply inline-block rounded-lg px-4 py-2;
  @apply border border-primary-200/50 dark:border-primary-700/50;

  animation: fade-in-up 0.6s ease-out 0.2s backwards;
}

/* Quick stats (mobile) */
.hero-section__quick-stats--mobile {
  @apply mt-4 flex gap-4 md:hidden;
}

.quick-stat {
  @apply flex items-center gap-2;
  @apply rounded-lg px-3 py-2;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
}

.quick-stat__icon {
  @apply text-xl;
}

.quick-stat__value {
  @apply font-bold text-gray-900 dark:text-white;
}

.quick-stat__label {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

/* Stats cards (desktop) */
.hero-section__stats {
  @apply hidden gap-4 md:flex;
  @apply flex-shrink-0;
}

.stat-card {
  @apply relative;
  @apply w-40 rounded-xl p-4;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  @apply shadow-sm hover:shadow-md;
  @apply transition-all duration-fast;
  @apply hover:-translate-y-1;

  animation: fade-in-up 0.6s ease-out backwards;
}

.stat-card--streak {
  animation-delay: 0.1s;
}

.stat-card--coins {
  animation-delay: 0.2s;
}

.stat-card--level {
  animation-delay: 0.3s;
}

.stat-card__header {
  @apply mb-3 flex items-center justify-between;
}

.stat-card__icon {
  @apply h-8 w-8 rounded-lg p-1.5;
  @apply bg-gradient-to-br from-primary-100 to-secondary-100;
  @apply dark:from-primary-900/50 dark:to-secondary-900/50;
}

.stat-card__icon svg {
  @apply h-full w-full;
  @apply text-primary-600 dark:text-primary-400;
}

.stat-card__label {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
  @apply uppercase tracking-wider;
}

.stat-card__value {
  @apply flex items-baseline gap-1;
  @apply text-2xl font-bold text-gray-900 dark:text-white;
  @apply mb-2;
}

.stat-card__unit {
  @apply text-sm font-normal text-gray-600 dark:text-gray-400;
}

/* Progress bar */
.stat-card__progress {
  @apply space-y-1;
}

.stat-card__progress-bar {
  @apply h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.stat-card__progress-fill {
  @apply h-full rounded-full;
  @apply transition-all duration-glacial ease-out;
}

.stat-card__progress-fill--streak {
  @apply bg-gradient-to-r from-orange-400 to-red-500;
}

.stat-card__progress-text {
  @apply text-[10px] text-gray-600 dark:text-gray-400;
}

/* Trend indicator */
.stat-card__trend {
  @apply flex items-center gap-1;
}

.stat-card__trend-icon {
  @apply h-4 w-4;
  @apply text-red-500;
}

.stat-card__trend-icon--up {
  @apply text-green-500;
}

.stat-card__trend-value {
  @apply text-xs font-medium;
  @apply text-gray-600 dark:text-gray-400;
}

/* Badges */
.stat-card__badges {
  @apply flex gap-1;
}

.stat-card__badge {
  @apply text-lg;
  @apply transition-transform duration-fast hover:scale-125;
  @apply cursor-help;
}

/* Floating action button */
.hero-section__fab {
  @apply fixed bottom-6 right-6 z-50;
  @apply h-14 w-14 rounded-full;
  @apply bg-gradient-to-r from-primary to-secondary;
  @apply text-white shadow-lg;
  @apply flex items-center justify-center;
  @apply hover:scale-110 hover:shadow-xl;
  @apply transition-all duration-fast;
  @apply md:hidden;

  /* Only show on mobile */
}

.hero-section__fab svg {
  @apply h-6 w-6;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade transition */
.fade-up-enter-active,
.fade-up-leave-active {
  @apply transition-all duration-moderate ease-out;
}

.fade-up-enter-from {
  @apply translate-y-4 opacity-0;
}

.fade-up-leave-to {
  @apply -translate-y-4 opacity-0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero-section__orb,
  .hero-section__greeting-emoji,
  .stat-card {
    animation: none !important;
  }
}
</style>
