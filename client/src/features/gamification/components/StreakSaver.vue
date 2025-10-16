<template>
  <div class="streak-saver">
    <!-- Warning Banner (shows when streak is in danger) -->
    <div
      v-if="isStreakInDanger && !isProcessing"
      class="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div class="flex items-start gap-4">
        <div class="text-4xl">⚠️</div>
        <div class="flex-1">
          <h3 class="text-2xl font-bold mb-2">Your Streak is at Risk!</h3>
          <p class="text-white/90 mb-4">
            You haven't completed any activities today. Your {{ streak.currentStreak }}-day streak will be lost soon!
          </p>
          <button
            v-if="canUseFreeFreeze"
            @click="showModal = true"
            class="px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            Save My Streak (Free)
          </button>
          <button
            v-else-if="canBuyFreezeWithCoins"
            @click="showModal = true"
            class="px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            Save My Streak ({{ freezeCostInCoins }} coins)
          </button>
          <div v-else class="text-white/80 text-sm">
            Not enough coins to save streak. Complete activities to earn more!
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="showModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <!-- Close Button -->
          <button
            @click="showModal = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Content -->
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">🛡️</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Streak Saver
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Save your {{ streak.currentStreak }}-day streak from being lost
            </p>
          </div>

          <!-- Options -->
          <div class="space-y-4 mb-6">
            <!-- Free Freeze -->
            <button
              v-if="canUseFreeFreeze"
              @click="useFreeFreeze"
              :disabled="isProcessing"
              class="w-full p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-green-900 dark:text-green-100">
                    Use Free Freeze
                  </div>
                  <div class="text-sm text-green-700 dark:text-green-300">
                    {{ streak.freezesAvailable }} available
                  </div>
                </div>
                <div class="text-3xl">🆓</div>
              </div>
            </button>

            <!-- Coins -->
            <button
              v-if="!canUseFreeFreeze && canBuyFreezeWithCoins && freezesRemaining > 0"
              @click="buyFreezeWithCoins"
              :disabled="isProcessing"
              class="w-full p-4 rounded-xl border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-yellow-900 dark:text-yellow-100">
                    Use Coins
                  </div>
                  <div class="text-sm text-yellow-700 dark:text-yellow-300">
                    {{ freezeCostInCoins }} coins
                  </div>
                </div>
                <div class="text-3xl">🪙</div>
              </div>
            </button>

            <!-- XP -->
            <button
              v-if="!canUseFreeFreeze && !canBuyFreezeWithCoins && freezesRemaining > 0"
              @click="buyFreezeWithXP"
              :disabled="isProcessing"
              class="w-full p-4 rounded-xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="font-bold text-purple-900 dark:text-purple-100">
                    Use XP
                  </div>
                  <div class="text-sm text-purple-700 dark:text-purple-300">
                    {{ freezeCostInXP }} XP
                  </div>
                </div>
                <div class="text-3xl">⭐</div>
              </div>
            </button>

            <!-- No freezes left -->
            <div
              v-if="freezesRemaining === 0"
              class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-center"
            >
              <div class="text-red-900 dark:text-red-100 font-bold mb-1">
                Weekly Limit Reached
              </div>
              <div class="text-sm text-red-700 dark:text-red-300">
                You've used all {{ maxFreezesPerWeek }} freezes this week
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <div class="font-semibold mb-2">How Streak Saver Works:</div>
            <ul class="space-y-1 text-xs">
              <li>• You get 2 free freezes per week</li>
              <li>• Additional freezes cost {{ freezeCostInCoins }} coins or {{ freezeCostInXP }} XP</li>
              <li>• Maximum {{ maxFreezesPerWeek }} freezes per week</li>
              <li>• Must be used within 24 hours of missing activity</li>
            </ul>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-200">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStreak } from '@/composables/useStreak';
import { useConfetti } from '@/composables/useConfetti';

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
      successMessage.value = 'Streak saved! 🎉';
      burst();

      setTimeout(() => {
        showModal.value = false;
        successMessage.value = null;
      }, 2000);
    } else {
      errorMessage.value = result.message || 'Failed to save streak';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Something went wrong';
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
      errorMessage.value = result.message || 'Failed to save streak';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Something went wrong';
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
      errorMessage.value = result.message || 'Failed to save streak';
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || 'Something went wrong';
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
