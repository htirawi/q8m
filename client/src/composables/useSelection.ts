/**
 * useSelection Composable
 * Manages selection state and validation for the Select page
 */

import { ref, computed } from "vue";
import type { ISelectOption } from "@/types/select";

export function useSelection() {
  const selectedId = ref<string>("");
  const isNavigating = ref(false);

  const hasSelection = computed(() => selectedId.value !== "");

  const isSelected = (optionId: string): boolean => {
    return selectedId.value === optionId;
  };

  const select = (optionId: string, options: ISelectOption[]): void => {
    const option = options.find((opt) => opt.id === optionId);

    // Prevent selecting locked or disabled options
    if (option?.isLocked || option?.disabled) {
      return;
    }

    // Update selection
    selectedId.value = optionId;
  };

  const clearSelection = (): void => {
    selectedId.value = "";
  };

  const getSelectedOption = (options: ISelectOption[]): ISelectOption | null => {
    if (!selectedId.value) return null;
    return options.find((opt) => opt.id === selectedId.value) ?? null;
  };

  const setNavigating = (value: boolean): void => {
    isNavigating.value = value;
  };

  return {
    selectedId,
    isNavigating,
    hasSelection,
    isSelected,
    select,
    clearSelection,
    getSelectedOption,
    setNavigating,
  };
}
