import type { PlanTier } from "./plan";
import type { OnboardingPreferences } from "./onboarding";

export interface User {
  id: string;
  _id?: string; // Backward compatibility alias for id
  userId?: string; // Another backward compatibility alias
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  permissions: string[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  planTier?: PlanTier;
  planExpiresAt?: Date;
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    plan: PlanTier;
    startedAt?: Date;
    expiresAt?: Date;
  };
  gamification?: {
    level: number;
    totalXP: number;
    currentXP: number;
    xp?: number; // Backward compatibility alias for currentXP
    xpToNextLevel: number;
    streak: number;
    coins: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      earned: boolean;
      earnedAt?: Date;
    }>;
  };
  onboarding?: {
    isCompleted: boolean;
    completedAt?: Date;
    preferences?: OnboardingPreferences;
  };
}

export interface Account {
  _id: string;
  userId: string;
  provider: "google" | "email";
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface VerificationToken {
  _id: string;
  identifier: string; // email
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface OAuthProvider {
  name: "google";
  url: string;
  icon: string;
}
