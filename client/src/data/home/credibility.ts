import type { ICredibilityLogo } from "@/types/components/home";
import { FRAMEWORK_ICONS } from "@/utils/frameworkIcons";

/**
 * Homepage Credibility Logos
 *
 * Tech stacks and frameworks supported by q8m.
 * Using actual SVG brand logos for professional appearance.
 */
export const HOMEPAGE_CREDIBILITY: ICredibilityLogo[] = [
  {
    id: "cred-1",
    name: "React",
    logoUrl: FRAMEWORK_ICONS.react,
    altKey: "home.credibility.react.alt",
  },
  {
    id: "cred-2",
    name: "Vue.js",
    logoUrl: FRAMEWORK_ICONS.vue,
    altKey: "home.credibility.vue.alt",
  },
  {
    id: "cred-3",
    name: "Angular",
    logoUrl: FRAMEWORK_ICONS.angular,
    altKey: "home.credibility.angular.alt",
  },
  {
    id: "cred-4",
    name: "Next.js",
    logoUrl: FRAMEWORK_ICONS.nextjs,
    altKey: "home.credibility.nextjs.alt",
  },
  {
    id: "cred-5",
    name: "Redux",
    logoUrl: FRAMEWORK_ICONS.redux,
    altKey: "home.credibility.redux.alt",
  },
  {
    id: "cred-6",
    name: "Svelte",
    logoUrl: FRAMEWORK_ICONS.svelte,
    altKey: "home.credibility.svelte.alt",
  },
  {
    id: "cred-7",
    name: "TypeScript",
    logoUrl: FRAMEWORK_ICONS.typescript,
    altKey: "home.credibility.typescript.alt",
  },
];
