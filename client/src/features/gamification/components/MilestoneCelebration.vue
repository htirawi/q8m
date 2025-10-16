<template>
  <Teleport to="body">
    <Transition name="celebration">
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
        @click="close"
      >
        <div
          class="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
          @click.stop
        >
          <!-- Animated background patterns -->
          <div class="absolute inset-0 overflow-hidden opacity-20">
            <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s" />
          </div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- Close button -->
            <button
              @click="close"
              class="absolute top-0 right-0 text-white/80 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Icon/Emoji -->
            <div class="text-center mb-6 animate-bounce">
              <div class="text-8xl">{{ milestone.icon }}</div>
            </div>

            <!-- Title -->
            <h2 class="text-4xl font-black text-white text-center mb-4 drop-shadow-lg">
              {{ milestone.title }}
            </h2>

            <!-- Description -->
            <p class="text-xl text-white/90 text-center mb-6 font-medium">
              {{ milestone.description }}
            </p>

            <!-- Stats -->
            <div v-if="milestone.stats" class="grid grid-cols-2 gap-4 mb-6">
              <div
                v-for="(stat, index) in milestone.stats"
                :key="index"
                class="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <div class="text-3xl font-bold text-white">{{ stat.value }}</div>
                <div class="text-sm text-white/80">{{ stat.label }}</div>
              </div>
            </div>

            <!-- Rewards -->
            <div v-if="milestone.rewards && milestone.rewards.length > 0" class="mb-6">
              <div class="text-center text-white/80 text-sm mb-3 font-semibold">Rewards Earned</div>
              <div class="space-y-2">
                <div
                  v-for="(reward, index) in milestone.rewards"
                  :key="index"
                  class="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ reward.icon }}</span>
                    <span class="text-white font-medium">{{ reward.label }}</span>
                  </div>
                  <span class="text-white font-bold">{{ reward.value }}</span>
                </div>
              </div>
            </div>

            <!-- Share prompt (optional) -->
            <div v-if="milestone.shareable" class="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div class="text-center text-white/90 text-sm mb-3">
                Share your achievement with friends!
              </div>
              <div class="flex gap-2 justify-center">
                <button
                  @click="share('twitter')"
                  class="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                >
                  Twitter
                </button>
                <button
                  @click="share('facebook')"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Facebook
                </button>
                <button
                  @click="share('copy')"
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <!-- Action button -->
            <button
              @click="close"
              class="w-full py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg"
            >
              {{ milestone.actionText || 'Awesome!' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IMilestoneReward, IMilestoneStat, IMilestone, IMilestoneCelebrationProps as Props } from "@/types/components/gamification";
import { ref, watch, onMounted } from 'vue';
import { useConfetti } from '@/composables/useConfetti';









const props = withDefaults(defineProps<Props>(), {
  show: false,
  autoHide: false,
  autoHideDelay: 5000,
  celebrationStyle: 'fireworks',
});

const emit = defineEmits<{
  close: [];
  share: [platform: string];
}>();

const { celebrate, fireworks, burst, rain } = useConfetti();
const isVisible = ref(false);
let autoHideTimeout: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      show();
    } else {
      hide();
    }
  }
);

onMounted(() => {
  if (props.show) {
    show();
  }
});

function show() {
  isVisible.value = true;

  // Trigger confetti animation
  if (props.celebrationStyle === 'celebrate') {
    celebrate();
  } else if (props.celebrationStyle === 'fireworks') {
    fireworks();
  } else if (props.celebrationStyle === 'burst') {
    burst();
  } else if (props.celebrationStyle === 'rain') {
    rain();
  }

  // Auto-hide if enabled
  if (props.autoHide) {
    autoHideTimeout = setTimeout(() => {
      close();
    }, props.autoHideDelay);
  }
}

function hide() {
  isVisible.value = false;
  if (autoHideTimeout) {
    clearTimeout(autoHideTimeout);
    autoHideTimeout = null;
  }
}

function close() {
  hide();
  emit('close');
}

function share(platform: string) {
  emit('share', platform);

  if (platform === 'copy') {
    // Copy share link to clipboard
    const shareText = `${props.milestone.title} - ${props.milestone.description}`;
    navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
  } else if (platform === 'twitter') {
    const shareText = encodeURIComponent(`${props.milestone.title}! ${props.milestone.description}`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`, '_blank');
  } else if (platform === 'facebook') {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }
}

// Expose methods for programmatic control
defineExpose({
  show,
  hide,
});
</script>

<style scoped>
/* Celebration animation */
.celebration-enter-active {
  animation: fadeIn 0.3s ease-out, scaleIn 0.3s ease-out;
}

.celebration-leave-active {
  animation: fadeOut 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

/* Pulse animation for background */
@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
