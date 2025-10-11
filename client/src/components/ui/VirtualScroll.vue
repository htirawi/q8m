<template>
  <div ref="containerRef" class="virtual-scroll-container" :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll">
    <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px' }">
      <div class="virtual-scroll-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <slot v-for="(item, index) in visibleItems" :key="getItemKey(item, startIndex + index)" :item="item"
          :index="startIndex + index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, string | number | boolean>">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { VirtualScrollProps } from "@/types/ui/component-props";

const props = withDefaults(defineProps<VirtualScrollProps<T>>(), {
  overscan: 5,
  getItemKey: (_item: T, index: number) => index,
});

const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);

// Computed properties
const totalHeight = computed(() => props.items.length * props.itemHeight);

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight);
  return Math.max(0, index - props.overscan);
});

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight);
  const index = startIndex.value + visibleCount + props.overscan;
  return Math.min(props.items.length - 1, index);
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1);
});

const offsetY = computed(() => startIndex.value * props.itemHeight);

// Methods
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

// Expose methods for parent components
defineExpose({
  scrollToIndex: (index: number) => {
    if (containerRef.value) {
      const scrollPosition = index * props.itemHeight;
      containerRef.value.scrollTop = scrollPosition;
    }
  },
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
    }
  },
  scrollToBottom: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = totalHeight.value;
    }
  },
});
</script>

<style scoped>
.virtual-scroll-container {
  @apply overflow-auto;
}

.virtual-scroll-spacer {
  @apply relative;
}

.virtual-scroll-content {
  @apply absolute left-0 top-0 w-full;
}
</style>
