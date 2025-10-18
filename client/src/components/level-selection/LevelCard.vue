<template>
  <div
    class="level-card"
    :class="{
      'level-card--selected': isSelected,
      'level-card--locked': isLocked,
      'level-card--hovering': isHovering,
      'level-card--junior': difficulty === 'junior',
      'level-card--intermediate': difficulty === 'intermediate',
      'level-card--senior': difficulty === 'senior',
      'level-card--custom': difficulty === 'custom',
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    :tabindex="isLocked ? -1 : 0"
    role="button"
    :aria-pressed="isSelected"
    :aria-disabled="isLocked"
    :aria-label="ariaLabel"
  >
    <!-- Animated background gradient -->
    <div class="level-card__gradient" :style="{ '--gradient-angle': gradientAngle + 'deg' }"></div>

    <!-- Lock overlay -->
    <Transition name="fade">
      <div v-if="isLocked" class="level-card__lock-overlay">
        <svg class="level-card__lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span class="level-card__lock-text">{{
          $t("levels.requiresPlan", { plan: requiredPlan })
        }}</span>
      </div>
    </Transition>

    <!-- Badge -->
    <div v-if="badge" class="level-card__badge" :class="`level-card__badge--${badge.variant}`">
      {{ badge.text }}
      <div class="level-card__badge-text">{{ getBadgeExplanation(badge.text) }}</div>
    </div>

    <!-- Content -->
    <div class="level-card__content">
      <!-- Icon -->
      <div class="level-card__icon-wrapper">
        <div class="level-card__icon-bg"></div>
        <component :is="iconComponent" class="level-card__icon" />
      </div>

      <!-- Text content -->
      <div class="level-card__text">
        <h3 class="level-card__title">{{ title }}</h3>
        <p class="level-card__subtitle">{{ subtitle }}</p>
        <p class="level-card__description">{{ description }}</p>
      </div>

      <!-- Footer -->
      <div class="level-card__footer">
        <div class="level-card__duration">
          <svg
            class="level-card__duration-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ duration }}</span>
        </div>
        <div class="level-card__progress" v-if="progress !== undefined">
          <div class="level-card__progress-bar">
            <div class="level-card__progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="level-card__progress-text">{{ progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Selection indicator -->
    <Transition name="scale">
      <div v-if="isSelected" class="level-card__selected-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </Transition>

    <!-- Hover effects -->
    <div class="level-card__hover-effects">
      <div class="level-card__hover-glow"></div>
      <div class="level-card__hover-particles">
        <span
          v-for="i in 6"
          :key="i"
          class="level-card__particle"
          :style="{ '--particle-index': i }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import type { ILevelCard } from "../../types/design-system";

interface Props extends Partial<ILevelCard> {
  modelValue?: boolean; // For v-model support
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: "junior",
  isLocked: false,
  isSelected: false,
  progress: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  click: [event: MouseEvent];
  select: [difficulty: string];
}>();

const { t } = useI18n();

// State
const isHovering = ref(false);
const gradientAngle = ref(45);
let animationFrame: number | null = null;
animationFrame;

// Computed
const ariaLabel = computed(() => {
  if (props.isLocked) {
    return t("levels.lockedCard", { title: props.title, plan: props.requiredPlan });
  }
  return t("levels.selectCard", { title: props.title });
});

const getBadgeExplanation = (badgeText: string): string => {
  const explanations: Record<string, string> = {
    PRO: t("levels.badgePro"),
    NEW: t("levels.badgeNew"),
    RECOMMENDED: t("levels.badgeRecommended"),
  };
  return explanations[badgeText] || "";
};

const iconComponent = computed(() => {
  const icons = {
    junior: h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" }, [
      h("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }),
      h("path", { d: "M2 17l10 5 10-5M2 12l10 5 10-5" }),
    ]),
    intermediate: h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" }, [
      h("polygon", {
        points:
          "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
      }),
    ]),
    senior: h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" }, [
      h("path", { d: "M12 2L3.5 20.5L12 17l8.5 3.5L12 2z" }),
    ]),
    custom: h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" }, [
      h("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }),
    ]),
  };

  return icons[props.difficulty] || icons.junior;
});

// Methods
const handleMouseEnter = () => {
  if (props.isLocked) return;
  isHovering.value = true;
  animateGradient();
};

const handleMouseLeave = () => {
  isHovering.value = false;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  gradientAngle.value = 45;
};

const animateGradient = () => {
  if (!isHovering.value) return;

  gradientAngle.value = (gradientAngle.value + 2) % 360;
  animationFrame = requestAnimationFrame(animateGradient);
};

const handleClick = (event: MouseEvent | KeyboardEvent) => {
  if (props.isLocked) {
    // Trigger shake animation
    const target = event.currentTarget as HTMLElement;
    target.classList.add("level-card--shake");
    setTimeout(() => {
      target.classList.remove("level-card--shake");
    }, 500);

    // Emit locked event for analytics
    emit("click", event as MouseEvent);
    return;
  }

  // Toggle selection
  const newValue = !props.isSelected;
  emit("update:modelValue", newValue);
  emit("select", props.difficulty);
  emit("click", event as MouseEvent);

  // Haptic feedback for mobile
  if ("vibrate" in navigator) {
    navigator.vibrate(10);
  }
};

// Cleanup
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
</script>

<style scoped>
/* Base card with enhanced glassmorphism */
.level-card {
  @apply relative overflow-hidden;
  @apply w-full rounded-3xl;
  @apply cursor-pointer select-none;
  @apply focus:outline-none focus:ring-4 focus:ring-white/30;
  @apply transition-all duration-300 ease-out;

  /* Enhanced glassmorphism */
  background: linear-gradient(135deg, rgb(255, 255, 255, 0.95) 0%, rgb(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);

  /* Sophisticated border with gradient */
  border: 2px solid;
  border-image: linear-gradient(
      135deg,
      rgb(255, 255, 255, 0.6) 0%,
      rgb(255, 255, 255, 0.2) 50%,
      rgb(255, 255, 255, 0.6) 100%
    )
    1;
  min-height: 380px;
  transform-style: preserve-3d;
  transform: translateZ(0);

  /* Professional multi-layer shadows */
  box-shadow:
    /* Primary shadow */
    0 20px 60px -15px rgb(0, 0, 0, 0.25),
    /* Rim light effect */ 0 0 0 1px rgb(255, 255, 255, 0.15),
    /* Inner glow for depth */ inset 0 1px 0 0 rgb(255, 255, 255, 0.5),
    inset 0 -1px 0 0 rgb(0, 0, 0, 0.05);
}

/* Hover state with enhanced effects */
.level-card:hover:not(.level-card--locked) {
  transform: translateY(-12px) scale(1.04);

  /* Enhanced glassmorphism on hover */
  background: linear-gradient(135deg, rgb(255, 255, 255, 0.98) 0%, rgb(255, 255, 255, 0.92) 100%);
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px) saturate(200%);

  /* Dramatic hover shadows */
  box-shadow:
    0 40px 100px -20px rgb(0, 0, 0, 0.35),
    0 0 0 2px rgb(255, 255, 255, 0.25),
    inset 0 2px 0 0 rgb(255, 255, 255, 0.7),
    inset 0 -2px 0 0 rgb(0, 0, 0, 0.08),
    /* Colored glow based on difficulty */ 0 0 60px -15px rgb(var(--card-color-rgb), 0.4);
}

.level-card:active:not(.level-card--locked) {
  transform: translateY(-6px) scale(1.02);
}

/* Selected state with premium feel */
.level-card--selected {
  background: linear-gradient(135deg, rgb(255, 255, 255, 1) 0%, rgb(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  transform: scale(1.08);

  /* Premium selected shadow with color accent */
  box-shadow:
    0 40px 120px -15px rgb(0, 0, 0, 0.4),
    0 0 0 3px rgb(var(--card-color-rgb), 0.3),
    0 0 0 5px rgb(255, 255, 255, 0.4),
    inset 0 2px 0 0 rgb(255, 255, 255, 0.8),
    inset 0 0 40px 0 rgb(var(--card-color-rgb), 0.05),
    /* Prominent glow */ 0 0 80px -10px rgb(var(--card-color-rgb), 0.6);

  /* Animated border gradient */
  border-image: linear-gradient(
      135deg,
      rgb(var(--card-color-rgb), 0.8) 0%,
      rgb(255, 255, 255, 0.4) 50%,
      rgb(var(--card-color-rgb), 0.8) 100%
    )
    1;
}

/* Locked state with frosted glass effect */
.level-card--locked {
  @apply cursor-not-allowed opacity-65;

  background: linear-gradient(135deg, rgb(255, 255, 255, 0.7) 0%, rgb(255, 255, 255, 0.6) 100%);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  filter: grayscale(0.3);
}

/* Difficulty-specific color variables */
.level-card--junior {
  --card-color-rgb: 34, 197, 94;

  /* green-600 */
}

.level-card--intermediate {
  --card-color-rgb: 59, 130, 246;

  /* blue-600 */
}

.level-card--senior {
  --card-color-rgb: 168, 85, 247;

  /* purple-600 */
}

.level-card--custom {
  --card-color-rgb: 251, 146, 60;

  /* orange-600 */
}

/* Animated gradient background */
.level-card__gradient {
  @apply absolute inset-0 opacity-0 transition-opacity duration-moderate;

  background: linear-gradient(
    var(--gradient-angle),
    transparent 0%,
    rgb(var(--color-primary-rgb), 0.05) 50%,
    transparent 100%
  );
  pointer-events: none;
}

.level-card--hovering .level-card__gradient {
  @apply opacity-100;
}

/* Lock overlay with professional frosted glass */
.level-card__lock-overlay {
  @apply absolute inset-0 z-10;
  @apply flex flex-col items-center justify-center;
  @apply rounded-3xl;

  /* Enhanced frosted glass effect */
  background: linear-gradient(135deg, rgb(255, 255, 255, 0.95) 0%, rgb(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);

  /* Subtle border */
  box-shadow: inset 0 0 0 1px rgb(0, 0, 0, 0.05);
}

.level-card__lock-icon {
  @apply mb-4 h-16 w-16 text-gray-500;
  @apply transition-transform duration-300;

  filter: drop-shadow(0 4px 12px rgb(0, 0, 0, 0.1));
}

.level-card--shake .level-card__lock-icon {
  animation: lock-shake 0.5s ease-in-out;
}

@keyframes lock-shake {
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

.level-card__lock-text {
  @apply text-sm font-bold text-gray-700;
  @apply rounded-full px-6 py-2;
  @apply bg-gray-100/80;

  text-shadow: 0 1px 2px rgb(255, 255, 255, 0.8);
}

/* Badge with premium glassmorphic design */
.level-card__badge {
  @apply absolute right-6 top-6 z-20;
  @apply rounded-full px-5 py-2;
  @apply text-xs font-extrabold uppercase tracking-[0.15em];
  @apply transition-all duration-300;

  /* Glassmorphic badge */
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  /* Sophisticated shadow */
  box-shadow:
    0 6px 16px rgb(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3);
}

.level-card__badge--primary {
  background: linear-gradient(135deg, rgb(59, 130, 246, 0.95) 0%, rgb(37, 99, 235, 0.95) 100%);

  @apply text-white;

  box-shadow:
    0 6px 16px rgb(59, 130, 246, 0.4),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3),
    0 0 20px rgb(59, 130, 246, 0.3);
}

.level-card__badge--success {
  background: linear-gradient(135deg, rgb(34, 197, 94, 0.95) 0%, rgb(22, 163, 74, 0.95) 100%);

  @apply text-white;

  box-shadow:
    0 6px 16px rgb(34, 197, 94, 0.4),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3),
    0 0 20px rgb(34, 197, 94, 0.3);
}

.level-card__badge--warning {
  background: linear-gradient(135deg, rgb(251, 146, 60, 0.95) 0%, rgb(249, 115, 22, 0.95) 100%);

  @apply text-white;

  box-shadow:
    0 6px 16px rgb(251, 146, 60, 0.4),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3),
    0 0 20px rgb(251, 146, 60, 0.3);
}

.level-card--hovering .level-card__badge {
  transform: scale(1.05);
}

.level-card--selected .level-card__badge {
  transform: scale(1.08);
}

.level-card__badge-text {
  @apply mt-1 block;
  @apply text-[10px] font-normal lowercase;
  @apply opacity-80;
  @apply leading-tight;
  @apply tracking-normal;
}

/* Content */
.level-card__content {
  @apply relative z-10 p-6;
  @apply flex flex-col items-center text-center;
}

/* Icon with enhanced effects */
.level-card__icon-wrapper {
  @apply relative mb-8;

  perspective: 1000px;
}

.level-card__icon-bg {
  @apply absolute inset-0;
  @apply h-28 w-28 rounded-3xl;
  @apply transition-all duration-500 ease-out;

  transform: rotate(45deg);

  /* Sophisticated gradient background */
  background: linear-gradient(
    135deg,
    rgb(var(--card-color-rgb), 0.15) 0%,
    rgb(var(--card-color-rgb), 0.05) 100%
  );

  /* Multi-layer shadow for depth */
  box-shadow:
    0 12px 35px -10px rgb(var(--card-color-rgb), 0.25),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.2),
    inset 0 -1px 0 0 rgb(0, 0, 0, 0.05);
}

.level-card--hovering .level-card__icon-bg {
  transform: rotate(50deg) scale(1.05);
  box-shadow:
    0 16px 45px -10px rgb(var(--card-color-rgb), 0.35),
    inset 0 2px 0 0 rgb(255, 255, 255, 0.3),
    inset 0 -2px 0 0 rgb(0, 0, 0, 0.08);
}

.level-card--selected .level-card__icon-bg {
  transform: rotate(45deg) scale(1.1);
  background: linear-gradient(
    135deg,
    rgb(var(--card-color-rgb), 0.25) 0%,
    rgb(var(--card-color-rgb), 0.1) 100%
  );
}

.level-card__icon {
  @apply relative h-24 w-24;
  @apply transition-all duration-500 ease-out;

  stroke-width: 1.5;

  /* Premium icon shadow */
  filter: drop-shadow(0 4px 16px rgb(var(--card-color-rgb), 0.25));
}

.level-card--junior .level-card__icon {
  @apply text-green-600;
}

.level-card--intermediate .level-card__icon {
  @apply text-blue-600;
}

.level-card--senior .level-card__icon {
  @apply text-purple-600;
}

.level-card--custom .level-card__icon {
  @apply text-orange-600;
}

.level-card--hovering .level-card__icon {
  transform: rotate(12deg) scale(1.2);
  filter: drop-shadow(0 8px 20px rgb(var(--card-color-rgb), 0.4));
}

.level-card--selected .level-card__icon {
  transform: scale(1.15);
  filter: drop-shadow(0 6px 18px rgb(var(--card-color-rgb), 0.5));
}

/* Text content with enhanced typography */
.level-card__text {
  @apply mb-8;
}

.level-card__title {
  @apply mb-3 text-3xl font-extrabold text-gray-900;
  @apply transition-all duration-300;

  letter-spacing: -0.02em;

  /* Premium text shadow */
  text-shadow: 0 2px 8px rgb(0, 0, 0, 0.08);
}

.level-card--selected .level-card__title {
  color: rgb(var(--card-color-rgb));
  text-shadow: 0 2px 12px rgb(var(--card-color-rgb), 0.2);
}

.level-card__subtitle {
  @apply mb-4 text-xs font-extrabold text-gray-500;
  @apply uppercase tracking-[0.15em];
  @apply transition-colors duration-300;
}

.level-card--selected .level-card__subtitle {
  color: rgb(var(--card-color-rgb), 0.8);
}

.level-card__description {
  @apply text-base leading-relaxed text-gray-700;
  @apply font-medium;
  @apply transition-colors duration-300;
}

.level-card--selected .level-card__description {
  @apply text-gray-800;
}

/* Footer */
.level-card__footer {
  @apply mt-auto border-t-2 border-gray-100 pt-6;
  @apply flex w-full items-center justify-between;
}

.level-card__duration {
  @apply flex items-center gap-2 text-sm font-semibold text-gray-600;
}

.level-card__duration-icon {
  @apply h-5 w-5;
}

/* Progress bar */
.level-card__progress {
  @apply flex items-center gap-2;
}

.level-card__progress-bar {
  @apply h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.level-card__progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary;
  @apply transition-[width] duration-moderate;
}

.level-card__progress-text {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
}

/* Selected indicator with premium design */
.level-card__selected-indicator {
  @apply absolute left-5 top-5 z-20;
  @apply h-12 w-12 rounded-full;
  @apply text-white;
  @apply flex items-center justify-center;
  @apply transition-all duration-300;

  /* Dynamic background based on card color */
  background: linear-gradient(
    135deg,
    rgb(var(--card-color-rgb), 1) 0%,
    rgb(var(--card-color-rgb), 0.85) 100%
  );

  /* Premium shadow with colored glow */
  box-shadow:
    0 8px 20px rgb(var(--card-color-rgb), 0.5),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3),
    0 0 30px rgb(var(--card-color-rgb), 0.4);
}

.level-card__selected-indicator svg {
  @apply h-6 w-6;

  stroke-width: 3;
  filter: drop-shadow(0 2px 4px rgb(0, 0, 0, 0.2));
}

/* Hover effects with enhanced glow */
.level-card__hover-effects {
  @apply pointer-events-none absolute inset-0 overflow-hidden rounded-3xl;
}

.level-card__hover-glow {
  @apply absolute -inset-6 opacity-0;
  @apply transition-all duration-500 ease-out;

  /* Radial glow that matches card color */
  background: radial-gradient(
    circle at center,
    rgb(var(--card-color-rgb), 0.15) 0%,
    rgb(var(--card-color-rgb), 0.08) 40%,
    transparent 70%
  );

  /* Animated pulse */
  animation: glow-pulse 3s ease-in-out infinite;
}

.level-card--hovering .level-card__hover-glow {
  opacity: 1;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Particles animation */
.level-card__particle {
  @apply absolute h-1 w-1 rounded-full bg-primary;
  @apply opacity-0;

  animation: particle-float 2s ease-out infinite;
  animation-delay: calc(var(--particle-index) * 0.2s);
}

.level-card--hovering .level-card__particle {
  @apply opacity-100;
}

@keyframes particle-float {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    transform: translate(calc(var(--particle-index) * 10px - 30px), -60px) scale(0.5);
    opacity: 0;
  }
}

/* Shake animation for locked cards */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}

.level-card--shake {
  animation: shake 0.5s ease-in-out;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-fast;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.scale-enter-active,
.scale-leave-active {
  @apply transition-all duration-fast ease-spring;
}

.scale-enter-from,
.scale-leave-to {
  @apply scale-0 opacity-0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .level-card,
  .level-card__icon,
  .level-card__particle,
  .level-card__gradient {
    animation: none !important;
    transition: none !important;
  }

  .level-card:hover:not(.level-card--locked) {
    transform: none;
  }
}

/* Dark mode with enhanced glassmorphism */
.dark .level-card {
  background: linear-gradient(135deg, rgb(24, 24, 27, 0.95) 0%, rgb(24, 24, 27, 0.85) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-image: linear-gradient(
      135deg,
      rgb(255, 255, 255, 0.2) 0%,
      rgb(255, 255, 255, 0.05) 50%,
      rgb(255, 255, 255, 0.2) 100%
    )
    1;
  box-shadow:
    0 20px 60px -15px rgb(0, 0, 0, 0.6),
    0 0 0 1px rgb(255, 255, 255, 0.08),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.1);
}

.dark .level-card--selected {
  background: linear-gradient(135deg, rgb(39, 39, 42, 1) 0%, rgb(39, 39, 42, 0.95) 100%);
  box-shadow:
    0 40px 120px -15px rgb(0, 0, 0, 0.8),
    0 0 0 3px rgb(var(--card-color-rgb), 0.4),
    0 0 0 5px rgb(255, 255, 255, 0.1),
    inset 0 2px 0 0 rgb(255, 255, 255, 0.15),
    inset 0 0 40px 0 rgb(var(--card-color-rgb), 0.1),
    0 0 80px -10px rgb(var(--card-color-rgb), 0.7);
}

.dark .level-card:hover:not(.level-card--locked) {
  background: linear-gradient(135deg, rgb(39, 39, 42, 0.98) 0%, rgb(39, 39, 42, 0.92) 100%);
  box-shadow:
    0 40px 100px -20px rgb(0, 0, 0, 0.7),
    0 0 0 2px rgb(255, 255, 255, 0.15),
    inset 0 2px 0 0 rgb(255, 255, 255, 0.15),
    0 0 60px -15px rgb(var(--card-color-rgb), 0.5);
}

.dark .level-card__hover-glow {
  background: radial-gradient(
    circle at center,
    rgb(var(--card-color-rgb), 0.12) 0%,
    rgb(var(--card-color-rgb), 0.06) 40%,
    transparent 70%
  );
}

.dark .level-card__title {
  @apply text-gray-100;
}

.dark .level-card--selected .level-card__title {
  color: rgb(var(--card-color-rgb));
}

.dark .level-card__subtitle,
.dark .level-card__description {
  @apply text-gray-300;
}

.dark .level-card--selected .level-card__description {
  @apply text-gray-200;
}

.dark .level-card__lock-overlay {
  background: linear-gradient(135deg, rgb(24, 24, 27, 0.95) 0%, rgb(24, 24, 27, 0.9) 100%);
}

.dark .level-card__lock-text {
  @apply bg-gray-800/80 text-gray-300;
}
</style>
