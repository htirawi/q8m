<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <RouterView />
    <ToastContainer />
    <PerformanceMonitor v-if="showPerformanceMonitor" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import { useSEO } from "./composables/useSEO";
import { usePWA } from "./composables/usePWA";
import ToastContainer from "./components/ui/ToastContainer.vue";
import PerformanceMonitor from "./components/ui/PerformanceMonitor.vue";

// Initialize stores
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Initialize composables
const seo = useSEO();
const pwa = usePWA();

// Performance monitoring (only in development)
const showPerformanceMonitor = ref(import.meta.env.DEV);

// Initialize app
onMounted(async () => {
  // Initialize theme
  themeStore.initializeTheme();

  // Initialize PWA
  await pwa.initialize();

  // Try to restore authentication state
  await authStore.initializeAuth();

  // Set up default SEO
  seo.updateSEO({
    title: "Vue 3 Quiz Platform",
    description:
      "Master Vue 3, React, Angular, and more with our comprehensive quiz platform. Interactive learning, real-time feedback, and expert-level content.",
    structuredData: seo.generateOrganizationStructuredData(),
  });

  // Preconnect to external domains for performance
  pwa.preconnectToDomain("https://fonts.googleapis.com");
  pwa.preconnectToDomain("https://fonts.gstatic.com");

  // Preload critical resources
  pwa.preloadResource("/manifest.json", "manifest");
});
</script>

<style>
/* Global styles will be imported from main.css */
</style>
