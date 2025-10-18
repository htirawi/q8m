/**
 * Monitoring Service
 * Tracks plan limit violations and suspicious activity
 */

import type { PlanTier } from "@shared/types/plan";
import type { FastifyInstance } from "fastify";

export interface PlanViolation {
  userId: string;
  userEmail?: string;
  planTier: PlanTier;
  violationType: "quota_exceeded" | "unauthorized_access" | "suspicious_activity";
  details: {
    framework?: string;
    requestedLimit?: number;
    allowedLimit?: number;
    currentUsage?: number;
    endpoint?: string;
    method?: string;
  };
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

export class MonitoringService {
  private static instance: MonitoringService;
  private violations: PlanViolation[] = [];
  private alertThresholds = {
    violationsPerHour: 10,
    violationsPerUser: 5,
  };

  private constructor(private fastify?: FastifyInstance) {}

  static getInstance(fastify?: FastifyInstance): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService(fastify);
    }
    return MonitoringService.instance;
  }

  /**
   * Log a plan limit violation
   */
  logViolation(violation: Omit<PlanViolation, "timestamp">): void {
    const fullViolation: PlanViolation = {
      ...violation,
      timestamp: new Date(),
    };

    this.violations.push(fullViolation);

    // Log to console/file
    this.fastify?.log.warn({
      type: "PLAN_VIOLATION",
      ...fullViolation,
    });

    // Check if we need to send alerts
    this.checkAlertThresholds();

    // Clean up old violations (keep last 24 hours)
    this.cleanupOldViolations();
  }

  /**
   * Log quota exceeded event
   */
  logQuotaExceeded(
    userId: string,
    planTier: PlanTier,
    framework: string,
    requested: number,
    allowed: number,
    current: number
  ): void {
    this.logViolation({
      userId,
      planTier,
      violationType: "quota_exceeded",
      details: {
        framework,
        requestedLimit: requested,
        allowedLimit: allowed,
        currentUsage: current,
      },
      severity: current > allowed * 1.5 ? "high" : "medium",
    });
  }

  /**
   * Log unauthorized access attempt
   */
  logUnauthorizedAccess(
    userId: string,
    planTier: PlanTier,
    endpoint: string,
    method: string,
    details?: Record<string, unknown>
  ): void {
    this.logViolation({
      userId,
      planTier,
      violationType: "unauthorized_access",
      details: {
        endpoint,
        method,
        ...details,
      },
      severity: "high",
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(
    userId: string,
    planTier: PlanTier,
    description: string,
    severity: "low" | "medium" | "high" | "critical" = "medium"
  ): void {
    this.logViolation({
      userId,
      planTier,
      violationType: "suspicious_activity",
      details: {
        endpoint: description,
      },
      severity,
    });
  }

  /**
   * Check if alert thresholds are exceeded
   */
  private checkAlertThresholds(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentViolations = this.violations.filter((v) => v.timestamp > oneHourAgo);

    // Check total violations threshold
    if (recentViolations.length >= this.alertThresholds.violationsPerHour) {
      this.sendAlert(
        "High volume of plan violations",
        `${recentViolations.length} violations in the last hour`,
        "critical"
      );
    }

    // Check per-user violations
    const userViolations = new Map<string, number>();
    recentViolations.forEach((v) => {
      const count = userViolations.get(v.userId) || 0;
      userViolations.set(v.userId, count + 1);
    });

    userViolations.forEach((count, userId) => {
      if (count >= this.alertThresholds.violationsPerUser) {
        this.sendAlert(
          "Suspicious user activity",
          `User ${userId} has ${count} violations in the last hour`,
          "high"
        );
      }
    });
  }

  /**
   * Send alert notification
   */
  private sendAlert(
    title: string,
    message: string,
    severity: "low" | "medium" | "high" | "critical"
  ): void {
    // In production, this would send to:
    // - Slack/Discord webhook
    // - Email to admin
    // - Monitoring dashboard (DataDog, Sentry, etc.)

    this.fastify?.log.error({
      type: "SECURITY_ALERT",
      title,
      message,
      severity,
      timestamp: new Date(),
    });

    // Example Slack webhook (uncomment in production)
    // fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     text: `🚨 ${title}`,
    //     attachments: [{
    //       color: severity === 'critical' ? 'danger' : 'warning',
    //       fields: [{
    //         title: 'Details',
    //         value: message,
    //         short: false
    //       }]
    //     }]
    //   })
    // });
  }

  /**
   * Clean up old violations
   */
  private cleanupOldViolations(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.violations = this.violations.filter((v) => v.timestamp > oneDayAgo);
  }

  /**
   * Get violation statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentCount: number;
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentViolations = this.violations.filter((v) => v.timestamp > oneHourAgo);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.violations.forEach((v) => {
      byType[v.violationType] = (byType[v.violationType] || 0) + 1;
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
    });

    return {
      total: this.violations.length,
      byType,
      bySeverity,
      recentCount: recentViolations.length,
    };
  }

  /**
   * Get recent violations for a specific user
   */
  getUserViolations(userId: string, hours: number = 24): PlanViolation[] {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.violations.filter((v) => v.userId === userId && v.timestamp > since);
  }

  /**
   * Check if user should be rate-limited based on violations
   */
  shouldRateLimit(userId: string): boolean {
    const userViolations = this.getUserViolations(userId, 1); // Last hour
    return userViolations.length >= 3; // More than 3 violations in an hour
  }

  /**
   * Export violations for analysis
   */
  exportViolations(since?: Date): PlanViolation[] {
    if (since) {
      return this.violations.filter((v) => v.timestamp > since);
    }
    return [...this.violations];
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();
