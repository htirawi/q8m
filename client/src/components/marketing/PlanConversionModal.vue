<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="headingId"
        @click.self="handleDismiss"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" aria-hidden="true" />

        <!-- Modal content -->
        <div
          ref="modalRef"
          class="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          tabindex="-1"
          @keydown.esc="handleDismiss"
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            :aria-label="t('a11y.closeModal')"
            @click="handleDismiss"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-8 text-white">
            <div
              class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            >
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 :id="headingId" class="mt-4 text-center text-2xl font-bold">
              {{ t(`convert.headline.${variant}`) }}
            </h2>
            <p class="mt-2 text-center text-sm text-white/90">
              {{ t("convert.subhead", { difficulty: difficultyLabel, count: developerCount }) }}
            </p>
          </div>

          <!-- Content -->
          <div class="px-8 py-6 pb-8">
            <!-- Plan Picker -->
            <div class="mb-6">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ t("convert.planSelection.title") }}
                </h3>
                <button
                  type="button"
                  class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  @click="toggleCoupon"
                >
                  {{ t("convert.coupon.toggle") }}
                </button>
              </div>

              <!-- Billing cycle options -->
              <div class="space-y-3">
                <label
                  v-for="option in cycleOptions"
                  :key="option.cycle"
                  class="relative flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all"
                  :class="
                    selectedCycle === option.cycle
                      ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20'
                      : 'border-gray-200 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-700'
                  "
                >
                  <div class="flex flex-1 items-center gap-4">
                    <input
                      type="radio"
                      :value="option.cycle"
                      :checked="selectedCycle === option.cycle"
                      class="h-5 w-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                      @change="handleCycleChange(option.cycle)"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-900 dark:text-white">
                          {{ t(`convert.cycle.${option.cycle}`) }}
                        </span>
                        <span
                          v-if="option.discountPercent"
                          class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {{ t("convert.cycle.save", { percent: option.discountPercent }) }}
                        </span>
                        <span
                          v-if="option.isRecommended"
                          class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        >
                          {{ t("convert.cycle.recommended") }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      ${{ option.price }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ option.cycle === "monthly" ? "per month" : "per year" }}
                    </div>
                  </div>
                </label>
              </div>

              <!-- Coupon field (collapsible) -->
              <Transition name="slide-down">
                <div v-if="showCoupon" class="mt-3">
                  <div class="flex gap-2">
                    <input
                      v-model="couponInput"
                      type="text"
                      class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      :placeholder="t('convert.coupon.placeholder')"
                    />
                    <button
                      type="button"
                      class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      @click="handleApplyCoupon"
                    >
                      {{ t("convert.coupon.apply") }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Price summary -->
            <div class="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >{{ t("convert.summary.total") }}
                </span>
                <span class="text-xl font-bold text-gray-900 dark:text-white">
                  {{
                    formatPrice(currentPlanOption?.price || 0, currentPlanOption?.currency || "USD")
                  }}
                </span>
              </div>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t("convert.summary.billedAs", { cycle: t(`convert.cycle.${selectedCycle}`) }) }}
              </div>
            </div>

            <!-- Primary CTA -->
            <div class="subscribe-button-container">
              <button
                type="button"
                :disabled="isProcessing"
                class="w-full rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-primary-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
                @click="handleSubscribe"
              >
                <span v-if="!isProcessing" class="flex items-center justify-center gap-2">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {{ ctaText }}
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ t("convert.cta.processing") }}
                </span>
              </button>
            </div>

            <!-- Reassurance -->
            <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {{ t("convert.reassurance.cancel") }} · {{ t("convert.reassurance.secure") }} ·
              {{ t("convert.reassurance.guarantee") }}
            </div>

            <!-- Social proof -->
            <div class="mt-6 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
              <div class="mb-2 flex items-center justify-center gap-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{
                  t("convert.socialProof.rating", { rating: "4.9", count: developerCount })
                }}</span>
              </div>
              <p class="text-center text-sm italic text-gray-700 dark:text-gray-300">
                "{{ t("convert.testimonial.text") }}"
              </p>
              <p class="mt-1 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ t("convert.testimonial.author") }}
              </p>
            </div>

            <!-- Trust badges -->
            <div
              class="mt-6 flex items-center justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              <div class="flex items-center gap-1.5">
                <svg
                  class="h-5 w-5 text-green-600 dark:text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t("convert.trustBadges.secure") }}
              </div>
              <div class="flex items-center gap-1.5">
                <svg
                  class="h-5 w-5 text-blue-600 dark:text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t("convert.trustBadges.moneyBack") }}
              </div>
              <div class="flex items-center gap-1.5">
                <svg
                  class="h-5 w-5 text-green-600 dark:text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t("convert.trustBadges.cancelAnytime") }}
              </div>
            </div>

            <!-- Secondary actions -->
            <div class="mt-6 flex items-center justify-center gap-6">
              <button
                type="button"
                class="secondary-action-btn text-base font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                @click="toggleComparison"
              >
                {{ t("convert.comparison.toggle") }}
                <span class="ml-1.5">{{ showComparison ? "▲" : "▼" }} </span>
              </button>
              <button
                type="button"
                class="secondary-action-btn text-base font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                @click="toggleFaq"
              >
                {{ t("convert.faq.toggle") }}
                <span class="ml-1.5">{{ showFaq ? "▲" : "▼" }} </span>
              </button>
            </div>

            <!-- Collapsible comparison -->
            <Transition name="slide-down">
              <div v-if="showComparison" class="mt-6">
                <PlanComparisonCard :target-plan="requiredPlan" />
              </div>
            </Transition>

            <!-- Collapsible FAQ -->
            <Transition name="slide-down">
              <div v-if="showFaq" class="mb-4 mt-6 space-y-3">
                <details
                  v-for="(faq, idx) in faqs"
                  :key="idx"
                  class="group rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary
                    class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/50"
                  >
                    {{ faq.question }}

                    <svg
                      class="h-5 w-5 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div class="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
                    {{ faq.answer }}
                  </div>
                </details>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type {
  IPlanConversionModalProps as Props,
  IPlanConversionModalEmits as Emits,
  IFaq,
} from "@/types/components/marketing";
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useCheckout } from "@/composables/useCheckout";
import { useAnalytics } from "@/composables/useAnalytics";
import PlanComparisonCard from "./PlanComparisonCard.vue";
import type { DifficultyLevel } from "@/types/plan/access";
import type { PlanTier } from "@shared/types/plan";
import type { BillingCycle } from "@/composables/useCheckout";

const props = withDefaults(defineProps<Props>(), {
  variant: "a",
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const { selectedCycle, isProcessing, planOptions, selectPlan, startCheckout, applyCoupon } =
  useCheckout();
const { track } = useAnalytics();

const modalRef = ref<HTMLElement>();
const headingId = "convert-modal-title";
const showCoupon = ref(false);
const showComparison = ref(false);
const showFaq = ref(false);
const couponInput = ref("");

const difficultyLabel = computed(() => t(`difficulty.${props.difficulty}.label`));
// Unified developer count for consistent social proof
const developerCount = "300";

const cycleOptions = computed(() => {
  return planOptions.value.filter((p) => p.tier === props.requiredPlan);
});

const currentPlanOption = computed(() => {
  return cycleOptions.value.find((o) => o.cycle === selectedCycle.value);
});

const ctaText = computed(() => {
  return t("convert.cta.primary");
});

const faqs = computed((): IFaq[] => [
  {
    question: t("convert.faq.q1.question"),
    answer: t("convert.faq.q1.answer"),
  },
  {
    question: t("convert.faq.q2.question"),
    answer: t("convert.faq.q2.answer"),
  },
  {
    question: t("convert.faq.q3.question"),
    answer: t("convert.faq.q3.answer"),
  },
]);

const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
};

const _handlecyclechange = (cycle: BillingCycle) => {
  selectPlan(props.requiredPlan, cycle);
};

const toggleCoupon = () => {
  showCoupon.value = !showCoupon.value;
};

const _handleapplycoupon = async () => {
  if (!couponInput.value) return;

  const success = await applyCoupon(couponInput.value);
  if (success) {
    // TODO: Show success message
    couponInput.value = "";
    TODO;
  } else {
    // TODO: Show error messageTODO
  }
};

const _handlesubscribe = async () => {
  track("subscribe_click", {
    difficulty: props.difficulty,
    plan: props.requiredPlan,
    cycle: selectedCycle.value,
    variant: props.variant,
  });

  await startCheckout("convert_modal");
};

const toggleComparison = () => {
  showComparison.value = !showComparison.value;

  if (showComparison.value) {
    track("comparison_expanded", {
      difficulty: props.difficulty,
      plan: props.requiredPlan,
    });
  }
};

const toggleFaq = () => {
  showFaq.value = !showFaq.value;

  if (showFaq.value) {
    track("faq_expanded", {
      difficulty: props.difficulty,
      plan: props.requiredPlan,
    });
  }
};

const handleDismiss = () => {
  track("convert_modal_dismissed", {
    difficulty: props.difficulty,
    plan: props.requiredPlan,
    hadInteraction: showComparison.value || showFaq.value || showCoupon.value,
  });
  emit("dismiss");
};

// Focus trap
const trapFocus = (e: KeyboardEvent) => {
  if (e.key !== "Tab" || !modalRef.value) return;

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
      // Pre-select annual plan (default)
      selectPlan(props.requiredPlan, "annual");

      // Track view
      track("convert_modal_opened", {
        difficulty: props.difficulty,
        plan: props.requiredPlan,
        variant: props.variant,
      });

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Focus modal after DOM updates
      await nextTick();
      modalRef.value?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }
  }
);

onMounted(() => {
  document.addEventListener("keydown", trapFocus);
});

onUnmounted(() => {
  document.removeEventListener("keydown", trapFocus);
  document.body.style.overflow = "";
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Custom scrollbar styles for better visibility */
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgb(229 231 235);
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(156 163 175);
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}

.dark .scrollbar-thin::-webkit-scrollbar-track {
  background: rgb(31 41 55);
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}

/* Subscribe button container - ensure visibility */
.subscribe-button-container {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  min-height: 60px;
  margin-bottom: 0;
}

/* Secondary action buttons with clean underline */
.secondary-action-btn {
  position: relative;
  padding-bottom: 2px;
}

.secondary-action-btn::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-color: currentColor;
  opacity: 0.7;
}

.secondary-action-btn:hover::after {
  opacity: 1;
}
</style>
