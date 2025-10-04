import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  const { log, method, url, headers, body } = request;

  // Log error
  (log as any).error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method,
      url,
      headers,
      body,
    },
  });

  // Handle different error types
  if (error instanceof ZodError) {
    return reply.status(400).send({
      code: 400,
      error: "Validation Error",
      message: "Invalid request data",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return reply.status(401).send({
      code: 401,
      error: "Unauthorized",
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return reply.status(401).send({
      code: 401,
      error: "Unauthorized",
      message: "Token expired",
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      code: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded",
    });
  }

  // Handle validation errors
  if (error.statusCode === 400) {
    return reply.status(400).send({
      code: 400,
      error: "Bad Request",
      message: error.message || "Invalid request",
    });
  }

  // Handle authentication errors
  if (error.statusCode === 401) {
    return reply.status(401).send({
      code: 401,
      error: "Unauthorized",
      message: error.message || "Authentication required",
    });
  }

  // Handle authorization errors
  if (error.statusCode === 403) {
    return reply.status(403).send({
      code: 403,
      error: "Forbidden",
      message: error.message || "Access denied",
    });
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return reply.status(404).send({
      code: 404,
      error: "Not Found",
      message: error.message || "Resource not found",
    });
  }

  // Handle internal server errors
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  return reply.status(statusCode).send({
    code: statusCode,
    error: statusCode === 500 ? "Internal Server Error" : error.name,
    message: statusCode === 500 ? "Something went wrong" : message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};
