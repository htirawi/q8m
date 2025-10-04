// Proper type definitions to replace any types
export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private';
    showEmail?: boolean;
  };
}

export interface UserStats {
  loginCount?: number;
  lastLogin?: Date;
  totalSessions?: number;
  activeSessions?: number;
  subscriptionCount?: number;
  totalSpent?: number;
}

export interface RefundData {
  amount: number;
  reason: string;
  paymentId: string;
  userId: string;
  timestamp: Date;
}

export interface TokenData {
  token: string;
  userId: string;
  type: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionData {
  userId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  lastUsed: Date;
  isRevoked?: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}

export interface PaymentData {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionData {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  planType: string;
  entitlements: string[];
}

export interface FxRateData {
  from: string;
  to: string;
  rate: number;
  fetchedAt: Date;
  expiresAt: Date;
}

// Generic return types for model methods
export type ModelMethodResult<T> = Promise<T | null>;
export type ModelMethodArrayResult<T> = Promise<T[]>;
export type ModelMethodVoidResult = Promise<void>;

// Specific method return types
export type UserMethodResult = ModelMethodResult<{
  _id: string;
  email: string;
  name: string;
  role: string;
  entitlements: string[];
  isEmailVerified: boolean;
  password?: string;
  loginAttempts?: number;
  lockUntil?: Date;
}>;

export type TokenMethodResult = ModelMethodResult<TokenData>;
export type SessionMethodResult = ModelMethodResult<SessionData>;
export type PaymentMethodResult = ModelMethodResult<PaymentData>;
export type SubscriptionMethodResult = ModelMethodResult<SubscriptionData>;
export type FxRateMethodResult = ModelMethodResult<FxRateData>;

// Logger method signatures with proper types
export interface LoggerMethods {
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}
