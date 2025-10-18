<template>
  <Teleport to="body">
    <Transition name="celebration">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        @click="close"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8 shadow-2xl"
          @click.stop
        >
          <!-- Animated background patterns -->
          <div class="absolute inset-0 overflow-hidden opacity-20">
            <div
              class="absolute left-0 top-0 h-64 w-64 animate-pulse rounded-full bg-white blur-3xl"
            />
            <div
              class="absolute bottom-0 right-0 h-96 w-96 animate-pulse rounded-full bg-yellow-300 blur-3xl"
              style="animation-delay: 0.5s"
            />
          </div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- Close button -->
            <button
              @click="close"
              class="absolute right-0 top-0 text-white/80 transition-colors hover:text-white"
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

            <!-- Icon/Emoji -->
            <div class="mb-6 animate-bounce text-center">
              <div class="text-8xl">{{ milestone.icon }}</div>
            </div>

            <!-- Title -->
            <h2 class="mb-4 text-center text-4xl font-black text-white drop-shadow-lg">
              {{ milestone.title ?? "" }}
            </h2>

            <!-- Description -->
            <p class="mb-6 text-center text-xl font-medium text-white/90">
              {{ milestone.description ?? "" }}
            </p>

            <!-- Stats -->
            <div v-if="milestone.stats" class="mb-6 grid grid-cols-2 gap-4">
              <div
                v-for="(stat, index) in milestone.stats"
                :key="index"
                class="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm"
              >
                <div class="text-3xl font-bold text-white">{{ stat.value ?? 0 }}</div>
                <div class="text-sm text-white/80">{{ stat.label }}</div>
              </div>
            </div>

            <!-- Rewards -->
            <div v-if="milestone.rewards && milestone.rewards.length > 0" class="mb-6">
              <div class="mb-3 text-center text-sm font-semibold text-white/80">Rewards Earned</div>
              <div class="space-y-2">
                <div
                  v-for="(reward, index) in milestone.rewards"
                  :key="index"
                  class="flex items-center justify-between rounded-lg bg-white/20 p-3 backdrop-blur-sm"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ reward.icon }} </span>
                    <span class="font-medium text-white">{{ reward.label }} </span>
                  </div>
                  <span class="font-bold text-white">{{ reward.value ?? 0 }} </span>
                </div>
              </div>
            </div>

            <!-- Share prompt (optional) -->
            <div
              v-if="milestone.shareable"
              class="mb-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <div class="mb-3 text-center text-sm text-white/90">
                Share your achievement with friends!
              </div>
              <div class="flex justify-center gap-2">
                <button
                  @click="share('twitter')"
                  class="rounded-lg bg-blue-400 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Twitter
                </button>
                <button
                  @click="share('facebook')"
                  class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Facebook
                </button>
                <button
                  @click="share('copy')"
                  class="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <!-- Action button -->
            <button
              @click="close"
              class="w-full rounded-xl bg-white py-4 text-lg font-bold text-purple-600 shadow-xl transition-all hover:bg-gray-100"
            >
              {{ milestone.actionText || "Awesome!" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IMilestoneCelebrationProps as Props } from "../../../types/components/gamification";
import { ref, watch, onMounted } from "vue";
import { useConfetti } from "../../../composables/useConfetti";

const props = withDefaults(defineProps<Props>(), {
  show: false,
  autoHide: false,
  autoHideDelay: 5000,
  celebrationStyle: "fireworks",
});

const emit = defineEmits<{
  close: [];
  share: [platform: string];
}>();

const { celebrate, fireworks, burst, rain } = useConfetti();

const isVisible = ref(false);
let autoHideTimeout: ReturnType<typeof setTimeout> | null = null;
autoHideTimeout;

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
  if (props.celebrationStyle === "celebrate") {
    celebrate();
  } else if (props.celebrationStyle === "fireworks") {
    fireworks();
  } else if (props.celebrationStyle === "burst") {
    burst();
  } else if (props.celebrationStyle === "rain") {
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
  emit("close");
}

function share(platform: string) {
  emit("share", platform);

  if (platform === "copy") {
    // Copy share link to clipboard
    const shareText = `${props.milestone.title} - ${props.milestone.description}`;
    navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
  } else if (platform === "twitter") {
    const shareText = encodeURIComponent(
      `${props.milestone.title}! ${props.milestone.description}`
    );
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`, "_blank");
  } else if (platform === "facebook") {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
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
  animation:
    fadeIn 0.3s ease-out,
    scaleIn 0.3s ease-out;
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
  0%,
  100% {
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
