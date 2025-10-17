import * as cron from "node-cron";

import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import { logger } from "../utils/logger";

import { NotificationService } from "./notification";

export class NotificationScheduler {
  private notificationService: NotificationService;
  private tasks: ReturnType<typeof cron.schedule>[] = [];

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Initialize and start all scheduled tasks
   */
  start(): void {
    logger.info("🚀 Starting notification scheduler...");

    // Daily streak reminders - Run at 8 PM every day
    const streakReminderTask = cron.schedule("0 20 * * *", async () => {
      logger.info("⏰ Running daily streak reminder task...");
      await this.sendStreakReminders();
    });

    // Trial ending reminders - Run at 10 AM every day
    const trialReminderTask = cron.schedule("0 10 * * *", async () => {
      logger.info("⏰ Running trial ending reminder task...");
      await this.sendTrialEndingReminders();
    });

    // Subscription expiry reminders - Run at 10 AM every day
    const subscriptionReminderTask = cron.schedule("0 10 * * *", async () => {
      logger.info("⏰ Running subscription expiry reminder task...");
      await this.sendSubscriptionExpiryReminders();
    });

    // Weekly progress summary - Run at 9 AM every Monday
    const weeklyProgressTask = cron.schedule("0 9 * * 1", async () => {
      logger.info("⏰ Running weekly progress summary task...");
      await this.sendWeeklyProgressSummaries();
    });

    // Achievement notifications - Run every hour
    const achievementTask = cron.schedule("0 * * * *", async () => {
      logger.info("⏰ Running achievement notification task...");
      await this.sendAchievementNotifications();
    });

    // Store tasks for cleanup
    this.tasks = [
      streakReminderTask,
      trialReminderTask,
      subscriptionReminderTask,
      weeklyProgressTask,
      achievementTask,
    ];

    logger.info("✅ Notification scheduler started successfully");
    logger.info("   - Streak reminders: 8 PM daily");
    logger.info("   - Trial reminders: 10 AM daily");
    logger.info("   - Subscription reminders: 10 AM daily");
    logger.info("   - Weekly progress: 9 AM Monday");
    logger.info("   - Achievement checks: Every hour");
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    logger.info("🛑 Stopping notification scheduler...");
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
    logger.info("✅ Notification scheduler stopped");
  }

  /**
   * Send streak reminders to users who haven't completed today's quiz
   */
  private async sendStreakReminders(): Promise<void> {
    try {
      // Find users with active streaks who haven't completed today's quiz
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const users = await User.find({
        isActive: true,
        "streak.currentStreak": { $gte: 1 },
        "streak.lastActivityDate": { $lt: today },
      }).select("_id email name streak");

      if (users.length === 0) {
        logger.info("📋 No users need streak reminders");
        return;
      }

      logger.info(`📤 Sending streak reminders to ${users.length} users...`);

      const userIds = users.map((user: { _id: string }) => user._id);

      await this.notificationService.sendBulkNotifications(userIds, {
        title: "🔥 Don't Lose Your Streak!",
        body: "Your learning streak is at risk! Complete a quiz today to keep it going.",
        type: "streak_reminder",
        icon: "/icons/streak.png",
        badge: "/badge-icon.png",
        data: {
          action: "take_quiz",
          priority: "high",
        },
        clickAction: "/quiz",
      });

      logger.info(`✅ Streak reminders sent to ${users.length} users`);
    } catch (error) {
      logger.error("Error sending streak reminders:", String(error));
    }
  }

  /**
   * Send trial ending reminders
   */
  private async sendTrialEndingReminders(): Promise<void> {
    try {
      const now = new Date();

      // Calculate dates for 7 days and 1 day from now
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find active subscriptions ending in 7, 3, or 1 day
      const expiringSubscriptions = await Subscription.find({
        status: "trialing",
        trialEnd: {
          $gte: oneDayFromNow,
          $lte: sevenDaysFromNow,
        },
      }).populate("userId", "_id email name");

      if (expiringSubscriptions.length === 0) {
        logger.info("📋 No trial ending reminders needed");
        return;
      }

      logger.info(`📤 Sending trial ending reminders to ${expiringSubscriptions.length} users...`);

      for (const subscription of expiringSubscriptions) {
        const daysLeft = Math.ceil(
          (new Date(subscription.trialEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let title: string;
        let body: string;

        if (daysLeft === 7) {
          title = "⏰ Your Trial Ends in 7 Days";
          body = "Your free trial expires in a week. Keep learning with unlimited access!";
        } else if (daysLeft === 3) {
          title = "⏰ Your Trial Ends in 3 Days";
          body = "Only 3 days left in your trial. Subscribe now to continue your progress!";
        } else if (daysLeft === 1) {
          title = "⚠️ Last Day of Your Trial!";
          body = "Your trial ends tomorrow. Subscribe today to keep learning!";
        } else {
          continue;
        }

        const user = subscription.userId as { _id: string; email: string; name: string };
        await this.notificationService.sendNotification(user._id, {
          title,
          body,
          type: "trial_ending",
          icon: "/icons/subscription.png",
          badge: "/badge-icon.png",
          data: {
            action: "subscribe",
            daysLeft: daysLeft.toString(),
          },
          clickAction: "/pricing",
        });
      }

      logger.info(`✅ Trial ending reminders sent to ${expiringSubscriptions.length} users`);
    } catch (error) {
      logger.error("Error sending trial ending reminders:", String(error));
    }
  }

  /**
   * Send subscription expiry reminders
   */
  private async sendSubscriptionExpiryReminders(): Promise<void> {
    try {
      const now = new Date();

      // Calculate dates for 7 days and 3 days from now
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Find active subscriptions expiring soon
      const expiringSubscriptions = await Subscription.find({
        status: "active",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: {
          $gte: threeDaysFromNow,
          $lte: sevenDaysFromNow,
        },
      }).populate("userId", "_id email name");

      if (expiringSubscriptions.length === 0) {
        logger.info("📋 No subscription expiry reminders needed");
        return;
      }

      logger.info(
        `📤 Sending subscription expiry reminders to ${expiringSubscriptions.length} users...`
      );

      for (const subscription of expiringSubscriptions) {
        const daysLeft = Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        let title: string;
        let body: string;

        if (daysLeft === 7) {
          title = "📆 Subscription Ends in 7 Days";
          body = "Your subscription expires in a week. Renew now to keep learning!";
        } else if (daysLeft === 3) {
          title = "⏰ Subscription Ends in 3 Days";
          body = "Only 3 days left on your subscription. Renew to continue!";
        } else {
          continue;
        }

        const user = subscription.userId as { _id: string; email: string; name: string };
        await this.notificationService.sendNotification(user._id, {
          title,
          body,
          type: "subscription",
          icon: "/icons/subscription.png",
          badge: "/badge-icon.png",
          data: {
            action: "renew",
            daysLeft: daysLeft.toString(),
          },
          clickAction: "/subscription",
        });
      }

      logger.info(`✅ Subscription expiry reminders sent to ${expiringSubscriptions.length} users`);
    } catch (error) {
      logger.error("Error sending subscription expiry reminders:", String(error));
    }
  }

  /**
   * Send weekly progress summaries
   */
  private async sendWeeklyProgressSummaries(): Promise<void> {
    try {
      // Get all active users
      const users = await User.find({
        isActive: true,
        "stats.totalQuizzes": { $gt: 0 },
      }).select("_id email name stats streak");

      if (users.length === 0) {
        logger.info("📋 No users for weekly progress summaries");
        return;
      }

      logger.info(`📤 Sending weekly progress summaries to ${users.length} users...`);

      for (const user of users) {
        const streak = (user.streak as { currentStreak?: number })?.currentStreak || 0;
        const totalQuizzes = (user.stats as { totalQuizzes?: number })?.totalQuizzes || 0;
        const avgScore = (user.stats as { averageScore?: number })?.averageScore || 0;

        await this.notificationService.sendNotification(user._id, {
          title: "📊 Your Weekly Progress",
          body: `Streak: ${streak} days | Quizzes: ${totalQuizzes} | Avg Score: ${avgScore.toFixed(1)}%`,
          type: "new_content",
          icon: "/icons/progress.png",
          badge: "/badge-icon.png",
          data: {
            action: "view_progress",
            streak: streak.toString(),
            quizzes: totalQuizzes.toString(),
            avgScore: avgScore.toFixed(1),
          },
          clickAction: "/progress",
        });
      }

      logger.info(`✅ Weekly progress summaries sent to ${users.length} users`);
    } catch (error) {
      logger.error("Error sending weekly progress summaries:", String(error));
    }
  }

  /**
   * Send achievement notifications for recently earned badges
   */
  private async sendAchievementNotifications(): Promise<void> {
    try {
      // Find users who earned badges in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const users = await User.find({
        isActive: true,
        "gamification.badges": { $exists: true, $ne: [] },
        updatedAt: { $gte: oneHourAgo },
      })
        .select("_id email name gamification.badges gamification.xp")
        .limit(100); // Limit to prevent overwhelming the system

      if (users.length === 0) {
        logger.info("📋 No new achievements to notify");
        return;
      }

      logger.info(`📤 Checking achievements for ${users.length} users...`);

      let notificationsSent = 0;

      for (const user of users) {
        const badges = user.gamification?.badges || [];
        const latestBadge = badges[badges.length - 1];

        if (latestBadge) {
          await this.notificationService.sendNotification(user._id, {
            title: "🏆 Achievement Unlocked!",
            body: `Congratulations! You've earned the "${latestBadge}" badge!`,
            type: "achievement",
            icon: "/icons/trophy.png",
            badge: "/badge-icon.png",
            data: {
              action: "view_achievements",
              badgeName: latestBadge,
            },
            clickAction: "/achievements",
          });

          notificationsSent++;
        }
      }

      logger.info(`✅ Achievement notifications sent: ${notificationsSent}`);
    } catch (error) {
      logger.error("Error sending achievement notifications:", String(error));
    }
  }

  /**
   * Send notification to specific users about new content
   */
  async sendNewContentNotification(
    title: string,
    body: string,
    clickAction?: string
  ): Promise<void> {
    try {
      // Get all active users
      const users = await User.find({ isActive: true }).select("_id");

      if (users.length === 0) {
        logger.info("📋 No users to notify about new content");
        return;
      }

      logger.info(`📤 Sending new content notification to ${users.length} users...`);

      const userIds = users.map((user: { _id: string }) => user._id);

      await this.notificationService.sendBulkNotifications(userIds, {
        title,
        body,
        type: "new_content",
        icon: "/icons/new.png",
        badge: "/badge-icon.png",
        data: {
          action: "view_content",
        },
        clickAction: clickAction || "/explore",
      });

      logger.info(`✅ New content notification sent to ${users.length} users`);
    } catch (error) {
      logger.error("Error sending new content notification:", String(error));
    }
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();
