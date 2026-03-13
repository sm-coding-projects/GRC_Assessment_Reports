"use client";

import { useState, useCallback } from "react";
import { ChevronRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StatusSelector } from "./status-selector";
import { EvidenceUpload } from "./evidence-upload";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { ComplianceStatus, EvidenceFile } from "@/types/assessment";

interface ControlRowProps {
  assessmentId: string;
  framework: string;
  controlId: string;
  controlName: string;
  description?: string | null;
  status: ComplianceStatus;
  notes: string;
  evidence: string;
  evidenceFiles: EvidenceFile[];
  onStatusChange: (status: ComplianceStatus) => void;
  onNotesChange: (notes: string) => void;
  onEvidenceChange: (evidence: string) => void;
  onEvidenceFileUploaded: (file: EvidenceFile) => void;
  onEvidenceFileDeleted: (fileId: string) => void;
}

const STATUS_TO_BADGE: Record<ComplianceStatus, BadgeVariant> = {
  compliant: "compliant",
  partially_compliant: "partial",
  non_compliant: "non-compliant",
  not_applicable: "not-applicable",
  not_assessed: "not-assessed",
};

function ControlRow({
  assessmentId,
  framework,
  controlId,
  controlName,
  description,
  status,
  notes,
  evidence,
  evidenceFiles,
  onStatusChange,
  onNotesChange,
  onEvidenceChange,
  onEvidenceFileUploaded,
  onEvidenceFileDeleted,
}: ControlRowProps): React.ReactNode {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const fileCount = evidenceFiles.length;

  return (
    <>
      {/* Main row */}
      <tr
        className={cn(
          "border-b border-border-muted transition-colors group",
          "hover:bg-surface-alt/50",
          expanded && "bg-surface-alt/30",
        )}
      >
        {/* Expand toggle + Control ID */}
        <td className="px-3 py-2.5 align-middle w-[140px]">
          <button
            onClick={toggleExpanded}
            className="inline-flex items-center gap-1.5 text-left group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} control ${controlId}`}
          >
            <ChevronRight
              size={14}
              className={cn(
                "text-ink-subtle transition-transform duration-150 shrink-0",
                expanded && "rotate-90",
              )}
            />
            <span className="font-mono text-xs text-ink-muted">{controlId}</span>
          </button>
        </td>

        {/* Control name */}
        <td className="px-3 py-2.5 align-middle text-sm text-ink">
          {controlName}
        </td>

        {/* Status */}
        <td className="px-3 py-2.5 align-middle">
          <StatusSelector value={status} onChange={onStatusChange} />
        </td>

        {/* Indicators (visible when collapsed) */}
        <td className="px-3 py-2.5 align-middle text-right">
          <span className="inline-flex items-center gap-2">
            {notes && (
              <span className="text-xs text-ink-subtle" title="Has notes">
                Notes
              </span>
            )}
            {fileCount > 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-xs text-ink-subtle"
                title={`${fileCount} file${fileCount !== 1 ? "s" : ""} attached`}
              >
                <Paperclip size={12} />
                {fileCount}
              </span>
            )}
          </span>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-border-muted bg-surface-alt/20">
          <td colSpan={4} className="px-3 py-4">
            <div className="ml-6 space-y-4">
              {/* Description */}
              {description && (
                <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}

              {/* Notes */}
              <div>
                <label
                  htmlFor={`notes-${framework}-${controlId}`}
                  className="block text-xs font-medium text-ink-muted tracking-label uppercase mb-1.5"
                >
                  Notes
                </label>
                <textarea
                  id={`notes-${framework}-${controlId}`}
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Assessment notes, observations, gaps identified..."
                  rows={3}
                  className={cn(
                    "w-full max-w-2xl rounded border border-border bg-surface px-3 py-2 text-sm font-sans text-ink",
                    "placeholder:text-ink-subtle/60",
                    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                    "resize-y",
                  )}
                />
              </div>

              {/* Evidence text */}
              <div>
                <label
                  htmlFor={`evidence-${framework}-${controlId}`}
                  className="block text-xs font-medium text-ink-muted tracking-label uppercase mb-1.5"
                >
                  Evidence Notes
                </label>
                <textarea
                  id={`evidence-${framework}-${controlId}`}
                  value={evidence}
                  onChange={(e) => onEvidenceChange(e.target.value)}
                  placeholder="Reference documents, policy names, URLs..."
                  rows={2}
                  className={cn(
                    "w-full max-w-2xl rounded border border-border bg-surface px-3 py-2 text-sm font-sans text-ink",
                    "placeholder:text-ink-subtle/60",
                    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                    "resize-y",
                  )}
                />
              </div>

              {/* Evidence file uploads */}
              <div>
                <label className="block text-xs font-medium text-ink-muted tracking-label uppercase mb-1.5">
                  Evidence Attachments
                </label>
                <div className="max-w-2xl">
                  <EvidenceUpload
                    assessmentId={assessmentId}
                    framework={framework}
                    controlId={controlId}
                    files={evidenceFiles}
                    onFileUploaded={onEvidenceFileUploaded}
                    onFileDeleted={onEvidenceFileDeleted}
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export { ControlRow, type ControlRowProps };
