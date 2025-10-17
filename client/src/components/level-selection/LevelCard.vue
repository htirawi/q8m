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
      'level-card--custom': difficulty === 'custom'
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
        <span class="level-card__lock-text">{{ $t('levels.requiresPlan', { plan: requiredPlan }) }}</span>
      </div>
    </Transition>

    <!-- Badge -->
    <div v-if="badge" class="level-card__badge" :class="`level-card__badge--${badge.variant}`">
      {{ badge.text }}
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
          <svg class="level-card__duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        <span v-for="i in 6" :key="i" class="level-card__particle" :style="{ '--particle-index': i }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ILevelCard } from '@/types/design-system';

interface Props extends Partial<ILevelCard> {
  modelValue?: boolean; // For v-model support
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: 'junior',
  isLocked: false,
  isSelected: false,
  progress: undefined
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'click': [event: MouseEvent];
  'select': [difficulty: string];
}>();

const { t } = useI18n();

// State
const isHovering = ref(false);
const gradientAngle = ref(45);
let animationFrame: number | null = null;

// Computed
const ariaLabel = computed(() => {
  if (props.isLocked) {
    return t('levels.lockedCard', { title: props.title, plan: props.requiredPlan });
  }
  return t('levels.selectCard', { title: props.title });
});

const iconComponent = computed(() => {
  const icons = {
    junior: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
      h('path', { d: 'M2 17l10 5 10-5M2 12l10 5 10-5' })
    ]),
    intermediate: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ]),
    senior: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M12 2L3.5 20.5L12 17l8.5 3.5L12 2z' })
    ]),
    custom: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' })
    ])
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
    target.classList.add('level-card--shake');
    setTimeout(() => {
      target.classList.remove('level-card--shake');
    }, 500);

    // Emit locked event for analytics
    emit('click', event as MouseEvent);
    return;
  }

  // Toggle selection
  const newValue = !props.isSelected;
  emit('update:modelValue', newValue);
  emit('select', props.difficulty);
  emit('click', event as MouseEvent);

  // Haptic feedback for mobile
  if ('vibrate' in navigator) {
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
/* Base card */
.level-card {
  @apply relative overflow-hidden;
  @apply w-full rounded-2xl;
  @apply bg-white dark:bg-gray-800;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply transition-all duration-fast ease-out;
  @apply cursor-pointer select-none;
  @apply focus:outline-none focus:ring-4 focus:ring-primary/20;
  min-height: 320px;
  transform-style: preserve-3d;
  transform: translateZ(0);
}

/* Hover state */
.level-card:hover:not(.level-card--locked) {
  @apply border-primary/30 shadow-lg;
  transform: translateY(-4px) scale(1.02);
}

.level-card:active:not(.level-card--locked) {
  transform: translateY(-2px) scale(1.01);
}

/* Selected state */
.level-card--selected {
  @apply border-primary shadow-xl;
  @apply bg-gradient-to-br from-primary-50 to-secondary-50;
  @apply dark:from-primary-900/20 dark:to-secondary-900/20;
  transform: scale(1.02);
}

/* Locked state */
.level-card--locked {
  @apply opacity-75 cursor-not-allowed;
  @apply bg-gray-50 dark:bg-gray-900;
}

/* Animated gradient background */
.level-card__gradient {
  @apply absolute inset-0 opacity-0 transition-opacity duration-moderate;
  background: linear-gradient(
    var(--gradient-angle),
    transparent 0%,
    rgba(var(--color-primary-rgb), 0.05) 50%,
    transparent 100%
  );
  pointer-events: none;
}

.level-card--hovering .level-card__gradient {
  @apply opacity-100;
}

/* Lock overlay */
.level-card__lock-overlay {
  @apply absolute inset-0 z-10;
  @apply flex flex-col items-center justify-center;
  @apply bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm;
}

.level-card__lock-icon {
  @apply w-12 h-12 text-gray-400 dark:text-gray-600 mb-2;
}

.level-card__lock-text {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

/* Badge */
.level-card__badge {
  @apply absolute top-4 right-4 z-20;
  @apply px-3 py-1 rounded-full;
  @apply text-xs font-bold uppercase tracking-wider;
  @apply shadow-sm;
}

.level-card__badge--primary {
  @apply bg-primary text-white;
}

.level-card__badge--success {
  @apply bg-success text-white;
}

.level-card__badge--warning {
  @apply bg-warning text-white;
}

/* Content */
.level-card__content {
  @apply relative z-10 p-6;
  @apply flex flex-col items-center text-center;
}

/* Icon */
.level-card__icon-wrapper {
  @apply relative mb-4;
}

.level-card__icon-bg {
  @apply absolute inset-0;
  @apply w-20 h-20 rounded-2xl;
  @apply bg-gradient-to-br opacity-10;
  transform: rotate(45deg);
}

.level-card--junior .level-card__icon-bg {
  @apply from-green-400 to-emerald-600;
}

.level-card--intermediate .level-card__icon-bg {
  @apply from-blue-400 to-indigo-600;
}

.level-card--senior .level-card__icon-bg {
  @apply from-purple-400 to-pink-600;
}

.level-card--custom .level-card__icon-bg {
  @apply from-amber-400 to-orange-600;
}

.level-card__icon {
  @apply relative w-16 h-16;
  @apply transition-transform duration-fast;
}

.level-card--junior .level-card__icon {
  @apply text-green-600 dark:text-green-400;
}

.level-card--intermediate .level-card__icon {
  @apply text-blue-600 dark:text-blue-400;
}

.level-card--senior .level-card__icon {
  @apply text-purple-600 dark:text-purple-400;
}

.level-card--custom .level-card__icon {
  @apply text-amber-600 dark:text-amber-400;
}

.level-card--hovering .level-card__icon {
  transform: rotate(10deg) scale(1.1);
}

/* Text content */
.level-card__text {
  @apply mb-6;
}

.level-card__title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
  @apply transition-colors duration-fast;
}

.level-card__subtitle {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400 mb-2;
  @apply uppercase tracking-wider;
}

.level-card__description {
  @apply text-base text-gray-700 dark:text-gray-300;
}

/* Footer */
.level-card__footer {
  @apply mt-auto pt-4 border-t border-gray-200 dark:border-gray-700;
  @apply flex items-center justify-between w-full;
}

.level-card__duration {
  @apply flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400;
}

.level-card__duration-icon {
  @apply w-4 h-4;
}

/* Progress bar */
.level-card__progress {
  @apply flex items-center gap-2;
}

.level-card__progress-bar {
  @apply w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.level-card__progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary;
  @apply transition-[width] duration-moderate;
}

.level-card__progress-text {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
}

/* Selected indicator */
.level-card__selected-indicator {
  @apply absolute top-4 left-4 z-20;
  @apply w-8 h-8 rounded-full;
  @apply bg-primary text-white;
  @apply flex items-center justify-center;
  @apply shadow-lg;
}

.level-card__selected-indicator svg {
  @apply w-5 h-5;
  stroke-width: 3;
}

/* Hover effects */
.level-card__hover-effects {
  @apply absolute inset-0 pointer-events-none;
}

.level-card__hover-glow {
  @apply absolute -inset-4 opacity-0;
  @apply transition-opacity duration-moderate;
  background: radial-gradient(circle at center, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 70%);
}

.level-card--hovering .level-card__hover-glow {
  @apply opacity-100;
}

/* Particles animation */
.level-card__particle {
  @apply absolute w-1 h-1 bg-primary rounded-full;
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
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
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

/* Dark mode adjustments */
.dark .level-card--selected {
  @apply bg-gray-800;
}

.dark .level-card__hover-glow {
  background: radial-gradient(circle at center, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 70%);
}
</style>