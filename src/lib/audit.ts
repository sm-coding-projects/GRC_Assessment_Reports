import { prisma } from "@/lib/db";

interface AuditEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an audit log entry. This is fire-and-forget — failures
 * are logged to the console but never block the calling operation.
 */
export function recordAudit(entry: AuditEntry): void {
  prisma.auditLog
    .create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      },
    })
    .catch((err: unknown) => {
      console.error("[audit] Failed to write audit log:", err);
    });
}
