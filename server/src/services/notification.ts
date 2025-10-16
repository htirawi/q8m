import fs from "fs";
import path from "path";

import admin from "firebase-admin";
import type { ObjectId } from "mongoose";

import { DeviceToken } from "../models/DeviceToken";
import { NotificationHistory } from "../models/NotificationHistory";
import {
  NotificationPreferences,
  type INotificationPreferences,
} from "../models/NotificationPreferences";
import type { NotificationPayload, NotificationMetadata, SendResult } from "../types/notification";

// Initialize Firebase Admin SDK (singleton)
let firebaseApp: admin.app.App | null = null;

function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check for base64 encoded service account (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const serviceAccountJson = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf-8");
      const serviceAccount = JSON.parse(serviceAccountJson);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
    // Check for service account file path (for development)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = path.resolve(
        process.cwd(),
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      );

      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      throw new Error(
        "Firebase Admin SDK not configured. Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_BASE64 in .env"
      );
    }

    console.log("✅ Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

export class NotificationService {
  private messaging: admin.messaging.Messaging;

  constructor() {
    const app = initializeFirebase();
    this.messaging = app.messaging();
  }

  /**
   * Register FCM token for a user
   */
  async registerToken(
    userId: string | ObjectId,
    token: string,
    metadata: NotificationMetadata
  ): Promise<void> {
    try {
      // Check if token already exists
      const existingToken = await DeviceToken.findOne({ token });

      if (existingToken) {
        // Update existing token
        existingToken.userId = userId as ObjectId;
        existingToken.platform = metadata.platform;
        existingToken.userAgent = metadata.userAgent;
        existingToken.lastUsed = new Date();
        existingToken.isActive = true;
        await existingToken.save();
      } else {
        // Create new token
        await DeviceToken.create({
          userId,
          token,
          platform: metadata.platform,
          userAgent: metadata.userAgent,
          lastUsed: new Date(),
          isActive: true,
        });
      }

      console.log(`✅ FCM token registered for user ${userId}`);
    } catch (error) {
      console.error("Error registering FCM token:", error);
      throw error;
    }
  }

  /**
   * Unregister FCM token (e.g., on logout)
   */
  async unregisterToken(userId: string | ObjectId, token: string): Promise<void> {
    try {
      await DeviceToken.findOneAndUpdate({ userId, token }, { isActive: false }, { new: true });

      console.log(`✅ FCM token unregistered for user ${userId}`);
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      throw error;
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string | ObjectId): Promise<INotificationPreferences> {
    try {
      let preferences = await NotificationPreferences.findOne({ userId });

      // Create default preferences if not found
      if (!preferences) {
        preferences = await NotificationPreferences.create({
          userId,
          enabled: true,
          types: {
            streak: true,
            content: true,
            challenges: true,
            achievements: true,
            subscription: true,
          },
          frequency: "realtime",
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "08:00",
            timezone: "UTC",
          },
        });
      }

      return preferences;
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      throw error;
    }
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string | ObjectId,
    preferences: Partial<INotificationPreferences>
  ): Promise<void> {
    try {
      await NotificationPreferences.findOneAndUpdate(
        { userId },
        { $set: preferences },
        { upsert: true, new: true }
      );

      console.log(`✅ Notification preferences updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  }

  /**
   * Check if user is in quiet hours
   */
  private isInQuietHours(preferences: INotificationPreferences): boolean {
    if (!preferences.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const timezone = preferences.quietHours.timezone || "UTC";

    // Convert current time to user's timezone
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Parse start and end times
    const [startHour, startMinute] = preferences.quietHours.start.split(":").map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(":").map(Number);
    const startTimeInMinutes = (startHour ?? 0) * 60 + (startMinute ?? 0);
    const endTimeInMinutes = (endHour ?? 0) * 60 + (endMinute ?? 0);

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startTimeInMinutes > endTimeInMinutes) {
      return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
    }

    // Normal range (e.g., 13:00 - 17:00)
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  }

  /**
   * Send notification to a user
   */
  async sendNotification(
    userId: string | ObjectId,
    payload: NotificationPayload
  ): Promise<SendResult> {
    try {
      // Get user preferences
      const preferences = await this.getPreferences(userId);

      // Check if notifications are enabled
      if (!preferences.enabled) {
        console.log(`⏭️  Notifications disabled for user ${userId}`);
        return { success: false, successCount: 0, failureCount: 0 };
      }

      // Check notification type preference
      const notificationType = payload.type || "subscription";
      if (
        preferences.types &&
        notificationType in preferences.types &&
        !(preferences.types as Record<string, boolean>)[notificationType]
      ) {
        console.log(`⏭️  Notification type ${notificationType} disabled for user ${userId}`);
        return { success: false, successCount: 0, failureCount: 0 };
      }

      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        console.log(`🔕 User ${userId} is in quiet hours, notification skipped`);
        return { success: false, successCount: 0, failureCount: 0 };
      }

      // Get active device tokens
      const deviceTokens = await DeviceToken.find({
        userId,
        isActive: true,
      });

      if (deviceTokens.length === 0) {
        console.log(`⚠️  No active device tokens found for user ${userId}`);
        return { success: false, successCount: 0, failureCount: 0 };
      }

      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens.map((dt: { token: string }) => dt.token),
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: {
          ...payload.data,
          type: payload.type || "subscription",
          clickAction: payload.clickAction || "/",
        },
        webpush: {
          notification: {
            icon: payload.icon || "/logo.png",
            badge: payload.badge || "/badge-icon.png",
            tag: payload.type || "default",
            requireInteraction: false,
          },
          fcmOptions: {
            link: payload.clickAction || "/",
          },
        },
      };

      // Send notification
      const response = await this.messaging.sendEachForMulticast(message);

      // Update device token last used times
      await DeviceToken.updateMany({ userId, isActive: true }, { lastUsed: new Date() });

      // Handle failed tokens (invalid or expired)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx].token);
            console.error(`Failed to send to token: ${resp.error?.message}`);
          }
        });

        // Deactivate failed tokens
        await DeviceToken.updateMany({ token: { $in: failedTokens } }, { isActive: false });
      }

      // Save to notification history
      await NotificationHistory.create({
        userId,
        type: payload.type || "subscription",
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        status: response.successCount > 0 ? "sent" : "failed",
        sentAt: new Date(),
        deviceTokensUsed: deviceTokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
        clicked: false,
      });

      console.log(
        `✅ Notification sent to user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed`
      );

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error("Error sending notification:", error);

      // Save failed notification to history
      await NotificationHistory.create({
        userId,
        type: payload.type || "subscription",
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
        deviceTokensUsed: 0,
        successCount: 0,
        failureCount: 1,
        clicked: false,
      });

      throw error;
    }
  }

  /**
   * Send test notification to user
   */
  async sendTestNotification(userId: string | ObjectId): Promise<SendResult> {
    return this.sendNotification(userId, {
      title: "🔔 Test Notification",
      body: "This is a test notification from Q8M. If you see this, notifications are working!",
      type: "subscription",
      icon: "/logo.png",
      badge: "/badge-icon.png",
      data: {
        test: "true",
        timestamp: new Date().toISOString(),
      },
      clickAction: "/dashboard",
    });
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: string | ObjectId,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: unknown[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        NotificationHistory.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        NotificationHistory.countDocuments({ userId }),
      ]);

      return {
        notifications,
        total,
        hasMore: skip + notifications.length < total,
      };
    } catch (error) {
      console.error("Error getting notification history:", error);
      throw error;
    }
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(notificationId: string): Promise<void> {
    try {
      await NotificationHistory.findByIdAndUpdate(notificationId, {
        clicked: true,
        clickedAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as clicked:", error);
      throw error;
    }
  }

  /**
   * Send bulk notifications (for scheduled tasks)
   */
  async sendBulkNotifications(
    userIds: (string | ObjectId)[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(userId, payload);
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        failed++;
      }
    }

    console.log(`📊 Bulk notifications: ${sent} sent, ${failed} failed`);

    return { sent, failed };
  }
}
