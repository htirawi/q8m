/**
 * Unit tests for useSelection composable
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useSelection } from "@/composables/useSelection";
import type { ISelectOption } from "@/types/select";

describe("useSelection", () => {
  let selection: ReturnType<typeof useSelection>;
  let mockOptions: ISelectOption[];

  beforeEach(() => {
    selection = useSelection();
    mockOptions = [
      {
        id: "junior",
        titleKey: "levels.junior.title",
        subtitleKey: "levels.junior.subtitle",
        descriptionKey: "levels.junior.description",
        durationKey: "levels.junior.duration",
        difficulty: "junior",
        isLocked: false,
      },
      {
        id: "intermediate",
        titleKey: "levels.intermediate.title",
        subtitleKey: "levels.intermediate.subtitle",
        descriptionKey: "levels.intermediate.description",
        durationKey: "levels.intermediate.duration",
        difficulty: "intermediate",
        isLocked: true,
      },
      {
        id: "senior",
        titleKey: "levels.senior.title",
        subtitleKey: "levels.senior.subtitle",
        descriptionKey: "levels.senior.description",
        durationKey: "levels.senior.duration",
        difficulty: "senior",
        disabled: true,
      },
    ];
  });

  describe("initial state", () => {
    it("should have no selection initially", () => {
      expect(selection.selectedId.value).toBe("");
      expect(selection.hasSelection.value).toBe(false);
    });

    it("should not be navigating initially", () => {
      expect(selection.isNavigating.value).toBe(false);
    });
  });

  describe("select", () => {
    it("should select an unlocked option", () => {
      selection.select("junior", mockOptions);
      expect(selection.selectedId.value).toBe("junior");
      expect(selection.hasSelection.value).toBe(true);
    });

    it("should not select a locked option", () => {
      selection.select("intermediate", mockOptions);
      expect(selection.selectedId.value).toBe("");
      expect(selection.hasSelection.value).toBe(false);
    });

    it("should not select a disabled option", () => {
      selection.select("senior", mockOptions);
      expect(selection.selectedId.value).toBe("");
      expect(selection.hasSelection.value).toBe(false);
    });

    it("should change selection when selecting a different option", () => {
      selection.select("junior", mockOptions);
      expect(selection.selectedId.value).toBe("junior");

      // Add another unlocked option
      mockOptions.push({
        id: "custom",
        titleKey: "levels.custom.title",
        subtitleKey: "levels.custom.subtitle",
        descriptionKey: "levels.custom.description",
        durationKey: "levels.custom.duration",
        difficulty: "custom",
        isLocked: false,
      });

      selection.select("custom", mockOptions);
      expect(selection.selectedId.value).toBe("custom");
    });
  });

  describe("isSelected", () => {
    it("should return true for the selected option", () => {
      selection.select("junior", mockOptions);
      expect(selection.isSelected("junior")).toBe(true);
    });

    it("should return false for non-selected options", () => {
      selection.select("junior", mockOptions);
      expect(selection.isSelected("intermediate")).toBe(false);
      expect(selection.isSelected("senior")).toBe(false);
    });
  });

  describe("clearSelection", () => {
    it("should clear the current selection", () => {
      selection.select("junior", mockOptions);
      expect(selection.hasSelection.value).toBe(true);

      selection.clearSelection();
      expect(selection.selectedId.value).toBe("");
      expect(selection.hasSelection.value).toBe(false);
    });
  });

  describe("getSelectedOption", () => {
    it("should return the selected option object", () => {
      selection.select("junior", mockOptions);
      const selectedOption = selection.getSelectedOption(mockOptions);

      expect(selectedOption).toBeDefined();
      expect(selectedOption?.id).toBe("junior");
      expect(selectedOption?.difficulty).toBe("junior");
    });

    it("should return null when no selection", () => {
      const selectedOption = selection.getSelectedOption(mockOptions);
      expect(selectedOption).toBeNull();
    });

    it("should return null if selected ID does not exist in options", () => {
      // Manually set an invalid ID (bypassing select method)
      selection.selectedId.value = "nonexistent";
      const selectedOption = selection.getSelectedOption(mockOptions);
      expect(selectedOption).toBeNull();
    });
  });

  describe("setNavigating", () => {
    it("should set navigating state to true", () => {
      selection.setNavigating(true);
      expect(selection.isNavigating.value).toBe(true);
    });

    it("should set navigating state to false", () => {
      selection.setNavigating(true);
      selection.setNavigating(false);
      expect(selection.isNavigating.value).toBe(false);
    });
  });
});
