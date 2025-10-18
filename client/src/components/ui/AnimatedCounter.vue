<template>
  <span class="animated-counter" :class="{ 'animated-counter--animating': isAnimating }">
    {{ displayValue }}

  </span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { IAnimatedCounterProps } from '@/types/components/shared';

let startTime: number | null = null;
let animationFrame: number | null = null;
let startValue = 0;

const animate = () => {
  if (!startTime) {
    startTime = Date.now();
    startValue = displayValue.value;
  }

  const elapsed = Date.now() - startTime;
  const progress = Math.min(elapsed / props.duration, 1);

  // Easing function for smooth animation
  const easeOutQuart = 1 - Math.pow(1 - progress, 4);

  const currentValue = startValue + (props.value - startValue) * easeOutQuart;
  displayValue.value = Math.round(currentValue * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals);

  if (progress < 1) {
    animationFrame = requestAnimationFrame(animate);
  }

 else {
    displayValue.value = props.value;
    isAnimating.value = false;
    startTime = null;
  }
};

const startanimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  isAnimating.value = true;
  animate();
};

watch(() => props.value, (newValue) => {
  if (newValue !== displayValue.value) {
    startAnimation();
  }
});

onMounted(() => {
  if (props.value !== 0) {
    startAnimation();
  }
});
</script>

<style scoped>
.animated-counter {
  @apply inline-block tabular-nums;
  @apply transition-colors duration-200;
}

.animated-counter--animating {
  @apply text-primary;
}
</style>