/**
 * AuditLog Model
 *
 * Append-only, tamper-evident audit log for administrative actions.
 * Implements hash chaining to detect tampering and ensure immutability.
 */

import { createHash } from "crypto";

import mongoose, { type Document, Schema } from "mongoose";

/**
 * Audit log action types
 */
export type AuditAction =
  | "user.create"
  | "user.update"
  | "user.delete"
  | "user.role.change"
  | "user.entitlement.change"
  | "user.suspend"
  | "user.unsuspend"
  | "question.create"
  | "question.update"
  | "question.delete"
  | "subscription.create"
  | "subscription.update"
  | "subscription.cancel"
  | "payment.refund"
  | "data.export"
  | "admin.impersonate"
  | "admin.config.change"
  | "security.incident"
  | "auth.failed_login"
  | "auth.password_reset";

/**
 * Audit log severity levels
 */
export type AuditSeverity = "info" | "warning" | "error" | "critical";

/**
 * Audit log interface
 */
export interface IAuditLog extends Document {
  // Audit metadata
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;

  // Actor information (who performed the action)
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorIp: string;

  // Target information (what was affected)
  targetType?: string;
  targetId?: string;
  targetEmail?: string;

  // Request context
  requestId: string;
  userAgent?: string;

  // Change details
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };

  // Additional metadata
  metadata?: Record<string, unknown>;

  // Tamper detection (hash chain)
  previousHash: string;
  currentHash: string;
  sequenceNumber: number;

  // Immutability enforcement
  isImmutable: boolean;
}

/**
 * AuditLog Schema
 */
const AuditLogSchema = new Schema<IAuditLog>(
  {
    // Audit metadata
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user.create",
        "user.update",
        "user.delete",
        "user.role.change",
        "user.entitlement.change",
        "user.suspend",
        "user.unsuspend",
        "question.create",
        "question.update",
        "question.delete",
        "subscription.create",
        "subscription.update",
        "subscription.cancel",
        "payment.refund",
        "data.export",
        "admin.impersonate",
        "admin.config.change",
        "security.incident",
        "auth.failed_login",
        "auth.password_reset",
      ],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["info", "warning", "error", "critical"],
      default: "info",
      index: true,
    },

    // Actor information
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
      index: true,
    },
    actorIp: {
      type: String,
      required: true,
    },

    // Target information
    targetType: {
      type: String,
      index: true,
    },
    targetId: {
      type: String,
      index: true,
    },
    targetEmail: {
      type: String,
    },

    // Request context
    requestId: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },

    // Change details
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },

    // Additional metadata
    metadata: {
      type: Schema.Types.Mixed,
    },

    // Tamper detection
    previousHash: {
      type: String,
      required: true,
      index: true,
    },
    currentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
      index: true,
      unique: true,
    },

    // Immutability enforcement
    isImmutable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "audit_logs",
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ timestamp: -1, action: 1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ targetId: 1, timestamp: -1 });
AuditLogSchema.index({ requestId: 1 });
AuditLogSchema.index({ sequenceNumber: 1 }, { unique: true });

/**
 * Prevent updates to audit logs (append-only)
 */
AuditLogSchema.pre("save", function (next) {
  if (this.isNew) {
    // New document, allow save
    this.isImmutable = true;
    next();
  } else {
    // Attempting to modify existing document, reject
    next(new Error("Audit logs are immutable and cannot be modified"));
  }
});

/**
 * Prevent deletion of audit logs
 */
AuditLogSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  next(new Error("Audit logs cannot be deleted"));
});

/**
 * Prevent deletion of audit logs (findOneAndDelete)
 */
AuditLogSchema.pre("findOneAndDelete", function (next) {
  next(new Error("Audit logs cannot be deleted"));
});

/**
 * Prevent deletion of audit logs (findOneAndRemove) - deprecated in Mongoose 7+
 * Note: This hook may not be called in Mongoose 7+ as findOneAndRemove is deprecated
 */
// @ts-ignore - findOneAndRemove is deprecated in Mongoose 7+ but kept for backwards compatibility
AuditLogSchema.pre("findOneAndRemove", function (next: (err?: Error) => void) {
  next(new Error("Audit logs cannot be deleted"));
});

/**
 * Prevent updates to audit logs
 */
AuditLogSchema.pre("updateOne", { document: true, query: false }, function (next) {
  next(new Error("Audit logs are immutable and cannot be updated"));
});

/**
 * Prevent updates to audit logs (findOneAndUpdate)
 */
AuditLogSchema.pre("findOneAndUpdate", function (next) {
  next(new Error("Audit logs are immutable and cannot be updated"));
});

/**
 * Static method: Get the last audit log (for hash chaining)
 */
AuditLogSchema.statics.getLastLog = async function (): Promise<IAuditLog | null> {
  return this.findOne({}).sort({ sequenceNumber: -1 }).exec();
};

/**
 * Static method: Calculate hash for audit log entry
 */
AuditLogSchema.statics.calculateHash = function (
  previousHash: string,
  sequenceNumber: number,
  data: {
    timestamp: Date;
    action: string;
    actorId: string;
    targetId?: string;
    changes?: unknown;
  }
): string {
  const payload = {
    previousHash,
    sequenceNumber,
    timestamp: data.timestamp.toISOString(),
    action: data.action,
    actorId: data.actorId,
    targetId: data.targetId || "",
    changes: JSON.stringify(data.changes || {}),
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
};

/**
 * Static method: Verify integrity of audit log chain
 */
AuditLogSchema.statics.verifyIntegrity = async function (
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
  const query: Record<string, unknown> = {};
  if (fromSequence !== undefined) {
    query.sequenceNumber = { $gte: fromSequence };
  }
  if (toSequence !== undefined) {
    query.sequenceNumber = {
      ...(query.sequenceNumber as Record<string, unknown>),
      $lte: toSequence,
    };
  }

  const logs = await this.find(query).sort({ sequenceNumber: 1 }).exec();
  const errors: Array<{ sequenceNumber: number; error: string }> = [];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Verify sequence number is continuous
    if (i > 0 && log.sequenceNumber !== logs[i - 1].sequenceNumber + 1) {
      errors.push({
        sequenceNumber: log.sequenceNumber,
        error: `Sequence gap detected: expected ${logs[i - 1].sequenceNumber + 1}, got ${log.sequenceNumber}`,
      });
    }

    // Verify hash chain
    const expectedHash = this.calculateHash(log.previousHash, log.sequenceNumber, {
      timestamp: log.timestamp,
      action: log.action,
      actorId: log.actorId,
      targetId: log.targetId,
      changes: log.changes,
    });

    if (log.currentHash !== expectedHash) {
      errors.push({
        sequenceNumber: log.sequenceNumber,
        error: "Hash mismatch detected (possible tampering)",
      });
    }

    // Verify previous hash matches previous entry's current hash
    if (i > 0 && log.previousHash !== logs[i - 1].currentHash) {
      errors.push({
        sequenceNumber: log.sequenceNumber,
        error: "Previous hash does not match previous entry",
      });
    }
  }

  return {
    valid: errors.length === 0,
    totalChecked: logs.length,
    errors,
  };
};

/**
 * Static method: Get audit logs for a specific actor
 */
AuditLogSchema.statics.getByActor = async function (
  actorId: string,
  options: {
    limit?: number;
    skip?: number;
    action?: AuditAction;
    severity?: AuditSeverity;
    fromDate?: Date;
    toDate?: Date;
  } = {}
): Promise<IAuditLog[]> {
  const query: Record<string, unknown> = { actorId };

  if (options.action) {
    query.action = options.action;
  }

  if (options.severity) {
    query.severity = options.severity;
  }

  if (options.fromDate || options.toDate) {
    query.timestamp = {};
    if (options.fromDate) {
      (query.timestamp as Record<string, unknown>).$gte = options.fromDate;
    }
    if (options.toDate) {
      (query.timestamp as Record<string, unknown>).$lte = options.toDate;
    }
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0)
    .exec();
};

/**
 * Static method: Get audit logs for a specific target
 */
AuditLogSchema.statics.getByTarget = async function (
  targetId: string,
  options: {
    limit?: number;
    skip?: number;
    action?: AuditAction;
    fromDate?: Date;
    toDate?: Date;
  } = {}
): Promise<IAuditLog[]> {
  const query: Record<string, unknown> = { targetId };

  if (options.action) {
    query.action = options.action;
  }

  if (options.fromDate || options.toDate) {
    query.timestamp = {};
    if (options.fromDate) {
      (query.timestamp as Record<string, unknown>).$gte = options.fromDate;
    }
    if (options.toDate) {
      (query.timestamp as Record<string, unknown>).$lte = options.toDate;
    }
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0)
    .exec();
};

/**
 * Create and export the AuditLog model
 */
export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
