<template>
  <div class="default-layout">
    <!-- Skip Link for Accessibility -->
    <a href="#main-content" class="skip-link" @click="skipToMain">
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Header -->
    <header class="layout-header" role="banner" :aria-label="$t('a11y.mainNavigation')">
      <nav class="header-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <!-- Logo -->
          <div class="nav-brand">
            <RouterLink to="/" class="brand-link" :aria-label="$t('a11y.goToHome')">
              <img src="/logo.svg" alt="q8m Logo" class="brand-logo" width="32" height="32" />
              <span class="brand-text">q8m</span>
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
              to="/quiz"
              class="nav-link"
              :class="{ 'nav-link--active': $route.name === 'quiz' }"
              role="menuitem"
            >
              {{ $t("navigation.quiz") }}
            </RouterLink>
          </div>

          <!-- User Menu & Language Switch -->
          <div class="nav-user" role="menubar">
            <LangSwitch class="nav-lang-switch" />

            <template v-if="authStore.isAuthenticated">
              <UserMenu />
            </template>
            <template v-else>
              <RouterLink to="/login" class="nav-link" role="menuitem">
                {{ $t("navigation.login") }}
              </RouterLink>
              <Button variant="primary" size="sm" :to="{ name: 'register' }" class="nav-register">
                {{ $t("navigation.register") }}
              </Button>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="layout-main" role="main" :aria-label="$t('a11y.mainContent')">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="layout-footer" role="contentinfo" :aria-label="$t('a11y.footer')">
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button.vue";
import LangSwitch from "@/components/ui/LangSwitch.vue";
import ToastContainer from "@/components/ui/ToastContainer.vue";
import UserMenu from "@/components/ui/UserMenu.vue";

// Stores
const authStore = useAuthStore();

// Methods
const skipToMain = (event: Event) => {
  event.preventDefault();
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
.default-layout {
  @apply flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900;
}

/* Skip Links */
.skip-link {
  @apply absolute -top-10 left-4 z-50 rounded-md bg-primary-600 px-4 py-2 text-white transition-all duration-200;
}

.skip-link:focus {
  @apply top-4;
}

/* Header */
.layout-header {
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
  @apply flex min-h-[44px] items-center rounded-md px-3 py-2 text-gray-700 transition-colors duration-200 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400;
}

.nav-link--active {
  @apply bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400;
}

.nav-lang-switch {
  @apply mr-4;
}

.nav-logout,
.nav-register {
  @apply min-h-[44px];
}

/* Main Content */
.layout-main {
  @apply flex-1;
}

/* Footer */
.layout-footer {
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
  @apply flex min-h-[44px] items-center text-gray-300 transition-colors duration-200 hover:text-white;
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

  .nav-lang-switch {
    @apply mb-2 mr-0;
  }
}
</style>
