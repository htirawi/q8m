import type { IHowItWorksStep } from "@/types/components/home";
import { MapIcon, BookOpenIcon, RocketLaunchIcon } from "@heroicons/vue/24/outline";

/**
 * Homepage "How It Works" Steps
 *
 * A simple 3-step process to explain the product flow.
 * Using Heroicons for professional appearance.
 */
export const HOMEPAGE_STEPS: IHowItWorksStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    icon: MapIcon,
    titleKey: "home.howItWorks.step1.title",
    descriptionKey: "home.howItWorks.step1.description",
  },
  {
    id: "step-2",
    stepNumber: 2,
    icon: BookOpenIcon,
    titleKey: "home.howItWorks.step2.title",
    descriptionKey: "home.howItWorks.step2.description",
  },
  {
    id: "step-3",
    stepNumber: 3,
    icon: RocketLaunchIcon,
    titleKey: "home.howItWorks.step3.title",
    descriptionKey: "home.howItWorks.step3.description",
  },
];
