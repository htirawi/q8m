import { FastifyRequest, FastifyReply } from "fastify";

// Rate limiting configuration
const RATE_LIMITS = {
  login: { max: 10, timeWindow: "15 minutes" },
  verifyEmail: { max: 5, timeWindow: "15 minutes" },
  passwordReset: { max: 3, timeWindow: "15 minutes" },
  tokenRefresh: { max: 10, timeWindow: "15 minutes" },
};

// Global rate limiting store
declare global {
  var rateLimitStore: Map<string, number>;
}

// Rate limiting middleware factory
export const createRateLimitMiddleware = (type: keyof typeof RATE_LIMITS) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const config = RATE_LIMITS[type];
    const key = `${type}:${request.ip}`;
    
    // Simple in-memory rate limiting store
    // In production, this would use Redis
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const storeKey = `${key}:${windowStart}`;
    
    // Get current count for this window
    const currentCount = global.rateLimitStore.get(storeKey) || 0;
    
    // Check if rate limit exceeded
    if (currentCount >= config.max) {
      const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
      reply.status(429).send({
        code: 429,
        error: "Too Many Requests",
        message: `${type} rate limit exceeded. Retry in ${retryAfter} seconds`,
        retryAfter,
      });
      return;
    }
    
    // Increment counter
    global.rateLimitStore.set(storeKey, currentCount + 1);
    
    // Clean up old entries (simple cleanup)
    if (Math.random() < 0.01) { // 1% chance to clean up
      const cutoff = now - (windowMs * 2);
      for (const [k] of global.rateLimitStore.entries()) {
        const keyTime = parseInt(k.split(':').pop() || '0');
        if (keyTime < cutoff) {
          global.rateLimitStore.delete(k);
        }
      }
    }
    
    request.log.debug({
      message: `${type} rate limit check`,
      ip: request.ip,
      key: storeKey,
      currentCount: currentCount + 1,
      max: config.max,
      timeWindow: config.timeWindow,
    });
  };
};

export default {
  createRateLimitMiddleware,
  RATE_LIMITS,
};
