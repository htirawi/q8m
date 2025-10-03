<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="isOpen"
        class="modal-overlay"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click="handleOverlayClick"
      >
        <div :class="modalClasses" @click.stop>
          <!-- Header -->
          <div v-if="showHeader" class="modal-header">
            <h2 v-if="title" :id="titleId" class="modal-title">
              {{ title }}
            </h2>

            <button
              v-if="showCloseButton"
              type="button"
              class="modal-close"
              :aria-label="$t('common.close')"
              @click="handleClose"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <div v-if="description" :id="descriptionId" class="modal-description">
              {{ description }}
            </div>

            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useId } from "vue";
import { useI18n } from "vue-i18n";
import { XMarkIcon } from "@heroicons/vue/24/outline";

interface Props {
  modelValue: boolean;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  persistent?: boolean;
  scrollable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: "",
  description: "",
  size: "md",
  showHeader: true,
  showCloseButton: true,
  closeOnOverlay: true,
  closeOnEscape: true,
  persistent: false,
  scrollable: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
  open: [];
}>();

const { t } = useI18n();

// Generate unique IDs
const titleId = useId();
const descriptionId = useId();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const modalClasses = computed(() => {
  const baseClasses = [
    "modal",
    "relative",
    "bg-white",
    "rounded-lg",
    "shadow-xl",
    "transform",
    "transition-all",
    "duration-300",
    "dark:bg-secondary-800",
  ];

  // Size classes
  const sizeClasses = {
    sm: ["max-w-sm"],
    md: ["max-w-md"],
    lg: ["max-w-lg"],
    xl: ["max-w-xl"],
    "2xl": ["max-w-2xl"],
    full: ["max-w-full", "mx-4", "my-4"],
  };

  // Scrollable classes
  if (props.scrollable) {
    baseClasses.push("max-h-screen", "overflow-y-auto");
  }

  return [...baseClasses, ...sizeClasses[props.size]].join(" ");
});

const handleClose = () => {
  if (!props.persistent) {
    isOpen.value = false;
    emit("close");
  }
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.persistent) {
    handleClose();
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closeOnEscape && !props.persistent) {
    handleClose();
  }
};

// Focus management
let previousActiveElement: HTMLElement | null = null;

const trapFocus = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  const modal = document.querySelector(".modal");
  if (!modal) return;

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key === "Tab") {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }
};

// Watch for modal open/close
watch(isOpen, (newValue) => {
  if (newValue) {
    // Store the currently focused element
    previousActiveElement = document.activeElement as HTMLElement;

    // Add event listeners
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", trapFocus);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    emit("open");
  } else {
    // Remove event listeners
    document.removeEventListener("keydown", handleEscape);
    document.removeEventListener("keydown", trapFocus);

    // Restore body scroll
    document.body.style.overflow = "";

    // Restore focus to the previously focused element
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.removeEventListener("keydown", trapFocus);
  document.body.style.overflow = "";
});

// Expose methods for parent components
defineExpose({
  close: handleClose,
});
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm;
}

.modal {
  @apply w-full;
}

.modal-header {
  @apply border-secondary-200 dark:border-secondary-700 flex items-center justify-between border-b px-6 py-4;
}

.modal-title {
  @apply text-secondary-900 text-lg font-semibold dark:text-white;
}

.modal-close {
  @apply text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 focus:ring-primary-500 dark:text-secondary-500 dark:hover:text-secondary-300 dark:hover:bg-secondary-700 rounded-lg p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.modal-content {
  @apply px-6 py-4;
}

.modal-description {
  @apply text-secondary-600 dark:text-secondary-400 mb-4 text-sm;
}

.modal-footer {
  @apply border-secondary-200 dark:border-secondary-700 flex items-center justify-end space-x-3 border-t px-6 py-4;
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* RTL support */
[dir="rtl"] .modal-footer {
  @apply space-x-0 space-x-reverse;
}

[dir="rtl"] .modal-close {
  @apply ml-0 mr-auto;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-overlay {
    @apply p-2;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    @apply px-4;
  }

  .modal-footer {
    @apply flex-col space-x-0 space-y-2;
  }

  .modal-footer > * {
    @apply w-full;
  }
}

/* Focus styles for better accessibility */
.modal-close:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
