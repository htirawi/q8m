<template>
  <div>
    <!-- Search & Filter Bar -->
    <div class="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row">
        <!-- Search -->
        <div class="relative flex-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            :value="searchQuery"
            type="text"
            class="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            :placeholder="t('study.filters.searchPlaceholder')"
            @input="updateSearch"
          />
        </div>

        <!-- Question Type Filter -->
        <select
          :value="questionTypeFilter"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="updateQuestionType"
        >
          <option value="all">{{ t("study.filters.allTypes") }}</option>
          <option value="multiple-choice">{{ t("study.filters.multipleChoice") }}</option>
          <option value="true-false">{{ t("study.filters.trueFalse") }}</option>
          <option value="fill-blank">{{ t("study.filters.fillBlank") }}</option>
          <option value="multiple-checkbox">{{ t("study.filters.multipleCheckbox") }}</option>
        </select>

        <!-- Answered Status Filter -->
        <select
          :value="answeredFilter"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="updateAnsweredFilter"
        >
          <option value="all">{{ t("study.filters.allQuestions") }}</option>
          <option value="answered">{{ t("study.filters.answered") }}</option>
          <option value="unanswered">{{ t("study.filters.unanswered") }}</option>
        </select>

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="$emit('clear')"
        >
          {{ t("study.filters.clear") }}
        </button>
      </div>

      <!-- Results Count -->
      <div v-if="hasActiveFilters" class="text-sm text-gray-600 dark:text-gray-400">
        {{ t("study.filters.resultsCount", { count: filteredCount, total: totalCount }) }}
      </div>
    </div>

    <!-- Practice Mode Selector -->
    <div class="mb-6 flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t("study.practiceMode.label") }}

        :
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            practiceMode === 'sequential'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="$emit('mode-change', 'sequential')"
        >
          🔢 {{ t("study.practiceMode.sequential") }}
        </button>
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            practiceMode === 'random'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="$emit('mode-change', 'random')"
        >
          🎲 {{ t("study.practiceMode.random") }}
        </button>
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            practiceMode === 'bookmarked'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="$emit('mode-change', 'bookmarked')"
        >
          🔖 {{ t("study.practiceMode.bookmarked") }}

          <span v-if="bookmarkCount > 0" class="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {{ bookmarkCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStudyFiltersProps as Props } from "@/types/components/study";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:answeredFilter": [value: string];
  "mode-change": [mode: "sequential" | "random" | "bookmarked"];
  clear: [];
}>();

const { t } = useI18n();

const hasActiveFilters = computed(() => {
  return (
    (props.searchQuery?.trim() ?? "") !== "" ||
    props.questionTypeFilter !== "all" ||
    props.answeredFilter !== "all"
  );
});

const updatesearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:searchQuery", target.value);
};

const updatequestiontype = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:questionTypeFilter", target.value);
};

const updateansweredfilter = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:answeredFilter", target.value);
};
</script>
