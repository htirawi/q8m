<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import PerformanceMonitor from "@/components/ui/PerformanceMonitor.vue";
import ToastContainer from "@/components/ui/ToastContainer.vue";
import UserMenu from "@/components/layout/UserMenu.vue";
import { usePWA } from "@/composables/usePWA";
import { useSEO } from "@/composables/useSEO";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

// Stores
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Router
const router = useRouter();

// Composables
const seo = useSEO();
const pwa = usePWA();

// State
const showPerformanceMonitor = ref(import.meta.env.DEV);

// Methods
const skipToMain = (event: Event) => {
  event.preventDefault();
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: "smooth" });
  }
};

// Logout is now handled by UserMenu component

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
    title: "q8m - Master Frontend Development Interviews",
    description:
      "Master frontend development with 500+ curated interview questions covering Angular, React, Next.js, Redux, TypeScript, and advanced topics. Expert-level content for developers.",
    structuredData: seo.generateOrganizationStructuredData(),
  });

  // Preconnect and preload are handled by PWA composable internally
});
</script>

<template>
  <div class="app-layout">
    <!-- Skip Links for Accessibility -->
    <a href="#main-content" class="skip-link" @click="skipToMain">
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Header -->
    <header class="app-header" role="banner" :aria-label="$t('a11y.mainNavigation')">
      <nav class="header-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <!-- Logo -->
          <div class="nav-brand">
            <RouterLink to="/" class="brand-link" :aria-label="$t('a11y.goToHome')">
              <img src="/logo.svg" alt="Quiz Platform Logo" class="brand-logo" />
              <span class="brand-text">{{ $t("common.appName") }}</span>
            </RouterLink>
          </div>

          <!-- Main Navigation -->
          <div class="nav-menu" role="menubar">
            <RouterLink
              to="/"
              class="nav-link"
              :class="{ 'nav-link--active': $route.name === 'home' }"
              role="menuitem"
            >
              {{ $t("navigation.home") }}
            </RouterLink>
            <RouterLink
              to="/subscribe"
              class="nav-link"
              :class="{ 'nav-link--active': $route.name === 'subscribe' }"
              role="menuitem"
            >
              {{ $t("navigation.pricing") }}
            </RouterLink>
            <RouterLink
              v-if="authStore.isAuthenticated"
              to="/study"
              class="nav-link"
              :class="{ 'nav-link--active': $route.name?.toString().startsWith('study') }"
              role="menuitem"
            >
              📚 {{ $t("navigation.study") }}
            </RouterLink>
            <RouterLink
              v-if="authStore.isAuthenticated"
              to="/quiz"
              class="nav-link"
              :class="{ 'nav-link--active': $route.name?.toString().startsWith('quiz') }"
              role="menuitem"
            >
              🎯 {{ $t("navigation.quiz") }}
            </RouterLink>
          </div>

          <!-- User Menu -->
          <div class="nav-user">
            <template v-if="authStore.isAuthenticated">
              <UserMenu />
            </template>
            <template v-else>
              <RouterLink to="/login" class="nav-link" role="menuitem">
                {{ $t("navigation.login") }}
              </RouterLink>
              <RouterLink to="/register" class="nav-link nav-link--primary" role="menuitem">
                {{ $t("navigation.register") }}
              </RouterLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="app-main" role="main" :aria-label="$t('a11y.mainContent')">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="app-footer" role="contentinfo" :aria-label="$t('a11y.footer')">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">{{ $t("footer.company") }}</h3>
            <ul class="footer-links" role="list">
              <li>
                <RouterLink to="/about" class="footer-link"
                  >{{ $t("navigation.about") }}
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" class="footer-link"
                  >{{ $t("navigation.contact") }}
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/help" class="footer-link">{{ $t("navigation.help") }} </RouterLink>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h3 class="footer-title">{{ $t("footer.legal") }}</h3>
            <ul class="footer-links" role="list">
              <li>
                <RouterLink to="/privacy" class="footer-link"
                  >{{ $t("navigation.privacy") }}
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/terms" class="footer-link"
                  >{{ $t("navigation.terms") }}
                </RouterLink>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h3 class="footer-title">{{ $t("footer.social") }}</h3>
            <ul class="footer-links" role="list">
              <li>
                <a href="#" class="footer-link" :aria-label="$t('a11y.followOnTwitter')">Twitter</a>
              </li>
              <li>
                <a href="#" class="footer-link" :aria-label="$t('a11y.followOnLinkedIn')"
                  >LinkedIn</a
                >
              </li>
              <li>
                <a href="#" class="footer-link" :aria-label="$t('a11y.followOnGitHub')">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">
            {{ $t("footer.copyright", { year: new Date().getFullYear() }) }}
          </p>
        </div>
      </div>
    </footer>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Performance Monitor (Development Only) -->
    <PerformanceMonitor v-if="showPerformanceMonitor" />
  </div>
</template>

<style scoped>
.app-layout {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

/* Skip Links */
.skip-link {
  @apply absolute -top-10 left-4 z-50 rounded-md bg-primary-600 px-4 py-2 text-white transition-all duration-200;
}

.skip-link:focus {
  @apply top-4;
}

/* Header */
.app-header {
  @apply border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800;
}

.header-nav {
  @apply w-full;
}

.nav-container {
  @apply container mx-auto flex items-center justify-between px-4 py-4;
}

.nav-brand {
  @apply flex items-center;
}

.brand-link {
  @apply flex items-center space-x-2 text-gray-900 transition-colors duration-200 hover:text-primary-600 dark:text-white dark:hover:text-primary-400;
}

.brand-logo {
  @apply h-8 w-8;
}

.brand-text {
  @apply text-xl font-bold;
}

.nav-menu {
  @apply hidden items-center space-x-6 md:flex;
}

.nav-user {
  @apply flex items-center space-x-4;
}

.nav-link {
  @apply rounded-md px-3 py-2 text-gray-700 transition-colors duration-200 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400;
}

.nav-link--active {
  @apply bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400;
}

.nav-link--primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.nav-link--button {
  @apply border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700;
}

/* Main Content */
.app-main {
  @apply flex-1;
}

/* Footer */
.app-footer {
  @apply mt-auto bg-gray-800 text-gray-300;
}

.footer-container {
  @apply container mx-auto px-4 py-8;
}

.footer-content {
  @apply mb-8 grid grid-cols-1 gap-8 md:grid-cols-3;
}

.footer-section {
  @apply space-y-4;
}

.footer-title {
  @apply text-lg font-semibold text-white;
}

.footer-links {
  @apply space-y-2;
}

.footer-link {
  @apply text-gray-300 transition-colors duration-200 hover:text-white;
}

.footer-bottom {
  @apply border-t border-gray-700 pt-4 text-center;
}

.footer-copyright {
  @apply text-sm text-gray-400;
}

/* Focus Styles */
.nav-link:focus,
.brand-link:focus,
.footer-link:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive */
@media (width <= 768px) {
  .nav-menu {
    @apply flex flex-col space-x-0 space-y-2;
  }

  .nav-user {
    @apply flex-col space-x-0 space-y-2;
  }
}
</style>
