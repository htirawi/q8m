<template>
  <teleport to="body">
    <transition name="modal" @enter="handleEnter" @leave="handleLeave">
      <div
        v-if="isOpen"
        class="modal-overlay"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click="handleOverlayClick"
        @keydown="handleKeydown"
      >
        <div ref="modalRef" class="modal-container" :class="containerClasses" @click.stop>
          <header v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h2 :id="titleId" class="modal-title">
                {{ title }}
              </h2>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="modal-close"
              :aria-label="$t('a11y.closeModal')"
              @click="handleClose"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <div class="modal-content">
            <div v-if="description" :id="descriptionId" class="modal-description">
              {{ description }}
            </div>
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: "md",
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true,
});

const emit = defineEmits<{
  close: [];
  "update:isOpen": [value: boolean];
}>();

// Refs
const modalRef = ref<HTMLElement>();
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);
const descriptionId = computed(
  () => `modal-description-${Math.random().toString(36).substr(2, 9)}`
);

// Computed properties
const containerClasses = computed(() => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return ["modal-dialog", sizeClasses[props.size]].join(" ");
});

// Methods
const handleClose = () => {
  emit("close");
  emit("update:isOpen", false);
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closeOnEscape) {
    handleClose();
  }
};

const handleEnter = async () => {
  await nextTick();
  if (modalRef.value) {
    modalRef.value.focus();
  }
};

const handleLeave = () => {
  // Focus management handled by the component that opened the modal
};

// Keyboard trap
let focusableElements: HTMLElement[] = [];
let firstFocusableElement: HTMLElement | null = null;
let lastFocusableElement: HTMLElement | null = null;

const trapFocus = (event: KeyboardEvent) => {
  if (!props.isOpen) return;

  if (event.key === "Tab") {
    if (event.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement?.focus();
        event.preventDefault();
      }
    }
  }
};

const updateFocusableElements = () => {
  if (!modalRef.value) return;

  focusableElements = Array.from(
    modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];

  firstFocusableElement = focusableElements[0] || null;
  lastFocusableElement = focusableElements[focusableElements.length - 1] || null;
};

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", trapFocus);
});

onUnmounted(() => {
  document.removeEventListener("keydown", trapFocus);
});

// Watch for modal open to update focusable elements
import { watch } from "vue";

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        updateFocusableElements();
      });
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4;
}

.modal-container {
  @apply max-h-[90vh] w-full overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800;
}

.modal-dialog {
  @apply mx-auto;
}

.modal-header {
  @apply flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300;
}

.modal-content {
  @apply overflow-y-auto p-6;
}

.modal-description {
  @apply mb-4 text-gray-600 dark:text-gray-300;
}

.modal-footer {
  @apply flex justify-end space-x-3 border-t border-gray-200 p-6 dark:border-gray-700;
}

/* Focus styles */
.modal-close:focus {
  @apply ring-primary-500 outline-none ring-2 ring-offset-2 dark:ring-offset-gray-800;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
