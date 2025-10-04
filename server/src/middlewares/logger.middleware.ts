import type { FastifyRequest, FastifyReply } from "fastify";

export const requestLogger = async (request: FastifyRequest, _reply: FastifyReply) => {
  const startTime = Date.now();

  // Log request
  request.log.info({
    type: "request",
    method: request.method,
    url: request.url,
    headers: {
      "user-agent": request.headers["user-agent"],
      "content-type": request.headers["content-type"],
      "content-length": request.headers["content-length"],
    },
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  });

  // Store start time on request for response logging
  (request as any).startTime = startTime;
};
