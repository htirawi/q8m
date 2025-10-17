/**
 * Audit Log Service
 *
 * Provides a clean interface for writing tamper-evident audit logs.
 * Handles hash chaining, sequence numbering, and PII redaction.
 */

import {
  AuditLog,
  type IAuditLog,
  type AuditAction,
  type AuditSeverity,
} from "@models/AuditLog.js";
import { sanitizeForLog, shortHash } from "@server/security/logging.js";
import type { FastifyRequest } from "fastify";

/**
 * Audit log entry data
 */
export interface AuditLogEntry {
  // Required fields
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorIp: string;
  requestId: string;

  // Optional fields
  severity?: AuditSeverity;
  targetType?: string;
  targetId?: string;
  targetEmail?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Extract audit context from Fastify request
 */
export function extractAuditContext(request: FastifyRequest): {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorIp: string;
  requestId: string;
  userAgent?: string;
} {
  const { authUser, id: requestId, ip, headers } = request;

  if (!authUser) {
    throw new Error("Cannot create audit log without authenticated user");
  }

  return {
    actorId: authUser.id,
    actorEmail: authUser.email,
    actorRole: authUser.role,
    actorIp: ip || "0.0.0.0",
    requestId: requestId || "unknown",
    userAgent: headers["user-agent"] || undefined,
  };
}

/**
 * Redact sensitive fields from change data
 */
function redactSensitiveFields(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "refreshToken",
    "accessToken",
    "secret",
    "apiKey",
    "card",
    "cvv",
    "ssn",
    "taxId",
  ];

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      redacted[key] = "[REDACTED]";
    } else if (key === "email") {
      // Hash email to prevent PII leakage
      redacted[key] = typeof value === "string" ? shortHash(value) : value;
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively redact nested objects
      redacted[key] = redactSensitiveFields(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Audit Log Service
 */
export class AuditLogService {
  /**
   * Write an audit log entry
   */
  async write(entry: AuditLogEntry): Promise<IAuditLog> {
    try {
      // Get the last log entry for hash chaining
      const lastLog = await AuditLog.getLastLog();

      const sequenceNumber = lastLog ? lastLog.sequenceNumber + 1 : 1;
      const previousHash = lastLog ? lastLog.currentHash : "0".repeat(64); // Genesis hash

      // Redact sensitive fields from changes
      let sanitizedChanges: typeof entry.changes | undefined;
      if (entry.changes) {
        sanitizedChanges = {
          before: entry.changes.before ? redactSensitiveFields(entry.changes.before) : undefined,
          after: entry.changes.after ? redactSensitiveFields(entry.changes.after) : undefined,
        };
      }

      // Calculate current hash
      const timestamp = new Date();
      const currentHash = AuditLog.calculateHash(previousHash, sequenceNumber, {
        timestamp,
        action: entry.action,
        actorId: entry.actorId,
        targetId: entry.targetId,
        changes: sanitizedChanges,
      });

      // Create audit log entry
      const auditLog = new AuditLog({
        timestamp,
        action: entry.action,
        severity: entry.severity || "info",
        actorId: entry.actorId,
        actorEmail: sanitizeForLog(entry.actorEmail),
        actorRole: entry.actorRole,
        actorIp: entry.actorIp,
        targetType: entry.targetType,
        targetId: entry.targetId,
        targetEmail: entry.targetEmail ? sanitizeForLog(entry.targetEmail) : undefined,
        requestId: entry.requestId,
        userAgent: entry.userAgent ? sanitizeForLog(entry.userAgent) : undefined,
        changes: sanitizedChanges,
        metadata: entry.metadata ? redactSensitiveFields(entry.metadata) : undefined,
        previousHash,
        currentHash,
        sequenceNumber,
        isImmutable: true,
      });

      await auditLog.save();

      return auditLog;
    } catch (error) {
      // Log error but don't throw (audit logging should not break app flow)
      console.error("Failed to write audit log:", error);
      throw error; // Re-throw for now, can be changed to silent failure
    }
  }

  /**
   * Write audit log from Fastify request context
   */
  async writeFromRequest(
    request: FastifyRequest,
    data: {
      action: AuditAction;
      severity?: AuditSeverity;
      targetType?: string;
      targetId?: string;
      targetEmail?: string;
      changes?: AuditLogEntry["changes"];
      metadata?: Record<string, unknown>;
    }
  ): Promise<IAuditLog> {
    const context = extractAuditContext(request);

    return this.write({
      ...context,
      ...data,
    });
  }

  /**
   * Get audit logs by actor
   */
  async getByActor(
    actorId: string,
    options?: {
      limit?: number;
      skip?: number;
      action?: AuditAction;
      severity?: AuditSeverity;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<IAuditLog[]> {
    return AuditLog.getByActor(actorId, options);
  }

  /**
   * Get audit logs by target
   */
  async getByTarget(
    targetId: string,
    options?: {
      limit?: number;
      skip?: number;
      action?: AuditAction;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<IAuditLog[]> {
    return AuditLog.getByTarget(targetId, options);
  }

  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(
    fromSequence?: number,
    toSequence?: number
  ): Promise<{
    valid: boolean;
    totalChecked: number;
    errors: Array<{
      sequenceNumber: number;
      error: string;
    }>;
  }> {
    return AuditLog.verifyIntegrity(fromSequence, toSequence);
  }

  /**
   * Get recent audit logs
   */
  async getRecent(limit: number = 100): Promise<IAuditLog[]> {
    return AuditLog.find({}).sort({ timestamp: -1 }).limit(limit).exec();
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    byActor: Array<{ actorId: string; actorEmail: string; count: number }>;
  }> {
    const dateFilter: Record<string, unknown> = {};
    if (fromDate || toDate) {
      dateFilter.timestamp = {};
      if (fromDate) {
        (dateFilter.timestamp as Record<string, unknown>).$gte = fromDate;
      }
      if (toDate) {
        (dateFilter.timestamp as Record<string, unknown>).$lte = toDate;
      }
    }

    const [total, byAction, bySeverity, byActor] = await Promise.all([
      // Total logs
      AuditLog.countDocuments(dateFilter),

      // By action
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ]),

      // By severity
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),

      // By actor
      AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$actorId",
            actorEmail: { $first: "$actorEmail" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      totalLogs: total,
      byAction: Object.fromEntries(
        byAction.map((item: { _id: string; count: number }) => [item._id, item.count])
      ),
      bySeverity: Object.fromEntries(
        bySeverity.map((item: { _id: string; count: number }) => [item._id, item.count])
      ),
      byActor: byActor.map((item: { _id: string; actorEmail: string; count: number }) => ({
        actorId: item._id,
        actorEmail: item.actorEmail,
        count: item.count,
      })),
    };
  }
}

/**
 * Export singleton instance
 */
export const auditLogService = new AuditLogService();
