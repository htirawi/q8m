/**
 * Authorization Service
 * Handles role-based and entitlement-based authorization checks
 */

import type { IUser } from "@models/User";

export class AuthorizationService {
  /**
   * Check if user has required email verification
   */
  checkEmailVerification(user: IUser, required: boolean): boolean {
    if (required && !user.isEmailVerified) {
      return false;
    }
    return true;
  }

  /**
   * Check if user has required role
   */
  checkRole(user: IUser, requiredRoles?: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    return requiredRoles.includes(user.role);
  }

  /**
   * Check if user has required entitlements
   */
  checkEntitlements(user: IUser, requiredEntitlements?: string[]): boolean {
    if (!requiredEntitlements || requiredEntitlements.length === 0) {
      return true;
    }
    return requiredEntitlements.every((entitlement) => user.entitlements.includes(entitlement));
  }

  /**
   * Perform all authorization checks
   */
  authorize(
    user: IUser,
    options: {
      requireEmailVerification?: boolean;
      requiredRole?: string[];
      requiredEntitlements?: string[];
    }
  ): { authorized: boolean; reason?: string } {
    // Check email verification
    if (!this.checkEmailVerification(user, options.requireEmailVerification || false)) {
      return { authorized: false, reason: "Email verification required" };
    }

    // Check role requirements
    if (!this.checkRole(user, options.requiredRole)) {
      return { authorized: false, reason: "Insufficient permissions" };
    }

    // Check entitlement requirements
    if (!this.checkEntitlements(user, options.requiredEntitlements)) {
      return { authorized: false, reason: "Insufficient entitlements" };
    }

    return { authorized: true };
  }
}

export const authorizationService = new AuthorizationService();
