<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`convert-modal-title-${suggestedPlan}`"
      >
        <div
          class="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"
          @click.stop
        >
          <!-- Close Button -->
          <button
            type="button"
            class="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            @click="handleClose"
            :aria-label="t('a11y.closeModal')"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <h2
            :id="`convert-modal-title-${suggestedPlan}`"
            class="mb-2 text-3xl font-bold text-gray-900 dark:text-white"
          >
            {{ t("convert.headline?.a") }}
          </h2>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            {{ t("convert.subhead", { difficulty: "Medium", count: 300 }) }}
          </p>

          <!-- Billing Cycle Toggle -->
          <div class="mb-6 flex items-center justify-center gap-4">
            <button
              type="button"
              :class="[
                'rounded-lg px-6 py-2.5 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
              ]"
              @click="setBillingCycle('monthly')"
              :aria-pressed="billingCycle === 'monthly'"
            >
              {{ t("convert.cycle?.monthly") }}
            </button>
            <button
              type="button"
              :class="[
                'relative rounded-lg px-6 py-2.5 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                billingCycle === 'annual'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
              ]"
              @click="setBillingCycle('annual')"
              :aria-pressed="billingCycle === 'annual'"
            >
              {{ t("convert.cycle?.annual") }}

              <span class="ml-2 rounded bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                {{ t("convert.cycle?.save", { percent: 20 }) }}
              </span>
            </button>
          </div>

          <!-- Plan Selection (if showing multiple plans) -->
          <div v-if="showPlanSelection" class="mb-6">
            <p class="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("convert.planSelection?.title") }}
            </p>
            <div class="flex justify-center gap-4">
              <button
                v-for="plan in availablePlans"
                :key="plan"
                type="button"
                :class="[
                  'rounded-lg border-2 px-6 py-3 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  selectedPlan === plan
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
                ]"
                @click="selectPlan(plan)"
              >
                {{ t(`plans.names.${plan}`) }}
              </button>
            </div>
          </div>

          <!-- Pricing Summary -->
          <div class="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium text-gray-700 dark:text-gray-300">
                {{ t("convert.summary?.total") }}
              </span>
              <div class="text-right">
                <div class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ formatPrice(calculatedPrice) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t("convert.summary?.billedAs", { cycle: billingCycle }) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Coupon Code (Expandable) -->
          <div class="mb-6">
            <button
              type="button"
              class="text-sm text-primary-600 hover:text-primary-700 focus:underline focus:outline-none dark:text-primary-400"
              @click="showCouponInput = !showCouponInput"
            >
              {{ t("convert.coupon?.toggle") }}
            </button>
            <div v-if="showCouponInput" class="mt-2 flex gap-2">
              <input
                v-model="couponCode"
                type="text"
                :placeholder="t('convert.coupon.placeholder')"
                :aria-label="t('convert.coupon.ariaLabel')"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                class="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                @click="applyCoupon"
              >
                {{ t("convert.coupon?.apply") }}
              </button>
            </div>
            <p v-if="couponApplied" class="mt-2 text-sm text-green-600 dark:text-green-400">
              ✓ {{ t("convert.coupon?.applied") }}
            </p>
          </div>

          <!-- Payment Provider Buttons -->
          <div class="mb-6 space-y-3">
            <button
              type="button"
              class="w-full rounded-lg bg-[#0070ba] px-6 py-4 font-medium text-white transition-all hover:bg-[#005ea6] focus:outline-none focus:ring-2 focus:ring-[#0070ba] focus:ring-offset-2"
              @click="handlePayPalCheckout"
              :disabled="isProcessing"
            >
              <span v-if="!isProcessing">{{ t("convert.cta?.primary") }} </span>
              <span v-else>{{ t("convert.cta?.processing") }} </span>
            </button>
          </div>

          <!-- Trust Badges -->
          <div
            class="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400"
          >
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ t("convert.reassurance?.cancel") }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ t("convert.reassurance?.secure") }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ t("convert.reassurance?.guarantee") }}
            </span>
          </div>

          <!-- Social Proof -->
          <p class="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {{ t("convert.socialProof?.trust") }}
          </p>

          <!-- Maybe Later -->
          <button
            type="button"
            class="w-full text-center text-sm text-gray-500 hover:text-gray-700 focus:underline focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
            @click="handleMaybeLater"
          >
            {{ t("convert.cta?.maybeLater") }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useSoftPaywall } from "@/composables/useSoftPaywall";
import { useAnalytics } from "@/composables/useAnalytics";
import type { PlanTier } from "@shared/types/plan";

const { t } = useI18n();
const router = useRouter();
const { isVisible, suggestedPlan, hide } = useSoftPaywall();
const { track } = useAnalytics();

// State
const billingCycle = ref<"monthly" | "annual">("annual");
const selectedPlan = ref<PlanTier>(suggestedPlan.value);
const couponCode = ref("");
const couponApplied = ref(false);
const showCouponInput = ref(false);
const isProcessing = ref(false);
const openedAt = ref(0);

// Computed
const showPlanSelection = computed(() => false); // Set to true if you want to show multiple plans
const availablePlans = computed<PlanTier[]>(() => ["intermediate", "advanced", "pro"]);

const calculatedPrice = computed(() => {
  const prices: Record<PlanTier, { monthly: number; annual: number }> = {
    free: { monthly: 0, annual: 0 },
    intermediate: { monthly: 15, annual: 144 },
    advanced: { monthly: 30, annual: 288 },
    pro: { monthly: 50, annual: 480 },
  };

  const price = prices[selectedPlan.value][billingCycle.value];
  return couponApplied.value ? price * 0.8 : price; // 20% discount if coupon applied
});

// Methods
const formatPrice = (price: number): string => {
  return `$${price}${billingCycle.value === "monthly" ? "/mo" : "/yr"}`;
};

const setBillingCycle = (cycle: "monthly" | "annual") => {
  billingCycle.value = cycle;
  track("convert_plan_changed", {
    fromPlan: selectedPlan.value,
    toPlan: selectedPlan.value,
    billingCycle: cycle,
  });
};

const selectPlan = (plan: PlanTier) => {
  const oldPlan = selectedPlan.value;
  selectedPlan.value = plan;
  track("convert_plan_changed", {
    fromPlan: oldPlan,
    toPlan: plan,
    billingCycle: billingCycle.value,
  });
};

const applyCoupon = () => {
  if (couponCode.value.trim()) {
    // Validate coupon (placeholder logic)
    couponApplied.value = true;
    track("convert_coupon_applied", {
      couponCode: couponCode.value,
      discountPercent: 20,
      targetPlan: selectedPlan.value,
    });
  }
};

const handlePayPalCheckout = () => {
  isProcessing.value = true;

  track("checkout_opened", {
    targetPlan: selectedPlan.value,
    billingCycle: billingCycle.value,
    price: calculatedPrice.value,
  });

  // Redirect to checkout page or handle PayPal integration
  const locale = router.currentRoute.value.params.locale || "en";
  router.push({
    path: `/${locale}/checkout`,
    query: {
      plan: selectedPlan.value,
      billing: billingCycle.value,
      coupon: couponApplied.value ? couponCode.value : undefined,
    },
  });

  hide();
  isProcessing.value = false;
};

const handleClose = () => {
  track("convert_dismissed", {
    source: "close_button",
    timeSpentSeconds: Math.floor((Date.now() - openedAt.value) / 1000),
  });
  hide();
};

const handleBackdropClick = () => {
  track("convert_dismissed", {
    source: "backdrop_click",
    timeSpentSeconds: Math.floor((Date.now() - openedAt.value) / 1000),
  });
  hide();
};

const handleMaybeLater = () => {
  track("convert_dismissed", {
    source: "maybe_later",
    timeSpentSeconds: Math.floor((Date.now() - openedAt.value) / 1000),
  });
  hide();
};

// Watch for modal open
watch(isVisible, (newVal) => {
  if (newVal) {
    openedAt.value = Date.now();
    selectedPlan.value = suggestedPlan.value;
    track("convert_opened", {
      source: "study_gate",
      suggestedPlan: suggestedPlan.value,
    });
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
