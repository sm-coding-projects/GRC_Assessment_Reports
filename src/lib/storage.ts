import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

/** Maximum file size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum files per assessment response */
export const MAX_FILES_PER_RESPONSE = 10;

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/csv": ".csv",
  "text/plain": ".txt",
};

interface FileValidation {
  valid: boolean;
  error?: string;
}

export function validateFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): FileValidation {
  if (sizeBytes > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (sizeBytes === 0) {
    return { valid: false, error: "File is empty" };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed. Allowed: images (PNG, JPG, GIF, WEBP), documents (PDF, DOC, DOCX, XLS, XLSX, CSV, TXT)`,
    };
  }

  if (!fileName || fileName.length > 255) {
    return { valid: false, error: "Invalid file name" };
  }

  return { valid: true };
}

/**
 * Generate a unique storage file name to prevent collisions
 * and path traversal attacks.
 */
export function generateStorageName(mimeType: string): string {
  const ext = MIME_TO_EXTENSION[mimeType] ?? "";
  return `${randomUUID()}${ext}`;
}

/**
 * Get the upload directory path. Creates it if it doesn't exist.
 */
async function getUploadDir(assessmentId: string): Promise<string> {
  const uploadsRoot = path.join(process.cwd(), "uploads", "evidence", assessmentId);
  await fs.mkdir(uploadsRoot, { recursive: true });
  return uploadsRoot;
}

/**
 * Save a file to local storage.
 * Returns the storage path relative to the uploads root.
 */
export async function saveFile(
  assessmentId: string,
  buffer: Buffer,
  storageName: string,
): Promise<string> {
  const dir = await getUploadDir(assessmentId);
  const filePath = path.join(dir, storageName);
  await fs.writeFile(filePath, buffer);
  return `evidence/${assessmentId}/${storageName}`;
}

/**
 * Delete a file from local storage.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "uploads", storagePath);
  try {
    await fs.unlink(fullPath);
  } catch (err: unknown) {
    // File may already be deleted; log and continue
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[storage] Failed to delete file:", storagePath, err);
    }
  }
}

/**
 * Read a file from local storage.
 * Returns the file buffer or null if not found.
 */
export async function readFile(storagePath: string): Promise<Buffer | null> {
  const fullPath = path.join(process.cwd(), "uploads", storagePath);
  try {
    return await fs.readFile(fullPath);
  } catch {
    return null;
  }
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
