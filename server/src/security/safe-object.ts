/**
 * Safe object manipulation utilities to prevent prototype pollution and property injection attacks
 */

const BLOCKED_PROPERTIES = new Set(["__proto__", "prototype", "constructor"]);

/**
 * Check if a property key is safe for assignment
 * @param key - The property key to validate
 * @returns true if the key is safe, false otherwise
 */
export function isSafeKey(key: string): boolean {
  // Only allow alphanumeric characters and underscores
  // Block prototype pollution vectors
  return /^[a-zA-Z0-9_]+$/.test(key) && !BLOCKED_PROPERTIES.has(key);
}

/**
 * Safely assign a property to an object, preventing prototype pollution
 * @param target - The target object to assign to
 * @param key - The property key
 * @param value - The value to assign
 * @returns The target object
 * @throws Error if the key is unsafe or target is not a plain object
 */
export function safeAssign<T extends Record<string, unknown>>(
  target: T,
  key: string,
  value: unknown
): T {
  if (!isSafeKey(key)) {
    throw new Error(`Invalid property key: ${key}`);
  }

  // Prevent pollution by ensuring plain object target
  if (Object.getPrototypeOf(target) !== Object.prototype) {
    throw new Error("Unsafe target object - must be a plain object");
  }

  // Prevent nested property access (e.g., "a.b")
  if (key.includes(".")) {
    throw new Error("Nested property access not allowed");
  }

  (target as Record<string, unknown>)[key] = value;
  return target;
}

/**
 * Create a safe update function with field validation
 * @param allowedFields - Map of allowed field names to their validation functions
 * @returns Function that safely updates an object with validated fields
 */
export function createSafeUpdater<T extends Record<string, unknown>>(
  allowedFields: Record<string, (value: unknown) => unknown>
) {
  return (target: T, userKey: string, rawValue: unknown): T => {
    if (!allowedFields[userKey]) {
      throw new Error(`Unsupported property: ${userKey}`);
    }

    const normalizedValue = allowedFields[userKey](rawValue);
    return safeAssign(target, userKey, normalizedValue);
  };
}

/**
 * Safely update multiple fields on an object
 * @param target - The target object
 * @param updates - Object containing field updates
 * @param allowedFields - Map of allowed field names to their validation functions
 * @returns The updated target object
 */
export function safeUpdateFields<T extends Record<string, unknown>>(
  target: T,
  updates: Record<string, unknown>,
  allowedFields: Record<string, (value: unknown) => unknown>
): T {
  const safeUpdater = createSafeUpdater(allowedFields);

  for (const [key, value] of Object.entries(updates)) {
    safeUpdater(target, key, value);
  }

  return target;
}

/**
 * Common field validators for admin operations
 */
export const adminFieldValidators = {
  displayName: (value: unknown) => {
    const str = String(value);
    if (str.length > 120) {
      throw new Error("Display name too long");
    }
    return str;
  },

  role: (value: unknown) => {
    const role = String(value);
    if (!["admin", "manager", "viewer", "user"].includes(role)) {
      throw new Error("Invalid role");
    }
    return role;
  },

  isActive: (value: unknown) => Boolean(value),

  isEmailVerified: (value: unknown) => Boolean(value),

  entitlements: (value: unknown) => {
    if (!Array.isArray(value)) {
      throw new Error("Entitlements must be an array");
    }
    const validEntitlements = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
    for (const entitlement of value) {
      if (!validEntitlements.includes(String(entitlement))) {
        throw new Error(`Invalid entitlement: ${entitlement}`);
      }
    }
    return value;
  },

  // Question content validators
  questionContent: (value: unknown) => {
    const str = String(value);
    if (str.length > 2000) {
      throw new Error("Question content too long");
    }
    return str;
  },

  explanation: (value: unknown) => {
    const str = String(value);
    if (str.length > 1000) {
      throw new Error("Explanation too long");
    }
    return str;
  },

  difficulty: (value: unknown) => {
    const difficulty = String(value);
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      throw new Error("Invalid difficulty level");
    }
    return difficulty;
  },

  framework: (value: unknown) => {
    const framework = String(value);
    if (!["angular", "react", "nextjs", "redux"].includes(framework)) {
      throw new Error("Invalid framework");
    }
    return framework;
  },

  level: (value: unknown) => {
    const level = String(value);
    if (!["junior", "intermediate", "senior"].includes(level)) {
      throw new Error("Invalid level");
    }
    return level;
  },

  points: (value: unknown) => {
    const points = Number(value);
    if (!Number.isInteger(points) || points < 1 || points > 100) {
      throw new Error("Points must be an integer between 1 and 100");
    }
    return points;
  },
};

/**
 * Validate that an object is a plain object (not an array, Date, etc.)
 * @param obj - The object to validate
 * @returns true if it's a plain object
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.getPrototypeOf(obj) === Object.prototype &&
    !Array.isArray(obj)
  );
}
