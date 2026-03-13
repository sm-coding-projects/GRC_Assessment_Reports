"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileBarChart2,
  MoreHorizontal,
  Eye,
  FileSpreadsheet,
  FileCode,
  FileJson,
  Download,
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
import { trpc } from "@/lib/trpc/client";
import type { ComplianceStatus } from "@/types/assessment";

type StatusFilter = "all" | "COMPLETED" | "ARCHIVED";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_DOT_COLORS: Record<string, string> = {
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

function computeComplianceRate(responses: Array<{ status: string }>): number {
  const mapped = responses.map((r) => PRISMA_TO_STATUS[r.status] ?? "not_assessed");
  const applicable = mapped.filter(
    (s) => s !== "not_applicable" && s !== "not_assessed",
  );
  if (applicable.length === 0) return 0;
  const compliant = applicable.filter((s) => s === "compliant").length;
  return Math.round((compliant / applicable.length) * 100);
}

function getUniqueFrameworks(
  controls: Array<{ framework: string }>,
): string[] {
  return [...new Set(controls.map((c) => c.framework))];
}

const FRAMEWORK_SHORT_NAMES: Record<string, string> = {
  iso27001: "ISO 27001",
  soc2: "SOC 2",
  nist_csf: "NIST CSF",
  pci_dss: "PCI DSS",
  hipaa: "HIPAA",
  gdpr: "GDPR",
};

export default function ReportsPage(): React.ReactNode {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const reportsQuery = trpc.reports.list.useQuery();
  const reports = reportsQuery.data;
  const isLoading = reportsQuery.isLoading;

  const filtered = reports?.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const FILTERS: StatusFilter[] = ["all", "COMPLETED", "ARCHIVED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-muted">
            View and export compliance reports from completed assessments.
          </p>
        </div>
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
            <FileBarChart2 size={24} />
          </div>
          <h2 className="text-lg font-serif text-ink">
            {filter === "all"
              ? "No reports yet"
              : `No ${STATUS_LABELS[filter]?.toLowerCase()} reports`}
          </h2>
          <p className="mt-1 text-sm text-ink-muted max-w-sm">
            {filter === "all"
              ? "Reports are generated from completed assessments. Complete an assessment to see it here."
              : "Reports matching this filter will appear here."}
          </p>
          {filter === "all" && (
            <Button asChild variant="ghost" className="mt-4">
              <Link href="/assessments">Go to Assessments</Link>
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
                  <TableHead>Report</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Frameworks</TableHead>
                  <TableHead className="w-[120px]">Compliance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report) => {
                  const rate = computeComplianceRate(report.responses);
                  const fws = getUniqueFrameworks(report.template.controls);
                  return (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      <TableCell>
                        <span className="font-medium text-ink">{report.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-ink-muted">
                          {report.template.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {fws.map((fw) => (
                            <span
                              key={fw}
                              className="inline-block rounded bg-surface-inset px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle"
                            >
                              {FRAMEWORK_SHORT_NAMES[fw] ?? fw}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ComplianceIndicator rate={rate} />
                      </TableCell>
                      <TableCell>
                        <StatusDot status={report.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-ink-muted">
                          {formatDate(report.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReportActions
                          reportId={report.id}
                          onView={() => router.push(`/reports/${report.id}`)}
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
            {filtered.map((report) => {
              const rate = computeComplianceRate(report.responses);
              const fws = getUniqueFrameworks(report.template.controls);
              return (
                <div
                  key={report.id}
                  className="rounded-md border border-border-muted bg-surface p-4 cursor-pointer"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-ink truncate">
                        {report.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {report.template.name}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ReportActions
                        reportId={report.id}
                        onView={() => router.push(`/reports/${report.id}`)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <StatusDot status={report.status} />
                    <ComplianceIndicator rate={rate} />
                    <span className="text-xs text-ink-subtle">
                      {formatDate(report.updatedAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fws.map((fw) => (
                      <span
                        key={fw}
                        className="inline-block rounded bg-surface-inset px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle"
                      >
                        {FRAMEWORK_SHORT_NAMES[fw] ?? fw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ComplianceIndicator({ rate }: { rate: number }): React.ReactNode {
  let color = "text-success";
  if (rate < 50) color = "text-danger";
  else if (rate < 80) color = "text-warning";

  return (
    <span className={`text-sm font-medium tabular-nums ${color}`}>
      {rate}%
    </span>
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

function ReportActions({
  reportId,
  onView,
}: {
  reportId: string;
  onView: () => void;
}): React.ReactNode {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded p-1.5 text-ink-subtle hover:bg-surface-alt hover:text-ink transition-colors"
          aria-label="Report actions"
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
            onSelect={onView}
          >
            <Eye size={14} />
            View Report
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
