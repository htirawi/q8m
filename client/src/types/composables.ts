/**
 * Composable Return Types
 */

// Re-export from existing composable types
export * from "./composables/checkout";
export * from "./composables/currency";
export * from "./composables/entitlement";
export * from "./composables/error-handler";

// Challenges Composable
export interface IUseChallengesReturn {
  // Add the actual return type structure from useChallenges
  // This will be filled in when we update the composable
  challenges: unknown[];
  loading: boolean;
  error: string | null;
}
