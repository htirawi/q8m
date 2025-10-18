<script setup lang="ts">
import type { ISectionHeaderProps as Props } from "@/types/components/home";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const props = withDefaults(defineProps<Props>(), {
  tag: "h2",
  align: "center",
});

const { t } = useI18n();

const alignmentClass = computed(() => {
  const alignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return alignMap[props.align] ?? "text-center";
});
</script>

<template>
  <div :class="['section-header', alignmentClass]">
    <component :is="tag" v-if="titleKey" class="section-header__title">
      {{ t(titleKey) }}
    </component>
    <p v-if="subtitleKey" class="section-header__subtitle">
      {{ t(subtitleKey) }}
    </p>
  </div>
</template>

<style scoped>
.section-header {
  @apply mb-12 space-y-4 md:mb-16;
}

.section-header__title {
  @apply text-3xl font-bold text-slate-900 dark:text-white md:text-4xl lg:text-5xl;

  line-height: 1.2;
}

.section-header__subtitle {
  @apply mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300 md:text-xl;

  line-height: 1.6;
}

/* RTL Support */
[dir="rtl"] .section-header {
  @apply rtl:space-x-reverse;
}
</style>
