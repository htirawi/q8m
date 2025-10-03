export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  details?: any;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ApiError extends ErrorResponse {
  validationErrors?: ValidationError[];
}

export interface RequestHeaders {
  "Content-Type"?: string;
  Authorization?: string;
  "X-Request-ID"?: string;
  "User-Agent"?: string;
  Accept?: string;
  "Accept-Language"?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: RequestHeaders;
  body?: any;
  query?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: RequestHeaders;
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requiresAuth?: boolean;
  requiresRole?: string;
  rateLimit?: {
    max: number;
    window: string;
  };
}

export interface WebhookPayload {
  eventType: string;
  timestamp: Date;
  data: any;
  signature?: string;
  idempotencyKey?: string;
}

export interface AuditLog {
  _id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
