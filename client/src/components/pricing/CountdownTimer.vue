<template>
  <div class="countdown-timer" :class="variant && `countdown-timer--${variant}`">
    <div class="countdown-container">
      <!-- Icon/Emoji -->
      <div v-if="showIcon" class="countdown-icon">
        {{ icon }}
      </div>

      <!-- Header -->
      <div class="countdown-header">
        <h3 v-if="title" class="countdown-title">{{ title }}</h3>
        <p v-if="message" class="countdown-message">{{ message }}</p>
      </div>

      <!-- Countdown Display -->
      <div class="countdown-display">
        <!-- Days -->
        <div v-if="showDays && timeLeft.days > 0" class="countdown-unit">
          <div class="countdown-value">
            <AnimatedCounter
              :value="timeLeft.days"
              :duration="500"
              :format="(value) => Math.round(value).toString()"
            />
          </div>
          <div class="countdown-label">{{ $t("pricing.countdown?.days") }}</div>
        </div>

        <!-- Hours -->
        <div v-if="showHours" class="countdown-unit">
          <div class="countdown-value">
            {{ formatTime(timeLeft.hours) }}
          </div>
          <div class="countdown-label">{{ $t("pricing.countdown?.hours") }}</div>
        </div>

        <!-- Separator -->
        <div v-if="showHours && showMinutes" class="countdown-separator">:</div>

        <!-- Minutes -->
        <div v-if="showMinutes" class="countdown-unit">
          <div class="countdown-value">
            {{ formatTime(timeLeft.minutes) }}
          </div>
          <div class="countdown-label">{{ $t("pricing.countdown?.minutes") }}</div>
        </div>

        <!-- Separator -->
        <div v-if="showMinutes && showSeconds" class="countdown-separator">:</div>

        <!-- Seconds -->
        <div v-if="showSeconds" class="countdown-unit">
          <div class="countdown-value">
            {{ formatTime(timeLeft.seconds) }}
          </div>
          <div class="countdown-label">{{ $t("pricing.countdown?.seconds") }}</div>
        </div>
      </div>

      <!-- CTA Button -->
      <slot name="cta">
        <button v-if="ctaText" class="countdown-cta" @click="$emit('cta-click')">
          {{ ctaText }}

          <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </slot>

      <!-- Expired Message -->
      <div v-if="isExpired" class="countdown-expired">
        {{ expiredMessage || $t("pricing.countdown?.expired") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ICountdownTimerTimeLeft as TimeLeft,
  ICountdownTimerProps as Props,
} from "@/types/components/pricing";
import { ref, onMounted, onUnmounted } from "vue";
import AnimatedCounter from "@/components/AnimatedCounter.vue";

const props = withDefaults(defineProps<Props>(), {
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  showIcon: true,
  icon: "⏰",
  variant: "default",
  autoReset: false,
  resetDuration: 86400, // 24 hours in seconds
});

const emit = defineEmits<{
  tick: [timeLeft: TimeLeft];
}>();

const timeLeft = ref<TimeLeft>({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
});

const isExpired = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;
intervalId;

function calculateTimeLeft(): TimeLeft {
  let endTime: number;
  endTime;

  if (props.targetDate) {
    const target =
      typeof props.targetDate === "string" ? new Date(props.targetDate) : props.targetDate;
    endTime = target.getTime();
  } else if (props.duration) {
    // If duration is provided, calculate end time from now
    const now = Date.now();
    endTime = now + props.duration * 1000;
  } else {
    // Default: 24 hours from now
    const now = Date.now();
    endTime = now + 86400 * 1000;
  }

  const now = Date.now();
  const diff = endTime - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    };
  }

  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    total,
  };
}

function updateTimer() {
  const newTimeLeft = calculateTimeLeft();
  timeLeft.value = newTimeLeft;

  emit("tick", newTimeLeft);

  if (newTimeLeft.total <= 0) {
    isExpired.value = true;
    stopTimer();
    emit("expired");

    if (props.autoReset) {
      setTimeout(() => {
        resetTimer();
      }, 2000);
    }
  }
}

function startTimer() {
  updateTimer();
  intervalId = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function resetTimer() {
  isExpired.value = false;
  // If auto-reset, use resetDuration
  if (props.autoReset && props.resetDuration) {
    // Update target date (would need to be reactive in real implementation)
    // For now, just recalculate
  }
  startTimer();
}

function formatTime(value: number): string {
  return value.toString().padStart(2, "0");
}

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

defineExpose({
  resetTimer,
  stopTimer,
  startTimer,
});
</script>

<style scoped>
/* Base styles */
.countdown-timer {
  @apply relative overflow-hidden;
}

.countdown-container {
  @apply flex flex-col items-center gap-4;
}

/* Icon */
.countdown-icon {
  @apply animate-bounce text-5xl;
}

/* Header */
.countdown-header {
  @apply text-center;
}

.countdown-title {
  @apply mb-2 text-2xl font-bold text-gray-900 dark:text-white;
}

.countdown-message {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* Display */
.countdown-display {
  @apply flex items-center justify-center gap-4;
}

.countdown-unit {
  @apply flex flex-col items-center;
}

.countdown-value {
  @apply text-4xl font-bold sm:text-5xl;
  @apply bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600;
  @apply bg-clip-text text-transparent;
  @apply min-w-[60px] text-center sm:min-w-[80px];
  @apply rounded-xl p-3;
  @apply bg-white dark:bg-gray-800;
  @apply border-2 border-gray-100 shadow-lg dark:border-gray-700;
}

.countdown-label {
  @apply mt-2 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 sm:text-sm;
}

.countdown-separator {
  @apply text-3xl font-bold text-gray-400 dark:text-gray-600 sm:text-4xl;
  @apply animate-pulse;
}

/* CTA */
.countdown-cta {
  @apply mt-4 rounded-xl px-8 py-4 text-base font-bold;
  @apply bg-gradient-to-r from-orange-500 via-red-500 to-pink-500;
  @apply text-white shadow-xl;
  @apply hover:scale-105 hover:shadow-2xl;
  @apply transition-all duration-200;
  @apply flex items-center gap-2;
  @apply animate-pulse;
}

/* Expired */
.countdown-expired {
  @apply mt-4 rounded-lg px-6 py-3;
  @apply bg-red-100 dark:bg-red-900/30;
  @apply text-red-700 dark:text-red-300;
  @apply text-center font-semibold;
}

/* Variants */

/* Compact */
.countdown-timer--compact .countdown-container {
  @apply flex-row gap-2;
}

.countdown-timer--compact .countdown-header {
  @apply flex-1 text-left;
}

.countdown-timer--compact .countdown-title {
  @apply mb-0 text-lg;
}

.countdown-timer--compact .countdown-display {
  @apply gap-2;
}

.countdown-timer--compact .countdown-value {
  @apply min-w-[40px] p-2 text-2xl;
}

.countdown-timer--compact .countdown-label {
  @apply text-xs;
}

.countdown-timer--compact .countdown-icon {
  @apply text-3xl;
}

/* Banner */
.countdown-timer--banner {
  @apply bg-gradient-to-r from-orange-500 via-red-500 to-pink-500;
  @apply px-6 py-4;
}

.countdown-timer--banner .countdown-container {
  @apply flex-row items-center justify-between;
  @apply mx-auto max-w-7xl;
}

.countdown-timer--banner .countdown-header {
  @apply flex-1 text-left;
}

.countdown-timer--banner .countdown-title {
  @apply mb-1 text-xl text-white;
}

.countdown-timer--banner .countdown-message {
  @apply text-orange-100;
}

.countdown-timer--banner .countdown-value {
  @apply text-3xl;
  @apply bg-white/20 backdrop-blur-sm;
  @apply text-white;
  @apply border-white/30;
}

.countdown-timer--banner .countdown-label {
  @apply text-white/90;
}

.countdown-timer--banner .countdown-separator {
  @apply text-white/70;
}

.countdown-timer--banner .countdown-icon {
  @apply text-white;
}

/* Urgent */
.countdown-timer--urgent {
  @apply bg-red-50 dark:bg-red-900/20;
  @apply border-4 border-red-500;
  @apply rounded-2xl p-6;
  @apply shadow-2xl shadow-red-500/50;
}

.countdown-timer--urgent .countdown-title {
  @apply text-red-700 dark:text-red-300;
}

.countdown-timer--urgent .countdown-value {
  @apply border-red-300 dark:border-red-700;
  @apply animate-pulse;
}

.countdown-timer--urgent .countdown-icon {
  @apply text-red-500;
}

/* Animations */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (width <= 640px) {
  .countdown-display {
    @apply gap-2;
  }

  .countdown-value {
    @apply min-w-[50px] p-2 text-3xl;
  }

  .countdown-separator {
    @apply text-2xl;
  }

  .countdown-timer--banner .countdown-container {
    @apply flex-col gap-3;
  }

  .countdown-timer--banner .countdown-header {
    @apply text-center;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .countdown-icon,
  .countdown-separator,
  .countdown-cta {
    animation: none;
  }

  .countdown-cta:hover {
    @apply scale-100;
  }
}

/* RTL Support */
[dir="rtl"] .countdown-cta {
  @apply flex-row-reverse;
}
</style>
