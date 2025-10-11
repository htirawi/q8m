import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * useDropdown Composable
 * Manages dropdown/popover state with click-outside and keyboard (Escape) handling.
 *
 * @param containerRef - Ref to the dropdown container element
 * @returns Object with isOpen state and toggle/close methods
 *
 * @example
 * const dropdownRef = ref<HTMLElement | null>(null);
 * const { isOpen, toggle, close } = useDropdown(dropdownRef);
 */
export function useDropdown(containerRef: Ref<HTMLElement | null>) {
  const isOpen = ref(false);

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function close() {
    isOpen.value = false;
  }

  function open() {
    isOpen.value = true;
  }

  function handleClickOutside(event: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
      close();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen.value) {
      close();
    }
  }

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleEscape);
  });

  return { isOpen, toggle, close, open };
}
