<template>
  <div class="user-menu" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Trigger Button -->
    <button ref="triggerRef" type="button" class="user-menu__trigger" :class="{ 'user-menu__trigger--active': isOpen }"
      :aria-expanded="isOpen" :aria-haspopup="true" :aria-label="$t('a11y.userMenu')" @click="toggleMenu"
      @keydown.escape="closeMenu" @mouseenter="preloadMenu">
      <!-- User Avatar -->
      <div class="user-menu__avatar">
        <span class="user-menu__avatar-text">{{ userInitials }}

</span>
      </div>

      <!-- User Info (Desktop Only) -->
      <div class="user-menu__info">
        <span class="user-menu__name">{{ userName }}

</span>
        <span v-if="!planStore.isPaid" class="user-menu__badge">
          {{ $t('plans.names.free') }}

        </span>
        <span v-else class="user-menu__badge user-menu__badge--premium">
          {{ planStore.planDisplayName }}
        </span>
      </div>

      <!-- Chevron Icon -->
      <svg class="user-menu__chevron" :class="{ 'user-menu__chevron--open': isOpen }" fill="none" stroke="currentColor"
        viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Mobile Backdrop -->
    <Transition name="backdrop">
      <div v-if="isOpen && isMobile" class="user-menu__backdrop" @click="closeMenu"></div>
    </Transition>

    <!-- Dropdown Menu -->
    <Transition :name="isMobile ? 'slide-up' : 'dropdown'">
      <div v-if="isOpen" ref="menuRef" class="user-menu__dropdown" :class="{ 'user-menu__dropdown--mobile': isMobile }"
        role="menu" :aria-orientation="'vertical'" @keydown.escape="closeMenu" @keydown.tab="handleTabKey"
        @keydown.up.prevent="handleArrowUp" @keydown.down.prevent="handleArrowDown"
        @keydown.home.prevent="handleHomeKey" @keydown.end.prevent="handleEndKey" @keydown="handleTypeAhead"
        @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <!-- Swipe Handle (Mobile Only) -->
        <div v-if="isMobile" class="user-menu__handle" aria-hidden="true"></div>

        <!-- User Info Section -->
        <div class="user-menu__header" role="none">
          <div class="user-menu__header-avatar">
            <span class="user-menu__header-avatar-text">{{ userInitials }}

</span>
          </div>
          <div class="user-menu__header-info">
            <p class="user-menu__header-name">{{ userName }}

</p>
            <p class="user-menu__header-email">{{ userEmail }}</p>
            <span v-if="planStore.planTier" class="user-menu__header-plan"
              :class="{ 'user-menu__header-plan--premium': planStore.isPaid }">
              {{ planStore.isPaid ? planStore.planDisplayName : $t('plans.names.free')planStore.planDisplayName }}
            </span>
          </div>
        </div>

        <div class="user-menu__divider" role="separator"></div>

        <!-- Menu Items -->
        <div class="user-menu__section" role="none">
          <RouterLink v-for="(item, index) in menuItems" :key="item.path" :to="`/${locale}${item.path}`"
            class="user-menu__item user-menu__item--animated" :style="{ '--item-index': index }" role="menuitem"
            :tabindex="isOpen ? 0 : -1" @click="handleItemClick">
            <!-- Quick Action Number (Desktop Only) -->
            <span v-if="!isMobile && index < 9" class="user-menu__quick-number" aria-hidden="true">
              {{ index + 1 }}

            </span>

            <component :is="item.icon" class="user-menu__item-icon" aria-hidden="true" />
            <span>{{ $t(item.label) }}</span>

            <!-- Badge -->
            <span v-if="item.badge" class="user-menu__notification-badge" :class="{
              'user-menu__notification-badge--new': item.badge.type === 'new',
              'user-menu__notification-badge--count': item.badge.type === 'count',
              'user-menu__notification-badge--dot': item.badge.type === 'dot'
            }" :aria-label="item.badge.type === 'new' ? $t('common.new') : item.badge.value?.toString()">
              <template v-if="item.badge.type === 'new'">
                {{ $t('common.new') }}

              </template>
              <template v-else-if="item.badge.type === 'count'">
                {{ item.badge.value }}
              </template>
              <!-- Dot badge renders as just a dot with no text -->
            </span>
          </RouterLink>
        </div>

        <!-- Subscribe CTA (Free Users Only) -->
        <template v-if="!planStore.isPaid">
          <div class="user-menu__divider" role="separator"></div>
          <div class="user-menu__section" role="none">
            <RouterLink :to="`/${locale}/pricing`" class="user-menu__item user-menu__item--cta" role="menuitem"
              :tabindex="isOpen ? 0 : -1" @click="handleUpgradeClick">
              <svg class="user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>{{ $t('navigation.upgrade') }}

</span>
              <span class="user-menu__item-badge">{{ $t('common.new') }}

</span>
            </RouterLink>
          </div>
        </template>

        <div class="user-menu__divider" role="separator"></div>

        <!-- Logout -->
        <div class="user-menu__section" role="none">
          <button type="button" class="user-menu__item user-menu__item--logout" role="menuitem"
            :tabindex="isOpen ? 0 : -1" :disabled="isLoggingOut" @click="handleLogout">
            <svg v-if="!isLoggingOut" class="user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <svg v-else class="user-menu__item-icon animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <span>{{ isLoggingOut ? $t('navigation.loggingOut') : $t('navigation.logout')$t }}

</span>
          </button>
        </div>

        <!-- Type-ahead Search Indicator -->
        <Transition name="fade">
          <div v-if="typeAheadSearch" class="user-menu__type-ahead" role="status" aria-live="polite">
            <svg class="user-menu__type-ahead-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="user-menu__type-ahead-text">{{ typeAheadSearch }}

</span>
          </div>
        </Transition>

        <!-- Keyboard Shortcuts Hint (Desktop Only) -->
        <div v-if="!isMobile" class="user-menu__shortcuts" role="none">
          <div class="user-menu__shortcuts-title">{{ $t('keyboard.shortcuts') }}

</div>
          <div class="user-menu__shortcuts-grid">
            <div class="user-menu__shortcut">
              <kbd class="user-menu__kbd">↑</kbd>
              <kbd class="user-menu__kbd">↓</kbd>
              <span>{{ $t('keyboard.navigate') }}

</span>
            </div>
            <div class="user-menu__shortcut">
              <kbd class="user-menu__kbd">1</kbd>
              <kbd class="user-menu__kbd">-</kbd>
              <kbd class="user-menu__kbd">{{ menuItems.length }}

</kbd>
              <span>{{ $t('keyboard.quickSelect') }}

</span>
            </div>
            <div class="user-menu__shortcut">
              <kbd class="user-menu__kbd">Esc</kbd>
              <span>{{ $t('keyboard.close') }}

</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Screen Reader Announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ screenReaderAnnouncement }}

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePlanStore } from '@/stores/plan';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const planStore = usePlanStore();
const { t, locale } = useI18n();

// State
const isOpen = ref(false);
const isLoggingOut = ref(false);
const isMobile = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);
const lastFocusedElement = ref<HTMLElement | null>(null);
const screenReaderAnnouncement = ref('');
const menuPreloaded = ref(false);

// Touch gesture state
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);

// Type-ahead search state
const typeAheadSearch = ref('');
const typeAheadTimer = ref<number | null>(null);
const typeAheadHighlightIndex = ref(-1);

// Computed
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'User');
const userEmail = computed(() => authStore.user?.email || '');
const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U';
  const parts = name.split(/[\s@]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

// Menu Items Configuration
const menuItems = computed(() => [
  {
    path: '/dashboard',
    label: 'navigation.dashboard',
    icon: h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
    ])
  },
  {
    path: '/account',
    label: 'navigation.account',
    icon: h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ])
  }
]);

// Analytics helper
const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'user_menu',
      device_type: isMobile.value ? 'mobile' : 'desktop',
      ...eventParams
    });
  }
};

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const togglemenu = () => {
  if (isOpen.value) {
    closeMenu();
  }

 else {
    openMenu();
  }
};

const openmenu = async () => {
  lastFocusedElement.value = document.activeElement as HTMLElement;
  isOpen.value = true;

  // Track analytics
  trackEvent('menu_opened', {
    plan_tier: planStore.planTier || 'free',
    is_paid: planStore.isPaid
  });

  // Announce to screen readers
  const itemCount = menuItems.value.length + (planStore.isPaid ? 0 : 1) + 1; // items + upgrade (if free) + logout
  screenReaderAnnouncement.value = t('a11y.menuOpened', {
    name: userName.value,
    email: userEmail.value,
    plan: planStore.isPaid ? planStore.planDisplayName : t('plans.names.free'),
    count: itemCount
  });

  // Focus first menu item
  await nextTick();
  if (menuRef.value) {
    const firstItem = menuRef.value.querySelector<HTMLElement>('a[role="menuitem"], button[role="menuitem"]');
    firstItem?.focus();
  }
};

const closemenu = () => {
  isOpen.value = false;
  screenReaderAnnouncement.value = t('a11y.menuClosed');

  // Clear type-ahead search
  clearTypeAhead();

  // Restore focus
  if (lastFocusedElement.value) {
    lastFocusedElement.value.focus();
  }

 else {
    triggerRef.value?.focus();
  }
};

const handleitemclick = (event: Event) => {
  // Track navigation
  const target = event.currentTarget as HTMLAnchorElement;
  const path = target.getAttribute('href') || '';
  const label = target.textContent?.trim() || 'unknown';

  trackEvent('menu_item_clicked', {
    destination: path,
    item_label: label
  });

  closeMenu();
};

const handleupgradeclick = (event: Event) => {
  // Track analytics with enhanced details
  trackEvent('upgrade_clicked', {
    event_category: 'monetization',
    event_label: 'user_menu',
    value: 1,
    current_plan: planStore.planTier || 'free'
  });

  // Track navigation
  const target = event.currentTarget as HTMLAnchorElement;
  const path = target.getAttribute('href') || '';
  trackEvent('menu_item_clicked', {
    destination: path,
    item_label: 'upgrade'
  });

  closeMenu();
};

const handlelogout = async () => {
  if (isLoggingOut.value) return;
  try {
    isLoggingOut.value = true;
    screenReaderAnnouncement.value = t('a11y.loggingOut');

    // Track logout attempt
    trackEvent('logout_initiated', {
      plan_tier: planStore.planTier || 'free'
    });

    closeMenu();
    await authStore.logout();

    // Track successful logout
    trackEvent('logout_success');

    screenReaderAnnouncement.value = t('a11y.loggedOut');
    router.push(`/${locale.value}/login`);
  } catch (error) {
    console.error('Logout failed:', error);
    screenReaderAnnouncement.value = t('a11y.logoutFailed');
    isLoggingOut.value = false;

    // Track logout failure
    trackEvent('logout_failed', {
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    // Show error toast (assuming toast composable exists)
    if (window.showToast) {
      window.showToast({
        type: 'error',
        message: t('errors.logoutFailed'),
        action: {
          label: t('common.retry'),
          onClick: handleLogout
        }
      });
    }
  }
};

const handleclickoutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    triggerRef.value &&
    menuRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    !menuRef.value.contains(event.target as Node)
  ) {
    closeMenu();
  }
};

const handletabkey = (event: KeyboardEvent) => {
  if (!menuRef.value) return;

  const focusableElements = menuRef.value.querySelectorAll<HTMLElement>(
    'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
};

// Helper function to get all focusable menu items
const getFocusableItems = (): HTMLElement[] => {
  if (!menuRef.value) return [];
  return Array.from(
    menuRef.value.querySelectorAll<HTMLElement>(
      'a[role="menuitem"]:not([tabindex="-1"]), button[role="menuitem"]:not([disabled]):not([tabindex="-1"])'
    )
  );
};

// Arrow key navigation: Up
const handleArrowUp = () => {
  const items = getFocusableItems();
  if (items.length === 0) return;

  const currentIndex = items.findIndex(item => item === document.activeElement);

  if (currentIndex === -1) {
    // No item focused, focus last item
    items[items.length - 1]?.focus();
  } else if (currentIndex === 0) {
    // At first item, wrap to last
    items[items.length - 1]?.focus();
  }

 else {
    // Focus previous item
    items[currentIndex - 1]?.focus();
  }
};

// Arrow key navigation: Down
const handleArrowDown = () => {
  const items = getFocusableItems();
  if (items.length === 0) return;

  const currentIndex = items.findIndex(item => item === document.activeElement);

  if (currentIndex === -1) {
    // No item focused, focus first item
    items[0]?.focus();
  } else if (currentIndex === items.length - 1) {
    // At last item, wrap to first
    items[0]?.focus();
  }

 else {
    // Focus next item
    items[currentIndex + 1]?.focus();
  }
};

// Home key: Focus first item
const handleHomeKey = () => {
  const items = getFocusableItems();
  if (items.length > 0) {
    items[0]?.focus();
  }
};

// End key: Focus last item
const handleEndKey = () => {
  const items = getFocusableItems();
  if (items.length > 0) {
    items[items.length - 1]?.focus();
  }
};

// Quick actions with number keys
const handleQuickAction = (event: KeyboardEvent) => {
  // Only handle number keys 1-9
  const key = event.key;
  if (!/^[1-9]$/.test(key)) return;

  event.preventDefault();

  const index = parseInt(key) - 1;
  const items = getFocusableItems();

  if (index < items.length) {
    const targetItem = items[index];

    // Track quick action usage
    trackEvent('quick_action_used', {
      item_index: index,
      item_label: targetItem.textContent?.trim() || 'unknown'
    });

    // Trigger click on the item
    targetItem.click();
  }
};

// Type-ahead search functionality
const clearTypeAhead = () => {
  typeAheadSearch.value = '';
  typeAheadHighlightIndex.value = -1;
  if (typeAheadTimer.value) {
    clearTimeout(typeAheadTimer.value);
    typeAheadTimer.value = null;
  }
};

const handletypeahead = (event: KeyboardEvent) => {
  // Handle quick actions first (number keys 1-9)
  if (/^[1-9]$/.test(event.key)) {
    handleQuickAction(event);
    return;
  }

  // Only handle alphabetic keys (not modifiers, arrow keys, or numbers)
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || /^[0-9]$/.test(event.key)) {
    return;
  }

  // Prevent default to avoid triggering other shortcuts
  event.preventDefault();

  // Add character to search string
  typeAheadSearch.value += event.key.toLowerCase();

  // Get all menu items with their text content
  const items = getFocusableItems();
  const itemTexts = items.map(item => item.textContent?.toLowerCase().trim() || '');

  // Find first matching item
  const matchIndex = itemTexts.findIndex(text =>
    text.startsWith(typeAheadSearch.value)
  );

  if (matchIndex !== -1) {
    typeAheadHighlightIndex.value = matchIndex;
    items[matchIndex]?.focus();

    // Track type-ahead usage
    trackEvent('type_ahead_used', {
      search_term: typeAheadSearch.value,
      match_found: true
    });
  }

  // Clear search after 1 second of no typing
  if (typeAheadTimer.value) {
    clearTimeout(typeAheadTimer.value);
  }
  typeAheadTimer.value = window.setTimeout(() => {
    clearTypeAhead();
  }, 1000);
};

// Haptic feedback helper
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  // Use Vibration API for haptic feedback
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[style]);
  }
};

// Mobile swipe gesture handlers
const handleTouchStart = (event: TouchEvent) => {
  if (!isMobile.value) return;
  touchStartY.value = event.touches[0].clientY;
  isDragging.value = true;

  // Light haptic feedback on touch start
  triggerHaptic('light');
};

const handletouchmove = (event: TouchEvent) => {
  if (!isMobile.value || !isDragging.value) return;
  touchCurrentY.value = event.touches[0].clientY;

  // Only allow dragging down
  const deltaY = touchCurrentY.value - touchStartY.value;
  if (deltaY > 0 && menuRef.value) {
    menuRef.value.style.transform = `translateY(${deltaY}px)`;

    // Medium haptic feedback when crossing close threshold
    if (deltaY > 100 && deltaY < 110) {
      triggerHaptic('medium');
    }
  }
};

const handletouchend = () => {
  if (!isMobile.value || !isDragging.value) return;

  const deltaY = touchCurrentY.value - touchStartY.value;

  // Close if dragged down more than 100px
  if (deltaY > 100) {
    // Heavy haptic feedback on close
    triggerHaptic('heavy');
    trackEvent('menu_closed_swipe');
    closeMenu();
  }

  // Reset
  if (menuRef.value) {
    menuRef.value.style.transform = '';
  }
  isDragging.value = false;
};

// Performance: Preload menu on hover
const preloadMenu = () => {
  if (menuPreloaded.value) return;

  // Prefetch user data if needed
  if (!authStore.user) {
    authStore.fetchUser();
  }

  // Prefetch plan data if needed
  if (!planStore.planTier) {
    planStore.fetchPlan();
  }

  menuPreloaded.value = true;
};

// Watch for menu open/close to manage body scroll (mobile)
watch(isOpen, (newValue) => {
  if (isMobile.value) {
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

// Lifecycle
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);

  // Cleanup type-ahead timer
  clearTypeAhead();

  // Cleanup body scroll lock
  if (isMobile.value) {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
/* User Menu Container */
.user-menu {
  @apply relative;
}

/* Trigger Button - Modern Linear/Arc style */
.user-menu__trigger {
  @apply flex items-center gap-2.5 rounded-lg px-3 py-1.5;
  @apply bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50;
  @apply border border-transparent hover:border-gray-200 dark:hover:border-gray-700;
  @apply transition-all duration-fast ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900;

  will-change: background-color, border-color, transform;
  transform: translateZ(0);

  /* Force GPU acceleration */
}

.user-menu__trigger:hover {
  transform: translateY(-1px);

  @apply shadow-sm;
}

.user-menu__trigger:active {
  transform: translateY(0);

  @apply shadow-none;
}

.user-menu__trigger--active {
  @apply bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700;
  @apply shadow-sm;
}

/* Avatar - Enhanced with better gradients */
.user-menu__avatar {
  @apply flex h-8 w-8 items-center justify-center rounded-full;
  @apply bg-gradient-to-br from-primary via-primary-600 to-secondary;
  @apply text-white shadow-sm ring-2 ring-white/20 dark:ring-gray-800/20;
  @apply transition-transform duration-fast;
}

.user-menu__trigger:hover .user-menu__avatar {
  @apply scale-105;
}

.user-menu__avatar-text {
  @apply text-xs font-bold tracking-wide;
}

/* User Info (Desktop) */
.user-menu__info {
  @apply hidden flex-col items-start md:flex;
}

.user-menu__name {
  @apply text-sm font-medium text-gray-700 dark:text-gray-200;
  @apply truncate max-w-[150px];
}

.user-menu__badge {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.user-menu__badge--premium {
  @apply bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text font-semibold text-transparent;
}

/* Chevron */
.user-menu__chevron {
  @apply h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-400;
}

.user-menu__chevron--open {
  @apply rotate-180;
}

/* Mobile Backdrop */
.user-menu__backdrop {
  @apply fixed inset-0 z-40 bg-black/40 backdrop-blur-sm;
}

/* Dropdown - Modern Linear-style elevation */
.user-menu__dropdown {
  @apply absolute right-0 top-full z-50 mt-2 w-72 origin-top-right;
  @apply rounded-xl bg-white dark:bg-gray-800;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply shadow-lg backdrop-blur-xl;

  background: rgb(255, 255, 255, 0.98);
  will-change: transform, opacity;
}

:global(.dark) .user-menu__dropdown {
  background: rgb(24, 24, 27, 0.98);
}

.user-menu__dropdown--mobile {
  @apply fixed inset-x-4 top-auto bottom-4 right-auto w-auto;
  @apply rounded-2xl shadow-2xl;
  @apply border-gray-200 dark:border-gray-700;
}

[dir='rtl'] .user-menu__dropdown {
  @apply left-0 right-auto origin-top-left;
}

/* Swipe Handle (Mobile) */
.user-menu__handle {
  @apply mx-auto mt-2 mb-4 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600;
}

/* Header Section */
.user-menu__header {
  @apply flex items-center gap-3 p-3;
}

.user-menu__header-avatar {
  @apply flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md;
}

.user-menu__header-avatar-text {
  @apply text-sm font-bold;
}

.user-menu__header-info {
  @apply flex-1 overflow-hidden;
}

.user-menu__header-name {
  @apply truncate text-sm font-semibold text-gray-900 dark:text-white;
}

.user-menu__header-email {
  @apply truncate text-xs text-gray-500 dark:text-gray-400;
}

.user-menu__header-plan {
  @apply mt-1 inline-block text-xs font-medium text-gray-600 dark:text-gray-400;
}

.user-menu__header-plan--premium {
  @apply bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent;
}

/* Divider */
.user-menu__divider {
  @apply border-t border-gray-200 dark:border-gray-700;
}

/* Menu Section */
.user-menu__section {
  @apply py-1;
}

/* Menu Item - Modern hover states */
.user-menu__item {
  @apply flex w-full items-center gap-3 px-4 py-2 mx-1 rounded-lg;
  @apply text-left text-sm font-medium text-gray-700 dark:text-gray-300;
  @apply transition-all duration-fast ease-out;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/30;
  @apply hover:translate-x-0.5;
  @apply focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/30;
  @apply focus:ring-2 focus:ring-inset focus:ring-primary/50;

  position: relative;
  overflow: hidden;
}

/* Subtle hover effect */
.user-menu__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--color-primary);
  transition: height var(--duration-fast) var(--ease-out);
  border-radius: 0 2px 2px 0;
}

[dir='rtl'] .user-menu__item::before {
  left: auto;
  right: 0;
  border-radius: 2px 0 0 2px;
}

.user-menu__item:hover::before {
  height: 60%;
}

.user-menu__item[disabled] {
  @apply opacity-40 cursor-not-allowed;
  @apply hover:translate-x-0 hover:bg-transparent;
}

.user-menu__item[disabled]::before {
  display: none;
}

/* Staggered entrance animation for menu items */
.user-menu__item--animated {
  animation: slideInFade 0.3s ease-out forwards;
  animation-delay: calc(var(--item-index) * 50ms);
  opacity: 0;
  transform: translateX(-10px);
}

[dir='rtl'] .user-menu__item--animated {
  transform: translateX(10px);
}

@keyframes slideInFade {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Quick Action Number */
.user-menu__quick-number {
  @apply flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold;
  @apply bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400;
  @apply transition-all duration-200;
}

.user-menu__item:hover .user-menu__quick-number {
  @apply bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300;
  @apply scale-110;
}

.user-menu__item-icon {
  @apply h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500;
}

.user-menu__item:hover .user-menu__item-icon {
  @apply text-gray-600 dark:text-gray-300;
}

/* Notification Badge */
.user-menu__notification-badge {
  @apply ml-auto rounded-full px-2 py-0.5 text-xs font-semibold;
  @apply transition-transform duration-200;
}

.user-menu__notification-badge--new {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white;
  @apply shadow-sm;

  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.user-menu__notification-badge--count {
  @apply bg-red-500 text-white;
  @apply min-w-[20px] h-5 flex items-center justify-center;
  @apply shadow-sm;

  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.user-menu__notification-badge--dot {
  @apply w-2 h-2 rounded-full bg-red-500 p-0;
  @apply ring-2 ring-white dark:ring-gray-800;

  animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Animate badge on hover */
.user-menu__item:hover .user-menu__notification-badge {
  @apply scale-110;

  animation: none;
}

/* Pulse animations */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* CTA Item - Modern gradient with animation */
.user-menu__item--cta {
  @apply relative mx-1 mb-1;
  @apply bg-gradient-to-r from-primary to-secondary;
  @apply text-white hover:shadow-md;
  @apply transform hover:scale-[1.02];

  background-size: 100% 100%;
  transition: all var(--duration-fast) var(--ease-out), background-size 0.3s;
}

.user-menu__item--cta:hover {
  background-size: 105% 105%;
}

.user-menu__item--cta::before {
  background: white;
  opacity: 0.2;
}

.user-menu__item--cta .user-menu__item-icon {
  @apply text-white;
}

.user-menu__item-badge {
  @apply ml-auto rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5;
  @apply text-[10px] font-bold text-white uppercase tracking-wider;
  @apply ring-1 ring-white/30;

  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgb(255, 255, 255, 0.3);
  }
}

/* Logout Item */
.user-menu__item--logout {
  @apply text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20;
}

.user-menu__item--logout .user-menu__item-icon {
  @apply text-red-500 dark:text-red-400;
}

/* Type-ahead Search Indicator */
.user-menu__type-ahead {
  @apply flex items-center gap-2 px-4 py-2.5 border-t border-gray-200 dark:border-gray-700;
  @apply bg-primary-50 dark:bg-primary-900/20;
}

.user-menu__type-ahead-icon {
  @apply h-4 w-4 text-primary-600 dark:text-primary-400;
}

.user-menu__type-ahead-text {
  @apply text-sm font-medium text-primary-700 dark:text-primary-300;
  @apply font-mono tracking-wider;
}

/* Keyboard Shortcuts */
.user-menu__shortcuts {
  @apply px-4 py-2 border-t border-gray-200 dark:border-gray-700;
  @apply bg-gray-50 dark:bg-gray-900/50;
}

.user-menu__shortcuts-title {
  @apply text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5;
}

.user-menu__shortcuts-grid {
  @apply flex flex-col gap-1;
}

.user-menu__shortcut {
  @apply flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400;
}

.user-menu__kbd {
  @apply inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold;
  @apply bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600;
  @apply rounded shadow-sm;
}

/* Dropdown Transition (Desktop) */
.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-200;

  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  @apply scale-95 opacity-0 -translate-y-2;
}

.dropdown-leave-to {
  @apply scale-95 opacity-0 -translate-y-2;
}

/* Slide Up Transition (Mobile) */
.slide-up-enter-active {
  @apply transition-all duration-300;

  transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-leave-active {
  @apply transition-all duration-200;

  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.slide-up-enter-from {
  @apply translate-y-full opacity-0;
}

.slide-up-leave-to {
  @apply translate-y-full opacity-0;
}

/* Backdrop Transition */
.backdrop-enter-active,
.backdrop-leave-active {
  @apply transition-opacity duration-200;
}

.backdrop-enter-from,
.backdrop-leave-to {
  @apply opacity-0;
}

/* Fade Transition (for type-ahead indicator) */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-150;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0 scale-95;
}

/* Screen Reader Only */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;

  clip: rect(0, 0, 0, 0);
}

/* RTL Support */
[dir='rtl'] .user-menu__info {
  @apply items-end;
}

[dir='rtl'] .user-menu__trigger {
  @apply flex-row-reverse;
}

/* Focus Visible Enhancement */
.user-menu__trigger:focus-visible {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.user-menu__item:focus-visible {
  @apply ring-2 ring-inset ring-primary-500;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .user-menu__trigger,
  .user-menu__chevron,
  .user-menu__dropdown,
  .user-menu__backdrop,
  .user-menu__item,
  .user-menu__notification-badge,
  .user-menu__quick-number {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation: none !important;
  }

  .dropdown-enter-active,
  .dropdown-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active,
  .backdrop-enter-active,
  .backdrop-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }

  /* Disable transform animations for reduced motion */
  .dropdown-enter-from,
  .dropdown-leave-to {
    @apply scale-100 translate-y-0;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    @apply translate-y-0;
  }

  /* Disable staggered animations */
  .user-menu__item--animated {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
