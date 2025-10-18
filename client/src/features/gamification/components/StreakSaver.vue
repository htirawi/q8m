<template>
  <div class="streak-saver">
    <!-- Warning Banner (shows when streak is in danger) -->
    <div v-if="isStreakInDanger && !isProcessing"
      class="mb-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
      <div class="flex items-start gap-4">
        <div class="text-4xl">⚠️</div>
        <div class="flex-1">
          <h3 class="mb-2 text-2xl font-bold">Your Streak is at Risk!</h3>
          <p class="mb-4 text-white/90">
            You haven't completed any activities today. Your {{ streak.currentStreak }}-day streak
            will be lost soon!
          </p>
          <button v-if="canUseFreeFreeze" @click="showModal = true"
            class="rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 shadow-lg transition-colors hover:bg-orange-50">
            Save My Streak (Free)
          </button>
          <button v-else-if="canBuyFreezeWithCoins" @click="showModal = true"
            class="rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 shadow-lg transition-colors hover:bg-orange-50">
            Save My Streak ({{ freezeCostInCoins }} coins)
          </button>
          <div v-else class="text-sm text-white/80">
            Not enough coins to save streak. Complete activities to earn more!
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="showModal = false">
        <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
          <!-- Close Button -->
          <button @click="showModal = false"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Content -->
          <div class="mb-6 text-center">
            <div class="mb-4 text-6xl">🛡️</div>
            <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Streak Saver</h2>
            <p class="text-gray-600 dark:text-gray-400">
              Save your {{ streak.currentStreak }}-day streak from being lost
            </p>
          </div>

          <!-- Options -->
          <div class="mb-6 space-y-4">
            <!-- Free Freeze -->
            <button v-if="canUseFreeFreeze" @click="useFreeFreeze" :disabled="isProcessing"
              class="w-full rounded-xl border-2 border-green-500 bg-green-50 p-4 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/20 dark:hover:bg-green-900/30">
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-green-900 dark:text-green-100">Use Free Freeze</div>
                  <div class="text-sm text-green-700 dark:text-green-300">
                    {{ streak.freezesAvailable }} available
                  </div>
                </div>
                <div class="text-3xl">🆓</div>
              </div>
            </button>

            <!-- Coins -->
            <button v-if="!canUseFreeFreeze && canBuyFreezeWithCoins && freezesRemaining > 0"
              @click="buyFreezeWithCoins" :disabled="isProcessing"
              class="w-full rounded-xl border-2 border-yellow-500 bg-yellow-50 p-4 transition-colors hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30">
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-yellow-900 dark:text-yellow-100">Use Coins</div>
                  <div class="text-sm text-yellow-700 dark:text-yellow-300">
                    {{ freezeCostInCoins }} coins
                  </div>
                </div>
                <div class="text-3xl">🪙</div>
              </div>
            </button>

            <!-- XP -->
            <button v-if="!canUseFreeFreeze && !canBuyFreezeWithCoins && freezesRemaining > 0" @click="buyFreezeWithXP"
              :disabled="isProcessing"
              class="w-full rounded-xl border-2 border-purple-500 bg-purple-50 p-4 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-900/20 dark:hover:bg-purple-900/30">
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-purple-900 dark:text-purple-100">Use XP</div>
                  <div class="text-sm text-purple-700 dark:text-purple-300">
                    {{ freezeCostInXP }} XP
                  </div>
                </div>
                <div class="text-3xl">⭐</div>
              </div>
            </button>

            <!-- No freezes left -->
            <div v-if="freezesRemaining === 0"
              class="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-center dark:bg-red-900/20">
              <div class="mb-1 font-bold text-red-900 dark:text-red-100">Weekly Limit Reached</div>
              <div class="text-sm text-red-700 dark:text-red-300">
                You've used all {{ maxFreezesPerWeek }}

                freezes this week
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            <div class="mb-2 font-semibold">How Streak Saver Works:</div>
            <ul class="space-y-1 text-xs">
              <li>• You get 2 free freezes per week</li>
              <li>
                • Additional freezes cost {{ freezeCostInCoins }} coins or {{ freezeCostInXP }}

                XP
              </li>
              <li>
                • Maximum {{ maxFreezesPerWeek }}

                freezes per week
              </li>
              <li>• Must be used within 24 hours of missing activity</li>
            </ul>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage"
            class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage"
            class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStreak } from "@/composables/useStreak";
import { useConfetti } from "@/composables/useConfetti";

const {
  streak,
  isStreakInDanger,
  canUseFreeFreeze,
  canBuyFreezeWithCoins,
  freezesRemaining,
  freezeCostInCoins,
  freezeCostInXP,
  maxFreezesPerWeek,
  useStreakFreeze,
} = useStreak();

const { burst } = useConfetti();

const showModal = ref(false);
const isProcessing = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function useFreeFreeze() {
  isProcessing.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    const result = await useStreakFreeze(false, false);

    if (result.success) {
      successMessage.value = "Streak saved! 🎉";
      burst();

      setTimeout(() => {
        showModal.value = false;
        successMessage.value = null;
      }, 2000);
    } else {
      errorMessage.value = result.message || "Failed to save streak";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || "Something went wrong";
  } finally {
    isProcessing.value = false;
  }
}

async function buyFreezeWithCoins() {
  isProcessing.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    const result = await useStreakFreeze(true, false);

    if (result.success) {
      successMessage.value = `Streak saved for ${result.cost} coins! 🎉`;
      burst();

      setTimeout(() => {
        showModal.value = false;
        successMessage.value = null;
      }, 2000);
    } else {
      errorMessage.value = result.message || "Failed to save streak";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || "Something went wrong";
  } finally {
    isProcessing.value = false;
  }
}

async function buyFreezeWithXP() {
  isProcessing.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    const result = await useStreakFreeze(false, true);

    if (result.success) {
      successMessage.value = `Streak saved for ${result.cost} XP! 🎉`;
      burst();

      setTimeout(() => {
        showModal.value = false;
        successMessage.value = null;
      }, 2000);
    } else {
      errorMessage.value = result.message || "Failed to save streak";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || "Something went wrong";
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
/* Modal backdrop animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.fixed {
  animation: fadeIn 0.2s ease-out;
}
</style>
