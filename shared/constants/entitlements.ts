export const ENTITLEMENTS = {
  JUNIOR: {
    id: "JUNIOR",
    name: "Junior",
    level: 1,
    features: ["basic_questions", "multiple_choice_quiz", "progress_tracking", "mobile_access"],
    maxQuestions: 100,
    timeLimit: 30, // minutes
    price: 0,
    currency: "USD",
  },
  INTERMEDIATE: {
    id: "INTERMEDIATE",
    name: "Intermediate",
    level: 2,
    features: [
      "advanced_questions",
      "all_question_types",
      "detailed_explanations",
      "performance_analytics",
      "bookmarks_notes",
      "priority_support",
    ],
    maxQuestions: 300,
    timeLimit: 60, // minutes
    price: 29,
    currency: "USD",
  },
  SENIOR: {
    id: "SENIOR",
    name: "Senior",
    level: 3,
    features: [
      "expert_questions",
      "system_design_questions",
      "mock_interviews",
      "advanced_analytics",
      "custom_study_plans",
      "expert_reviews",
      "priority_support",
    ],
    maxQuestions: 500,
    timeLimit: 90, // minutes
    price: 49,
    currency: "USD",
  },
  BUNDLE: {
    id: "BUNDLE",
    name: "Bundle",
    level: 4,
    features: [
      "everything_intermediate",
      "everything_senior",
      "lifetime_access",
      "future_updates",
      "personal_mentor",
      "interview_coaching",
      "resume_review",
      "premium_support",
    ],
    maxQuestions: -1, // unlimited
    timeLimit: -1, // unlimited
    price: 69,
    currency: "USD",
  },
} as const;

export const ENTITLEMENT_LEVELS = {
  JUNIOR: 1,
  INTERMEDIATE: 2,
  SENIOR: 3,
  BUNDLE: 4,
} as const;

export const ENTITLEMENT_FEATURES = {
  // Basic features (all tiers)
  basic_questions: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
  multiple_choice_quiz: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
  progress_tracking: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
  mobile_access: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],

  // Advanced features (paid tiers)
  advanced_questions: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
  all_question_types: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
  detailed_explanations: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
  performance_analytics: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
  bookmarks_notes: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
  priority_support: ["INTERMEDIATE", "SENIOR", "BUNDLE"],

  // Expert features (senior+ tiers)
  expert_questions: ["SENIOR", "BUNDLE"],
  system_design_questions: ["SENIOR", "BUNDLE"],
  mock_interviews: ["SENIOR", "BUNDLE"],
  advanced_analytics: ["SENIOR", "BUNDLE"],
  custom_study_plans: ["SENIOR", "BUNDLE"],
  expert_reviews: ["SENIOR", "BUNDLE"],

  // Premium features (bundle only)
  lifetime_access: ["BUNDLE"],
  future_updates: ["BUNDLE"],
  personal_mentor: ["BUNDLE"],
  interview_coaching: ["BUNDLE"],
  resume_review: ["BUNDLE"],
  premium_support: ["BUNDLE"],
} as const;

export const SUPPORTED_ENTITLEMENTS = Object.keys(ENTITLEMENTS) as Array<keyof typeof ENTITLEMENTS>;

export const FREE_ENTITLEMENTS = ["JUNIOR"] as const;
export const PAID_ENTITLEMENTS = ["INTERMEDIATE", "SENIOR", "BUNDLE"] as const;

export type EntitlementId = keyof typeof ENTITLEMENTS;

export const hasEntitlement = (
  userEntitlements: string[],
  requiredEntitlement: EntitlementId
): boolean => {
  return userEntitlements.includes(requiredEntitlement);
};

export const hasFeature = (
  userEntitlements: string[],
  feature: keyof typeof ENTITLEMENT_FEATURES
): boolean => {
  const featureEntitlements = ENTITLEMENT_FEATURES[feature];
  return userEntitlements.some((entitlement) =>
    featureEntitlements.includes(entitlement as EntitlementId)
  );
};

export const getEntitlementLevel = (entitlement: EntitlementId): number => {
  return ENTITLEMENTS[entitlement].level;
};

export const canAccessFeature = (
  userEntitlements: string[],
  feature: keyof typeof ENTITLEMENT_FEATURES
): boolean => {
  return hasFeature(userEntitlements, feature);
};

export const getUpgradeOptions = (currentEntitlements: string[]): EntitlementId[] => {
  const currentLevel = Math.max(
    ...currentEntitlements.map((ent) => ENTITLEMENTS[ent as EntitlementId]?.level || 0)
  );

  return Object.keys(ENTITLEMENTS).filter((entitlement) => {
    const entitlementLevel = ENTITLEMENTS[entitlement as EntitlementId].level;
    return entitlementLevel > currentLevel;
  }) as EntitlementId[];
};

export const getDowngradeOptions = (currentEntitlements: string[]): EntitlementId[] => {
  const currentLevel = Math.max(
    ...currentEntitlements.map((ent) => ENTITLEMENTS[ent as EntitlementId]?.level || 0)
  );

  return Object.keys(ENTITLEMENTS).filter((entitlement) => {
    const entitlementLevel = ENTITLEMENTS[entitlement as EntitlementId].level;
    return entitlementLevel < currentLevel;
  }) as EntitlementId[];
};
