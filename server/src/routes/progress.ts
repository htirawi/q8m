/**
 * Progress API Routes
 * Endpoints for user progress tracking, mastery management, and study sessions
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { IQuestion } from "../models/Question";
import { Question } from "../models/Question";
import { UserProgress } from "../models/UserProgress";
import { selectNextQuestion, selectSessionQuestions } from "../utils/adaptiveQuestionSelection";
import { checkAndAwardBadges } from "../utils/badgeEngine";
import {
  calculateNextReviewDate,
  calculateMasteryLevel,
  getCurrentInterval,
} from "../utils/spacedRepetition";
import { calculateStudyQuestionXP, calculateStudySessionXP, awardXP } from "../utils/xpEngine";

export default async function progressRoutes(fastify: FastifyInstance) {
  // Get user progress
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get current user progress",
        tags: ["progress"],
        response: {
          200: zodToJsonSchema(
            z.object({
              progress: z.object({
                xp: z.number(),
                level: z.number(),
                streaks: z.object({
                  currentStreak: z.number(),
                  longestStreak: z.number(),
                  lastActivityDate: z.string(),
                }),
                masteryStats: z.object({
                  totalQuestions: z.number(),
                  mastered: z.number(),
                  familiar: z.number(),
                  learning: z.number(),
                  new: z.number(),
                  accuracy: z.number(),
                  dueForReview: z.number(),
                  overdueReviews: z.number(),
                }),
              }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        let progress = await UserProgress.findOne({ userId });

        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        const masteryStats = progress.getMasteryStats();

        reply.send({
          progress: {
            ...progress.toJSON(),
            masteryStats,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch progress",
        });
      }
    }
  );

  // Update question progress (after answering)
  fastify.post(
    "/question/:questionId",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Update progress for a specific question",
        tags: ["progress"],
        params: zodToJsonSchema(
          z.object({
            questionId: z.string(),
          })
        ),
        body: zodToJsonSchema(
          z.object({
            isCorrect: z.boolean(),
            timeSpentSeconds: z.number().min(0),
            difficulty: z.enum(["easy", "medium", "hard"]),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              success: z.boolean(),
              xpEarned: z.number(),
              newMasteryLevel: z.string(),
              nextReviewDate: z.string(),
              badgesEarned: z.array(z.string()),
              leveledUp: z.boolean().optional(),
              newLevel: z.number().optional(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { questionId } = request.params as { questionId: string };
        const { isCorrect, timeSpentSeconds, difficulty } = request.body as {
          isCorrect: boolean;
          timeSpentSeconds: number;
          difficulty: "easy" | "medium" | "hard";
        };

        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        // Get or create question progress
        const questionProgress = progress.questions.get(questionId) || {
          questionId,
          masteryLevel: "new" as const,
          attempts: 0,
          correctCount: 0,
          wrongCount: 0,
          lastAttemptDate: new Date(),
          nextReviewDate: new Date(),
          averageTimeSeconds: 0,
          struggledOn: [],
          firstAttemptDate: new Date(),
        };

        // Update attempts
        questionProgress.attempts++;
        if (isCorrect) {
          questionProgress.correctCount++;
          questionProgress.lastCorrectDate = new Date();
        } else {
          questionProgress.wrongCount++;
        }

        // Update average time
        questionProgress.averageTimeSeconds =
          (questionProgress.averageTimeSeconds * (questionProgress.attempts - 1) +
            timeSpentSeconds) /
          questionProgress.attempts;

        // Calculate new mastery level
        const previousMasteryLevel = questionProgress.masteryLevel;
        questionProgress.masteryLevel = calculateMasteryLevel(
          questionProgress.masteryLevel,
          isCorrect,
          questionProgress.correctCount,
          questionProgress.wrongCount
        );

        // Calculate next review date
        const currentInterval = getCurrentInterval(
          questionProgress.lastAttemptDate,
          questionProgress.nextReviewDate
        );
        questionProgress.nextReviewDate = calculateNextReviewDate(
          questionProgress.masteryLevel,
          isCorrect,
          currentInterval
        );

        questionProgress.lastAttemptDate = new Date();

        // Update progress
        progress.questions.set(questionId, questionProgress);
        progress.totalQuestionsAttempted++;
        if (isCorrect) {
          progress.totalQuestionsCorrect++;
        }

        // Update difficulty progress
        const diffProgress = progress.difficultyProgress[difficulty];
        if (previousMasteryLevel !== "mastered" && questionProgress.masteryLevel === "mastered") {
          diffProgress.mastered++;
        }
        if (previousMasteryLevel === "new") {
          diffProgress.new = Math.max(0, diffProgress.new - 1);
          if (questionProgress.masteryLevel === "learning") {
            diffProgress.learning++;
          }
        }

        // Calculate XP
        const isFirstTry = questionProgress.attempts === 1;
        const { xp: questionXP } = calculateStudyQuestionXP(
          isCorrect,
          isFirstTry,
          timeSpentSeconds
        );

        // Check for mastery XP
        let masteryXP = 0;
        if (previousMasteryLevel !== "mastered" && questionProgress.masteryLevel === "mastered") {
          masteryXP = 30; // XP_REWARDS.study_master_question
        }

        const totalXP = questionXP + masteryXP;

        // Award XP and check for level up
        const { newXP, newLevel, leveledUp } = awardXP(progress.xp, totalXP);
        progress.xp = newXP;
        progress.level = newLevel;

        // Check for badges
        const newBadges = await checkAndAwardBadges(progress);

        await progress.save();

        reply.send({
          success: true,
          xpEarned: totalXP,
          newMasteryLevel: questionProgress.masteryLevel,
          nextReviewDate: questionProgress.nextReviewDate.toISOString(),
          badgesEarned: newBadges,
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to update progress",
        });
      }
    }
  );

  // Get next question (adaptive selection)
  fastify.get(
    "/next-question",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get next question using adaptive algorithm",
        tags: ["progress"],
        querystring: zodToJsonSchema(
          z.object({
            difficulty: z.enum(["easy", "medium", "hard"]).optional(),
            category: z.string().optional(),
            count: z.coerce.number().min(1).max(50).default(1),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { difficulty, category, count } = request.query as {
          difficulty?: "easy" | "medium" | "hard";
          category?: string;
          count: number;
        };

        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        // Get available questions
        const query: Record<string, unknown> = { isActive: true };
        if (difficulty) query.difficulty = difficulty;
        if (category) query.category = category;

        const availableQuestions = await Question.find(query);

        if (availableQuestions.length === 0) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "No questions available",
          });
        }

        // Convert to format expected by selection algorithm
        const questionsWithProgress = availableQuestions.map((q: IQuestion) => ({
          _id: String(q._id),
          difficulty: q.difficulty,
          category: q.category,
          tags: q.tags,
        }));

        // Select question(s)
        const selected =
          count === 1
            ? [selectNextQuestion(questionsWithProgress, progress.questions)]
            : selectSessionQuestions(questionsWithProgress, progress.questions, count);

        // Get full question data
        const selectedIds = selected
          .filter((q): q is NonNullable<typeof q> => q !== null)
          .map((q) => q._id);
        const questions = await Question.find({ _id: { $in: selectedIds } });

        reply.send({
          questions: questions.map((q: IQuestion) => q.toJSON()),
          count: questions.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to get next question",
        });
      }
    }
  );

  // Complete study session
  fastify.post(
    "/session/complete",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Complete study session and calculate rewards",
        tags: ["progress"],
        body: zodToJsonSchema(
          z.object({
            questionsCompleted: z.number().min(1),
            correctAnswers: z.number().min(0),
            sessionDurationMinutes: z.number().min(1),
            startTime: z.string(),
            endTime: z.string(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { questionsCompleted, correctAnswers, sessionDurationMinutes, startTime, endTime } =
          request.body as {
            questionsCompleted: number;
            correctAnswers: number;
            sessionDurationMinutes: number;
            startTime: string;
            endTime: string;
          };

        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        // Calculate session XP
        const { xp: sessionXP, breakdown } = calculateStudySessionXP(
          questionsCompleted,
          correctAnswers,
          sessionDurationMinutes
        );

        // Award XP
        const { newXP, newLevel, leveledUp } = awardXP(progress.xp, sessionXP);
        progress.xp = newXP;
        progress.level = newLevel;

        // Update session stats
        progress.totalStudySessions++;
        progress.totalStudyTimeMinutes += sessionDurationMinutes;
        progress.lastSessionStart = new Date(startTime);
        progress.lastSessionEnd = new Date(endTime);

        // Update average session duration
        progress.averageSessionDurationMinutes =
          (progress.averageSessionDurationMinutes * (progress.totalStudySessions - 1) +
            sessionDurationMinutes) /
          progress.totalStudySessions;

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActivity = new Date(progress.streaks.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);

        const daysSinceLastActivity = Math.floor(
          (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity === 0) {
          // Same day - no change
        } else if (daysSinceLastActivity === 1) {
          // Consecutive day - increment streak
          progress.streaks.currentStreak++;
          if (progress.streaks.currentStreak > progress.streaks.longestStreak) {
            progress.streaks.longestStreak = progress.streaks.currentStreak;
          }
        } else if (daysSinceLastActivity > 1 && daysSinceLastActivity <= 2) {
          // Grace period (1 day miss)
          progress.streaks.missedDays++;
          // Don't break streak on first miss
        } else {
          // Streak broken
          progress.streaks.currentStreak = 1;
          progress.streaks.streakStartDate = today;
        }

        progress.streaks.lastActivityDate = today;

        // Check for badges
        const newBadges = await checkAndAwardBadges(progress);

        await progress.save();

        reply.send({
          success: true,
          xpEarned: sessionXP,
          breakdown,
          leveledUp,
          newLevel: leveledUp ? newLevel : undefined,
          badgesEarned: newBadges,
          streakMaintained: true,
          currentStreak: progress.streaks.currentStreak,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to complete session",
        });
      }
    }
  );

  // Get study statistics
  fastify.get(
    "/stats",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get detailed study statistics",
        tags: ["progress"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
          return reply.send({
            stats: null,
          });
        }

        const masteryStats = progress.getMasteryStats();

        reply.send({
          stats: {
            xp: progress.xp,
            level: progress.level,
            totalStudyTimeMinutes: progress.totalStudyTimeMinutes,
            totalQuestionsAttempted: progress.totalQuestionsAttempted,
            totalQuestionsCorrect: progress.totalQuestionsCorrect,
            overallAccuracy:
              progress.totalQuestionsAttempted > 0
                ? Math.round(
                    (progress.totalQuestionsCorrect / progress.totalQuestionsAttempted) * 100
                  )
                : 0,
            totalStudySessions: progress.totalStudySessions,
            averageSessionDurationMinutes: progress.averageSessionDurationMinutes,
            masteryStats,
            difficultyProgress: progress.difficultyProgress,
            streaks: progress.streaks,
            badges: progress.badges,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch statistics",
        });
      }
    }
  );
}
