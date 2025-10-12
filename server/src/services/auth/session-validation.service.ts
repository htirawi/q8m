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
   * Find and validate active session by session ID
   */
  async findActiveSessionById(sessionId: string): Promise<ISession | null> {
    const session = await Session.findById(sessionId);

    // Check if session exists and is valid
    if (!session) {
      return null;
    }

    // Check if session is active and not revoked
    if (!session.isActive || session.isRevoked) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      return null;
    }

    return session;
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
   * Validate session and fetch user using sessionId from JWT payload
   */
  async validateSessionAndUser(sessionId: string, userId: string): Promise<SessionValidationResult> {
    // Check if session exists and is valid
    const session = await this.findActiveSessionById(sessionId);
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
