"use client";

import { use, useMemo, useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ExecutiveSummary } from "@/components/reports/executive-summary";
import { FindingsTable } from "@/components/reports/findings-table";
import { RemediationSection } from "@/components/reports/remediation-section";
import { trpc } from "@/lib/trpc/client";
import { frameworks } from "@/data";
import {
  getReportMetrics,
  getFrameworkBreakdown,
  getDomainBreakdown,
  buildFindingRows,
  buildRemediationItems,
  exportToCsv,
  exportToJson,
  exportToHtml,
} from "@/lib/utils/export";
import type { AssessmentResponse, ComplianceStatus } from "@/types/assessment";
import type { Assessment } from "@/types/assessment";
import type { Template } from "@/types/template";
import type { FrameworkControl, FrameworkId } from "@/types/framework";

const ComplianceChart = dynamic(
  () =>
    import("@/components/reports/compliance-chart").then((m) => ({
      default: m.ComplianceChart,
    })),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const PRISMA_TO_STATUS: Record<string, ComplianceStatus> = {
  NOT_ASSESSED: "not_assessed",
  COMPLIANT: "compliant",
  PARTIALLY_COMPLIANT: "partially_compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_APPLICABLE: "not_applicable",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: PageProps): React.ReactNode {
  const { id } = use(params);
  return <ReportDetailView assessmentId={id} />;
}

function ReportDetailView({ assessmentId }: { assessmentId: string }): React.ReactNode {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const query = trpc.reports.getById.useQuery(
    { id: assessmentId },
    { refetchOnWindowFocus: false },
  );

  const { assessment, template } = useMemo(() => {
    if (!query.data) {
      return { assessment: null, template: null };
    }

    const rawResponses = (query.data.responses ?? []).map(
      (r: {
        framework: string;
        controlId: string;
        status: string;
        notes: string | null;
        evidence: string | null;
      }) => ({
        framework: r.framework,
        controlId: r.controlId,
        status: PRISMA_TO_STATUS[r.status] ?? ("not_assessed" as ComplianceStatus),
        notes: r.notes ?? "",
        evidence: r.evidence ?? "",
      }),
    );

    const responseMap = Object.fromEntries(
      rawResponses.map((r: AssessmentResponse) => [
        `${r.framework}::${r.controlId}`,
        r,
      ]),
    );

    const controls: FrameworkControl[] = (
      query.data.template?.controls ?? []
    ).map(
      (c: {
        framework: string;
        controlId: string;
        controlName: string;
        description?: string | null;
        domain: string;
      }) => ({
        id: c.controlId,
        name: c.controlName,
        description: c.description ?? "",
        domain: c.domain,
        framework: c.framework as FrameworkId,
      }),
    );

    const tmpl: Template = {
      id: query.data.templateId,
      name: query.data.template?.name ?? "",
      description: query.data.template?.description ?? "",
      controls,
      createdAt: "",
      updatedAt: "",
    };

    const asmt: Assessment = {
      id: query.data.id,
      name: query.data.name,
      templateId: query.data.templateId,
      status:
        query.data.status === "COMPLETED"
          ? "completed"
          : query.data.status === "ARCHIVED"
            ? "archived"
            : "in_progress",
      responses: responseMap,
      createdAt: query.data.createdAt ?? "",
      updatedAt: query.data.updatedAt ?? "",
    };

    return { assessment: asmt, template: tmpl };
  }, [query.data]);

  const reportData = useMemo(() => {
    if (!assessment || !template) return null;

    const responseList = Object.values(assessment.responses);
    return {
      metrics: getReportMetrics(responseList),
      frameworkBreakdowns: getFrameworkBreakdown(responseList),
      domainBreakdowns: getDomainBreakdown(
        template.controls,
        assessment.responses,
      ),
      findings: buildFindingRows(template.controls, assessment.responses),
      remediation: buildRemediationItems(
        template.controls,
        assessment.responses,
      ),
    };
  }, [assessment, template]);

  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [],
  );

  const handleExportCsv = useCallback(() => {
    if (!assessment || !template) return;
    try {
      setExporting("csv");
      const csv = exportToCsv(assessment, template);
      downloadFile(
        csv,
        `${assessment.name.replace(/\s+/g, "-")}-report.csv`,
        "text/csv;charset=utf-8",
      );
      toast("CSV exported successfully", { variant: "success" });
    } catch {
      toast("Failed to export CSV", { variant: "danger" });
    } finally {
      setExporting(null);
    }
  }, [assessment, template, downloadFile, toast]);

  const handleExportJson = useCallback(() => {
    if (!assessment || !template) return;
    try {
      setExporting("json");
      const json = exportToJson(assessment, template);
      downloadFile(
        json,
        `${assessment.name.replace(/\s+/g, "-")}-report.json`,
        "application/json",
      );
      toast("JSON exported successfully", { variant: "success" });
    } catch {
      toast("Failed to export JSON", { variant: "danger" });
    } finally {
      setExporting(null);
    }
  }, [assessment, template, downloadFile, toast]);

  const handleExportHtml = useCallback(() => {
    if (!assessment || !template) return;
    try {
      setExporting("html");
      const html = exportToHtml(assessment, template);
      downloadFile(
        html,
        `${assessment.name.replace(/\s+/g, "-")}-report.html`,
        "text/html;charset=utf-8",
      );
      toast("HTML exported successfully", { variant: "success" });
    } catch {
      toast("Failed to export HTML", { variant: "danger" });
    } finally {
      setExporting(null);
    }
  }, [assessment, template, downloadFile, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!assessment || !template || !reportData) return;
    try {
      setExporting("pdf");
      const { renderPdf } = await import("@/lib/utils/render-pdf");
      const blob = await renderPdf({
        assessmentName: assessment.name,
        templateName: template.name,
        assessmentStatus: assessment.status,
        date: assessment.updatedAt,
        metrics: reportData.metrics,
        frameworkBreakdowns: reportData.frameworkBreakdowns,
        findings: reportData.findings,
        remediation: reportData.remediation,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assessment.name.replace(/\s+/g, "-")}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast("PDF exported successfully", { variant: "success" });
    } catch {
      toast("Failed to export PDF", { variant: "danger" });
    } finally {
      setExporting(null);
    }
  }, [assessment, template, reportData, toast]);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.error || !assessment || !template || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-serif text-ink">Report unavailable</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {query.error?.message ?? "Could not load report data."}
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/reports">Back to Reports</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-tight text-ink">
              {assessment.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Compliance Report &middot; {template.name}
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportPdf}
              disabled={exporting !== null}
              size="sm"
            >
              <FileText size={14} className="mr-1.5" />
              {exporting === "pdf" ? "Exporting..." : "PDF"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleExportCsv}
              disabled={exporting !== null}
              size="sm"
            >
              <FileSpreadsheet size={14} className="mr-1.5" />
              {exporting === "csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleExportHtml}
              disabled={exporting !== null}
              size="sm"
            >
              <FileCode size={14} className="mr-1.5" />
              {exporting === "html" ? "Exporting..." : "HTML"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleExportJson}
              disabled={exporting !== null}
              size="sm"
            >
              <FileJson size={14} className="mr-1.5" />
              {exporting === "json" ? "Exporting..." : "JSON"}
            </Button>
          </div>
        </div>
      </div>

      {/* Report sections */}
      <div className="space-y-10">
        <div className="rounded-md border border-border-muted bg-surface p-6">
          <ExecutiveSummary
            metrics={reportData.metrics}
            frameworkBreakdowns={reportData.frameworkBreakdowns}
            assessmentName={assessment.name}
          />
        </div>

        <div className="rounded-md border border-border-muted bg-surface p-6">
          <ComplianceChart
            frameworkBreakdowns={reportData.frameworkBreakdowns}
            domainBreakdowns={reportData.domainBreakdowns}
          />
        </div>

        <div className="rounded-md border border-border-muted bg-surface p-6">
          <FindingsTable findings={reportData.findings} />
        </div>

        <div className="rounded-md border border-border-muted bg-surface p-6">
          <RemediationSection items={reportData.remediation} />
        </div>
      </div>
    </div>
  );
}
