/**
 * Audit Log Tests
 * Tests for tamper-evident audit logging system
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { AuditLog } from "@models/AuditLog.js";
import { auditLogService, type AuditLogEntry } from "@services/audit-log.service.js";
import { connectDatabase } from "@config/database.js";

// Connect to test database
beforeEach(async () => {
  await connectDatabase();
  // Clear audit logs before each test
  await AuditLog.deleteMany({}).catch(() => {
    // Ignore errors (model prevents deletion)
  });
});

afterEach(async () => {
  // Clean up after tests
  await AuditLog.collection.drop().catch(() => {
    // Ignore if collection doesn't exist
  });
});

describe("AuditLog Model", () => {
  test("should create audit log with hash chain", async () => {
    const entry: AuditLogEntry = {
      action: "user.create",
      actorId: "actor-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
      severity: "info",
    };

    const log = await auditLogService.write(entry);

    expect(log).toBeDefined();
    expect(log.action).toBe("user.create");
    expect(log.sequenceNumber).toBe(1);
    expect(log.previousHash).toMatch(/^0{64}$/); // Genesis hash
    expect(log.currentHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    expect(log.isImmutable).toBe(true);
  });

  test("should enforce hash chaining across multiple entries", async () => {
    const entry1: AuditLogEntry = {
      action: "user.create",
      actorId: "actor-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
    };

    const entry2: AuditLogEntry = {
      action: "user.update",
      actorId: "actor-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-124",
    };

    const log1 = await auditLogService.write(entry1);
    const log2 = await auditLogService.write(entry2);

    expect(log1.sequenceNumber).toBe(1);
    expect(log2.sequenceNumber).toBe(2);
    expect(log2.previousHash).toBe(log1.currentHash);
  });

  test("should prevent modification of existing audit logs", async () => {
    const entry: AuditLogEntry = {
      action: "user.create",
      actorId: "actor-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
    };

    const log = await auditLogService.write(entry);

    // Attempt to modify
    log.action = "user.delete";

    await expect(log.save()).rejects.toThrow("Audit logs are immutable");
  });

  test("should prevent deletion of audit logs", async () => {
    const entry: AuditLogEntry = {
      action: "user.create",
      actorId: "actor-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
    };

    const log = await auditLogService.write(entry);

    // Attempt to delete
    await expect(AuditLog.findByIdAndDelete(log._id)).rejects.toThrow(
      "Audit logs cannot be deleted"
    );
  });

  test("should calculate consistent hashes", () => {
    const previousHash = "a".repeat(64);
    const sequenceNumber = 1;
    const data = {
      timestamp: new Date("2024-01-01T00:00:00Z"),
      action: "user.create",
      actorId: "actor-123",
      targetId: "user-456",
      changes: { role: "admin" },
    };

    const hash1 = AuditLog.calculateHash(previousHash, sequenceNumber, data);
    const hash2 = AuditLog.calculateHash(previousHash, sequenceNumber, data);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("AuditLogService", () => {
  test("should write audit log with metadata", async () => {
    const entry: AuditLogEntry = {
      action: "user.role.change",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
      severity: "warning",
      targetType: "user",
      targetId: "user-456",
      targetEmail: "user@example.com",
      changes: {
        before: { role: "user" },
        after: { role: "admin" },
      },
      metadata: {
        endpoint: "/admin/users/:userId/role",
      },
    };

    const log = await auditLogService.write(entry);

    expect(log.action).toBe("user.role.change");
    expect(log.severity).toBe("warning");
    expect(log.targetType).toBe("user");
    expect(log.targetId).toBe("user-456");
    expect(log.changes).toBeDefined();
    expect(log.changes?.before).toEqual({ role: "user" });
    expect(log.changes?.after).toEqual({ role: "admin" });
    expect(log.metadata).toHaveProperty("endpoint");
  });

  test("should redact sensitive fields from changes", async () => {
    const entry: AuditLogEntry = {
      action: "user.update",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
      changes: {
        before: { password: "secret123", name: "John" },
        after: { password: "newsecret456", name: "John Doe" },
      },
    };

    const log = await auditLogService.write(entry);

    expect(log.changes?.before).toHaveProperty("password", "[REDACTED]");
    expect(log.changes?.after).toHaveProperty("password", "[REDACTED]");
    expect(log.changes?.before).toHaveProperty("name", "John");
    expect(log.changes?.after).toHaveProperty("name", "John Doe");
  });

  test("should sanitize log data to prevent injection", async () => {
    const entry: AuditLogEntry = {
      action: "user.create",
      actorId: "admin-123",
      actorEmail: "admin@example.com\r\nmalicious\nlog\tinjection",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-123",
      userAgent: "Mozilla\r\nmalicious\nheader",
    };

    const log = await auditLogService.write(entry);

    expect(log.actorEmail).not.toContain("\r");
    expect(log.actorEmail).not.toContain("\n");
    expect(log.actorEmail).not.toContain("\t");
    expect(log.userAgent).not.toContain("\r");
    expect(log.userAgent).not.toContain("\n");
  });

  test("should get audit logs by actor", async () => {
    const actorId = "admin-123";

    await auditLogService.write({
      action: "user.create",
      actorId,
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
    });

    await auditLogService.write({
      action: "user.update",
      actorId,
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
    });

    await auditLogService.write({
      action: "question.create",
      actorId: "different-admin",
      actorEmail: "other@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.2",
      requestId: "req-3",
    });

    const logs = await auditLogService.getByActor(actorId);

    expect(logs).toHaveLength(2);
    expect(logs.every((log) => log.actorId === actorId)).toBe(true);
  });

  test("should get audit logs by target", async () => {
    const targetId = "user-456";

    await auditLogService.write({
      action: "user.update",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
      targetId,
      targetType: "user",
    });

    await auditLogService.write({
      action: "user.role.change",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
      targetId,
      targetType: "user",
    });

    await auditLogService.write({
      action: "question.delete",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-3",
      targetId: "question-789",
      targetType: "question",
    });

    const logs = await auditLogService.getByTarget(targetId);

    expect(logs).toHaveLength(2);
    expect(logs.every((log) => log.targetId === targetId)).toBe(true);
  });

  test("should filter logs by action", async () => {
    await auditLogService.write({
      action: "user.create",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
    });

    await auditLogService.write({
      action: "user.update",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
    });

    const logs = await auditLogService.getByActor("admin-123", {
      action: "user.create",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("user.create");
  });

  test("should filter logs by severity", async () => {
    await auditLogService.write({
      action: "user.create",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
      severity: "info",
    });

    await auditLogService.write({
      action: "user.delete",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
      severity: "critical",
    });

    const logs = await auditLogService.getByActor("admin-123", {
      severity: "critical",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].severity).toBe("critical");
  });

  test("should filter logs by date range", async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await auditLogService.write({
      action: "user.create",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
    });

    const logs = await auditLogService.getByActor("admin-123", {
      fromDate: yesterday,
      toDate: tomorrow,
    });

    expect(logs).toHaveLength(1);
  });
});

describe("Audit Log Integrity", () => {
  test("should verify integrity of valid audit log chain", async () => {
    for (let i = 0; i < 5; i++) {
      await auditLogService.write({
        action: "user.create",
        actorId: `admin-${i}`,
        actorEmail: `admin${i}@example.com`,
        actorRole: "admin",
        actorIp: "192.168.1.1",
        requestId: `req-${i}`,
      });
    }

    const verification = await auditLogService.verifyIntegrity();

    expect(verification.valid).toBe(true);
    expect(verification.totalChecked).toBe(5);
    expect(verification.errors).toHaveLength(0);
  });

  test("should detect tampering in audit log chain", async () => {
    // Create initial logs
    await auditLogService.write({
      action: "user.create",
      actorId: "admin-1",
      actorEmail: "admin1@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
    });

    const log2 = await auditLogService.write({
      action: "user.update",
      actorId: "admin-2",
      actorEmail: "admin2@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
    });

    // Tamper with log (bypass immutability check for testing)
    await AuditLog.collection.updateOne(
      { _id: log2._id },
      { $set: { currentHash: "tampered" + log2.currentHash.substring(8) } }
    );

    const verification = await auditLogService.verifyIntegrity();

    expect(verification.valid).toBe(false);
    expect(verification.errors.length).toBeGreaterThan(0);
    expect(verification.errors[0].error).toContain("Hash mismatch");
  });

  test("should verify partial chain", async () => {
    for (let i = 0; i < 10; i++) {
      await auditLogService.write({
        action: "user.create",
        actorId: `admin-${i}`,
        actorEmail: `admin${i}@example.com`,
        actorRole: "admin",
        actorIp: "192.168.1.1",
        requestId: `req-${i}`,
      });
    }

    const verification = await auditLogService.verifyIntegrity(5, 8);

    expect(verification.valid).toBe(true);
    expect(verification.totalChecked).toBe(4); // Sequence 5, 6, 7, 8
  });
});

describe("Audit Log Statistics", () => {
  test("should get audit log statistics", async () => {
    await auditLogService.write({
      action: "user.create",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-1",
      severity: "info",
    });

    await auditLogService.write({
      action: "user.update",
      actorId: "admin-123",
      actorEmail: "admin@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-2",
      severity: "info",
    });

    await auditLogService.write({
      action: "user.delete",
      actorId: "admin-456",
      actorEmail: "admin2@example.com",
      actorRole: "admin",
      actorIp: "192.168.1.1",
      requestId: "req-3",
      severity: "critical",
    });

    const stats = await auditLogService.getStatistics();

    expect(stats.totalLogs).toBe(3);
    expect(stats.byAction).toHaveProperty("user.create", 1);
    expect(stats.byAction).toHaveProperty("user.update", 1);
    expect(stats.byAction).toHaveProperty("user.delete", 1);
    expect(stats.bySeverity).toHaveProperty("info", 2);
    expect(stats.bySeverity).toHaveProperty("critical", 1);
    expect(stats.byActor).toHaveLength(2);
  });
});
