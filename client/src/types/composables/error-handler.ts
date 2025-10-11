/**
 * Error Handler Composable Types
 */

export interface ErrorDetails {
  stack?: string;
  cause?: Error;
  statusCode?: number;
  response?: Record<string, string | number | boolean>;
  [key: string]:
    | string
    | number
    | boolean
    | Error
    | Record<string, string | number | boolean>
    | undefined;
}

export interface ErrorState {
  message: string | null;
  code: string | null;
  details: ErrorDetails | null;
  timestamp: number | null;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  showDetails?: boolean;
}
