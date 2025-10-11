/**
 * Entitlement Composable Types
 */

export interface EntitlementGuardOptions {
  requiredEntitlement?: string;
  requiredContentLevel?: string;
  redirectTo?: string;
  showUpgradeModal?: boolean;
}
