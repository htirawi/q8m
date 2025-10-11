<script setup lang="ts">
import { useRouter } from "vue-router";
import { ArrowRightIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const redirectToSubscribe = () => {
  router.push({ name: "subscribe" });
};
</script>

<template>
  <div class="subscription-banner" @click="redirectToSubscribe">
    <div class="banner-content">
      <div class="banner-text">
        <span class="banner-icon">🚀</span>
        <span class="banner-title">{{ $t("home.banner.title") }}</span>
        <span class="banner-description">{{ $t("home.banner.description") }}</span>
      </div>
      <div class="banner-arrow">
        <ArrowRightIcon class="arrow-icon" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-banner {
  @apply cursor-pointer bg-gradient-to-r from-primary-600 to-primary-700 transition-all duration-300 hover:from-primary-700 hover:to-primary-800 hover:shadow-lg;
  position: relative;
  overflow: hidden;
}

.subscription-banner::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.subscription-banner:hover::before {
  left: 100%;
}

.banner-content {
  @apply container mx-auto flex items-center justify-between px-4 py-4;
  position: relative;
  z-index: 1;
}

.banner-text {
  @apply flex items-center gap-3 text-white;
}

.banner-icon {
  @apply text-xl;
}

.banner-title {
  @apply text-lg font-semibold;
}

.banner-description {
  @apply hidden text-sm opacity-90 sm:block;
}

.banner-arrow {
  @apply flex items-center text-white;
}

.arrow-icon {
  @apply h-5 w-5 transition-transform duration-300;
}

.subscription-banner:hover .arrow-icon {
  @apply translate-x-1 transform;
}

/* Responsive adjustments */
@media (width <= 640px) {
  .banner-content {
    @apply py-3;
  }

  .banner-title {
    @apply text-base;
  }

  .banner-description {
    @apply hidden;
  }
}
</style>
