<template>
  <div class="user-menu" ref="userMenuRef">
    <!-- User Button (Trigger) -->
    <button
      type="button"
      @click="toggleMenu"
      class="user-button"
      :aria-expanded="isOpen"
      :aria-label="$t('navigation.userMenu')"
    >
      <!-- User Avatar/Initial -->
      <div class="user-avatar">
        <span class="user-initial">{{ userInitial }}</span>
      </div>

      <!-- User Name -->
      <span class="user-name">{{ userName }}</span>

      <!-- Chevron Icon -->
      <svg
        class="chevron-icon"
        :class="{ 'chevron-open': isOpen }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" role="menu">
        <!-- User Info Section -->
        <div class="dropdown-header">
          <div class="user-info">
            <p class="user-info-name">{{ userName }}</p>
            <p class="user-info-email">{{ userEmail }}</p>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <!-- Menu Items -->
        <div class="dropdown-items">
          <RouterLink
            to="/account"
            class="dropdown-item"
            role="menuitem"
            @click="closeMenu"
          >
            <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t("navigation.profile") }}</span>
          </RouterLink>

          <RouterLink
            to="/settings"
            class="dropdown-item"
            role="menuitem"
            @click="closeMenu"
          >
            <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t("navigation.settings") }}</span>
          </RouterLink>
        </div>

        <div class="dropdown-divider"></div>

        <!-- Logout -->
        <div class="dropdown-items">
          <button
            type="button"
            class="dropdown-item dropdown-item-danger"
            role="menuitem"
            @click="handleLogout"
          >
            <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L6.586 10 5.172 11.414l2.707 2.707a3 3 0 004.242 0l5.707-5.707L16.414 7.414z"
                clip-rule="evenodd"
              />
              <path
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              />
            </svg>
            <span>{{ $t("navigation.logout") }}</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Store & Router
const authStore = useAuthStore();
const router = useRouter();

// Refs
const isOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

// Computed
const userName = computed(() => authStore.user?.name || "User");
const userEmail = computed(() => authStore.user?.email || "");
const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || "U";
  return name.charAt(0).toUpperCase();
});

// Methods
function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

async function handleLogout() {
  closeMenu();
  await authStore.logout();
  router.push("/");
}

// Close menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeMenu();
  }
}

// Close menu on Escape key
function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape" && isOpen.value) {
    closeMenu();
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
/* User Menu Container */
.user-menu {
  @apply relative;
}

/* User Button */
.user-button {
  @apply flex items-center gap-2.5 px-3 py-2 rounded-lg;
  @apply bg-white border border-gray-200;
  @apply text-gray-700 text-sm font-medium;
  @apply transition-all duration-200;
  @apply hover:bg-gray-50 hover:border-gray-300;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200;
  @apply dark:hover:bg-gray-700 dark:hover:border-gray-500;
}

/* User Avatar */
.user-avatar {
  @apply flex items-center justify-center;
  @apply w-8 h-8 rounded-full;
  @apply bg-gradient-to-br from-primary-500 to-primary-600;
  @apply text-white font-semibold text-sm;
  @apply shadow-sm;
}

.user-initial {
  @apply select-none;
}

/* User Name */
.user-name {
  @apply hidden md:block;
  @apply max-w-[120px] truncate;
}

/* Chevron Icon */
.chevron-icon {
  @apply w-5 h-5 transition-transform duration-200;
  @apply text-gray-400;
  @apply dark:text-gray-500;
}

.chevron-open {
  @apply rotate-180;
}

/* Dropdown Menu */
.dropdown-menu {
  @apply absolute right-0 mt-2 w-64;
  @apply bg-white border border-gray-200 rounded-xl shadow-xl;
  @apply z-50;
  @apply dark:bg-gray-800 dark:border-gray-700;
}

/* Dropdown Header */
.dropdown-header {
  @apply px-4 py-3;
}

.user-info {
  @apply space-y-1;
}

.user-info-name {
  @apply text-sm font-semibold text-gray-900;
  @apply dark:text-gray-100;
  @apply truncate;
}

.user-info-email {
  @apply text-xs text-gray-500;
  @apply dark:text-gray-400;
  @apply truncate;
}

/* Dropdown Divider */
.dropdown-divider {
  @apply h-px bg-gray-100;
  @apply dark:bg-gray-700;
}

/* Dropdown Items */
.dropdown-items {
  @apply py-2;
}

.dropdown-item {
  @apply w-full flex items-center gap-3 px-4 py-2.5;
  @apply text-sm font-medium text-gray-700;
  @apply transition-all duration-150;
  @apply hover:bg-gray-50;
  @apply focus:outline-none focus:bg-gray-50;
  @apply dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700;
}

.dropdown-item-danger {
  @apply text-red-600 hover:bg-red-50 focus:bg-red-50;
  @apply dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20;
}

.item-icon {
  @apply w-5 h-5 flex-shrink-0;
}

/* Animations */
.dropdown-enter-active {
  @apply transition-all duration-200 ease-out;
}

.dropdown-leave-active {
  @apply transition-all duration-150 ease-in;
}

.dropdown-enter-from {
  @apply opacity-0 scale-95 -translate-y-2;
}

.dropdown-leave-to {
  @apply opacity-0 scale-95 -translate-y-2;
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-menu {
    @apply w-56;
  }
}
</style>
