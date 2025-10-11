import "fastify";
import type { AuthOptions } from "@middlewares/auth.middleware";
import type { FastifyReply, FastifyRequest } from "fastify";


declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      options?: AuthOptions
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      roles: string[] | ReadonlyArray<string>
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    loginFailurePenaltyPreHandler: (
      routeId: string
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
