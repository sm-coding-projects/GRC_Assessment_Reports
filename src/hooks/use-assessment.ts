"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAssessmentStore, type ResponseKey } from "@/stores/assessment-store";
import { useDebouncedCallback } from "./use-debounce";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { trpc } from "@/lib/trpc/client";
import { useToast } from "@/components/ui/toast";
import type { ComplianceStatus } from "@/types/assessment";

/** Map client-side snake_case status to Prisma UPPER_SNAKE enum */
const STATUS_TO_PRISMA: Record<ComplianceStatus, string> = {
  not_assessed: "NOT_ASSESSED",
  compliant: "COMPLIANT",
  partially_compliant: "PARTIALLY_COMPLIANT",
  non_compliant: "NON_COMPLIANT",
  not_applicable: "NOT_APPLICABLE",
};

/** Map Prisma UPPER_SNAKE enum to client-side snake_case status */
const PRISMA_TO_STATUS: Record<string, ComplianceStatus> = {
  NOT_ASSESSED: "not_assessed",
  COMPLIANT: "compliant",
  PARTIALLY_COMPLIANT: "partially_compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_APPLICABLE: "not_applicable",
};

interface UseAssessmentOptions {
  assessmentId: string;
}

interface UseAssessmentReturn {
  isLoading: boolean;
  error: string | null;
  saving: boolean;
  lastSavedAt: Date | null;
  assessmentName: string;
  templateName: string;
  assessmentStatus: string;
}

function useAssessment({ assessmentId }: UseAssessmentOptions): UseAssessmentReturn {
  const { toast } = useToast();
  const loadResponses = useAssessmentStore((s) => s.loadResponses);
  const dirty = useAssessmentStore((s) => s.dirty);
  const getDirtyEntries = useAssessmentStore((s) => s.getDirtyEntries);
  const markSaved = useAssessmentStore((s) => s.markSaved);
  const setSaving = useAssessmentStore((s) => s.setSaving);
  const saving = useAssessmentStore((s) => s.saving);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const reset = useAssessmentStore((s) => s.reset);

  const query = trpc.assessments.getById.useQuery(
    { id: assessmentId },
    { refetchOnWindowFocus: false },
  );

  const updateMutation = trpc.assessments.updateResponses.useMutation({
    onError: (err) => {
      setSaving(false);
      toast(`Save failed: ${err.message}`, { variant: "danger" });
    },
  });

  // Track which keys were pending when we fired the mutation
  const pendingKeysRef = useRef<ResponseKey[]>([]);

  // Load server data into store on fetch
  useEffect(() => {
    if (query.data?.responses) {
      const mapped = query.data.responses.map((r) => ({
        framework: r.framework,
        controlId: r.controlId,
        status: PRISMA_TO_STATUS[r.status] ?? ("not_assessed" as ComplianceStatus),
        notes: r.notes,
        evidence: r.evidence,
        evidenceFiles: (r as Record<string, unknown>).evidenceFiles as
          | Array<{
              id: string;
              responseId: string;
              fileName: string;
              originalName: string;
              mimeType: string;
              sizeBytes: number;
              storagePath: string;
              createdAt: string;
            }>
          | undefined,
      }));
      loadResponses(mapped);
    }
  }, [query.data, loadResponses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Flush dirty entries to server
  const flush = useCallback(() => {
    const entries = getDirtyEntries();
    if (entries.length === 0) return;

    const keys = Array.from(useAssessmentStore.getState().dirty) as ResponseKey[];
    pendingKeysRef.current = keys;
    setSaving(true);

    updateMutation.mutate(
      {
        id: assessmentId,
        responses: entries.map((e) => ({
          framework: e.framework as "iso27001" | "soc2" | "nist_csf" | "pci_dss" | "hipaa" | "gdpr",
          controlId: e.controlId,
          status: STATUS_TO_PRISMA[e.status] as "NOT_ASSESSED" | "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE",
          notes: e.notes || undefined,
          evidence: e.evidence || undefined,
        })),
      },
      {
        onSuccess: () => {
          markSaved(pendingKeysRef.current);
          setSaving(false);
        },
      },
    );
  }, [assessmentId, getDirtyEntries, markSaved, setSaving, updateMutation]);

  // Debounced auto-save (800ms)
  const debouncedFlush = useDebouncedCallback(flush, 800);

  // Trigger debounced save when dirty set changes
  useEffect(() => {
    if (dirty.size > 0) {
      debouncedFlush();
    }
  }, [dirty.size, debouncedFlush]);

  // Cmd+S to immediately save
  useKeyboardShortcut({
    key: "s",
    meta: true,
    handler: flush,
  });

  return {
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    saving,
    lastSavedAt,
    assessmentName: query.data?.name ?? "",
    templateName: query.data?.template?.name ?? "",
    assessmentStatus: query.data?.status ?? "IN_PROGRESS",
  };
}

export { useAssessment, PRISMA_TO_STATUS, STATUS_TO_PRISMA };
