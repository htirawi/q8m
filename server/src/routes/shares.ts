import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type mongoose from 'mongoose';
import { z } from 'zod';

import { authenticate } from '../middlewares/auth.middleware.js';
import { Badge } from '../models/Badge.js';
import { Challenge } from '../models/Challenge.js';
import { QuizResult } from '../models/QuizResult.js';
import { Share } from '../models/Share.js';
import { User } from '../models/User.js';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    _id: mongoose.Types.ObjectId;
    email: string;
    role: string;
  };
}

interface SharePreviewData {
  title: string;
  description: string;
  imageUrl: string;
  metadata: Record<string, unknown>;
}

const createShareSchema = z.object({
  shareType: z.enum(['quiz_result', 'achievement', 'streak', 'challenge_victory', 'profile', 'badge']),
  entityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid entity ID'),
  platform: z.enum(['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy_link']),
  metadata: z.record(z.any()).optional(),
});

const shareStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
});

export default async function shareRoutes(fastify: FastifyInstance) {
  // Apply rate limiting to share creation
  await fastify.register(rateLimit, {
    max: 50,
    timeWindow: '15 minutes',
  });

  // Create/track a share
  fastify.post(
    '/api/v1/shares',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createShareSchema.parse(request.body);
        const userId = (request as AuthenticatedRequest).user._id;

        // Create share record for analytics
        const share = await Share.create({
          userId,
          shareType: body.shareType,
          entityId: body.entityId,
          platform: body.platform,
          metadata: body.metadata || {},
        });

        return reply.status(201).send({
          success: true,
          data: share,
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid request data',
            errors: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to create share',
        });
      }
    }
  );

  // Get share preview data
  fastify.get(
    '/api/v1/shares/preview/:shareType/:entityId',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { shareType, entityId } = request.params as {
          shareType: string;
          entityId: string;
        };
        const userId = (request as AuthenticatedRequest).user._id;

        let previewData: SharePreviewData = {
          title: '',
          description: '',
          imageUrl: '',
          metadata: {},
        };

        switch (shareType) {
          case 'quiz_result': {
            const result = await QuizResult.findOne({
              _id: entityId,
              userId,
            }).populate('quizId', 'title framework difficulty');

            if (!result) {
              return reply.status(404).send({
                success: false,
                message: 'Quiz result not found',
              });
            }

            const user = await User.findById(userId, 'username profilePicture');
            const percentage = Math.round((result.score / result.totalQuestions) * 100);

            const quizData = result.quizId as unknown as { title?: string; framework?: string; difficulty?: string };
            previewData = {
              title: `I scored ${percentage}% on ${quizData.title || 'a quiz'}!`,
              description: `${result.correctAnswers}/${result.totalQuestions} correct answers in ${Math.round(result.totalTimeSeconds / 60)}min. Can you beat my score?`,
              imageUrl: user?.avatar || '/default-avatar.png',
              metadata: {
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage,
                framework: quizData.framework,
                difficulty: quizData.difficulty,
                timeSpent: result.totalTimeSeconds,
              },
            };
            break;
          }

          case 'achievement':
          case 'badge': {
            const badge = await Badge.findOne({
              _id: entityId,
              userId,
            });

            if (!badge) {
              return reply.status(404).send({
                success: false,
                message: 'Badge not found',
              });
            }

            const user = await User.findById(userId, 'name avatar');

            previewData = {
              title: `I just unlocked the "${badge.name}" badge!`,
              description: badge.description || `Achievement unlocked on Quiz8Master!`,
              imageUrl: badge.icon || user?.avatar || '/default-badge.png',
              metadata: {
                badgeName: badge.name,
                badgeCategory: badge.category,
                rarity: badge.rarity,
              },
            };
            break;
          }

          case 'streak': {
            const user = await User.findById(userId, 'name avatar streak');

            if (!user) {
              return reply.status(404).send({
                success: false,
                message: 'User not found',
              });
            }

            const streakDays = user.streak?.currentStreak || 0;

            previewData = {
              title: `I'm on a ${streakDays}-day learning streak!`,
              description: `Join me on Quiz8Master and build your coding knowledge daily!`,
              imageUrl: user.avatar || '/default-avatar.png',
              metadata: {
                streakDays,
                username: user.name,
              },
            };
            break;
          }

          case 'challenge_victory': {
            const challenge = await Challenge.findOne({
              _id: entityId,
              $or: [{ challengerId: userId }, { challengedUserId: userId }],
              status: 'completed',
            })
              .populate('challengerId', 'name')
              .populate('challengedUserId', 'name');

            if (!challenge) {
              return reply.status(404).send({
                success: false,
                message: 'Challenge not found',
              });
            }

            const isWinner = challenge.winnerId?.toString() === userId.toString();
            const challengerUser = challenge.challengerId as unknown as { name: string };
            const challengedUser = challenge.challengedUserId as unknown as { name: string };
            const opponent =
              challenge.challengerId.toString() === userId.toString()
                ? challengedUser.name
                : challengerUser.name;

            previewData = {
              title: isWinner
                ? `I beat ${opponent} in a quiz challenge!`
                : `Great challenge with ${opponent}!`,
              description: `${challenge.challengerScore} - ${challenge.challengedScore} in ${challenge.framework} quiz`,
              imageUrl: '/challenge-victory.png',
              metadata: {
                challengerScore: challenge.challengerScore,
                challengedScore: challenge.challengedScore,
                framework: challenge.framework,
                isWinner,
                isTie: challenge.isTie,
              },
            };
            break;
          }

          case 'profile': {
            const user = await User.findById(userId, 'name avatar gamification bio');

            if (!user) {
              return reply.status(404).send({
                success: false,
                message: 'User not found',
              });
            }

            previewData = {
              title: `Check out my Quiz8Master profile!`,
              description:
                user.bio ||
                `Level ${user.gamification?.level || 1} | ${user.gamification?.xp || 0} XP | Join me in mastering coding!`,
              imageUrl: user.avatar || '/default-avatar.png',
              metadata: {
                username: user.name,
                level: user.gamification?.level,
                totalXP: user.gamification?.xp,
                totalQuizzes: user.stats?.totalQuizzes,
              },
            };
            break;
          }

          default:
            return reply.status(400).send({
              success: false,
              message: 'Invalid share type',
            });
        }

        return reply.send({
          success: true,
          data: previewData,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to generate share preview',
        });
      }
    }
  );

  // Get user's share statistics
  fastify.get(
    '/api/v1/shares/stats',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = shareStatsSchema.parse(request.query);
        const userId = (request as AuthenticatedRequest).user._id;

        const dateFilter: Record<string, unknown> = {};
        const now = new Date();

        switch (query.period) {
          case 'day':
            dateFilter.createdAt = {
              $gte: new Date(now.setHours(0, 0, 0, 0)),
            };
            break;
          case 'week':
            dateFilter.createdAt = {
              $gte: new Date(now.setDate(now.getDate() - 7)),
            };
            break;
          case 'month':
            dateFilter.createdAt = {
              $gte: new Date(now.setMonth(now.getMonth() - 1)),
            };
            break;
        }

        const [totalShares, sharesByType, sharesByPlatform, totalClicks] = await Promise.all([
          Share.countDocuments({ userId, ...dateFilter }),
          Share.aggregate([
            { $match: { userId, ...dateFilter } },
            { $group: { _id: '$shareType', count: { $sum: 1 } } },
          ]),
          Share.aggregate([
            { $match: { userId, ...dateFilter } },
            { $group: { _id: '$platform', count: { $sum: 1 } } },
          ]),
          Share.aggregate([
            { $match: { userId, ...dateFilter } },
            { $group: { _id: null, totalClicks: { $sum: '$clicks' } } },
          ]),
        ]);

        return reply.send({
          success: true,
          data: {
            totalShares,
            totalClicks: totalClicks[0]?.totalClicks || 0,
            sharesByType: sharesByType.reduce(
              (acc: Record<string, number>, item: { _id: string; count: number }) => {
                acc[item._id] = item.count;
                return acc;
              },
              {} as Record<string, number>
            ),
            sharesByPlatform: sharesByPlatform.reduce(
              (acc: Record<string, number>, item: { _id: string; count: number }) => {
                acc[item._id] = item.count;
                return acc;
              },
              {} as Record<string, number>
            ),
          },
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid request data',
            errors: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to get share statistics',
        });
      }
    }
  );

  // Track share click (public endpoint)
  fastify.post(
    '/api/v1/shares/:shareId/click',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { shareId } = request.params as { shareId: string };

        await Share.findByIdAndUpdate(shareId, {
          $inc: { clicks: 1 },
        });

        return reply.send({
          success: true,
          message: 'Click tracked',
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to track click',
        });
      }
    }
  );
}
