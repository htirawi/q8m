import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HomeCredibility from "@/features/home/components/HomeCredibility.vue";
import type { ICredibilityLogo } from "@/types/components/home";

const mockT = (key: string) => key;

const createWrapper = (logos?: ICredibilityLogo[]) => {
  return mount(HomeCredibility, {
    props: logos ? { logos } : {},
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

describe("HomeCredibility", () => {
  it("renders section with proper landmarks", () => {
    const wrapper = createWrapper();
    expect(wrapper.find("section").exists()).toBe(true);
    expect(wrapper.find("section").attributes("aria-labelledby")).toBe("credibility-title");
  });

  it("renders title when titleKey prop is provided", () => {
    const wrapper = createWrapper();
    expect(wrapper.find("h2").exists()).toBe(true);
  });

  it("renders all logos", () => {
    const mockLogos: ICredibilityLogo[] = [
      { id: "logo-1", name: "React", icon: "⚛️", altKey: "home.credibility.react.alt" },
      { id: "logo-2", name: "Vue", icon: "💚", altKey: "home.credibility.vue.alt" },
    ];

    const wrapper = createWrapper(mockLogos);
    const logoElements = wrapper.findAll(".credibility-logo");
    expect(logoElements).toHaveLength(2);
  });

  it("renders logo icons correctly", () => {
    const mockLogos: ICredibilityLogo[] = [
      { id: "logo-1", name: "React", icon: "⚛️", altKey: "home.credibility.react.alt" },
    ];

    const wrapper = createWrapper(mockLogos);
    expect(wrapper.text()).toContain("⚛️");
    expect(wrapper.text()).toContain("React");
  });

  it("applies correct aria-labels", () => {
    const mockLogos: ICredibilityLogo[] = [
      { id: "logo-1", name: "React", icon: "⚛️", altKey: "home.credibility.react.alt" },
    ];

    const wrapper = createWrapper(mockLogos);
    const logo = wrapper.find(".credibility-logo");
    expect(logo.attributes("aria-label")).toBe("home.credibility.react.alt");
  });
});
