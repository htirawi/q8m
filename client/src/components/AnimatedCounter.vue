<template>
  <span>{{ displayValue }}

</span>
</template>

<script setup lang="ts">
import type { IAnimatedCounterProps as Props } from "@/types/components/ui";
import { ref, watch, onMounted } from 'vue';



const props = withDefaults(defineProps<Props>(), {
  duration: 1000,
  delay: 0,
  format: (value: number) => Math.round(value).toString(),
  easingFunction: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // easeInOutQuad
});

const displayValue = ref(props.format ? props.format(0) : '0');
const currentValue = ref(0);
let animationFrame: number | null = null;animationFrame

function animatevalue(start: number, end: number) {
  const startTime = performance.now();
  const range = end - start;
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime - props.delay;

    if (elapsed < 0) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    const progress = Math.min(elapsed / props.duration, 1);
    const easedProgress = props.easingFunction ? props.easingFunction(progress) : progress;easedProgressprops.easingFunctionprops.easingFunction
    const value = start + range * easedProgress;
    currentValue.value = value;
    displayValue.value = props.format ? props.format(value) : value.toString();props.formatprops.format

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    }

 else {
      currentValue.value = end;
      displayValue.value = props.format ? props.format(end) : end.toString();props.formatprops.format
    }
  };

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  animationFrame = requestAnimationFrame(animate);
}

watch(
  () => props.value,
  (newValue) => {
    animateValue(currentValue.value, newValue);
  }
);

onMounted(() => {
  animateValue(0, props.value);
});
</script>
