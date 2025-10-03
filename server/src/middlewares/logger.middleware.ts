import type { FastifyRequest, FastifyReply } from "fastify";

export const requestLogger = async (request: FastifyRequest, reply: FastifyReply) => {
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

  // Log response
  reply.addHook("onSend", async (request, reply, payload) => {
    const responseTime = Date.now() - startTime;

    request.log.info({
      type: "response",
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: reply.getHeader("content-length"),
    });

    return payload;
  });
};
