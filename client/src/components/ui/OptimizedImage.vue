<template>
  <img :src="optimizedSrc" :alt="alt" :class="imageClasses" :loading="lazy ? 'lazy' : 'eager'" :decoding="decoding"
    :sizes="sizes" :srcset="srcset" @load="handleLoad" @error="handleError" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { OptimizedImageProps } from "@/types/ui/component-props";

const props = withDefaults(defineProps<OptimizedImageProps>(), {
  lazy: true,
  quality: 80,
  format: "auto",
  decoding: "async",
});

const emit = defineEmits<{
  load: [];
  error: [event: Event];
}>();

const isLoaded = ref(false);
const hasError = ref(false);

// Generate optimized image URL
const optimizedSrc = computed(() => {
  if (hasError.value) {
    return props.src; // Fallback to original
  }

  // For now, return the original src
  // In production, this would integrate with an image optimization service
  // like Cloudinary, ImageKit, or Next.js Image Optimization
  return props.src;
});

// Generate srcset for responsive images
const srcset = computed(() => {
  if (!props.width) return undefined;

  const widths = [320, 640, 768, 1024, 1280, 1536];
  return widths
    .filter((w) => w <= (props.width || 0) * 2)
    .map((w) => `${optimizedSrc.value}?w=${w}&q=${props.quality} ${w}w`)
    .join(", ");
});

const imageClasses = computed(() => {
  const baseClasses = ["transition-opacity duration-300"];

  if (props.class) {
    baseClasses.push(props.class);
  }

  if (props.lazy && !isLoaded.value) {
    baseClasses.push("opacity-0");
  } else {
    baseClasses.push("opacity-100");
  }

  return baseClasses.join(" ");
});

const handleLoad = () => {
  isLoaded.value = true;
  emit("load");
};

const handleError = (event: Event) => {
  hasError.value = true;
  emit("error", event);
};
</script>
