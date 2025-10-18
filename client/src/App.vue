<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSoftPaywall } from "@/composables/useSoftPaywall";
import { useAuthStore } from "@/stores/auth";
import SoftPaywallModal from "@/components/paywall/SoftPaywallModal.vue";
import ConvertModal from "@/components/marketing/ConvertModal.vue";
import AIChatbot from "@/components/ai/AIChatbot.vue";

const { isVisible, targetRoute, suggestedPlan, hide } = useSoftPaywall();
const route = useRoute();
const authStore = useAuthStore();

// Show AI chatbot for authenticated users and on homepage (for non-authenticated users)
const showAIChatbot = computed(() => {
  const excludedPaths = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password'];
  const isHomepage = route.path === '/' || route.path === '/ar' || route.path === '/en';

  return (authStore.isAuthenticated || isHomepage) && !excludedPaths.some(path => route.path.includes(path));
});

// Get context from current route for AI chatbot
const aiContext = computed(() => {
  if (route.path.includes('/study')) {
    return {
      topic: 'Study Mode',
      difficulty: route.params.difficulty as string,
      framework: route.params.framework as string,
    };
  }
  if (route.path.includes('/quiz')) {
    return {
      topic: 'Quiz Mode',
      difficulty: route.params.difficulty as string,
      framework: route.params.framework as string,
    };
  }
  return undefined;
});
</script>

<template>
  <div id="app">
    <RouterView />

    <!-- Global Soft Paywall Modal -->
    <SoftPaywallModal :is-visible="isVisible" :target-route="targetRoute" :suggested-plan="suggestedPlan"
      @dismiss="hide" />

    <!-- Conversion Modal (Embedded Checkout) -->
    <ConvertModal />

    <!-- AI Chatbot (Global) -->
    <AIChatbot v-if="showAIChatbot" :context="aiContext" :voice-enabled="true" :show-suggestions="true" />
  </div>
</template>

<style>
/* Global styles are imported in main.ts */
</style>
