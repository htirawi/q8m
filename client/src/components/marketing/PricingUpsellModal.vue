<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="headingId"
        @click.self="handleDismiss('backdrop')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" aria-hidden="true" />

        <!-- Modal content -->
        <div
          ref="modalRef"
          class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          tabindex="-1"
          @keydown.esc="handleDismiss('esc')"
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:focus:ring-offset-gray-800"
            :aria-label="t('a11y.closeModal')"
            @click="handleDismiss('close_button')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6 text-white">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 :id="headingId" class="mt-4 text-center text-2xl font-bold">
              {{ t('study.upsell.title') }}
            </h3>
            <p class="mt-2 text-center text-sm text-white/90">
              {{ t('study.upsell.subtitle', { difficulty: difficultyLabel }) }}
            </p>
          </div>

          <!-- Content -->
          <div class="px-8 py-6">
            <!-- Plan comparison -->
            <div class="mb-6">
              <h4 class="mb-4 font-semibold text-gray-900 dark:text-white">
                {{ t('study.upsell.comparison.title') }}
              </h4>
              <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        {{ t('study.upsell.comparison.feature') }}
                      </th>
                      <th class="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                        {{ t('plans.names.free') }}
                      </th>
                      <th class="px-4 py-3 text-center font-medium text-white dark:text-white bg-gradient-to-r from-primary-500 to-purple-500 rounded-t">
                        {{ targetPlanName }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(feature, idx) in comparisonFeatures" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {{ feature.label }}
                      </td>
                      <td class="px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50">
                        <div class="flex justify-center">
                          <svg v-if="feature.free" class="h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Included">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="text-gray-400 dark:text-gray-600" aria-label="Not included">—</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 bg-primary-50/30 dark:bg-primary-900/10">
                        <div class="flex justify-center">
                          <svg v-if="feature.target" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20" aria-label="Included">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="text-gray-400 dark:text-gray-600" aria-label="Not included">—</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Benefits -->
            <div class="mb-6">
              <h4 class="mb-4 font-semibold text-gray-900 dark:text-white">
                {{ t('study.upsell.benefits.title', { plan: targetPlanName }) }}
              </h4>
              <ul class="space-y-3">
                <li v-for="(benefit, idx) in benefits" :key="idx" class="flex items-start gap-3">
                  <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <!-- Testimonial -->
            <div class="mb-6 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
              <div class="mb-2 flex items-center gap-1">
                <svg v-for="i in 5" :key="i" class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="mb-2 text-sm italic text-gray-700 dark:text-gray-300">
                {{ t('study.upsell.testimonial.text') }}
              </p>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ t('study.upsell.testimonial.author') }}
              </p>
            </div>

            <!-- Quick FAQ -->
            <div class="mb-6">
              <h4 class="mb-3 font-semibold text-gray-900 dark:text-white">
                {{ t('study.upsell.faq.title') }}
              </h4>
              <div class="space-y-3">
                <details v-for="(faq, idx) in faqs" :key="idx" class="group rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/50">
                    {{ faq.question }}
                    <svg class="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div class="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
                    {{ faq.answer }}
                  </div>
                </details>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <!-- Primary CTA -->
              <button
                type="button"
                class="w-full rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-primary-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                @click="handleUpgrade"
              >
                {{ t('study.upsell.cta.upgrade', { plan: targetPlanName }) }}
              </button>

              <!-- Secondary CTA -->
              <button
                type="button"
                class="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                @click="handleViewAllPlans"
              >
                {{ t('study.upsell.cta.viewAllPlans') }}
              </button>

              <!-- Tertiary CTA -->
              <button
                type="button"
                class="w-full px-6 py-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
                @click="handleDismiss('maybe_later_button')"
              >
                {{ t('study.upsell.cta.maybeLater') }}
              </button>
            </div>

            <!-- Trust signals -->
            <div class="mt-6 flex items-center justify-center gap-6 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ t('study.upsell.trust.secure') }}
              </div>
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                </svg>
                {{ t('study.upsell.trust.moneyBack') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAnalytics } from "@/composables/useAnalytics";
import type { DifficultyLevel } from "@/types/plan/access";
import type { PlanTier } from "@shared/types/plan";

interface Props {
  isVisible: boolean;
  difficulty: DifficultyLevel;
  requiredPlan: PlanTier;
}

interface Emits {
  (e: "dismiss", method: 'esc' | 'backdrop' | 'close_button' | 'maybe_later_button'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const router = useRouter();
const { trackStudyEvent } = useAnalytics();

const modalRef = ref<HTMLElement>();
const headingId = "upsell-modal-title";

const difficultyLabel = computed(() => t(`difficulty.${props.difficulty}.label`));

const targetPlanName = computed(() => {
  const names: Record<PlanTier, string> = {
    free: t("plans.names.free"),
    intermediate: t("plans.names.intermediate"),
    advanced: t("plans.names.advanced"),
    pro: t("plans.names.pro"),
  };
  return names[props.requiredPlan];
});

interface IComparisonFeature {
  label: string;
  free: boolean;
  target: boolean;
}

const comparisonFeatures = computed((): IComparisonFeature[] => {
  return [
    {
      label: t('study.upsell.comparison.features.basicQuestions'),
      free: true,
      target: true,
    },
    {
      label: t('study.upsell.comparison.features.advancedQuestions'),
      free: false,
      target: true,
    },
    {
      label: t('study.upsell.comparison.features.detailedExplanations'),
      free: false,
      target: true,
    },
    {
      label: t('study.upsell.comparison.features.progressAnalytics'),
      free: false,
      target: true,
    },
    {
      label: t('study.upsell.comparison.features.prioritySupport'),
      free: false,
      target: props.requiredPlan === 'advanced' || props.requiredPlan === 'pro',
    },
  ];
});

const benefits = computed(() => {
  const key = props.requiredPlan === 'intermediate' ? 'intermediate' : 'advanced';
  return [
    t(`study.upsell.benefits.${key}.benefit1`),
    t(`study.upsell.benefits.${key}.benefit2`),
    t(`study.upsell.benefits.${key}.benefit3`),
    t(`study.upsell.benefits.${key}.benefit4`),
    t(`study.upsell.benefits.${key}.benefit5`),
  ];
});

interface IFaq {
  question: string;
  answer: string;
}

const faqs = computed((): IFaq[] => [
  {
    question: t('study.upsell.faq.q1.question'),
    answer: t('study.upsell.faq.q1.answer'),
  },
  {
    question: t('study.upsell.faq.q2.question'),
    answer: t('study.upsell.faq.q2.answer'),
  },
  {
    question: t('study.upsell.faq.q3.question'),
    answer: t('study.upsell.faq.q3.answer'),
  },
]);

const handleUpgrade = () => {
  trackStudyEvent('upsell_cta_clicked', {
    action: 'upgrade',
    difficulty: props.difficulty,
    requiredPlan: props.requiredPlan,
  });

  const locale = router.currentRoute.value.params.locale || 'en';
  router.push({
    path: `/${locale}/subscribe`,
    query: {
      plan: props.requiredPlan,
      intent: 'study',
      difficulty: props.difficulty,
    },
  });

  emit('dismiss', 'close_button');
};

const handleViewAllPlans = () => {
  trackStudyEvent('upsell_cta_clicked', {
    action: 'view_plans',
    difficulty: props.difficulty,
    requiredPlan: props.requiredPlan,
  });

  const locale = router.currentRoute.value.params.locale || 'en';
  router.push(`/${locale}/pricing`);

  emit('dismiss', 'close_button');
};

const handleDismiss = (method: 'esc' | 'backdrop' | 'close_button' | 'maybe_later_button') => {
  trackStudyEvent('upsell_cta_clicked', {
    action: 'maybe_later',
    difficulty: props.difficulty,
    requiredPlan: props.requiredPlan,
  });
  emit('dismiss', method);
};

// Focus trap
const trapFocus = (e: KeyboardEvent) => {
  if (e.key !== 'Tab' || !modalRef.value) return;

  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement?.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement?.focus();
      e.preventDefault();
    }
  }
};

watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      // Track view
      trackStudyEvent('upsell_modal_viewed', {
        difficulty: props.difficulty,
        requiredPlan: props.requiredPlan,
      });

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus modal after DOM updates
      await nextTick();
      modalRef.value?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', trapFocus);
});

onUnmounted(() => {
  document.removeEventListener('keydown', trapFocus);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from > div:last-child {
  transform: scale(0.95);
}

.modal-fade-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
