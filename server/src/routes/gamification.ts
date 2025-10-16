/**
 * Gamification API Routes
 * Endpoints for badges, leaderboards, XP tracking, and achievements
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { authenticate } from "../middlewares/auth.middleware.js";
import type { IBadgeDoc } from "../models/Badge";
import { Badge } from "../models/Badge";
import { Leaderboard } from "../models/Leaderboard";
import type { IEarnedBadgeDoc } from "../models/UserProgress";
import { UserProgress } from "../models/UserProgress";
import { getUserBadgesWithProgress, getUnlockedSecretBadges } from "../utils/badgeEngine";
import { getXPForNextLevel, getLevelProgress, getLevelTitle } from "../utils/xpEngine";

export default async function gamificationRoutes(fastify: FastifyInstance) {
  // Get all badges with user progress
  fastify.get(
    "/badges",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get all badges with user progress",
        tags: ["gamification"],
        querystring: zodToJsonSchema(
          z.object({
            category: z.enum(["study", "quiz", "streak", "social", "milestone"]).optional(),
            rarity: z.enum(["common", "rare", "epic", "legendary"]).optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { category, rarity } = request.query as {
          category?: string;
          rarity?: string;
        };

        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        const badgesWithProgress = await getUserBadgesWithProgress(progress);

        // Filter by category and rarity
        let filtered = badgesWithProgress;
        if (category) {
          filtered = filtered.filter((b) => b.badge.category === category);
        }
        if (rarity) {
          filtered = filtered.filter((b) => b.badge.rarity === rarity);
        }

        reply.send({
          badges: filtered.map((b) => ({
            ...b.badge.toJSON(),
            earned: b.earned,
            earnedAt: b.earnedAt,
            progress: b.progress,
          })),
          totalBadges: filtered.length,
          earnedCount: filtered.filter((b) => b.earned).length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch badges",
        });
      }
    }
  );

  // Get user's earned badges
  fastify.get(
    "/badges/earned",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get badges earned by current user",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
          return reply.send({
            badges: [],
            count: 0,
          });
        }

        const earnedBadgeIds = progress.badges.map((b: IEarnedBadgeDoc) => b.badgeId);
        const badges = await Badge.find({ _id: { $in: earnedBadgeIds } });

        const badgesWithDates = badges.map((badge: IBadgeDoc) => {
          const earnedBadge = progress.badges.find((b: IEarnedBadgeDoc) => b.badgeId === badge.id);
          return {
            ...badge.toJSON(),
            earnedAt: earnedBadge?.earnedAt,
          };
        });

        reply.send({
          badges: badgesWithDates,
          count: badgesWithDates.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch earned badges",
        });
      }
    }
  );

  // Get secret badges unlocked
  fastify.get(
    "/badges/secret",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get secret badges unlocked by user",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
          return reply.send({
            badges: [],
            count: 0,
          });
        }

        const secretBadges = await getUnlockedSecretBadges(progress);

        reply.send({
          badges: secretBadges.map((b) => b.toJSON()),
          count: secretBadges.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch secret badges",
        });
      }
    }
  );

  // Get leaderboard
  fastify.get(
    "/leaderboard/:type",
    {
      schema: {
        description: "Get leaderboard rankings",
        tags: ["gamification"],
        params: zodToJsonSchema(
          z.object({
            type: z.enum(["weekly", "monthly", "all_time"]),
          })
        ),
        querystring: zodToJsonSchema(
          z.object({
            scope: z.enum(["global", "plan_tier"]).default("global"),
            planTier: z.enum(["free", "intermediate", "advanced", "pro"]).optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { type } = request.params as { type: "weekly" | "monthly" | "all_time" };
        const { scope, planTier } = request.query as {
          scope: "global" | "plan_tier";
          planTier?: "free" | "intermediate" | "advanced" | "pro";
        };

        const leaderboard = await Leaderboard.getCurrent(type, { scope, planTier });

        if (!leaderboard) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "Leaderboard not found",
          });
        }

        // If user is authenticated, find their rank
        let userRank;
        if (request.authUser) {
          userRank = await Leaderboard.getUserRank(type, request.authUser.id, { scope, planTier });
        }

        reply.send({
          leaderboard: leaderboard.toJSON(),
          userRank,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch leaderboard",
        });
      }
    }
  );

  // Get user's leaderboard rank
  fastify.get(
    "/leaderboard/:type/rank",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get current user leaderboard rank",
        tags: ["gamification"],
        params: zodToJsonSchema(
          z.object({
            type: z.enum(["weekly", "monthly", "all_time"]),
          })
        ),
        querystring: zodToJsonSchema(
          z.object({
            scope: z.enum(["global", "plan_tier"]).default("global"),
            planTier: z.enum(["free", "intermediate", "advanced", "pro"]).optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { type } = request.params as { type: "weekly" | "monthly" | "all_time" };
        const { scope, planTier } = request.query as {
          scope: "global" | "plan_tier";
          planTier?: "free" | "intermediate" | "advanced" | "pro";
        };

        const rankInfo = await Leaderboard.getUserRank(type, userId, { scope, planTier });

        if (!rankInfo) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found in leaderboard",
          });
        }

        reply.send(rankInfo);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch user rank",
        });
      }
    }
  );

  // Get XP info
  fastify.get(
    "/xp",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get XP and level information",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
          return reply.send({
            xp: 0,
            level: 1,
            levelTitle: "Beginner",
            xpToNextLevel: 100,
            levelProgress: 0,
          });
        }

        const xpToNextLevel = getXPForNextLevel(progress.xp);
        const levelProgressPercent = getLevelProgress(progress.xp);
        const levelTitle = getLevelTitle(progress.level);

        reply.send({
          xp: progress.xp,
          level: progress.level,
          levelTitle,
          xpToNextLevel,
          levelProgress: levelProgressPercent,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch XP information",
        });
      }
    }
  );

  // Get gamification summary
  fastify.get(
    "/summary",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get complete gamification summary",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        let progress = await UserProgress.findOne({ userId });
        if (!progress) {
          progress = await UserProgress.findOrCreate(userId);
        }

        const xpToNextLevel = getXPForNextLevel(progress.xp);
        const levelProgressPercent = getLevelProgress(progress.xp);
        const levelTitle = getLevelTitle(progress.level);

        // Get earned badges count by rarity
        const earnedBadgeIds = progress.badges.map((b: IEarnedBadgeDoc) => b.badgeId);
        const earnedBadges = await Badge.find({ _id: { $in: earnedBadgeIds } });
        const rareBadges = earnedBadges.filter(
          (b: IBadgeDoc) => b.rarity === "rare" || b.rarity === "epic" || b.rarity === "legendary"
        ).length;

        // Get leaderboard rank (all-time global)
        const leaderboardRank = await Leaderboard.getUserRank("all_time", userId, {
          scope: "global",
        });

        reply.send({
          xp: progress.xp,
          level: progress.level,
          levelTitle,
          xpToNextLevel,
          xpProgress: levelProgressPercent,
          totalBadges: progress.badges.length,
          rareBadges,
          currentStreak: progress.streaks.currentStreak,
          longestStreak: progress.streaks.longestStreak,
          leaderboardRank: leaderboardRank?.rank,
          leaderboardPercentile: leaderboardRank?.percentile,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch gamification summary",
        });
      }
    }
  );

  // Get streak information
  fastify.get(
    "/streak",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get streak information",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const progress = await UserProgress.findOne({ userId });
        if (!progress) {
          return reply.send({
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            streakStartDate: null,
            freezesUsed: 0,
            freezesAvailable: 2,
          });
        }

        reply.send({
          currentStreak: progress.streaks.currentStreak,
          longestStreak: progress.streaks.longestStreak,
          lastActivityDate: progress.streaks.lastActivityDate,
          streakStartDate: progress.streaks.streakStartDate,
          missedDays: progress.streaks.missedDays,
          freezesUsed: progress.streaks.freezesUsed || 0,
          freezesAvailable: progress.streaks.freezesAvailable || 2,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch streak information",
        });
      }
    }
  );

  // Use streak freeze (streak saver)
  fastify.post(
    "/streak/freeze",
    {
      onRequest: [fastify.authenticate()],
      rateLimit: {
        max: 10,
        timeWindow: "15 minutes",
      },
      schema: {
        description: "Use streak freeze to save streak",
        tags: ["gamification"],
        body: zodToJsonSchema(
          z.object({
            useCoins: z.boolean().default(true),
            useXP: z.boolean().default(false),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { useCoins, useXP } = request.body as { useCoins: boolean; useXP: boolean };

        const { User } = await import("../models/User");
        const user = await User.findById(userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        // Check if user needs a freeze (missed yesterday's activity)
        const now = new Date();
        const lastActivity = user.streak?.lastActivityDate;

        if (!lastActivity) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "No streak to save",
          });
        }

        const daysSinceLastActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity <= 1) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Streak is not broken, no freeze needed",
          });
        }

        if (daysSinceLastActivity > 2) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Streak is already lost (more than 1 day missed)",
          });
        }

        // Check freeze availability and cost
        const STREAK_SAVER_CONFIG = {
          COST_IN_COINS: 100,
          COST_IN_XP: 100,
          MAX_FREEZES_PER_WEEK: 2,
        };

        const freezesUsed = user.streak?.freezesUsed || 0;
        const freezesAvailable = user.streak?.freezesAvailable || 2;

        if (freezesAvailable > 0) {
          // Use free freeze
          user.streak = {
            ...user.streak,
            currentStreak: user.streak?.currentStreak || 0,
            longestStreak: user.streak?.longestStreak || 0,
            lastActivityDate: now,
            streakStartDate: user.streak?.streakStartDate || null,
            freezesUsed,
            freezesAvailable: freezesAvailable - 1,
          };

          await user.save();

          return reply.send({
            success: true,
            message: "Free freeze used successfully",
            streak: user.streak,
            costType: "free",
          });
        }

        // Check weekly limit
        if (freezesUsed >= STREAK_SAVER_CONFIG.MAX_FREEZES_PER_WEEK) {
          return reply.status(400).send({
            code: 400,
            error: "Bad Request",
            message: "Weekly freeze limit reached",
          });
        }

        // Use paid freeze
        if (useCoins) {
          if (!user.coins || user.coins.total < STREAK_SAVER_CONFIG.COST_IN_COINS) {
            return reply.status(400).send({
              code: 400,
              error: "Bad Request",
              message: "Insufficient coins",
              required: STREAK_SAVER_CONFIG.COST_IN_COINS,
              available: user.coins?.total || 0,
            });
          }

          user.coins = {
            total: (user.coins?.total || 0) - STREAK_SAVER_CONFIG.COST_IN_COINS,
            earned: user.coins?.earned || 0,
            spent: (user.coins?.spent || 0) + STREAK_SAVER_CONFIG.COST_IN_COINS,
          };

          user.streak = {
            ...user.streak,
            currentStreak: user.streak?.currentStreak || 0,
            longestStreak: user.streak?.longestStreak || 0,
            lastActivityDate: now,
            streakStartDate: user.streak?.streakStartDate || null,
            freezesUsed: freezesUsed + 1,
            freezesAvailable,
          };

          await user.save();

          return reply.send({
            success: true,
            message: "Streak frozen with coins",
            streak: user.streak,
            coins: user.coins,
            costType: "coins",
            cost: STREAK_SAVER_CONFIG.COST_IN_COINS,
          });
        } else if (useXP) {
          if (!user.gamification || user.gamification.xp < STREAK_SAVER_CONFIG.COST_IN_XP) {
            return reply.status(400).send({
              code: 400,
              error: "Bad Request",
              message: "Insufficient XP",
              required: STREAK_SAVER_CONFIG.COST_IN_XP,
              available: user.gamification?.xp || 0,
            });
          }

          user.gamification = {
            xp: (user.gamification?.xp || 0) - STREAK_SAVER_CONFIG.COST_IN_XP,
            level: user.gamification?.level || 1,
            badges: user.gamification?.badges || [],
          };

          user.streak = {
            ...user.streak,
            currentStreak: user.streak?.currentStreak || 0,
            longestStreak: user.streak?.longestStreak || 0,
            lastActivityDate: now,
            streakStartDate: user.streak?.streakStartDate || null,
            freezesUsed: freezesUsed + 1,
            freezesAvailable,
          };

          await user.save();

          return reply.send({
            success: true,
            message: "Streak frozen with XP",
            streak: user.streak,
            xp: user.gamification.xp,
            costType: "xp",
            cost: STREAK_SAVER_CONFIG.COST_IN_XP,
          });
        }

        return reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: "Must specify payment method (coins or XP)",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to freeze streak",
        });
      }
    }
  );

  // Get coins balance
  fastify.get(
    "/coins",
    {
      onRequest: [fastify.authenticate()],
      schema: {
        description: "Get coin balance",
        tags: ["gamification"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;

        const { User } = await import("../models/User");
        const user = await User.findById(userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        reply.send({
          total: user.coins?.total || 0,
          earned: user.coins?.earned || 0,
          spent: user.coins?.spent || 0,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch coin balance",
        });
      }
    }
  );

  // Award coins (admin only)
  fastify.post(
    "/coins/award",
    {
      preHandler: [authenticate],
      // TODO: Add role-based authorization for admin
      rateLimit: {
        max: 100,
        timeWindow: "15 minutes",
      },
      schema: {
        description: "Award coins to a user (admin only)",
        tags: ["gamification"],
        body: zodToJsonSchema(
          z.object({
            userId: z.string(),
            amount: z.number().positive(),
            reason: z.string(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { userId, amount, reason } = request.body as {
          userId: string;
          amount: number;
          reason: string;
        };

        const { User } = await import("../models/User");
        const user = await User.findById(userId);

        if (!user) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "User not found",
          });
        }

        user.coins = {
          total: (user.coins?.total || 0) + amount,
          earned: (user.coins?.earned || 0) + amount,
          spent: user.coins?.spent || 0,
        };

        await user.save();

        reply.send({
          success: true,
          message: `Awarded ${amount} coins for: ${reason}`,
          coins: user.coins,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to award coins",
        });
      }
    }
  );
}
