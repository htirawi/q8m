import { authenticate } from "@middlewares/auth.middleware.js";
import { User } from "@models/User.js";
import { ipKey } from "@server/security/rateLimit.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Validation schemas
const onboardingSchema = z.object({
  preferences: z.object({
    goal: z.enum(["get-job", "learn-framework", "interview-prep", "skill-improvement", "certification"]),
    experienceLevel: z.enum(["junior", "mid", "senior"]),
    frameworks: z.array(
      z.enum(["react", "vue", "angular", "nextjs", "redux", "typescript", "javascript", "node", "express"])
    ).min(1, "At least one framework is required"),
    dailyGoal: z.number().min(5).max(480).optional(), // 5 minutes to 8 hours
    availableDaysPerWeek: z.number().min(1).max(7).optional(),
    preferredStudyTime: z.enum(["morning", "afternoon", "evening", "night"]).optional(),
  }),
});

export default async function usersRoutes(fastify: FastifyInstance) {
  // Save onboarding preferences
  fastify.post(
    "/onboarding",
    {
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
      schema: {
        body: zodToJsonSchema(onboardingSchema),
      },
    },
    async (request, reply) => {
      try {
        const { authUser } = request;
        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        const { preferences } = request.body as z.infer<typeof onboardingSchema>;

        // Update user with onboarding data
        const user = await User.findByIdAndUpdate(
          authUser.id,
          {
            $set: {
              "onboarding.isCompleted": true,
              "onboarding.completedAt": new Date(),
              "onboarding.preferences": preferences,
            },
          },
          { new: true }
        );

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          message: "Onboarding completed successfully",
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            onboarding: user.onboarding,
          },
        });
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to save onboarding preferences",
          message: "Onboarding error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to save onboarding preferences",
        });
      }
    }
  );

  // Get user onboarding status
  fastify.get(
    "/onboarding",
    {
      rateLimit: {
        max: 100,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { authUser } = request;
        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        const user = await User.findById(authUser.id).select("onboarding");
        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          onboarding: user.onboarding || {
            isCompleted: false,
          },
        });
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to get onboarding status",
          message: "Get onboarding error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to get onboarding status",
        });
      }
    }
  );

  // Skip onboarding (mark as completed without preferences)
  fastify.post(
    "/onboarding/skip",
    {
      rateLimit: {
        max: 10,
        timeWindow: "15m",
        hook: "onRequest",
        keyGenerator: ipKey,
      },
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15m",
          hook: "onRequest",
          keyGenerator: ipKey,
        },
      },
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { authUser } = request;
        if (!authUser) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "User not authenticated",
          });
        }

        const user = await User.findByIdAndUpdate(
          authUser.id,
          {
            $set: {
              "onboarding.isCompleted": true,
              "onboarding.completedAt": new Date(),
            },
          },
          { new: true }
        );

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          message: "Onboarding skipped",
          user: {
            id: user._id.toString(),
            onboarding: user.onboarding,
          },
        });
      } catch (error: unknown) {
        request.log.error({
          error: error instanceof Error ? error.message : "Failed to skip onboarding",
          message: "Skip onboarding error",
        });
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to skip onboarding",
        });
      }
    }
  );
}
