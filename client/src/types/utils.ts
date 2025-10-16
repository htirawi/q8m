/**
 * Utility Types
 */

// API Utilities
export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export interface IRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface IHttpClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

// A/B Testing
export interface IABTestResults {
  variantA: {
    conversions: number;
    total: number;
    rate: number;
  };
  variantB: {
    conversions: number;
    total: number;
    rate: number;
  };
  improvement: number;
  confidence: number;
}

export interface IStatisticalSignificance {
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  zScore: number;
}

// Plan Mapping
export interface IPlanIntent {
  planId: string;
  mode: IIntentMode;
  context?: Record<string, unknown>;
}

export type IIntentMode = "upgrade" | "downgrade" | "switch" | "renew";

// Telemetry
export interface ITelemetryEventData {
  userId?: string;
  sessionId?: string;
  timestamp: number;
  properties?: Record<string, unknown>;
  metrics?: Record<string, number>;
}

export type ITelemetryEvent =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "api_call"
  | "error"
  | "performance"
  | string;
