import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth-check";
import { validateCsrfOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import { readFile, deleteFile } from "@/lib/storage";

const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;

function getClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "unknown";
}

function errorResponse(
  message: string,
  code: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

/**
 * Verify that the evidence file belongs to the authenticated user
 * by checking the ownership chain: EvidenceFile → Response → Assessment → User.
 */
async function getOwnedEvidenceFile(fileId: string, userId: string) {
  return prisma.evidenceFile.findFirst({
    where: {
      id: fileId,
      response: {
        assessment: {
          userId,
        },
      },
    },
  });
}

/** GET /api/evidence/[id] — Serve the evidence file */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse | Response> {
  const { id } = await params;

  const ip = getClientIp(req);
  const { success } = await rateLimit(
    `evidence-get:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!success) {
    return errorResponse("Too many requests", "RATE_LIMITED", 429);
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const evidenceFile = await getOwnedEvidenceFile(id, userId);
  if (!evidenceFile) {
    return errorResponse("File not found", "NOT_FOUND", 404);
  }

  const buffer = await readFile(evidenceFile.storagePath);
  if (!buffer) {
    return errorResponse("File not found on disk", "FILE_MISSING", 404);
  }

  const uint8 = new Uint8Array(buffer);
  return new Response(uint8, {
    headers: {
      "Content-Type": evidenceFile.mimeType,
      "Content-Length": String(evidenceFile.sizeBytes),
      "Content-Disposition": `inline; filename="${encodeURIComponent(evidenceFile.originalName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/** DELETE /api/evidence/[id] — Delete an evidence file */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!validateCsrfOrigin(req)) {
    return errorResponse("CSRF validation failed", "CSRF_FAILED", 403);
  }

  const ip = getClientIp(req);
  const { success } = await rateLimit(
    `evidence-delete:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!success) {
    return errorResponse("Too many requests", "RATE_LIMITED", 429);
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const evidenceFile = await getOwnedEvidenceFile(id, userId);
  if (!evidenceFile) {
    return errorResponse("File not found", "NOT_FOUND", 404);
  }

  // Delete from storage first, then from database
  await deleteFile(evidenceFile.storagePath);
  await prisma.evidenceFile.delete({ where: { id } });

  recordAudit({
    userId,
    action: "evidence.delete",
    entityType: "evidenceFile",
    entityId: id,
    metadata: {
      originalName: evidenceFile.originalName,
      storagePath: evidenceFile.storagePath,
    },
  });

  return NextResponse.json({ success: true });
}
