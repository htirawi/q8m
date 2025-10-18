<template>
  <Teleport to="body">
    <Transition name="level-up">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg"
        @click="close"
      >
        <div class="relative w-full max-w-2xl" @click.stop>
          <!-- Animated background rays -->
          <div class="absolute inset-0 overflow-hidden opacity-30">
            <div
              class="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2"
            >
              <div
                class="bg-gradient-conic absolute inset-0 animate-spin-slow from-purple-500 via-pink-500 to-purple-500 opacity-50 blur-3xl"
              ></div>
            </div>
          </div>

          <!-- Content card -->
          <div
            class="relative overflow-hidden rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 shadow-2xl"
          >
            <!-- Sparkles animation -->
            <div class="absolute inset-0 overflow-hidden">
              <div v-for="i in 20" :key="i" class="sparkle" :style="getSparkleStyle(i)"></div>
            </div>

            <!-- Close button -->
            <button
              @click="close"
              class="absolute right-4 top-4 z-10 text-white/80 transition-colors hover:text-white"
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

            <div class="relative z-10 p-8 text-center">
              <!-- Level badge -->
              <div class="mb-6 animate-scale-in">
                <div class="relative inline-block">
                  <div
                    class="animate-pulse-glow flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-2xl ring-8 ring-yellow-400/30"
                  >
                    <div class="text-6xl font-black text-white drop-shadow-lg">
                      {{ newLevel }}
                    </div>
                  </div>
                  <!-- Star burst -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="animate-rotate-slow text-8xl opacity-50">✨</div>
                  </div>
                </div>
              </div>

              <!-- Title -->
              <h2 class="mb-3 animate-fade-in-up text-5xl font-black text-white drop-shadow-lg">
                LEVEL UP!
              </h2>

              <!-- Level title -->
              <div
                class="animation-delay-200 mb-6 animate-fade-in-up text-2xl font-bold text-yellow-300"
              >
                {{ levelTitle }}
              </div>

              <!-- Stats -->
              <div class="mx-auto mb-8 grid max-w-md grid-cols-2 gap-4">
                <div
                  class="animation-delay-300 animate-fade-in-up rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div class="text-3xl font-bold text-white">
                    {{ previousLevel }} → {{ newLevel }}
                  </div>
                  <div class="text-sm text-white/80">Level Progress</div>
                </div>
                <div
                  class="animation-delay-400 animate-fade-in-up rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div class="text-3xl font-bold text-yellow-300">+{{ xpEarned }}</div>
                  <div class="text-sm text-white/80">XP Earned</div>
                </div>
              </div>

              <!-- Rewards unlocked -->
              <div
                v-if="rewards && rewards.length > 0"
                class="animation-delay-500 mb-6 animate-fade-in-up"
              >
                <div class="mb-3 text-lg font-semibold text-white">Rewards Unlocked</div>
                <div class="flex flex-wrap justify-center gap-3">
                  <div
                    v-for="(reward, index) in rewards"
                    :key="index"
                    class="flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm"
                  >
                    <span class="text-2xl">{{ reward.icon }} </span>
                    <span class="font-medium text-white">{{ reward.label }} </span>
                  </div>
                </div>
              </div>

              <!-- Message -->
              <p class="animation-delay-600 mb-8 animate-fade-in-up text-lg text-white/90">
                {{ message || `You've reached Level ${newLevel}! Keep up the amazing work!` }}
              </p>

              <!-- Action button -->
              <button
                @click="close"
                class="animation-delay-700 animate-fade-in-up rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-black text-white shadow-xl transition-all hover:scale-105 hover:from-yellow-500 hover:to-orange-600 hover:shadow-2xl"
              >
                {{ actionText || "Continue" }}
              </button>

              <!-- Social share -->
              <div v-if="shareable" class="animation-delay-800 mt-6 animate-fade-in-up">
                <div class="mb-2 text-sm text-white/70">Share your achievement</div>
                <div class="flex justify-center gap-2">
                  <button
                    @click="share('twitter')"
                    class="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                    title="Share on Twitter"
                  >
                    <span class="text-xl">🐦</span>
                  </button>
                  <button
                    @click="share('facebook')"
                    class="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                    title="Share on Facebook"
                  >
                    <span class="text-xl">📘</span>
                  </button>
                  <button
                    @click="share('copy')"
                    class="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                    title="Copy link"
                  >
                    <span class="text-xl">🔗</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IReward, ILevelUpCelebrationProps as Props } from "@/types/components/gamification";
import { ref, watch, onMounted } from "vue";
import { useConfetti } from "@/composables/useConfetti";

const props = withDefaults(defineProps<Props>(), {
  show: false,
  shareable: true,
  autoHide: false,
  autoHideDelay: 5000,
});

const emit = defineEmits<{
  close: [];
  share: [platform: string];
}>();

const { fireworks } = useConfetti();
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

  // Trigger fireworks
  fireworks();

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

  const shareText = `I just reached Level ${props.newLevel} (${props.levelTitle})! 🎉`;

  if (platform === "copy") {
    navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
  } else if (platform === "twitter") {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  } else if (platform === "facebook") {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  }
}

function getsparklestyle(index: number) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  const randomDuration = 1 + Math.random() * 2;
  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    animationDelay: `${randomDelay}

s`,
    animationDuration: `${randomDuration}s`,
  };
}

// Expose methods
defineExpose({
  show,
  hide,
});
</script>

<style scoped>
/* Level up transition */
.level-up-enter-active {
  animation:
    fadeIn 0.5s ease-out,
    scaleIn 0.5s ease-out;
}

.level-up-leave-active {
  animation: fadeOut 0.3s ease-in;
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

/* Scale in animation */
@keyframes scale-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Fade in up animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

.animation-delay-300 {
  animation-delay: 0.3s;
  opacity: 0;
}

.animation-delay-400 {
  animation-delay: 0.4s;
  opacity: 0;
}

.animation-delay-500 {
  animation-delay: 0.5s;
  opacity: 0;
}

.animation-delay-600 {
  animation-delay: 0.6s;
  opacity: 0;
}

.animation-delay-700 {
  animation-delay: 0.7s;
  opacity: 0;
}

.animation-delay-800 {
  animation-delay: 0.8s;
  opacity: 0;
}

/* Pulse glow animation */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow:
      0 0 40px rgb(251, 191, 36, 0.5),
      0 0 80px rgb(251, 191, 36, 0.3);
  }

  50% {
    box-shadow:
      0 0 60px rgb(251, 191, 36, 0.8),
      0 0 120px rgb(251, 191, 36, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Slow spin */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

/* Rotate slow */
@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-rotate-slow {
  animation: rotate-slow 4s linear infinite;
}

/* Sparkle animation */
.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle-float 3s infinite;
}

@keyframes sparkle-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-50px) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0);
  }
}

/* Gradient conic */
.bg-gradient-conic {
  background: conic-gradient(from 0deg, var(--tw-gradient-stops));
}
</style>
