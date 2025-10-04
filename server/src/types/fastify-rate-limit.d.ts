import "fastify";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
  interface RouteConfig {
    rateLimit?: {
      max?: number;
      timeWindow?: string | number;
      hook?: "onRequest" | "preHandler";
      keyGenerator?: (req: FastifyRequest) => string;
    };
  }
  interface RouteShorthandOptions {
    rateLimit?: {
      max?: number;
      timeWindow?: string | number;
      hook?: "onRequest" | "preHandler";
      keyGenerator?: (req: FastifyRequest) => string;
    };
  }
}
