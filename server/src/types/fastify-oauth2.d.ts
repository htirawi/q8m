import "@fastify/oauth2";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: {
      getAccessTokenFromAuthorizationCodeFlow(
        request: FastifyRequest
      ): Promise<{
        access_token: string;
        token_type: string;
        expires_in?: number;
        refresh_token?: string;
        scope?: string;
      }>;
    };
  }
}
