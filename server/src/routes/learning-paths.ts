/**
 * Learning Paths API Routes
 * Endpoints for learning path browsing, enrollment, progress tracking, and certificates
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import mongoose from 'mongoose';

import { LearningPath } from '../models/LearningPath';
import { PathEnrollment } from '../models/PathEnrollment';
import { User } from '../models/User';

export default async function learningPathRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/learning-paths
   * List all published learning paths with optional filters
   */
  fastify.get(
    '/',
    {
      schema: {
        description: 'List all published learning paths',
        tags: ['learning-paths'],
        querystring: zodToJsonSchema(
          z.object({
            category: z
              .enum([
                'frontend',
                'backend',
                'fullstack',
                'interview',
                'framework-specific',
                'role-based',
              ])
              .optional(),
            difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).optional(),
            framework: z.string().optional(),
            isPremium: z.coerce.boolean().optional(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              paths: z.array(
                z.object({
                  _id: z.string(),
                  title: z.object({
                    en: z.string(),
                    ar: z.string(),
                  }),
                  description: z.object({
                    en: z.string(),
                    ar: z.string(),
                  }),
                  slug: z.string(),
                  category: z.string(),
                  difficulty: z.string(),
                  frameworks: z.array(z.string()),
                  totalQuestions: z.number(),
                  estimatedHours: z.number(),
                  tags: z.array(z.string()),
                  thumbnail: z.string().optional(),
                  isPremium: z.boolean(),
                  enrollmentCount: z.number(),
                  completionCount: z.number(),
                  rating: z.number().optional(),
                })
              ),
              total: z.number(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const { category, difficulty, framework, isPremium } = request.query as {
          category?: string;
          difficulty?: string;
          framework?: string;
          isPremium?: boolean;
        };

        const filter: Record<string, unknown> = { isPublished: true };

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (framework) filter.frameworks = framework;
        if (isPremium !== undefined) filter.isPremium = isPremium;

        const paths = await LearningPath.find(filter)
          .select('-modules.questionIds -createdBy')
          .sort({ enrollmentCount: -1, rating: -1 });

        reply.send({
          paths: paths.map((p: typeof paths[0]) => p.toJSON()),
          total: paths.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch learning paths',
        });
      }
    }
  );

  /**
   * GET /api/v1/learning-paths/:slug
   * Get detailed information about a specific learning path
   */
  fastify.get(
    '/:slug',
    {
      schema: {
        description: 'Get detailed learning path information',
        tags: ['learning-paths'],
        params: zodToJsonSchema(
          z.object({
            slug: z.string(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              path: z.object({
                _id: z.string(),
                title: z.object({ en: z.string(), ar: z.string() }),
                description: z.object({ en: z.string(), ar: z.string() }),
                slug: z.string(),
                category: z.string(),
                difficulty: z.string(),
                frameworks: z.array(z.string()),
                modules: z.array(
                  z.object({
                    moduleId: z.string(),
                    title: z.object({ en: z.string(), ar: z.string() }),
                    description: z.object({ en: z.string(), ar: z.string() }),
                    order: z.number(),
                    estimatedMinutes: z.number(),
                    prerequisites: z.array(z.string()),
                    isLocked: z.boolean(),
                  })
                ),
                totalQuestions: z.number(),
                estimatedHours: z.number(),
                prerequisites: z.array(z.string()),
                tags: z.array(z.string()),
                thumbnail: z.string().optional(),
                isPremium: z.boolean(),
                enrollmentCount: z.number(),
                completionCount: z.number(),
                rating: z.number().optional(),
              }),
              isEnrolled: z.boolean(),
              enrollment: z
                .object({
                  _id: z.string(),
                  status: z.string(),
                  progress: z.number(),
                  moduleProgress: z.array(z.unknown()),
                  currentModuleId: z.string().optional(),
                })
                .optional(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const { slug } = request.params as { slug: string };
        const userId = request.authUser?.id;

        const path = await LearningPath.findOne({ slug, isPublished: true }).select(
          '-modules.questionIds'
        );

        if (!path) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Learning path not found',
          });
        }

        let enrollment;
        let isEnrolled = false;

        if (userId) {
          enrollment = await PathEnrollment.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            pathId: path._id,
          });
          isEnrolled = !!enrollment;
        }

        reply.send({
          path: path.toJSON(),
          isEnrolled,
          enrollment: enrollment?.toJSON(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch learning path',
        });
      }
    }
  );

  /**
   * GET /api/v1/learning-paths/my/enrollments
   * Get all learning paths the current user is enrolled in
   */
  fastify.get(
    '/my/enrollments',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get user enrollments',
        tags: ['learning-paths'],
        querystring: zodToJsonSchema(
          z.object({
            status: z.enum(['in-progress', 'completed', 'abandoned']).optional(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              enrollments: z.array(
                z.object({
                  _id: z.string(),
                  pathId: z.string(),
                  status: z.string(),
                  progress: z.number(),
                  currentModuleId: z.string().optional(),
                  startedAt: z.string(),
                  completedAt: z.string().optional(),
                  lastActivityAt: z.string(),
                  totalTimeSpent: z.number(),
                  certificateIssued: z.boolean(),
                  path: z.object({
                    title: z.object({ en: z.string(), ar: z.string() }),
                    slug: z.string(),
                    difficulty: z.string(),
                    thumbnail: z.string().optional(),
                    estimatedHours: z.number(),
                  }),
                })
              ),
              total: z.number(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { status } = request.query as { status?: string };

        const filter: Record<string, unknown> = {
          userId: new mongoose.Types.ObjectId(userId),
        };

        if (status) filter.status = status;

        const enrollments = await PathEnrollment.find(filter)
          .populate('pathId', 'title slug difficulty thumbnail estimatedHours')
          .sort({ lastActivityAt: -1 });

        reply.send({
          enrollments: enrollments.map((e: typeof enrollments[0]) => {
            const enrollment = e.toJSON();
            return {
              ...enrollment,
              path: enrollment.pathId,
              pathId: String(e.pathId._id),
            };
          }),
          total: enrollments.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch enrollments',
        });
      }
    }
  );

  /**
   * POST /api/v1/learning-paths/:pathId/enroll
   * Enroll user in a learning path
   */
  fastify.post(
    '/:pathId/enroll',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Enroll in a learning path',
        tags: ['learning-paths'],
        params: zodToJsonSchema(
          z.object({
            pathId: z.string(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              success: z.boolean(),
              enrollment: z.object({
                _id: z.string(),
                pathId: z.string(),
                status: z.string(),
                progress: z.number(),
                moduleProgress: z.array(z.unknown()),
                currentModuleId: z.string().optional(),
                startedAt: z.string(),
              }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { pathId } = request.params as { pathId: string };

        const path = await LearningPath.findById(pathId);

        if (!path) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Learning path not found',
          });
        }

        if (!path.isPublished) {
          return reply.status(403).send({
            code: 403,
            error: 'Forbidden',
            message: 'This learning path is not available',
          });
        }

        // Check if already enrolled
        const existingEnrollment = await PathEnrollment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          pathId: new mongoose.Types.ObjectId(pathId),
        });

        if (existingEnrollment) {
          return reply.send({
            success: true,
            enrollment: existingEnrollment.toJSON(),
          });
        }

        // Check premium access
        if (path.isPremium) {
          const user = await User.findById(userId);
          if (!user || !user.subscription?.isActive) {
            return reply.status(403).send({
              code: 403,
              error: 'Forbidden',
              message: 'Premium subscription required',
            });
          }
        }

        // Initialize module progress
        const moduleProgress = path.modules.map((module: typeof path.modules[0]) => ({
          moduleId: module.moduleId,
          isCompleted: false,
          questionsCompleted: 0,
          totalQuestions: module.questionIds.length,
        }));

        // Find first unlocked module
        const firstModule = path.modules.find((m: typeof path.modules[0]) => !m.isLocked);

        // Create enrollment
        const enrollment = await PathEnrollment.create({
          userId: new mongoose.Types.ObjectId(userId),
          pathId: new mongoose.Types.ObjectId(pathId),
          status: 'in-progress',
          progress: 0,
          moduleProgress,
          currentModuleId: firstModule?.moduleId,
          startedAt: new Date(),
          lastActivityAt: new Date(),
          totalTimeSpent: 0,
          certificateIssued: false,
        });

        // Increment enrollment count
        path.enrollmentCount += 1;
        await path.save();

        reply.send({
          success: true,
          enrollment: enrollment.toJSON(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to enroll in learning path',
        });
      }
    }
  );

  /**
   * GET /api/v1/learning-paths/:pathId/enrollment
   * Get enrollment progress for a specific path
   */
  fastify.get(
    '/:pathId/enrollment',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get enrollment progress',
        tags: ['learning-paths'],
        params: zodToJsonSchema(
          z.object({
            pathId: z.string(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              enrollment: z.object({
                _id: z.string(),
                status: z.string(),
                progress: z.number(),
                moduleProgress: z.array(z.unknown()),
                currentModuleId: z.string().optional(),
                totalTimeSpent: z.number(),
                certificateIssued: z.boolean(),
              }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { pathId } = request.params as { pathId: string };

        const enrollment = await PathEnrollment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          pathId: new mongoose.Types.ObjectId(pathId),
        });

        if (!enrollment) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Enrollment not found',
          });
        }

        reply.send({
          enrollment: enrollment.toJSON(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch enrollment',
        });
      }
    }
  );

  /**
   * POST /api/v1/learning-paths/:pathId/modules/:moduleId/complete
   * Mark a module as completed and update progress
   */
  fastify.post(
    '/:pathId/modules/:moduleId/complete',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Complete a module',
        tags: ['learning-paths'],
        params: zodToJsonSchema(
          z.object({
            pathId: z.string(),
            moduleId: z.string(),
          })
        ),
        body: zodToJsonSchema(
          z.object({
            questionsCompleted: z.number().min(0),
            score: z.number().min(0).max(100).optional(),
            timeSpentMinutes: z.number().min(0),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              success: z.boolean(),
              progress: z.number(),
              pathCompleted: z.boolean(),
              certificateIssued: z.boolean(),
              nextModuleId: z.string().optional(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { pathId, moduleId } = request.params as { pathId: string; moduleId: string };
        const { questionsCompleted, score, timeSpentMinutes } = request.body as {
          questionsCompleted: number;
          score?: number;
          timeSpentMinutes: number;
        };

        const enrollment = await PathEnrollment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          pathId: new mongoose.Types.ObjectId(pathId),
        });

        if (!enrollment) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Enrollment not found',
          });
        }

        const path = await LearningPath.findById(pathId);
        if (!path) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Learning path not found',
          });
        }

        // Find module progress
        const moduleProgressIndex = enrollment.moduleProgress.findIndex(
          (mp: typeof enrollment.moduleProgress[0]) => mp.moduleId === moduleId
        );

        if (moduleProgressIndex === -1) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Module not found',
          });
        }

        // Update module progress
        const moduleProgress = enrollment.moduleProgress[moduleProgressIndex];
        moduleProgress.isCompleted = true;
        moduleProgress.completedAt = new Date();
        moduleProgress.questionsCompleted = questionsCompleted;
        if (score !== undefined) {
          moduleProgress.score = score;
        }

        enrollment.moduleProgress[moduleProgressIndex] = moduleProgress;

        // Update total time spent
        enrollment.totalTimeSpent += timeSpentMinutes;
        enrollment.lastActivityAt = new Date();

        // Calculate overall progress
        const completedModules = enrollment.moduleProgress.filter((mp: typeof enrollment.moduleProgress[0]) => mp.isCompleted).length;
        const totalModules = path.modules.length;
        enrollment.progress = Math.round((completedModules / totalModules) * 100);

        // Check if path is completed
        const pathCompleted = enrollment.progress === 100;
        let certificateIssued = false;

        if (pathCompleted && !enrollment.certificateIssued) {
          enrollment.status = 'completed';
          enrollment.completedAt = new Date();
          enrollment.certificateIssued = true;
          enrollment.certificateId = `cert_${pathId}_${userId}_${Date.now()}`;
          certificateIssued = true;

          // Increment completion count
          path.completionCount += 1;
          await path.save();
        }

        // Find next module
        let nextModuleId: string | undefined;
        if (!pathCompleted) {
          const currentModuleIndex = path.modules.findIndex((m: typeof path.modules[0]) => m.moduleId === moduleId);
          const nextModule = path.modules
            .slice(currentModuleIndex + 1)
            .find((m: typeof path.modules[0]) => {
              const progress = enrollment.moduleProgress.find((mp: typeof enrollment.moduleProgress[0]) => mp.moduleId === m.moduleId);
              return !progress?.isCompleted && !m.isLocked;
            });

          if (nextModule) {
            nextModuleId = nextModule.moduleId;
            enrollment.currentModuleId = nextModuleId;
          }
        }

        await enrollment.save();

        reply.send({
          success: true,
          progress: enrollment.progress,
          pathCompleted,
          certificateIssued,
          nextModuleId,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to complete module',
        });
      }
    }
  );

  /**
   * GET /api/v1/learning-paths/:pathId/certificate
   * Get certificate for completed path
   */
  fastify.get(
    '/:pathId/certificate',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get certificate for completed path',
        tags: ['learning-paths'],
        params: zodToJsonSchema(
          z.object({
            pathId: z.string(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              certificate: z.object({
                certificateId: z.string(),
                userId: z.string(),
                userName: z.string(),
                pathTitle: z.object({ en: z.string(), ar: z.string() }),
                pathSlug: z.string(),
                completedAt: z.string(),
                totalTimeSpent: z.number(),
                finalScore: z.number(),
                moduleCount: z.number(),
              }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { pathId } = request.params as { pathId: string };

        const enrollment = await PathEnrollment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          pathId: new mongoose.Types.ObjectId(pathId),
        });

        if (!enrollment) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Enrollment not found',
          });
        }

        if (!enrollment.certificateIssued || !enrollment.certificateId) {
          return reply.status(403).send({
            code: 403,
            error: 'Forbidden',
            message: 'Certificate not available. Complete the path first.',
          });
        }

        const path = await LearningPath.findById(pathId);
        const user = await User.findById(userId);

        if (!path || !user) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Path or user not found',
          });
        }

        // Calculate average score
        const scores = enrollment.moduleProgress
          .filter((mp: typeof enrollment.moduleProgress[0]) => mp.score !== undefined)
          .map((mp: typeof enrollment.moduleProgress[0]) => mp.score!);
        const finalScore = scores.length > 0
          ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length)
          : 0;

        reply.send({
          certificate: {
            certificateId: enrollment.certificateId,
            userId: String(user._id),
            userName: user.name || user.email,
            pathTitle: path.title,
            pathSlug: path.slug,
            completedAt: enrollment.completedAt!.toISOString(),
            totalTimeSpent: enrollment.totalTimeSpent,
            finalScore,
            moduleCount: path.modules.length,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch certificate',
        });
      }
    }
  );

  /**
   * GET /api/v1/learning-paths/stats
   * Get user's learning path statistics
   */
  fastify.get(
    '/my/stats',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get user learning path statistics',
        tags: ['learning-paths'],
        response: {
          200: zodToJsonSchema(
            z.object({
              stats: z.object({
                totalPaths: z.number(),
                enrolledPaths: z.number(),
                completedPaths: z.number(),
                inProgressPaths: z.number(),
                totalTimeSpent: z.number(),
                certificatesEarned: z.number(),
              }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const allPaths = await LearningPath.countDocuments({ isPublished: true });
        const enrollments = await PathEnrollment.find({
          userId: new mongoose.Types.ObjectId(userId),
        });

        const completed = enrollments.filter((e: typeof enrollments[0]) => e.status === 'completed').length;
        const inProgress = enrollments.filter((e: typeof enrollments[0]) => e.status === 'in-progress').length;
        const certificates = enrollments.filter((e: typeof enrollments[0]) => e.certificateIssued).length;
        const totalTime = enrollments.reduce((sum: number, e: typeof enrollments[0]) => sum + e.totalTimeSpent, 0);

        reply.send({
          stats: {
            totalPaths: allPaths,
            enrolledPaths: enrollments.length,
            completedPaths: completed,
            inProgressPaths: inProgress,
            totalTimeSpent: totalTime,
            certificatesEarned: certificates,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch statistics',
        });
      }
    }
  );
}
