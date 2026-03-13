"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  Play,
  Archive,
  CheckCircle2,
  Trash2,
  ClipboardList,
  FileBarChart2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ProgressBar } from "@/components/assessments/progress-bar";
import { trpc } from "@/lib/trpc/client";
import type { ComplianceStatus } from "@/types/assessment";

type StatusFilter = "all" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  IN_PROGRESS: "bg-accent",
  COMPLETED: "bg-success",
  ARCHIVED: "bg-neutral",
};

const PRISMA_TO_STATUS: Record<string, ComplianceStatus> = {
  NOT_ASSESSED: "not_assessed",
  COMPLIANT: "compliant",
  PARTIALLY_COMPLIANT: "partially_compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_APPLICABLE: "not_applicable",
};

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function computeCounts(responses: Array<{ status: string }>): {
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notApplicable: number;
  notAssessed: number;
  total: number;
} {
  const counts = {
    compliant: 0,
    partiallyCompliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    notAssessed: 0,
    total: responses.length,
  };
  for (const r of responses) {
    const s = PRISMA_TO_STATUS[r.status] ?? "not_assessed";
    switch (s) {
      case "compliant": counts.compliant++; break;
      case "partially_compliant": counts.partiallyCompliant++; break;
      case "non_compliant": counts.nonCompliant++; break;
      case "not_applicable": counts.notApplicable++; break;
      case "not_assessed": counts.notAssessed++; break;
    }
  }
  return counts;
}

export default function AssessmentsPage(): React.ReactNode {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const assessmentsQuery = trpc.assessments.list.useQuery();
  const utils = trpc.useUtils();

  const completeMutation = trpc.assessments.complete.useMutation({
    onSuccess: () => {
      utils.assessments.list.invalidate();
      toast("Assessment marked as completed", { variant: "success" });
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  const archiveMutation = trpc.assessments.archive.useMutation({
    onSuccess: () => {
      utils.assessments.list.invalidate();
      toast("Assessment archived", { variant: "success" });
    },
    onError: (err) => toast(err.message, { variant: "danger" }),
  });

  const deleteMutation = trpc.assessments.delete.useMutation({
    onSuccess: () => {
      utils.assessments.list.invalidate();
      setDeletingId(null);
      toast("Assessment deleted", { variant: "success" });
    },
    onError: (err) => {
      setDeletingId(null);
      toast(err.message, { variant: "danger" });
    },
  });

  function handleDelete(id: string, name: string): void {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      setDeletingId(id);
      deleteMutation.mutate({ id });
    }
  }

  const assessments = assessmentsQuery.data;
  const isLoading = assessmentsQuery.isLoading;

  const filtered = assessments?.filter(
    (a) => filter === "all" || a.status === filter,
  );

  const FILTERS: StatusFilter[] = ["all", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Assessments</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Evaluate business compliance against your templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/assessments/new">
            <Plus size={16} className="mr-2" />
            New Assessment
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-border-muted">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink hover:border-border"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!isLoading && filtered && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-inset text-ink-subtle mb-4">
            <ClipboardList size={24} />
          </div>
          <h2 className="text-lg font-serif text-ink">
            {filter === "all" ? "No assessments yet" : `No ${STATUS_LABELS[filter]?.toLowerCase()} assessments`}
          </h2>
          <p className="mt-1 text-sm text-ink-muted max-w-sm">
            {filter === "all"
              ? "Start your first compliance assessment by selecting a template."
              : "Assessments matching this filter will appear here."}
          </p>
          {filter === "all" && (
            <Button asChild className="mt-4">
              <Link href="/assessments/new">
                <Plus size={16} className="mr-2" />
                Start Assessment
              </Link>
            </Button>
          )}
        </div>
      )}

      {!isLoading && filtered && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[160px]">Progress</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((assessment) => {
                  const counts = computeCounts(assessment.responses);
                  return (
                    <TableRow
                      key={assessment.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/assessments/${assessment.id}`)}
                    >
                      <TableCell>
                        <span className="font-medium text-ink">{assessment.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-ink-muted">
                          {assessment.template.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusDot status={assessment.status} />
                      </TableCell>
                      <TableCell>
                        <ProgressBar {...counts} compact />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-ink-muted">
                          {formatDate(assessment.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AssessmentActions
                          assessment={assessment}
                          deletingId={deletingId}
                          onOpen={() => router.push(`/assessments/${assessment.id}`)}
                          onViewReport={() => router.push(`/reports/${assessment.id}`)}
                          onComplete={() => completeMutation.mutate({ id: assessment.id })}
                          onArchive={() => archiveMutation.mutate({ id: assessment.id })}
                          onDelete={() => handleDelete(assessment.id, assessment.name)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((assessment) => {
              const counts = computeCounts(assessment.responses);
              return (
                <div
                  key={assessment.id}
                  className="rounded-md border border-border-muted bg-surface p-4 cursor-pointer"
                  onClick={() => router.push(`/assessments/${assessment.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-ink truncate">
                        {assessment.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {assessment.template.name}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <AssessmentActions
                        assessment={assessment}
                        deletingId={deletingId}
                        onOpen={() => router.push(`/assessments/${assessment.id}`)}
                        onViewReport={() => router.push(`/reports/${assessment.id}`)}
                        onComplete={() => completeMutation.mutate({ id: assessment.id })}
                        onArchive={() => archiveMutation.mutate({ id: assessment.id })}
                        onDelete={() => handleDelete(assessment.id, assessment.name)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <StatusDot status={assessment.status} />
                    <span className="text-xs text-ink-subtle">
                      {formatDate(assessment.updatedAt)}
                    </span>
                  </div>
                  <ProgressBar {...counts} compact />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }): React.ReactNode {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
      <span
        className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status] ?? "bg-ink-subtle"}`}
        aria-hidden="true"
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function AssessmentActions({
  assessment,
  deletingId,
  onOpen,
  onViewReport,
  onComplete,
  onArchive,
  onDelete,
}: {
  assessment: { id: string; name: string; status: string };
  deletingId: string | null;
  onOpen: () => void;
  onViewReport: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onDelete: () => void;
}): React.ReactNode {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded p-1.5 text-ink-subtle hover:bg-surface-alt hover:text-ink transition-colors"
          aria-label="Assessment actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-md"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
            onSelect={onOpen}
          >
            <Play size={14} />
            {assessment.status === "COMPLETED" ? "View" : "Continue"}
          </DropdownMenu.Item>
          {(assessment.status === "COMPLETED" || assessment.status === "ARCHIVED") && (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
              onSelect={onViewReport}
            >
              <FileBarChart2 size={14} />
              View Report
            </DropdownMenu.Item>
          )}
          {assessment.status === "IN_PROGRESS" && (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
              onSelect={onComplete}
            >
              <CheckCircle2 size={14} />
              Mark Complete
            </DropdownMenu.Item>
          )}
          {assessment.status !== "ARCHIVED" && (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-alt"
              onSelect={onArchive}
            >
              <Archive size={14} />
              Archive
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-border-muted" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-danger outline-none data-[highlighted]:bg-danger-bg"
            onSelect={onDelete}
            disabled={deletingId === assessment.id}
          >
            <Trash2 size={14} />
            {deletingId === assessment.id ? "Deleting..." : "Delete"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
