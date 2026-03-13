"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EvidenceFile } from "@/types/assessment";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
]);

const ACCEPT_STRING = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
].join(",");

interface EvidenceUploadProps {
  assessmentId: string;
  framework: string;
  controlId: string;
  files: EvidenceFile[];
  onFileUploaded: (file: EvidenceFile) => void;
  onFileDeleted: (fileId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon size={16} className="text-accent shrink-0" />;
  }
  if (mimeType === "application/pdf") {
    return <FileText size={16} className="text-danger shrink-0" />;
  }
  return <FileIcon size={16} className="text-ink-muted shrink-0" />;
}

function EvidenceUpload({
  assessmentId,
  framework,
  controlId,
  files,
  onFileUploaded,
  onFileDeleted,
}: EvidenceUploadProps): React.ReactNode {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateClientSide = useCallback(
    (file: File): string | null => {
      if (file.size > MAX_FILE_SIZE) {
        return `File exceeds maximum size of 10MB`;
      }
      if (file.size === 0) {
        return "File is empty";
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return "File type not allowed. Use images (PNG, JPG, GIF, WEBP) or documents (PDF, DOC, DOCX, XLS, XLSX, CSV, TXT)";
      }
      if (files.length >= MAX_FILES) {
        return `Maximum ${MAX_FILES} files per control`;
      }
      return null;
    },
    [files.length],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateClientSide(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assessmentId", assessmentId);
        formData.append("framework", framework);
        formData.append("controlId", controlId);

        const res = await fetch("/api/evidence/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(data.error ?? "Upload failed");
        }

        const evidenceFile: EvidenceFile = await res.json();
        onFileUploaded(evidenceFile);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [assessmentId, framework, controlId, validateClientSide, onFileUploaded],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDelete = useCallback(
    async (fileId: string) => {
      setDeletingIds((prev) => new Set(prev).add(fileId));
      try {
        const res = await fetch(`/api/evidence/${fileId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Delete failed" }));
          throw new Error(data.error ?? "Delete failed");
        }
        onFileDeleted(fileId);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Delete failed";
        setError(message);
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
      }
    },
    [onFileDeleted],
  );

  return (
    <div className="space-y-2">
      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file) => {
            const isDeleting = deletingIds.has(file.id);
            return (
              <li
                key={file.id}
                className={cn(
                  "flex items-center gap-2 rounded border border-border-muted bg-surface px-2.5 py-1.5 text-sm",
                  isDeleting && "opacity-50",
                )}
              >
                {getFileIcon(file.mimeType)}
                <a
                  href={`/api/evidence/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-ink hover:text-accent transition-colors"
                  title={file.originalName}
                >
                  {file.originalName}
                </a>
                <span className="text-xs text-ink-subtle shrink-0">
                  {formatFileSize(file.sizeBytes)}
                </span>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={isDeleting}
                  className={cn(
                    "p-0.5 rounded text-ink-subtle hover:text-danger hover:bg-danger-bg transition-colors shrink-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                  )}
                  aria-label={`Delete ${file.originalName}`}
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Drop zone */}
      {files.length < MAX_FILES && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex items-center justify-center gap-2 rounded border border-dashed px-3 py-3 transition-colors cursor-pointer",
            dragOver
              ? "border-accent bg-accent-subtle/40"
              : "border-border hover:border-ink-subtle hover:bg-surface-alt/50",
            uploading && "pointer-events-none opacity-60",
          )}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload evidence file"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-ink-muted" />
              <span className="text-xs text-ink-muted">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-ink-subtle" />
              <span className="text-xs text-ink-muted">
                Drop file here or click to browse
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={ACCEPT_STRING}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Allowed types hint */}
      {files.length === 0 && !error && (
        <p className="text-[11px] text-ink-subtle">
          PNG, JPG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, CSV, TXT — max 10MB
        </p>
      )}
    </div>
  );
}

export { EvidenceUpload, type EvidenceUploadProps };
