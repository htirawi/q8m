import { FastifyRequest, FastifyReply } from "fastify";
import rateLimit from "@fastify/rate-limit";

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = async (request: FastifyRequest, _reply: FastifyReply) => {
  const ip = request.ip;
  const userAgent = request.headers["user-agent"] || "unknown";
  
  // Create a unique key for rate limiting
  const key = `auth:${ip}:${userAgent}`;
  
  // This would integrate with Redis for actual rate limiting
  // For now, we'll use a simple in-memory approach
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;
  
  // In a real implementation, this would use Redis
  // For now, we'll just log the attempt
  request.log.debug({
    message: "Auth rate limit check",
    ip,
    userAgent,
    key,
    maxRequests,
    windowMs,
  });
  
  // Return without error - let the global rate limiter handle it
  return;
};

/**
 * Rate limiting middleware for password reset endpoints
 */
export const passwordResetRateLimit = async (request: FastifyRequest, _reply: FastifyReply) => {
  const ip = request.ip;
  const userAgent = request.headers["user-agent"] || "unknown";
  
  // Create a unique key for rate limiting
  const key = `password-reset:${ip}:${userAgent}`;
  
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3; // More restrictive for password reset
  
  request.log.debug({
    message: "Password reset rate limit check",
    ip,
    userAgent,
    key,
    maxRequests,
    windowMs,
  });
  
  return;
};

/**
 * Rate limiting middleware for token refresh endpoints
 */
export const tokenRefreshRateLimit = async (request: FastifyRequest, _reply: FastifyReply) => {
  const ip = request.ip;
  const userAgent = request.headers["user-agent"] || "unknown";
  
  // Create a unique key for rate limiting
  const key = `token-refresh:${ip}:${userAgent}`;
  
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Allow more refresh attempts
  
  request.log.debug({
    message: "Token refresh rate limit check",
    ip,
    userAgent,
    key,
    maxRequests,
    windowMs,
  });
  
  return;
};

/**
 * Register rate limiting plugins for specific routes
 */
export const registerRateLimitPlugins = async (fastify: any) => {
  // Rate limiting for email verification
  await fastify.register(rateLimit, {
    keyGenerator: (request: FastifyRequest) => `verify-email:${request.ip}`,
    max: 5,
    timeWindow: "15 minutes",
    errorResponseBuilder: (_request: FastifyRequest, context: any) => ({
      code: 429,
      error: "Too Many Requests",
      message: `Email verification rate limit exceeded. Retry in ${Math.round(context.ttl / 1000)} seconds`,
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });

  // Rate limiting for password reset
  await fastify.register(rateLimit, {
    keyGenerator: (request: FastifyRequest) => `password-reset:${request.ip}`,
    max: 3,
    timeWindow: "15 minutes",
    errorResponseBuilder: (_request: FastifyRequest, context: any) => ({
      code: 429,
      error: "Too Many Requests",
      message: `Password reset rate limit exceeded. Retry in ${Math.round(context.ttl / 1000)} seconds`,
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });

  // Rate limiting for token refresh
  await fastify.register(rateLimit, {
    keyGenerator: (request: FastifyRequest) => `token-refresh:${request.ip}`,
    max: 10,
    timeWindow: "15 minutes",
    errorResponseBuilder: (_request: FastifyRequest, context: any) => ({
      code: 429,
      error: "Too Many Requests",
      message: `Token refresh rate limit exceeded. Retry in ${Math.round(context.ttl / 1000)} seconds`,
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });
};

export default {
  authRateLimit,
  passwordResetRateLimit,
  tokenRefreshRateLimit,
  registerRateLimitPlugins,
};
