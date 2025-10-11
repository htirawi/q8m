/**
 * Type declarations for external modules without types
 */

declare module '@fastify/rate-limit' {
  import type { FastifyPluginCallback } from 'fastify';

  export interface FastifyRateLimitOptions {
    global?: boolean;
    max?: number | ((req: any, key: string) => number | Promise<number>);
    timeWindow?: string | number;
    cache?: number;
    allowList?: string[] | ((req: any, key: string) => boolean | Promise<boolean>);
    continueExceeding?: boolean;
    skipOnError?: boolean;
    ban?: number;
    hook?: string;
    onBanReach?: (req: any, key: string) => void;
    onExceeding?: (req: any) => void;
    onExceeded?: (req: any) => void;
    keyGenerator?: (req: any) => string | number | Promise<string | number>;
    errorResponseBuilder?: (req: any, context: any) => any;
    enableDraftSpec?: boolean;
    addHeadersOnExceeding?: boolean | {
      'x-ratelimit-limit'?: boolean;
      'x-ratelimit-remaining'?: boolean;
      'x-ratelimit-reset'?: boolean;
    };
    addHeaders?: boolean | {
      'x-ratelimit-limit'?: boolean;
      'x-ratelimit-remaining'?: boolean;
      'x-ratelimit-reset'?: boolean;
      'retry-after'?: boolean;
    };
  }

  const fastifyRateLimit: FastifyPluginCallback<FastifyRateLimitOptions>;
  export default fastifyRateLimit;
}

declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    class PayPalHttpClient {
      constructor(environment: PayPalEnvironment);
      execute(request: any): Promise<any>;
    }
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class PayPalHttpRequest {
      constructor(path: string);
      requestBody(body: any): void;
      verb: string;
      path: string;
      headers: Record<string, string>;
    }
    interface PayPalEnvironment {
      authorizationString?(): string;
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      constructor();
      prefer(preferenceType: string): OrdersCreateRequest;
      requestBody(body: any): void;
      headers: Record<string, string>;
    }
    class OrdersCaptureRequest {
      constructor(orderId: string);
      prefer(preferenceType: string): OrdersCaptureRequest;
      requestBody(body: any): void;
      headers: Record<string, string>;
    }
    class OrdersGetRequest {
      constructor(orderId: string);
      headers: Record<string, string>;
    }
  }

  export namespace payments {
    class CapturesRefundRequest {
      constructor(captureId: string);
      requestBody(body: any): void;
    }
  }
}

declare module 'paypal-rest-sdk' {
  export function configure(options: {
    mode: string;
    client_id: string;
    client_secret: string;
  }): void;

  export const payment: {
    create(
      data: any,
      callback: (error: any, payment: any) => void
    ): void;
    execute(
      paymentId: string,
      data: any,
      callback: (error: any, payment: any) => void
    ): void;
    get(
      paymentId: string,
      callback: (error: any, payment: any) => void
    ): void;
  };

  export default {
    configure,
    payment,
  };
}
