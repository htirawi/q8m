/**
 * Page-specific Component Props & Types
 */

import type { PlanTier } from "@shared/types/plan";

export interface IFrameworkAccessRule {
  framework: string;
  requiredPlanTier: PlanTier;
  isActive: boolean;
  displayName?: string;
  description?: string;
  isLocked?: boolean;
  metadata?: {
    order?: number;
    description?: string;
    icon?: string;
    color?: string;
  };
}
