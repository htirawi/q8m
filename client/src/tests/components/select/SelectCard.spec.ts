/**
 * Unit tests for SelectCard component
 */

import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import SelectCard from "@/components/select/SelectCard.vue";
import type { ISelectOption } from "@/types/select";

// Mock router
const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", () => ({
  useRouter: () => mockRouter,
}));

// Mock analytics
vi.mock("@/services/analytics", () => ({
  analytics: {
    track: vi.fn(),
  },
  EventCategory: {
    LevelSelection: "level_selection",
    Conversion: "conversion",
  },
  EventAction: {
    Click: "click",
  },
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      select: {
        cardAriaLabel: "Select {title} level",
        requiresPlan: "Requires {plan} plan",
        progressLabel: "{progress}% complete",
        complete: "complete",
        selected: "✓ Selected",
        choose: "Choose",
        upgrade: "Upgrade",
      },
      levels: {
        junior: {
          title: "Junior",
          subtitle: "Perfect for beginners",
          description: "Master the fundamentals",
          duration: "15-20 mins",
        },
        badgePro: "PRO",
      },
    },
  },
});

describe("SelectCard", () => {
  const baseOption: ISelectOption = {
    id: "junior",
    titleKey: "levels.junior.title",
    subtitleKey: "levels.junior.subtitle",
    descriptionKey: "levels.junior.description",
    durationKey: "levels.junior.duration",
    difficulty: "junior",
    isLocked: false,
  };

  it("should render the card with basic content", () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find(".select-card__title").text()).toBe("Junior");
    expect(wrapper.find(".select-card__subtitle").text()).toBe("Perfect for beginners");
    expect(wrapper.find(".select-card__description").text()).toBe("Master the fundamentals");
    expect(wrapper.find(".meta-text").text()).toBe("15-20 mins");
  });

  it("should show selected state when isSelected is true", () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: true,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.classes()).toContain("select-card--selected");
    expect(wrapper.find(".select-card__cta").text()).toBe("✓ Selected");
  });

  it("should emit select event when clicked", async () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect(wrapper.emitted("select")?.[0]).toEqual(["junior"]);
  });

  it("should emit select event on Enter key press", async () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.trigger("keydown.enter");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect(wrapper.emitted("select")?.[0]).toEqual(["junior"]);
  });

  it("should emit select event on Space key press", async () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.trigger("keydown.space");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect(wrapper.emitted("select")?.[0]).toEqual(["junior"]);
  });

  it("should show locked overlay for locked options", () => {
    const lockedOption: ISelectOption = {
      ...baseOption,
      isLocked: true,
      requiredPlan: "PRO",
    };

    const wrapper = mount(SelectCard, {
      props: {
        option: lockedOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.classes()).toContain("select-card--locked");
    expect(wrapper.find(".select-card__lock-overlay").exists()).toBe(true);
    expect(wrapper.find(".lock-text").text()).toContain("Requires PRO plan");
  });

  it("should not emit select event when locked option is clicked", async () => {
    const lockedOption: ISelectOption = {
      ...baseOption,
      isLocked: true,
    };

    const wrapper = mount(SelectCard, {
      props: {
        option: lockedOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted("select")).toBeFalsy();
  });

  it("should show progress bar when progress is provided", () => {
    const optionWithProgress: ISelectOption = {
      ...baseOption,
      progress: 65,
    };

    const wrapper = mount(SelectCard, {
      props: {
        option: optionWithProgress,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find(".select-card__progress").exists()).toBe(true);
    expect(wrapper.find(".progress-fill").attributes("style")).toContain("width: 65%");
    expect(wrapper.find(".progress-text").text()).toBe("65% complete");
  });

  it("should show badge when provided", () => {
    const optionWithBadge: ISelectOption = {
      ...baseOption,
      badge: {
        textKey: "levels.badgePro",
        variant: "warning",
      },
    };

    const wrapper = mount(SelectCard, {
      props: {
        option: optionWithBadge,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find(".select-card__badge").exists()).toBe(true);
    expect(wrapper.find(".select-card__badge").text()).toBe("PRO");
    expect(wrapper.find(".select-card__badge").classes()).toContain("badge--warning");
  });

  it("should have proper accessibility attributes", () => {
    const wrapper = mount(SelectCard, {
      props: {
        option: baseOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.attributes("role")).toBe("button");
    expect(wrapper.attributes("tabindex")).toBe("0");
    expect(wrapper.attributes("aria-pressed")).toBe("false");
    expect(wrapper.attributes("aria-disabled")).toBe("false");
  });

  it("should have tabindex -1 for locked options", () => {
    const lockedOption: ISelectOption = {
      ...baseOption,
      isLocked: true,
    };

    const wrapper = mount(SelectCard, {
      props: {
        option: lockedOption,
        isSelected: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.attributes("tabindex")).toBe("-1");
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });
});
