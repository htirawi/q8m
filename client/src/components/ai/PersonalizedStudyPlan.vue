<template>
  <div class="study-plan">
    <!-- Header with Progress Overview -->
    <div class="study-plan__header">
      <div class="study-plan__header-content">
        <h2 class="study-plan__title">{{ plan.title ?? "" }}</h2>
        <p class="study-plan__description">{{ plan.description ?? "" }}</p>

        <div class="study-plan__meta">
          <div class="study-plan__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span
              >{{ formatDate(plan.duration?.startDate as Date | string) }} -
              {{ formatDate(plan.duration?.targetEndDate as Date | string) }}
            </span>
          </div>
          <div class="study-plan__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span
              >{{ plan.duration?.hoursPerWeek }}h/week • {{ plan.duration?.weeks }}

              weeks</span
            >
          </div>
          <div class="study-plan__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>{{ completedModules }}/{{ totalModules }} modules</span>
          </div>
        </div>
      </div>

      <!-- Overall Progress Ring -->
      <div class="study-plan__progress-ring">
        <svg class="progress-ring" viewBox="0 0 120 120">
          <circle
            class="progress-ring__background"
            cx="60"
            cy="60"
            r="54"
            stroke-width="8"
            fill="none"
          />
          <circle
            class="progress-ring__fill"
            cx="60"
            cy="60"
            r="54"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="`${progressPercentage * 3.39} 339`"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div class="progress-ring__content">
          <span class="progress-ring__value">{{ Math.round(progressPercentage) }}%</span>
          <span class="progress-ring__label">{{ $t("common.complete") }} </span>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="study-plan__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--streak">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ plan.progress?.currentStreak }} </span>
          <span class="stat-card__label">{{ $t("stats.dayStreak") }} </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--hours">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ plan.progress?.totalHoursStudied }} </span>
          <span class="stat-card__label">{{ $t("stats.hoursStudied") }} </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--score">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ Math.round(plan.progress?.averageScore) }}%</span>
          <span class="stat-card__label">{{ $t("stats.avgScore") }} </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--velocity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ plan.progress?.velocity }} </span>
          <span class="stat-card__label">{{ $t("stats.topicsPerWeek") }} </span>
        </div>
      </div>
    </div>

    <!-- Adaptive Settings Alert -->
    <div v-if="plan.adaptiveSettings.enabled" class="adaptive-alert">
      <div class="adaptive-alert__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div class="adaptive-alert__content">
        <h4 class="adaptive-alert__title">{{ $t("ai.adaptiveLearning") }}</h4>
        <p class="adaptive-alert__text">{{ $t("ai.adaptiveDescription") }}</p>
      </div>
      <button class="adaptive-alert__settings" @click="showAdaptiveSettings = true">
        {{ $t("common.configure") }}
      </button>
    </div>

    <!-- Curriculum Modules -->
    <div class="study-plan__curriculum">
      <div class="curriculum-header">
        <h3 class="curriculum-header__title">{{ $t("ai.curriculum") }}</h3>
        <div class="curriculum-header__actions">
          <button class="curriculum-header__filter" @click="showFilters = !showFilters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {{ $t("common.filter") }}
          </button>
          <button
            class="curriculum-header__view"
            @click="viewMode = viewMode === 'list' ? 'timeline' : 'list'"
          >
            <svg v-if="viewMode === 'list'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters (collapsible) -->
      <Transition name="collapse">
        <div v-if="showFilters" class="curriculum-filters">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="filter-chip"
            :class="{ 'filter-chip--active': activeFilters.includes(filter.id) }"
            @click="toggleFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>
      </Transition>

      <!-- Timeline View -->
      <div v-if="viewMode === 'timeline'" class="curriculum-timeline">
        <div
          v-for="(module, index) in filteredModules"
          :key="module.id"
          class="timeline-module"
          :class="{
            'timeline-module--completed': module.status === 'completed',
            'timeline-module--current': module.status === 'in-progress',
            'timeline-module--locked': module.status === 'locked',
          }"
        >
          <div class="timeline-module__connector" v-if="index < filteredModules.length - 1"></div>

          <div class="timeline-module__marker">
            <div class="timeline-module__dot"></div>
            <span class="timeline-module__week"
              >{{ $t("ai.week") }}
              {{ Math.ceil(((index + 1) * plan.duration.weeks) / plan.curriculum?.length) }}
            </span>
          </div>

          <div class="timeline-module__card" @click="expandModule(module.id)">
            <div class="timeline-module__header">
              <h4 class="timeline-module__title">{{ module.title ?? "" }}</h4>
              <span class="timeline-module__duration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {{ module.estimatedHours }}

                h
              </span>
            </div>

            <p class="timeline-module__description">{{ module.description ?? "" }}</p>

            <!-- Module progress -->
            <div class="timeline-module__progress">
              <div class="timeline-module__progress-bar">
                <div
                  class="timeline-module__progress-fill"
                  :style="{ width: `${getModuleProgress(module)}%` }"
                ></div>
              </div>
              <span class="timeline-module__progress-text">
                {{ getCompletedTopics(module) }}/{{ module.topics?.length ?? 0 }}
                {{ $t("ai.topicsCompleted") }}
              </span>
            </div>

            <!-- Topics preview -->
            <div v-if="expandedModules.includes(module.id)" class="timeline-module__topics">
              <div
                v-for="topic in module.topics"
                :key="topic.id"
                class="topic-item"
                :class="{ 'topic-item--completed': topic.completed }"
                @click.stop="startTopic(topic)"
              >
                <div class="topic-item__icon">
                  <svg
                    v-if="topic.type === 'lesson'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <svg
                    v-else-if="topic.type === 'practice'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <svg
                    v-else-if="topic.type === 'quiz'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <div class="topic-item__content">
                  <h5 class="topic-item__title">{{ topic.title ?? "" }}</h5>
                  <div class="topic-item__meta">
                    <span class="topic-item__duration">{{ topic.estimatedMinutes }} min</span>
                    <span
                      class="topic-item__difficulty"
                      :class="`topic-item__difficulty--${topic.difficulty}`"
                    >
                      {{ topic.difficulty }}
                    </span>
                  </div>
                </div>
                <div class="topic-item__status">
                  <svg
                    v-if="topic.completed"
                    class="topic-item__check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <button v-else class="topic-item__start">
                    {{ $t("actions.start") }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Quiz info if available -->
            <div v-if="module.quiz" class="timeline-module__quiz">
              <div class="quiz-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                <span
                  >{{ $t("ai.moduleQuiz") }}: {{ module.quiz?.passingScore }}% {{ $t("ai.toPass") }}
                </span>
                <span v-if="module.quiz.bestScore" class="quiz-info__score">
                  {{ $t("ai.bestScore") }}: {{ module.quiz?.bestScore }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="curriculum-list">
        <!-- Similar content in list format -->
      </div>
    </div>

    <!-- Milestones -->
    <div class="study-plan__milestones">
      <h3 class="milestones-title">{{ $t("ai.milestones") }}</h3>
      <div class="milestones-grid">
        <div
          v-for="milestone in plan.milestones"
          :key="milestone.id"
          class="milestone-card"
          :class="{ 'milestone-card--achieved': milestone.achieved }"
        >
          <div class="milestone-card__icon">
            <svg v-if="milestone.achieved" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="milestone-card__title">{{ milestone.title ?? "" }}</h4>
          <p class="milestone-card__description">{{ milestone.description ?? "" }}</p>
          <div class="milestone-card__target">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ formatDate(milestone.targetDate as Date | string) }} </span>
          </div>
          <div v-if="milestone.reward" class="milestone-card__reward">
            <span class="milestone-card__reward-label"
              >{{ $t("ai.reward") }}

              :</span
            >
            <span class="milestone-card__reward-value">{{ milestone.reward?.value ?? 0 }} </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="study-plan__footer">
      <button class="footer-btn footer-btn--secondary" @click="adjustPlan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        {{ $t("ai.adjustPlan") }}
      </button>

      <button class="footer-btn footer-btn--secondary" @click="exportPlan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {{ $t("ai.exportPlan") }}
      </button>

      <button class="footer-btn footer-btn--primary" @click="continueStudying">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ $t("ai.continueStudying") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { IStudyPlan, ICurriculumModule } from "../../types/ai";
import { analytics } from "../../services/analytics";

// Props
interface Props {
  plan: IStudyPlan;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "plan-adjust": [];
  "topic-start": [topic: any];
  "module-expand": [moduleId: string];
}>();

// i18n & router
const { t, locale } = useI18n();
const router = useRouter();

// State
const viewMode = ref<"timeline" | "list">("timeline");
const showFilters = ref(false);
const activeFilters = ref<string[]>([]);
const expandedModules = ref<string[]>([]);
const showAdaptiveSettings = ref(false);

// Filter options
const filters = [
  { id: "not-started", label: t("filters.notStarted") },
  { id: "in-progress", label: t("filters.inProgress") },
  { id: "completed", label: t("filters.completed") },
  { id: "has-quiz", label: t("filters.hasQuiz") },
  { id: "high-priority", label: t("filters.highPriority") },
];

// Computed
const progressPercentage = computed(() => {
  return props.plan.progress.overall;
});

const totalModules = computed(() => {
  return props.plan.curriculum.length;
});

const completedModules = computed(() => {
  return props.plan.curriculum.filter((m) => m.status === "completed").length;
});

const filteredModules = computed(() => {
  if (activeFilters.value.length === 0) {
    return props.plan.curriculum;
  }

  return props.plan.curriculum.filter((module) => {
    if (activeFilters.value.includes("not-started") && module.status === "locked") return true;
    if (activeFilters.value.includes("in-progress") && module.status === "in-progress") return true;
    if (activeFilters.value.includes("completed") && module.status === "completed") return true;
    if (activeFilters.value.includes("has-quiz") && module.quiz) return true;
    return false;
  });
});

// Methods
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale.value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toggleFilter = (filterId: string) => {
  const index = activeFilters.value.indexOf(filterId);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterId);
  }
};

const expandModule = (moduleId: string) => {
  const index = expandedModules.value.indexOf(moduleId);
  if (index > -1) {
    expandedModules.value.splice(index, 1);
  } else {
    expandedModules.value.push(moduleId);
  }
  emit("module-expand", moduleId);

  analytics.track("study_plan_module_expanded", {
    moduleId,
    planId: props.plan.id,
  });
};

const getModuleProgress = (module: ICurriculumModule): number => {
  const completedTopics = module.topics.filter((t) => t.completed).length;
  return (completedTopics / module.topics.length) * 100;
};

const getCompletedTopics = (module: ICurriculumModule): number => {
  return module.topics.filter((t) => t.completed).length;
};

const startTopic = (topic: any) => {
  emit("topic-start", topic);

  analytics.track("study_plan_topic_started", {
    topicId: topic.id,
    topicType: topic.type,
    planId: props.plan.id,
  });

  // Navigate to appropriate page based on topic type
  if (topic.type === "lesson") {
    router.push(`/study/${topic.id}`);
  } else if (topic.type === "quiz") {
    router.push(`/quiz/${topic.id}`);
  } else if (topic.type === "practice") {
    router.push(`/practice/${topic.id}`);
  }
};

const continueStudying = () => {
  // Find next incomplete topic
  for (const module of props.plan.curriculum) {
    if (module.status === "in-progress" || module.status === "available") {
      for (const topic of module.topics) {
        if (!topic.completed) {
          startTopic(topic);
          return;
        }
      }
    }
  }
};

const adjustPlan = () => {
  emit("plan-adjust");
  showAdaptiveSettings.value = true;
};

const exportPlan = () => {
  // Export plan as PDF or JSON
  const data = JSON.stringify(props.plan, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `study-plan-${props.plan.id}.json`;
  a.click();
  URL.revokeObjectURL(url);

  analytics.track("study_plan_exported", {
    planId: props.plan.id,
    format: "json",
  });
};

// Lifecycle
onMounted(() => {
  analytics.track("study_plan_viewed", {
    planId: props.plan.id,
    progress: props.plan.progress.overall,
    modules: props.plan.curriculum.length,
  });
});
</script>

<style scoped>
/* Container */
.study-plan {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-xl shadow-sm;
  @apply border border-gray-200 dark:border-gray-700;
}

/* Header */
.study-plan__header {
  @apply flex items-start justify-between;
  @apply border-b border-gray-200 p-6 dark:border-gray-700;
  @apply bg-gradient-to-br from-primary-50 to-secondary-50;
  @apply dark:from-primary-900/20 dark:to-secondary-900/20;
}

.study-plan__header-content {
  @apply flex-1 pr-6;
}

.study-plan__title {
  @apply mb-2 text-2xl font-bold text-gray-900 dark:text-white;
}

.study-plan__description {
  @apply mb-4 text-gray-600 dark:text-gray-400;
}

.study-plan__meta {
  @apply flex flex-wrap gap-4;
}

.study-plan__meta-item {
  @apply flex items-center gap-2;
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.study-plan__meta-item svg {
  @apply h-4 w-4 text-gray-500;
}

/* Progress Ring */
.study-plan__progress-ring {
  @apply w-30 h-30 relative;
}

.progress-ring {
  @apply h-full w-full;
}

.progress-ring__background {
  @apply stroke-gray-200 dark:stroke-gray-700;
}

.progress-ring__fill {
  @apply stroke-primary-DEFAULT;

  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-ring__content {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.progress-ring__value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.progress-ring__label {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

/* Stats */
.study-plan__stats {
  @apply grid grid-cols-2 gap-4 p-6 md:grid-cols-4;
  @apply border-b border-gray-200 dark:border-gray-700;
}

.stat-card {
  @apply flex items-center gap-3;
  @apply rounded-lg p-3;
  @apply bg-gray-50 dark:bg-gray-900;
}

.stat-card__icon {
  @apply h-10 w-10 rounded-lg;
  @apply flex items-center justify-center;
}

.stat-card__icon svg {
  @apply h-5 w-5;
}

.stat-card__icon--streak {
  @apply bg-orange-100 text-orange-600;
  @apply dark:bg-orange-900/30 dark:text-orange-400;
}

.stat-card__icon--hours {
  @apply bg-blue-100 text-blue-600;
  @apply dark:bg-blue-900/30 dark:text-blue-400;
}

.stat-card__icon--score {
  @apply bg-green-100 text-green-600;
  @apply dark:bg-green-900/30 dark:text-green-400;
}

.stat-card__icon--velocity {
  @apply bg-purple-100 text-purple-600;
  @apply dark:bg-purple-900/30 dark:text-purple-400;
}

.stat-card__content {
  @apply flex flex-col;
}

.stat-card__value {
  @apply text-lg font-bold text-gray-900 dark:text-white;
}

.stat-card__label {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

/* Adaptive Alert */
.adaptive-alert {
  @apply mx-6 rounded-lg p-4;
  @apply bg-gradient-to-r from-primary-50 to-secondary-50;
  @apply dark:from-primary-900/20 dark:to-secondary-900/20;
  @apply border border-primary-200 dark:border-primary-800;
  @apply flex items-center gap-3;
}

.adaptive-alert__icon {
  @apply h-10 w-10 rounded-lg;
  @apply bg-white dark:bg-gray-800;
  @apply flex items-center justify-center;
  @apply flex-shrink-0;
}

.adaptive-alert__icon svg {
  @apply h-6 w-6 text-primary;
}

.adaptive-alert__content {
  @apply flex-1;
}

.adaptive-alert__title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.adaptive-alert__text {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.adaptive-alert__settings {
  @apply rounded-lg px-3 py-1.5;
  @apply bg-white dark:bg-gray-800;
  @apply text-sm font-medium text-primary;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply transition-colors duration-fast;
}

/* Curriculum */
.study-plan__curriculum {
  @apply p-6;
}

.curriculum-header {
  @apply mb-4 flex items-center justify-between;
}

.curriculum-header__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.curriculum-header__actions {
  @apply flex gap-2;
}

.curriculum-header__filter,
.curriculum-header__view {
  @apply flex items-center gap-2;
  @apply rounded-lg px-3 py-1.5;
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-colors duration-fast;
}

.curriculum-header__filter svg,
.curriculum-header__view svg {
  @apply h-4 w-4;
}

/* Filters */
.curriculum-filters {
  @apply mb-4 flex flex-wrap gap-2;
}

.filter-chip {
  @apply rounded-full px-3 py-1;
  @apply text-xs font-medium;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply transition-colors duration-fast;
  @apply cursor-pointer;
}

.filter-chip--active {
  @apply bg-primary-100 text-primary-700;
  @apply dark:bg-primary-900/30 dark:text-primary-400;
}

/* Timeline */
.curriculum-timeline {
  @apply relative space-y-6;
  @apply pl-10;
}

.timeline-module {
  @apply relative;
}

.timeline-module__connector {
  @apply absolute bottom-[-24px] left-[-30px] top-12;
  @apply w-0.5 bg-gray-200 dark:bg-gray-700;
}

.timeline-module--completed .timeline-module__connector {
  @apply bg-green-400 dark:bg-green-600;
}

.timeline-module__marker {
  @apply absolute left-[-38px] top-4;
  @apply flex flex-col items-center;
}

.timeline-module__dot {
  @apply h-4 w-4 rounded-full;
  @apply bg-white dark:bg-gray-800;
  @apply border-2 border-gray-300 dark:border-gray-600;
}

.timeline-module--completed .timeline-module__dot {
  @apply border-green-500 bg-green-500;
}

.timeline-module--current .timeline-module__dot {
  @apply border-primary bg-primary;
  @apply animate-pulse;
}

.timeline-module__week {
  @apply mt-1 text-xs text-gray-500;
  @apply whitespace-nowrap;
}

.timeline-module__card {
  @apply rounded-lg p-4;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border border-gray-200 dark:border-gray-700;
  @apply hover:border-primary-300 dark:hover:border-primary-700;
  @apply cursor-pointer transition-all duration-fast;
}

.timeline-module--locked .timeline-module__card {
  @apply cursor-not-allowed opacity-60;
}

.timeline-module__header {
  @apply mb-2 flex items-center justify-between;
}

.timeline-module__title {
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.timeline-module__duration {
  @apply flex items-center gap-1;
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.timeline-module__duration svg {
  @apply h-3 w-3;
}

.timeline-module__description {
  @apply mb-3 text-sm text-gray-600 dark:text-gray-400;
}

.timeline-module__progress {
  @apply mb-3;
}

.timeline-module__progress-bar {
  @apply h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.timeline-module__progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary;
  @apply transition-[width] duration-moderate;
}

.timeline-module__progress-text {
  @apply mt-1 text-xs text-gray-600 dark:text-gray-400;
}

/* Topics */
.timeline-module__topics {
  @apply mt-3 border-t border-gray-200 pt-3 dark:border-gray-700;
  @apply space-y-2;
}

.topic-item {
  @apply flex items-center gap-3;
  @apply rounded-lg p-2;
  @apply hover:bg-white dark:hover:bg-gray-800;
  @apply transition-colors duration-fast;
}

.topic-item--completed {
  @apply opacity-60;
}

.topic-item__icon {
  @apply h-8 w-8 rounded-lg;
  @apply bg-gray-200 dark:bg-gray-700;
  @apply flex items-center justify-center;
}

.topic-item__icon svg {
  @apply h-4 w-4 text-gray-600 dark:text-gray-400;
}

.topic-item__content {
  @apply flex-1;
}

.topic-item__title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.topic-item__meta {
  @apply flex items-center gap-2;
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.topic-item__difficulty {
  @apply rounded px-1.5 py-0.5;
}

.topic-item__difficulty--beginner {
  @apply bg-green-100 text-green-700;
  @apply dark:bg-green-900/30 dark:text-green-400;
}

.topic-item__difficulty--intermediate {
  @apply bg-blue-100 text-blue-700;
  @apply dark:bg-blue-900/30 dark:text-blue-400;
}

.topic-item__difficulty--advanced {
  @apply bg-purple-100 text-purple-700;
  @apply dark:bg-purple-900/30 dark:text-purple-400;
}

.topic-item__status {
  @apply flex-shrink-0;
}

.topic-item__check {
  @apply h-5 w-5 text-green-500;
}

.topic-item__start {
  @apply rounded px-2 py-1 text-xs font-medium;
  @apply bg-primary text-white;
  @apply hover:bg-primary-700;
  @apply transition-colors duration-fast;
}

/* Quiz info */
.timeline-module__quiz {
  @apply mt-3 border-t border-gray-200 pt-3 dark:border-gray-700;
}

.quiz-info {
  @apply flex items-center gap-2;
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.quiz-info svg {
  @apply h-4 w-4;
}

.quiz-info__score {
  @apply ml-auto font-medium text-green-600 dark:text-green-400;
}

/* Milestones */
.study-plan__milestones {
  @apply border-t border-gray-200 p-6 dark:border-gray-700;
}

.milestones-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.milestones-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-3;
}

.milestone-card {
  @apply rounded-lg p-4;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border border-gray-200 dark:border-gray-700;
}

.milestone-card--achieved {
  @apply bg-green-50 dark:bg-green-900/20;
  @apply border-green-200 dark:border-green-800;
}

.milestone-card__icon {
  @apply mb-2 h-8 w-8;
}

.milestone-card__icon svg {
  @apply h-full w-full;
  @apply text-gray-400 dark:text-gray-600;
}

.milestone-card--achieved .milestone-card__icon svg {
  @apply text-green-500;
}

.milestone-card__title {
  @apply mb-1 text-sm font-semibold text-gray-900 dark:text-white;
}

.milestone-card__description {
  @apply mb-2 text-xs text-gray-600 dark:text-gray-400;
}

.milestone-card__target {
  @apply flex items-center gap-1;
  @apply text-xs text-gray-500;
}

.milestone-card__target svg {
  @apply h-3 w-3;
}

.milestone-card__reward {
  @apply mt-2 border-t border-gray-200 pt-2 dark:border-gray-700;
  @apply text-xs;
}

.milestone-card__reward-label {
  @apply text-gray-600 dark:text-gray-400;
}

.milestone-card__reward-value {
  @apply font-medium text-primary;
}

/* Footer */
.study-plan__footer {
  @apply flex items-center justify-end gap-3;
  @apply border-t border-gray-200 p-6 dark:border-gray-700;
  @apply bg-gray-50 dark:bg-gray-900;
}

.footer-btn {
  @apply flex items-center gap-2;
  @apply rounded-lg px-4 py-2;
  @apply text-sm font-medium;
  @apply transition-all duration-fast;
}

.footer-btn svg {
  @apply h-4 w-4;
}

.footer-btn--secondary {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-700 dark:text-gray-300;
  @apply border border-gray-300 dark:border-gray-600;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
}

.footer-btn--primary {
  @apply bg-primary text-white;
  @apply hover:bg-primary-700;
}

/* Transitions */
.collapse-enter-active,
.collapse-leave-active {
  @apply transition-all duration-fast;
}

.collapse-enter-from,
.collapse-leave-to {
  @apply opacity-0;

  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  @apply opacity-100;

  max-height: 200px;
}
</style>
