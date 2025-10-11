/**
 * Session Validation Service
 * Handles session lookup, validation, and user fetching
 */

import type { ISession } from "@models/Session";
import { Session } from "@models/Session.js";
import type { IUser } from "@models/User";
import { User } from "@models/User.js";

export interface SessionValidationResult {
  session: ISession;
  user: IUser;
}

export class SessionValidationService {
  /**
   * Find and validate active session by access token
   */
  async findActiveSession(token: string): Promise<ISession | null> {
    return Session.findActiveByAccessToken(token);
  }

  /**
   * Fetch active user by ID
   */
  async fetchUser(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select("+isEmailVerified");
    if (!user?.isActive) {
      return null;
    }
    return user;
  }

  /**
   * Validate session and fetch user
   */
  async validateSessionAndUser(token: string, userId: string): Promise<SessionValidationResult> {
    // Check if session exists and is valid
    const session = await this.findActiveSession(token);
    if (!session) {
      throw new Error("Session not found or expired");
    }

    // Fetch user from database
    const user = await this.fetchUser(userId);
    if (!user) {
      throw new Error("User not found or inactive");
    }

    return { session, user };
  }

  /**
   * Refresh session last used time
   */
  async refreshSession(session: ISession): Promise<void> {
    await session.refresh();
  }
}

export const sessionValidationService = new SessionValidationService();
