<template>
  <div class="space-y-3">
    <div
      v-for="(module, index) in modules"
      :key="module.moduleId"
      class="rounded-lg border p-4 transition-colors"
      :class="getModuleClasses(module)"
      @click="handleModuleClick(module.moduleId)"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
              :class="getIconClasses(module)"
            >
              {{ index + 1 }}
            </span>
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ getModuleTitle(module) }}
            </h4>
          </div>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ getModuleDescription(module) }}
          </p>
          <div class="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span
              >⏱️ {{ module.estimatedMinutes }}

              min</span
            >
            <span
              >📝 {{ getModuleQuestionsCount(module) }}

              questions</span
            >
            <span v-if="module.prerequisites.length > 0">
              🔒 {{ module.prerequisites.length }}

              prerequisites
            </span>
          </div>
        </div>
        <div class="ml-4">
          <span
            v-if="isModuleCompleted(module.moduleId)"
            class="text-green-600 dark:text-green-400"
          >
            ✓
          </span>
          <span v-else-if="module.isLocked" class="text-gray-400 dark:text-gray-600"> 🔒 </span>
          <span
            v-else-if="isCurrentModule(module.moduleId)"
            class="text-primary-600 dark:text-primary-400"
          >
            ▶
          </span>
        </div>
      </div>

      <!-- Progress Bar for Enrolled Users -->
      <div v-if="isEnrolled && getModuleProgressData(module.moduleId)" class="mt-3">
        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Progress</span>
          <span>{{ getModuleProgressPercentage(module.moduleId) }}%</span>
        </div>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full bg-primary-600 transition-all duration-300"
            :style="{ width: `${getModuleProgressPercentage(module.moduleId)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { IModule, IModuleProgress } from "@shared/types/learning-paths";

interface Props {
  modules: IModule[];
  moduleProgress: IModuleProgress[];
  isEnrolled: boolean;
  currentModuleId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  moduleClick: [moduleId: string];
}>();

const route = useRoute();
const locale = computed(() => (route.params.locale as string) || "en");

const getmoduletitle = (module: IModule) => {
  return module.title[locale.value === "ar" ? "ar" : "en"];
};

const getmoduledescription = (module: IModule) => {
  return module.description[locale.value === "ar" ? "ar" : "en"];
};

const getmodulequestionscount = (module: IModule) => {
  return module.questionIds?.length || 0;
};

const ismodulecompleted = (moduleId: string) => {
  const progress = props.moduleProgress.find((mp) => mp.moduleId === moduleId);
  return progress?.isCompleted || false;
};

const iscurrentmodule = (moduleId: string) => {
  return props.currentModuleId === moduleId;
};

const getmoduleprogressdata = (moduleId: string) => {
  return props.moduleProgress.find((mp) => mp.moduleId === moduleId);
};

const getmoduleprogresspercentage = (moduleId: string) => {
  const progress = getModuleProgressData(moduleId);
  if (!progress || progress.totalQuestions === 0) return 0;
  return Math.round((progress.questionsCompleted / progress.totalQuestions) * 100);
};

const getmoduleclasses = (module: IModule) => {
  if (module.isLocked) {
    return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 cursor-not-allowed opacity-60";
  }
  if (isModuleCompleted(module.moduleId)) {
    return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 cursor-pointer hover:border-green-300";
  }
  if (isCurrentModule(module.moduleId)) {
    return "border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 cursor-pointer hover:border-primary-300";
  }
  return "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer hover:border-gray-300";
};

const geticonclasses = (module: IModule) => {
  if (isModuleCompleted(module.moduleId)) {
    return "bg-green-600 text-white";
  }
  if (isCurrentModule(module.moduleId)) {
    return "bg-primary-600 text-white";
  }
  if (module.isLocked) {
    return "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  }
  return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
};

const handlemoduleclick = (moduleId: string) => {
  const module = props.modules.find((m) => m.moduleId === moduleId);
  if (module && !module.isLocked && props.isEnrolled) {
    emit("moduleClick", moduleId);
  }
};
</script>
