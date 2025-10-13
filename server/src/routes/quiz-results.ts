/**
 * Quiz Results API Routes
 * Endpoints for quiz submission, history, analytics, and retry functionality
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { IQuizResultDoc } from '../models/QuizResult';
import { QuizResult } from '../models/QuizResult';
import { UserProgress } from '../models/UserProgress';
import { checkAndAwardBadges } from '../utils/badgeEngine';
import { calculateQuizXP, awardXP } from '../utils/xpEngine';

export default async function quizResultsRoutes(fastify: FastifyInstance) {
  // Submit quiz results
  fastify.post(
    '/submit',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Submit quiz results and calculate rewards',
        tags: ['quiz'],
        body: zodToJsonSchema(
          z.object({
            quizType: z.enum(['practice', 'exam', 'retry_wrong', 'review']),
            level: z.enum(['junior', 'intermediate', 'senior']),
            framework: z.enum(['vue', 'react', 'angular', 'nextjs']).optional(),
            answers: z.array(
              z.object({
                questionId: z.string(),
                userAnswer: z.union([z.string(), z.array(z.string())]),
                correctAnswer: z.union([z.string(), z.array(z.string())]),
                isCorrect: z.boolean(),
                timeSpentSeconds: z.number().min(0),
                difficultyLevel: z.enum(['easy', 'medium', 'hard']),
                category: z.string(),
                tags: z.array(z.string()),
                points: z.number().min(0),
                pointsEarned: z.number().min(0),
              })
            ),
            startTime: z.string(),
            endTime: z.string(),
            originalQuizId: z.string().optional(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              success: z.boolean(),
              quizResultId: z.string(),
              score: z.number(),
              xpEarned: z.number(),
              badgesEarned: z.array(z.string()),
              leveledUp: z.boolean().optional(),
              newLevel: z.number().optional(),
              weakCategories: z.array(z.string()),
              streakMaintained: z.boolean(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const quizData = request.body as {
          quizType: 'practice' | 'exam' | 'retry_wrong' | 'review';
          level: 'junior' | 'intermediate' | 'senior';
          framework?: 'vue' | 'react' | 'angular' | 'nextjs';
          answers: Array<{
            questionId: string;
            userAnswer: string | string[];
            correctAnswer: string | string[];
            isCorrect: boolean;
            timeSpentSeconds: number;
            difficultyLevel: 'easy' | 'medium' | 'hard';
            category: string;
            tags: string[];
            points: number;
            pointsEarned: number;
          }>;
          startTime: string;
          endTime: string;
          originalQuizId?: string;
        };

        // Calculate performance metrics
        const totalQuestions = quizData.answers.length;
        const correctAnswers = quizData.answers.filter((a) => a.isCorrect).length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        const totalTimeSeconds =
          (new Date(quizData.endTime).getTime() - new Date(quizData.startTime).getTime()) / 1000;
        const averageTimePerQuestion = totalTimeSeconds / totalQuestions;

        const totalPoints = quizData.answers.reduce((sum, a) => sum + a.points, 0);
        const pointsEarned = quizData.answers.reduce((sum, a) => sum + a.pointsEarned, 0);

        const isPerfect = score === 100;
        const isFast = averageTimePerQuestion < 10;

        // Calculate category performance
        const categoryMap = new Map<
          string,
          { totalQuestions: number; correctAnswers: number; totalTime: number }
        >();

        for (const answer of quizData.answers) {
          const existing = categoryMap.get(answer.category);
          if (existing) {
            existing.totalQuestions++;
            if (answer.isCorrect) existing.correctAnswers++;
            existing.totalTime += answer.timeSpentSeconds;
          } else {
            categoryMap.set(answer.category, {
              totalQuestions: 1,
              correctAnswers: answer.isCorrect ? 1 : 0,
              totalTime: answer.timeSpentSeconds,
            });
          }
        }

        const categoryPerformance = Array.from(categoryMap.entries()).map(([category, stats]) => {
          const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
          return {
            category,
            totalQuestions: stats.totalQuestions,
            correctAnswers: stats.correctAnswers,
            accuracy,
            averageTimeSeconds: stats.totalTime / stats.totalQuestions,
            isWeak: accuracy < 70,
            isStrong: accuracy >= 90,
          };
        });

        const weakCategories = categoryPerformance.filter((c) => c.isWeak).map((c) => c.category);
        const strongCategories = categoryPerformance
          .filter((c) => c.isStrong)
          .map((c) => c.category);

        // Calculate difficulty performance
        const difficultyMap = new Map<
          string,
          { totalQuestions: number; correctAnswers: number; totalTime: number }
        >();

        for (const answer of quizData.answers) {
          const existing = difficultyMap.get(answer.difficultyLevel);
          if (existing) {
            existing.totalQuestions++;
            if (answer.isCorrect) existing.correctAnswers++;
            existing.totalTime += answer.timeSpentSeconds;
          } else {
            difficultyMap.set(answer.difficultyLevel, {
              totalQuestions: 1,
              correctAnswers: answer.isCorrect ? 1 : 0,
              totalTime: answer.timeSpentSeconds,
            });
          }
        }

        const difficultyPerformance = Array.from(difficultyMap.entries()).map(
          ([difficulty, stats]) => ({
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            totalQuestions: stats.totalQuestions,
            correctAnswers: stats.correctAnswers,
            accuracy: (stats.correctAnswers / stats.totalQuestions) * 100,
            averageTimeSeconds: stats.totalTime / stats.totalQuestions,
          })
        );

        // Calculate XP
        const { xp: quizXP, breakdown: xpBreakdown } = calculateQuizXP(
          score,
          totalQuestions,
          totalTimeSeconds
        );

        // Create quiz result
        const quizResult = await QuizResult.create({
          userId,
          quizType: quizData.quizType,
          level: quizData.level,
          framework: quizData.framework,
          score,
          correctAnswers,
          incorrectAnswers,
          skippedAnswers: 0,
          totalQuestions,
          totalPoints,
          pointsEarned,
          startTime: new Date(quizData.startTime),
          endTime: new Date(quizData.endTime),
          totalTimeSeconds,
          averageTimePerQuestion,
          answers: quizData.answers,
          categoryPerformance,
          difficultyPerformance,
          weakCategories,
          strongCategories,
          xpEarned: quizXP,
          badgesEarned: [],
          streakMaintained: true,
          isPerfect,
          isFast,
          originalQuizId: quizData.originalQuizId,
        });

        // Update user progress
        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        // Award XP
        const { newXP, newLevel, leveledUp } = awardXP(progress.xp, quizXP);
        progress.xp = newXP;
        progress.level = newLevel;

        // Update quiz stats
        progress.quizzesTaken++;
        progress.totalQuizTimeMinutes += totalTimeSeconds / 60;

        // Update average quiz score
        progress.averageQuizScore =
          (progress.averageQuizScore * (progress.quizzesTaken - 1) + score) /
          progress.quizzesTaken;

        // Update best score
        if (score > progress.bestQuizScore) {
          progress.bestQuizScore = score;
        }

        // Track perfect quizzes
        if (isPerfect) {
          progress.perfectQuizzes++;
        }

        // Check for badges
        const newBadges = await checkAndAwardBadges(progress);
        quizResult.badgesEarned = newBadges;

        await Promise.all([quizResult.save(), progress.save()]);

        reply.send({
          success: true,
          quizResultId: quizResult._id.toString(),
          score,
          xpEarned: quizXP,
          xpBreakdown,
          badgesEarned: newBadges,
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined,
          weakCategories,
          strongCategories,
          categoryPerformance,
          difficultyPerformance,
          streakMaintained: true,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to submit quiz results',
        });
      }
    }
  );

  // Get quiz history
  fastify.get(
    '/history',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get quiz history for current user',
        tags: ['quiz'],
        querystring: zodToJsonSchema(
          z.object({
            level: z.enum(['junior', 'intermediate', 'senior']).optional(),
            limit: z.coerce.number().min(1).max(100).default(10),
            offset: z.coerce.number().min(0).default(0),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { level, limit, offset } = request.query as {
          level?: 'junior' | 'intermediate' | 'senior';
          limit: number;
          offset: number;
        };

        const results = await QuizResult.getUserHistory(userId, { level, limit, offset });

        reply.send({
          results: results.map((r: IQuizResultDoc) => r.toJSON()),
          count: results.length,
          limit,
          offset,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch quiz history',
        });
      }
    }
  );

  // Get quiz statistics
  fastify.get(
    '/stats',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get detailed quiz statistics',
        tags: ['quiz'],
        querystring: zodToJsonSchema(
          z.object({
            level: z.enum(['junior', 'intermediate', 'senior']).optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { level } = request.query as { level?: 'junior' | 'intermediate' | 'senior' };

        const stats = await QuizResult.getUserStats(userId, level);

        reply.send({ stats });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch quiz statistics',
        });
      }
    }
  );

  // Get weak areas
  fastify.get(
    '/weak-areas',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get weak areas based on quiz performance',
        tags: ['quiz'],
        querystring: zodToJsonSchema(
          z.object({
            level: z.enum(['junior', 'intermediate', 'senior']).optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { level } = request.query as { level?: 'junior' | 'intermediate' | 'senior' };

        const weakAreas = await QuizResult.getWeakAreas(userId, level);

        reply.send({
          weakAreas,
          count: weakAreas.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch weak areas',
        });
      }
    }
  );

  // Get wrong questions from a quiz
  fastify.get(
    '/:quizId/wrong-questions',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get wrong questions from a quiz for retry',
        tags: ['quiz'],
        params: zodToJsonSchema(
          z.object({
            quizId: z.string(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { quizId } = request.params as { quizId: string };

        const wrongQuestions = await QuizResult.getWrongQuestions(quizId);

        reply.send({
          questionIds: wrongQuestions,
          count: wrongQuestions.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch wrong questions',
        });
      }
    }
  );

  // Get quiz result details
  fastify.get(
    '/:quizId',
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: 'Get detailed quiz result',
        tags: ['quiz'],
        params: zodToJsonSchema(
          z.object({
            quizId: z.string(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { quizId } = request.params as { quizId: string };

        const result = await QuizResult.findOne({ _id: quizId, userId });

        if (!result) {
          return reply.status(404).send({
            code: 404,
            error: 'Not Found',
            message: 'Quiz result not found',
          });
        }

        reply.send({
          result: result.toJSON(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch quiz result',
        });
      }
    }
  );
}
