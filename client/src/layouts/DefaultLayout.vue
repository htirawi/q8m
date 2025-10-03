<template>
  <div class="default-layout">
    <!-- Skip Link for Accessibility -->
    <a 
      href="#main-content" 
      class="skip-link"
      @click="skipToMain"
    >
      {{ $t('a11y.skipToMain') }}
    </a>

    <!-- Header -->
    <header 
      class="layout-header" 
      role="banner"
      :aria-label="$t('a11y.mainNavigation')"
    >
      <nav class="header-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <!-- Logo -->
          <div class="nav-brand">
            <RouterLink 
              to="/" 
              class="brand-link"
              :aria-label="$t('a11y.goToHome')"
            >
              <img 
                src="/logo.svg" 
                alt="q8m Logo" 
                class="brand-logo"
                width="32"
                height="32"
              />
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
              {{ $t('navigation.home') }}
            </RouterLink>
            <RouterLink 
              to="/pricing" 
              class="nav-link"
              :class="{ 'nav-link--active': $route.name === 'pricing' }"
              role="menuitem"
            >
              {{ $t('navigation.pricing') }}
            </RouterLink>
            <RouterLink 
              v-if="authStore.isAuthenticated"
              to="/quiz" 
              class="nav-link"
              :class="{ 'nav-link--active': $route.name === 'quiz' }"
              role="menuitem"
            >
              {{ $t('navigation.quiz') }}
            </RouterLink>
          </div>

          <!-- User Menu & Language Switch -->
          <div class="nav-user" role="menubar">
            <LangSwitch class="nav-lang-switch" />
            
            <template v-if="authStore.isAuthenticated">
              <RouterLink 
                to="/account" 
                class="nav-link"
                :class="{ 'nav-link--active': $route.name === 'account' }"
                role="menuitem"
              >
                {{ $t('navigation.account') }}
              </RouterLink>
              <Button 
                variant="outline"
                size="sm"
                @click="handleLogout"
                class="nav-logout"
                :aria-label="$t('a11y.logout')"
              >
                {{ $t('navigation.logout') }}
              </Button>
            </template>
            <template v-else>
              <RouterLink 
                to="/login" 
                class="nav-link"
                role="menuitem"
              >
                {{ $t('navigation.login') }}
              </RouterLink>
              <Button
                variant="primary"
                size="sm"
                :to="{ name: 'register' }"
                class="nav-register"
              >
                {{ $t('navigation.register') }}
              </Button>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main 
      id="main-content" 
      class="layout-main" 
      role="main"
      :aria-label="$t('a11y.mainContent')"
    >
      <RouterView />
    </main>

    <!-- Footer -->
    <footer 
      class="layout-footer" 
      role="contentinfo"
      :aria-label="$t('a11y.footer')"
    >
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">{{ $t('footer.company') }}</h3>
            <ul class="footer-links" role="list">
              <li><RouterLink to="/about" class="footer-link">{{ $t('navigation.about') }}</RouterLink></li>
              <li><RouterLink to="/contact" class="footer-link">{{ $t('navigation.contact') }}</RouterLink></li>
              <li><RouterLink to="/help" class="footer-link">{{ $t('navigation.help') }}</RouterLink></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3 class="footer-title">{{ $t('footer.legal') }}</h3>
            <ul class="footer-links" role="list">
              <li><RouterLink to="/privacy" class="footer-link">{{ $t('navigation.privacy') }}</RouterLink></li>
              <li><RouterLink to="/terms" class="footer-link">{{ $t('navigation.terms') }}</RouterLink></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3 class="footer-title">{{ $t('footer.social') }}</h3>
            <ul class="footer-links" role="list">
              <li><a href="#" class="footer-link" :aria-label="$t('a11y.followOnTwitter')">Twitter</a></li>
              <li><a href="#" class="footer-link" :aria-label="$t('a11y.followOnLinkedIn')">LinkedIn</a></li>
              <li><a href="#" class="footer-link" :aria-label="$t('a11y.followOnGitHub')">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">
            {{ $t('footer.copyright', { year: new Date().getFullYear() }) }}
          </p>
        </div>
      </div>
    </footer>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import LangSwitch from '@/components/ui/LangSwitch.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

// Stores
const authStore = useAuthStore()

// Router
const router = useRouter()

// Methods
const skipToMain = (event: Event) => {
  event.preventDefault()
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
    mainContent.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.default-layout {
  @apply min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900;
}

/* Skip Links */
.skip-link {
  @apply absolute -top-10 left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md transition-all duration-200;
}

.skip-link:focus {
  @apply top-4;
}

/* Header */
.layout-header {
  @apply bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700;
}

.header-nav {
  @apply w-full;
}

.nav-container {
  @apply container mx-auto px-4 py-4 flex items-center justify-between;
}

.nav-brand {
  @apply flex items-center;
}

.brand-link {
  @apply flex items-center space-x-2 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200;
}

.brand-logo {
  @apply h-8 w-8;
}

.brand-text {
  @apply text-xl font-bold;
}

.nav-menu {
  @apply hidden md:flex items-center space-x-6;
}

.nav-user {
  @apply flex items-center space-x-4;
}

.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 px-3 py-2 rounded-md min-h-[44px] flex items-center;
}

.nav-link--active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20;
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
  @apply bg-gray-800 text-gray-300 mt-auto;
}

.footer-container {
  @apply container mx-auto px-4 py-8;
}

.footer-content {
  @apply grid grid-cols-1 md:grid-cols-3 gap-8 mb-8;
}

.footer-section {
  @apply space-y-4;
}

.footer-title {
  @apply text-white font-semibold text-lg;
}

.footer-links {
  @apply space-y-2;
}

.footer-link {
  @apply text-gray-300 hover:text-white transition-colors duration-200 min-h-[44px] flex items-center;
}

.footer-bottom {
  @apply border-t border-gray-700 pt-4 text-center;
}

.footer-copyright {
  @apply text-gray-400 text-sm;
}

/* Focus Styles */
.nav-link:focus,
.brand-link:focus,
.footer-link:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    @apply flex flex-col space-y-2 space-x-0;
  }
  
  .nav-user {
    @apply flex-col space-y-2 space-x-0;
  }
  
  .nav-lang-switch {
    @apply mr-0 mb-2;
  }
}
</style>
