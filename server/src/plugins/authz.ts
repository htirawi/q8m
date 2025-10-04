import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { createAuthMiddleware, AuthOptions } from "../middlewares/auth.middleware.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      options?: AuthOptions
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      roles: string | string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    loginFailurePenaltyPreHandler: (
      routeId: string
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authzPlugin: FastifyPluginAsync = async (fastify) => {
  // 1) authenticate: verify JWT/session and attach user to request
  fastify.decorate("authenticate", (options?: AuthOptions) => {
    return createAuthMiddleware(options);
  });

  // 2) requireRole: verify user role membership
  fastify.decorate("requireRole", (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return createAuthMiddleware({ requiredRole: roleArray });
  });

  // 3) loginFailurePenaltyPreHandler: if you already implemented it elsewhere, wire it here;
  // otherwise add a safe no-op to avoid "undefined" during boot.
  fastify.decorate("loginFailurePenaltyPreHandler", (_routeId: string) => {
    return async (_req: FastifyRequest, _reply: FastifyReply) => {
      /* no-op by default; your rate-limit penalty logic can go here */
    };
  });
};

export default authzPlugin;
