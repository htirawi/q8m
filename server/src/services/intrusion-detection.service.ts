/**
 * Intrusion Detection Service
 *
 * Monitors suspicious activity patterns and generates alerts:
 * - Excessive failed logins
 * - Sudden 401/403 or 5xx spikes
 * - Suspicious path attempts (traversal, admin probing)
 * - Rate limit breaches
 * - Webhook signature failures
 */

import type { FastifyRequest } from "fastify";

/**
 * Intrusion signal types
 */
export type IntrusionSignal =
  | "excessive_failed_logins"
  | "auth_spike_401"
  | "auth_spike_403"
  | "server_error_spike_5xx"
  | "path_traversal_attempt"
  | "admin_path_probe"
  | "rate_limit_breach"
  | "webhook_signature_failure"
  | "suspicious_user_agent"
  | "sql_injection_attempt"
  | "xss_attempt";

/**
 * Intrusion severity levels
 */
export type IntrusionSeverity = "low" | "medium" | "high" | "critical";

/**
 * Intrusion detection configuration
 */
export interface IntrusionDetectionConfig {
  // Failed login thresholds
  maxFailedLoginsPerIp: number;
  maxFailedLoginsPerUser: number;
  failedLoginWindowMinutes: number;

  // HTTP error spike thresholds
  max401PerRoute: number;
  max403PerRoute: number;
  max5xxPerRoute: number;
  errorSpikeWindowMinutes: number;

  // Rate limit breach threshold
  maxRateLimitBreachesPerIp: number;
  rateLimitBreachWindowMinutes: number;

  // Webhook failure threshold
  maxWebhookFailuresPerIp: number;
  webhookFailureWindowMinutes: number;

  // Alert configuration
  alertCooldownMinutes: number;
  enableAlerts: boolean;
  enableAutoBlock: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: IntrusionDetectionConfig = {
  // Failed logins
  maxFailedLoginsPerIp: 10,
  maxFailedLoginsPerUser: 5,
  failedLoginWindowMinutes: 15,

  // HTTP errors
  max401PerRoute: 20,
  max403PerRoute: 10,
  max5xxPerRoute: 50,
  errorSpikeWindowMinutes: 5,

  // Rate limits
  maxRateLimitBreachesPerIp: 5,
  rateLimitBreachWindowMinutes: 15,

  // Webhooks
  maxWebhookFailuresPerIp: 10,
  webhookFailureWindowMinutes: 15,

  // Alerts
  alertCooldownMinutes: 60,
  enableAlerts: true,
  enableAutoBlock: false,
};

/**
 * Intrusion event
 */
export interface IntrusionEvent {
  signal: IntrusionSignal;
  severity: IntrusionSeverity;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  userId?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Alert handler function type
 */
export type AlertHandler = (event: IntrusionEvent) => Promise<void> | void;

/**
 * In-memory storage for detection windows
 * In production, use Redis for distributed detection
 */
class DetectionStore {
  private failedLogins = new Map<string, Array<{ timestamp: number; userId?: string }>>();
  private httpErrors = new Map<string, Array<{ timestamp: number; status: number }>>();
  private rateLimitBreaches = new Map<string, Array<{ timestamp: number }>>();
  private webhookFailures = new Map<string, Array<{ timestamp: number }>>();
  private alerts = new Map<string, number>(); // Last alert timestamp by signal+ip

  /**
   * Record failed login attempt
   */
  recordFailedLogin(ip: string, userId?: string): void {
    const key = `login:${ip}`;
    const attempts = this.failedLogins.get(key) || [];
    attempts.push({ timestamp: Date.now(), userId });
    this.failedLogins.set(key, attempts);
    this.cleanup(this.failedLogins, DEFAULT_CONFIG.failedLoginWindowMinutes);
  }

  /**
   * Get failed login count for IP
   */
  getFailedLoginCount(ip: string, windowMinutes: number): number {
    const key = `login:${ip}`;
    const attempts = this.failedLogins.get(key) || [];
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    return attempts.filter((a) => a.timestamp > cutoff).length;
  }

  /**
   * Record HTTP error
   */
  recordHttpError(route: string, status: number): void {
    const key = `error:${route}:${status}`;
    const errors = this.httpErrors.get(key) || [];
    errors.push({ timestamp: Date.now(), status });
    this.httpErrors.set(key, errors);
    this.cleanup(this.httpErrors, DEFAULT_CONFIG.errorSpikeWindowMinutes);
  }

  /**
   * Get HTTP error count for route
   */
  getHttpErrorCount(route: string, status: number, windowMinutes: number): number {
    const key = `error:${route}:${status}`;
    const errors = this.httpErrors.get(key) || [];
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    return errors.filter((e) => e.timestamp > cutoff).length;
  }

  /**
   * Record rate limit breach
   */
  recordRateLimitBreach(ip: string): void {
    const key = `ratelimit:${ip}`;
    const breaches = this.rateLimitBreaches.get(key) || [];
    breaches.push({ timestamp: Date.now() });
    this.rateLimitBreaches.set(key, breaches);
    this.cleanup(this.rateLimitBreaches, DEFAULT_CONFIG.rateLimitBreachWindowMinutes);
  }

  /**
   * Get rate limit breach count for IP
   */
  getRateLimitBreachCount(ip: string, windowMinutes: number): number {
    const key = `ratelimit:${ip}`;
    const breaches = this.rateLimitBreaches.get(key) || [];
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    return breaches.filter((b) => b.timestamp > cutoff).length;
  }

  /**
   * Record webhook failure
   */
  recordWebhookFailure(ip: string): void {
    const key = `webhook:${ip}`;
    const failures = this.webhookFailures.get(key) || [];
    failures.push({ timestamp: Date.now() });
    this.webhookFailures.set(key, failures);
    this.cleanup(this.webhookFailures, DEFAULT_CONFIG.webhookFailureWindowMinutes);
  }

  /**
   * Get webhook failure count for IP
   */
  getWebhookFailureCount(ip: string, windowMinutes: number): number {
    const key = `webhook:${ip}`;
    const failures = this.webhookFailures.get(key) || [];
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    return failures.filter((f) => f.timestamp > cutoff).length;
  }

  /**
   * Check if alert should be sent (with cooldown)
   */
  shouldSendAlert(signal: IntrusionSignal, ip: string, cooldownMinutes: number): boolean {
    const key = `alert:${signal}:${ip}`;
    const lastAlert = this.alerts.get(key) || 0;
    const now = Date.now();

    if (now - lastAlert > cooldownMinutes * 60 * 1000) {
      this.alerts.set(key, now);
      return true;
    }

    return false;
  }

  /**
   * Cleanup old entries from map
   */
  private cleanup<T>(
    map: Map<string, Array<{ timestamp: number } & T>>,
    windowMinutes: number
  ): void {
    const cutoff = Date.now() - windowMinutes * 60 * 1000 * 2; // Keep 2x window

    for (const [key, entries] of map.entries()) {
      const filtered = entries.filter((e) => e.timestamp > cutoff);
      if (filtered.length === 0) {
        map.delete(key);
      } else {
        map.set(key, filtered);
      }
    }
  }
}

/**
 * Intrusion Detection Service
 */
export class IntrusionDetectionService {
  private config: IntrusionDetectionConfig;
  private store = new DetectionStore();
  private alertHandlers: AlertHandler[] = [];

  constructor(config: Partial<IntrusionDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register an alert handler
   */
  registerAlertHandler(handler: AlertHandler): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Clear all alert handlers (for testing)
   */
  clearAlertHandlers(): void {
    this.alertHandlers = [];
  }

  /**
   * Reset detection store (for testing)
   */
  resetStore(): void {
    this.store = new DetectionStore();
  }

  /**
   * Send alert to all handlers
   */
  private async sendAlert(event: IntrusionEvent): Promise<void> {
    if (!this.config.enableAlerts) {
      return;
    }

    // Check cooldown
    if (!this.store.shouldSendAlert(event.signal, event.ip, this.config.alertCooldownMinutes)) {
      return; // Skip duplicate alerts
    }

    // Send to all handlers
    for (const handler of this.alertHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error("Alert handler error:", error);
      }
    }
  }

  /**
   * Detect failed login attempts
   */
  async detectFailedLogin(ip: string, userId?: string, userAgent?: string): Promise<void> {
    this.store.recordFailedLogin(ip, userId);

    const failedCount = this.store.getFailedLoginCount(ip, this.config.failedLoginWindowMinutes);

    if (failedCount >= this.config.maxFailedLoginsPerIp) {
      await this.sendAlert({
        signal: "excessive_failed_logins",
        severity: "high",
        timestamp: new Date(),
        ip,
        userId,
        userAgent,
        metadata: {
          failedAttempts: failedCount,
          windowMinutes: this.config.failedLoginWindowMinutes,
        },
      });
    }
  }

  /**
   * Detect HTTP error spikes
   */
  async detectHttpError(request: FastifyRequest, statusCode: number, route: string): Promise<void> {
    this.store.recordHttpError(route, statusCode);

    const { ip, headers } = request;
    const userAgent = headers["user-agent"];

    // Check for 401 spike
    if (statusCode === 401) {
      const count = this.store.getHttpErrorCount(route, 401, this.config.errorSpikeWindowMinutes);
      if (count >= this.config.max401PerRoute) {
        await this.sendAlert({
          signal: "auth_spike_401",
          severity: "medium",
          timestamp: new Date(),
          ip: ip || "unknown",
          userAgent,
          route,
          metadata: {
            count,
            windowMinutes: this.config.errorSpikeWindowMinutes,
          },
        });
      }
    }

    // Check for 403 spike
    if (statusCode === 403) {
      const count = this.store.getHttpErrorCount(route, 403, this.config.errorSpikeWindowMinutes);
      if (count >= this.config.max403PerRoute) {
        await this.sendAlert({
          signal: "auth_spike_403",
          severity: "medium",
          timestamp: new Date(),
          ip: ip || "unknown",
          userAgent,
          route,
          metadata: {
            count,
            windowMinutes: this.config.errorSpikeWindowMinutes,
          },
        });
      }
    }

    // Check for 5xx spike
    if (statusCode >= 500 && statusCode < 600) {
      const count = this.store.getHttpErrorCount(
        route,
        statusCode,
        this.config.errorSpikeWindowMinutes
      );
      if (count >= this.config.max5xxPerRoute) {
        await this.sendAlert({
          signal: "server_error_spike_5xx",
          severity: "high",
          timestamp: new Date(),
          ip: ip || "unknown",
          userAgent,
          route,
          metadata: {
            statusCode,
            count,
            windowMinutes: this.config.errorSpikeWindowMinutes,
          },
        });
      }
    }
  }

  /**
   * Detect suspicious path attempts
   */
  async detectSuspiciousPath(request: FastifyRequest): Promise<void> {
    const { url, ip, headers } = request;
    const userAgent = headers["user-agent"];

    // Path traversal patterns
    const traversalPatterns = [/\.\./, /%2e%2e/i, /\.\.%2f/i, /%2e%2e%2f/i];

    if (traversalPatterns.some((pattern) => pattern.test(url))) {
      await this.sendAlert({
        signal: "path_traversal_attempt",
        severity: "critical",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        route: url,
        metadata: {
          url,
          pattern: "path_traversal",
        },
      });
    }

    // Admin/config path probing
    const suspiciousPaths = [
      "/wp-admin",
      "/admin/login",
      "/phpmyadmin",
      "/.env",
      "/.git",
      "/config",
      "/backup",
      "/db",
      "/sql",
    ];

    if (suspiciousPaths.some((path) => url.toLowerCase().includes(path))) {
      await this.sendAlert({
        signal: "admin_path_probe",
        severity: "medium",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        route: url,
        metadata: {
          url,
          pattern: "admin_probe",
        },
      });
    }
  }

  /**
   * Detect rate limit breaches
   */
  async detectRateLimitBreach(request: FastifyRequest, route: string): Promise<void> {
    const { ip, headers } = request;
    const userAgent = headers["user-agent"];

    this.store.recordRateLimitBreach(ip || "unknown");

    const breachCount = this.store.getRateLimitBreachCount(
      ip || "unknown",
      this.config.rateLimitBreachWindowMinutes
    );

    if (breachCount >= this.config.maxRateLimitBreachesPerIp) {
      await this.sendAlert({
        signal: "rate_limit_breach",
        severity: "high",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        route,
        metadata: {
          breachCount,
          windowMinutes: this.config.rateLimitBreachWindowMinutes,
        },
      });
    }
  }

  /**
   * Detect webhook signature failures
   */
  async detectWebhookFailure(ip: string, gateway: string, userAgent?: string): Promise<void> {
    this.store.recordWebhookFailure(ip);

    const failureCount = this.store.getWebhookFailureCount(
      ip,
      this.config.webhookFailureWindowMinutes
    );

    if (failureCount >= this.config.maxWebhookFailuresPerIp) {
      await this.sendAlert({
        signal: "webhook_signature_failure",
        severity: "high",
        timestamp: new Date(),
        ip,
        userAgent,
        metadata: {
          gateway,
          failureCount,
          windowMinutes: this.config.webhookFailureWindowMinutes,
        },
      });
    }
  }

  /**
   * Detect suspicious user agent
   */
  async detectSuspiciousUserAgent(request: FastifyRequest): Promise<void> {
    const { ip, headers } = request;
    const userAgent = headers["user-agent"] || "";

    // Suspicious user agent patterns
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /nessus/i,
      /burp/i,
      /metasploit/i,
      /havij/i,
      /acunetix/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
      await this.sendAlert({
        signal: "suspicious_user_agent",
        severity: "high",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        metadata: {
          userAgent,
          pattern: "security_scanner",
        },
      });
    }
  }

  /**
   * Detect SQL injection attempts
   */
  async detectSqlInjection(request: FastifyRequest): Promise<void> {
    const { url, body, ip, headers } = request;
    const userAgent = headers["user-agent"];

    // SQL injection patterns
    const sqlPatterns = [
      /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /;\s*drop/i,
      /'\s+or\s+'/i,
      /"\s+or\s+"/i,
    ];

    const bodyStr = JSON.stringify(body);
    if (sqlPatterns.some((pattern) => pattern.test(url) || pattern.test(bodyStr))) {
      await this.sendAlert({
        signal: "sql_injection_attempt",
        severity: "critical",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        route: url,
        metadata: {
          url,
          pattern: "sql_injection",
        },
      });
    }
  }

  /**
   * Detect XSS attempts
   */
  async detectXssAttempt(request: FastifyRequest): Promise<void> {
    const { url, body, ip, headers } = request;
    const userAgent = headers["user-agent"];

    // XSS patterns
    // ✅ SECURITY FIX (CodeQL #729): Fixed bad HTML filtering regexp
    // Properly matches script tags with whitespace variations (e.g., </script >, </script  >)
    const xssPatterns = [
      /<script[\s\S]{0,1000}?<\s*\/\s*script\s*>/i, // Matches </script>, </script >, etc.
      /<script[^>]{0,1000}?>/i, // Opening script tag variations
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /<iframe[\s>]/i, // More specific pattern
      /eval\s*\(/i,
      /<object[\s>]/i,
      /<embed[\s>]/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Generic event handler detection
    ];

    const bodyStr = JSON.stringify(body);
    if (xssPatterns.some((pattern) => pattern.test(url) || pattern.test(bodyStr))) {
      await this.sendAlert({
        signal: "xss_attempt",
        severity: "high",
        timestamp: new Date(),
        ip: ip || "unknown",
        userAgent,
        route: url,
        metadata: {
          url,
          pattern: "xss",
        },
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): IntrusionDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IntrusionDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Export singleton instance
 */
export const intrusionDetectionService = new IntrusionDetectionService();

/**
 * Default console alert handler (for development)
 */
export const consoleAlertHandler: AlertHandler = (event: IntrusionEvent) => {
  console.warn("🚨 INTRUSION DETECTION ALERT:", {
    signal: event.signal,
    severity: event.severity,
    ip: event.ip,
    route: event.route,
    metadata: event.metadata,
  });
};

/**
 * Register default alert handler
 */
intrusionDetectionService.registerAlertHandler(consoleAlertHandler);
