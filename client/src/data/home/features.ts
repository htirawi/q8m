import type { IFeature } from "@/types/components/home";
import {
  BoltIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  TrophyIcon,
} from "@heroicons/vue/24/outline";

/**
 * Homepage Features Data
 *
 * Key value propositions displayed in the features grid section.
 * Using Heroicons for professional, consistent appearance.
 */
export const HOMEPAGE_FEATURES: IFeature[] = [
  {
    id: "feature-1",
    icon: BoltIcon,
    titleKey: "home.features.interactive.title",
    bodyKey: "home.features.interactive.body",
  },
  {
    id: "feature-2",
    icon: CheckBadgeIcon,
    titleKey: "home.features.curated.title",
    bodyKey: "home.features.curated.body",
  },
  {
    id: "feature-3",
    icon: ChartBarIcon,
    titleKey: "home.features.analytics.title",
    bodyKey: "home.features.analytics.body",
  },
  {
    id: "feature-4",
    icon: CpuChipIcon,
    titleKey: "home.features.ai.title",
    bodyKey: "home.features.ai.body",
  },
  {
    id: "feature-5",
    icon: GlobeAltIcon,
    titleKey: "home.features.multilang.title",
    bodyKey: "home.features.multilang.body",
  },
  {
    id: "feature-6",
    icon: TrophyIcon,
    titleKey: "home.features.gamification.title",
    bodyKey: "home.features.gamification.body",
  },
];
