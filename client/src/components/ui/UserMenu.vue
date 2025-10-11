<script setup lang="ts">
import { computed, ref } from "vue";

import { useRouter } from "vue-router";

import { useDropdown } from "@/composables/useDropdown";
import { useAuthStore } from "@/stores/auth";

/**
 * UserMenu Component
 * Dropdown menu for authenticated users showing profile info and navigation options.
 */

const authStore = useAuthStore();
const router = useRouter();

const userMenuRef = ref<HTMLElement | null>(null);
const { isOpen, toggle, close } = useDropdown(userMenuRef);

const userName = computed(() => authStore.user?.name || "User");
const userEmail = computed(() => authStore.user?.email || "");
const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || "U";
  return name.charAt(0).toUpperCase();
});

async function handleLogout() {
  close();
  await authStore.logout();
  router.push("/");
}
</script>

<template>
  <div class="user-menu" ref="userMenuRef">
    <button
      type="button"
      @click="toggle"
      class="user-button"
      :aria-expanded="isOpen"
      :aria-label="$t('navigation.userMenu')"
    >
      <div class="user-avatar">
        <span class="user-initial">{{ userInitial }}</span>
      </div>

      <span class="user-name">{{ userName }}</span>

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

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" role="menu">
        <div class="dropdown-header">
          <div class="user-info">
            <p class="user-info-name">{{ userName }}</p>
            <p class="user-info-email">{{ userEmail }}</p>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <div class="dropdown-items">
          <RouterLink
            to="/account"
            class="dropdown-item"
            role="menuitem"
            @click="close"
          >
            <svg class="dropdown-item-icon" viewBox="0 0 20 20" fill="currentColor">
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
            @click="close"
          >
            <svg class="dropdown-item-icon" viewBox="0 0 20 20" fill="currentColor">
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

        <div class="dropdown-items">
          <button
            type="button"
            class="dropdown-item dropdown-item-danger"
            role="menuitem"
            @click="handleLogout"
          >
            <svg class="dropdown-item-icon" viewBox="0 0 20 20" fill="currentColor">
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

<style scoped>
/* Component-specific styles */
.user-menu {
  @apply relative;
}

.user-button {
  /* Layout & sizing */
  @apply flex min-h-[44px] items-center gap-2.5;

  /* Base styling */
  @apply rounded-lg border border-gray-200 bg-white px-3 py-2;
  @apply text-sm font-medium text-gray-700;

  /* Interaction states */
  @apply transition-all duration-200;
  @apply hover:border-gray-300 hover:bg-gray-50;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;

  /* Dark mode */
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200;
  @apply dark:hover:border-gray-500 dark:hover:bg-gray-700;
}

.user-avatar {
  @apply flex h-8 w-8 items-center justify-center rounded-full;
  @apply bg-gradient-to-br from-primary-500 to-primary-600;
  @apply text-sm font-semibold text-white shadow-sm;
}

.user-initial {
  @apply select-none;
}

.user-name {
  @apply hidden max-w-[120px] truncate md:block;
}

.chevron-icon {
  @apply h-5 w-5 transition-transform duration-200;
  @apply text-gray-400 dark:text-gray-500;
}

.chevron-open {
  @apply rotate-180;
}

/* Dropdown menu size override */
.dropdown-menu {
  @apply w-64;
}

/* User info section */
.user-info {
  @apply space-y-1;
}

.user-info-name {
  @apply truncate text-sm font-semibold text-gray-900 dark:text-gray-100;
}

.user-info-email {
  @apply truncate text-xs text-gray-500 dark:text-gray-400;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .dropdown-menu {
    @apply w-56;
  }
}
</style>
