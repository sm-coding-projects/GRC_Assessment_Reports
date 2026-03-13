import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth-check";
import { validateCsrfOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import {
  validateFile,
  generateStorageName,
  saveFile,
  MAX_FILES_PER_RESPONSE,
} from "@/lib/storage";

const RATE_LIMIT = 30;
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

export async function POST(req: Request): Promise<NextResponse> {
  // CSRF check
  if (!validateCsrfOrigin(req)) {
    return errorResponse("CSRF validation failed", "CSRF_FAILED", 403);
  }

  // Rate limiting
  const ip = getClientIp(req);
  const { success } = await rateLimit(
    `upload:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!success) {
    return errorResponse("Too many requests", "RATE_LIMITED", 429);
  }

  // Auth check
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Invalid form data", "INVALID_FORM_DATA", 400);
  }

  const assessmentId = formData.get("assessmentId");
  const framework = formData.get("framework");
  const controlId = formData.get("controlId");
  const file = formData.get("file");

  if (
    typeof assessmentId !== "string" ||
    typeof framework !== "string" ||
    typeof controlId !== "string"
  ) {
    return errorResponse(
      "Missing required fields: assessmentId, framework, controlId",
      "MISSING_FIELDS",
      400,
    );
  }

  if (!(file instanceof File)) {
    return errorResponse("No file provided", "MISSING_FILE", 400);
  }

  // Validate file
  const validation = validateFile(file.name, file.type, file.size);
  if (!validation.valid) {
    return errorResponse(validation.error!, "INVALID_FILE", 400);
  }

  // Verify assessment ownership
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, userId },
  });
  if (!assessment) {
    return errorResponse("Assessment not found", "NOT_FOUND", 404);
  }

  // Find or create the assessment response
  let response = await prisma.assessmentResponse.findUnique({
    where: {
      assessmentId_framework_controlId: {
        assessmentId,
        framework,
        controlId,
      },
    },
    include: { evidenceFiles: true },
  });

  if (!response) {
    response = await prisma.assessmentResponse.create({
      data: {
        assessmentId,
        framework,
        controlId,
        status: "NOT_ASSESSED",
      },
      include: { evidenceFiles: true },
    });
  }

  // Check file count limit
  if (response.evidenceFiles.length >= MAX_FILES_PER_RESPONSE) {
    return errorResponse(
      `Maximum ${MAX_FILES_PER_RESPONSE} files per control`,
      "FILE_LIMIT_EXCEEDED",
      400,
    );
  }

  // Save file to storage
  const storageName = generateStorageName(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await saveFile(assessmentId, buffer, storageName);

  // Create database record
  const evidenceFile = await prisma.evidenceFile.create({
    data: {
      responseId: response.id,
      fileName: storageName,
      originalName: file.name.slice(0, 255),
      mimeType: file.type,
      sizeBytes: file.size,
      storagePath,
    },
  });

  recordAudit({
    userId,
    action: "evidence.upload",
    entityType: "evidenceFile",
    entityId: evidenceFile.id,
    metadata: {
      assessmentId,
      framework,
      controlId,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return NextResponse.json({
    id: evidenceFile.id,
    fileName: evidenceFile.fileName,
    originalName: evidenceFile.originalName,
    mimeType: evidenceFile.mimeType,
    sizeBytes: evidenceFile.sizeBytes,
    storagePath: evidenceFile.storagePath,
    createdAt: evidenceFile.createdAt.toISOString(),
  });
}
