import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FeatureCard from "@/components/ui/FeatureCard.vue";
import type { IFeature } from "@/types/components/home";
import { BoltIcon } from "@heroicons/vue/24/outline";
import { defineComponent, h } from "vue";

// Mock i18n
const mockT = (key: string) => key;

// Mock icon component for testing
const MockIcon = defineComponent({
  name: "MockIcon",
  render() {
    return h("svg", { class: "mock-icon" }, "Icon");
  },
});

const createWrapper = (feature: IFeature) => {
  return mount(FeatureCard, {
    props: {
      feature,
    },
    global: {
      mocks: {
        $t: mockT,
        t: mockT,
      },
      stubs: {
        useI18n: () => ({ t: mockT }),
      },
    },
  });
};

describe("FeatureCard", () => {
  const mockFeature: IFeature = {
    id: "test-feature",
    icon: MockIcon,
    titleKey: "home.features.interactive.title",
    bodyKey: "home.features.interactive.body",
  };

  it("renders feature icon component", () => {
    const wrapper = createWrapper(mockFeature);
    expect(wrapper.find(".feature-card__icon").exists()).toBe(true);
  });

  it("renders feature title from i18n key", () => {
    const wrapper = createWrapper(mockFeature);
    expect(wrapper.text()).toContain("home.features.interactive.title");
  });

  it("renders feature body from i18n key", () => {
    const wrapper = createWrapper(mockFeature);
    expect(wrapper.text()).toContain("home.features.interactive.body");
  });

  it("applies correct data attribute", () => {
    const wrapper = createWrapper(mockFeature);
    const article = wrapper.find("article");
    expect(article.attributes("data-feature-id")).toBe("test-feature");
  });

  it("has proper article semantic HTML", () => {
    const wrapper = createWrapper(mockFeature);
    expect(wrapper.find("article").exists()).toBe(true);
    expect(wrapper.find("h3").exists()).toBe(true);
    expect(wrapper.find("p").exists()).toBe(true);
  });

  it("icon component has aria-hidden attribute", () => {
    const wrapper = createWrapper(mockFeature);
    const icon = wrapper.find(".feature-card__icon");
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("uses real Heroicon in production", () => {
    const featureWithHeroicon: IFeature = {
      id: "real-feature",
      icon: BoltIcon,
      titleKey: "home.features.interactive.title",
      bodyKey: "home.features.interactive.body",
    };
    const wrapper = createWrapper(featureWithHeroicon);
    expect(wrapper.find("svg").exists()).toBe(true);
  });
});
