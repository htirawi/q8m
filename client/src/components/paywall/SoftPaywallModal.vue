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
          class="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
          @keydown.esc="handleDismiss"
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute top-4 right-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            :aria-label="t('a11y.closeModal')"
            @click="handleDismiss"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Content -->
          <div class="p-6">
            <!-- Icon -->
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <svg
                class="h-6 w-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <!-- Heading -->
            <h3
              :id="headingId"
              class="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white"
            >
              {{ t('paywall.title') }}

            </h3>

            <!-- Description -->
            <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              {{ t('paywall.description', { plan: suggestedPlanName }) }}

            </p>

            <!-- Features list -->
            <ul class="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li
                v-for="(feature, index) in features"
                :key="index"
                class="flex items-start"
              >
                <svg
                  class="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ feature }}

</span>
              </li>
            </ul>

            <!-- Actions -->
            <div class="mt-6 space-y-3">
              <!-- Primary CTA -->
              <button
                type="button"
                class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                @click="handleSeePlans"
              >
                {{ t('paywall.cta.seePlans') }}

              </button>

              <!-- Secondary CTA -->
              <button
                type="button"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                @click="handleContinueFree"
              >
                {{ t('paywall.cta.continueFree') }}

              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ISoftPaywallModalProps as Props, ISoftPaywallModalEmits as Emits } from "@/types/components/paywall";
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { trackEvent } from "@/utils/telemetry";
import type { PlanTier } from "@shared/types/plan";





const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const router = useRouter();

const modalRef = ref<HTMLElement>();
const headingId = "paywall-modal-title";

const suggestedPlanName = computed(() => {
  const names: Record<PlanTier, string> = {
    free: t("plans.names.free"),
    intermediate: t("plans.names.intermediate"),
    advanced: t("plans.names.advanced"),
    pro: t("plans.names.pro"),
  };
  return names[props.suggestedPlan];
});

const features = computed(() => {
  return [
    t("paywall.features.feature1", { plan: suggestedPlanName.value }),
    t("paywall.features.feature2"),
    t("paywall.features.feature3"),
  ];
});

const handleseeplans = () => {
  trackEvent("free_soft_paywall_cta_clicked", {
    cta: "see_plans",
    targetPlan: props.suggestedPlan,
    targetRoute: props.targetRoute,
  });

  const locale = router.currentRoute.value.params.locale || "en";
  router.push({
    path: `/${locale}/subscribe`,
    query: {
      intent: "upgrade",
      from: props.targetRoute,
    },
  });

  emit("dismiss");
};

const handlecontinuefree = () => {
  trackEvent("free_soft_paywall_cta_clicked", {
    cta: "continue_free",
    targetPlan: props.suggestedPlan,
    targetRoute: props.targetRoute,
  });

  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/guide/easy`);

  emit("dismiss");
};

const handledismiss = () => {
  trackEvent("free_soft_paywall_dismissed", {
    targetRoute: props.targetRoute,
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
  }

 else {
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
      trackEvent("free_soft_paywall_view", {
        targetRoute: props.targetRoute,
        planSuggested: props.suggestedPlan,
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
</style>
