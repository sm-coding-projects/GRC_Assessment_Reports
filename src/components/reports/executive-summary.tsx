"use client";

import type { ReportMetrics, FrameworkBreakdown } from "@/types/report";
import { cn } from "@/lib/utils/cn";

interface ExecutiveSummaryProps {
  metrics: ReportMetrics;
  frameworkBreakdowns: FrameworkBreakdown[];
  assessmentName: string;
}

function ExecutiveSummary({
  metrics,
  frameworkBreakdowns,
  assessmentName,
}: ExecutiveSummaryProps): React.ReactNode {
  return (
    <section aria-labelledby="exec-summary-heading">
      <h2
        id="exec-summary-heading"
        className="font-serif text-xl tracking-tight text-ink mb-6"
      >
        Executive Summary
      </h2>

      {/* Key metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          value={`${metrics.complianceRate}%`}
          label="Compliance Rate"
          valueColor="text-accent"
        />
        <MetricCard
          value={`${metrics.assessedCount}/${metrics.totalControls}`}
          label="Controls Assessed"
          valueColor="text-ink"
        />
        <MetricCard
          value={metrics.riskScore.toString()}
          label="Risk Score (0–3)"
          valueColor={riskScoreColor(metrics.riskScore)}
        />
      </div>

      {/* Status breakdown */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
        <StatusCount count={metrics.compliant} label="Compliant" dotClass="bg-success" />
        <StatusCount count={metrics.partiallyCompliant} label="Partial" dotClass="bg-warning" />
        <StatusCount count={metrics.nonCompliant} label="Non-Compliant" dotClass="bg-danger" />
        <StatusCount count={metrics.notApplicable} label="N/A" dotClass="bg-neutral" />
        <StatusCount count={metrics.notAssessed} label="Not Assessed" dotClass="bg-ink-subtle/30" />
      </div>

      {/* Per-framework horizontal stacked bars */}
      {frameworkBreakdowns.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-ink-muted tracking-label uppercase mb-4">
            Per-Framework Compliance
          </h3>
          <div className="space-y-4">
            {frameworkBreakdowns.map((fw) => (
              <FrameworkBar key={fw.frameworkId} breakdown={fw} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({
  value,
  label,
  valueColor,
}: {
  value: string;
  label: string;
  valueColor: string;
}): React.ReactNode {
  return (
    <div className="bg-surface-alt rounded-md p-4 text-center">
      <div className={cn("text-3xl font-bold", valueColor)}>{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </div>
  );
}

function StatusCount({
  count,
  label,
  dotClass,
}: {
  count: number;
  label: string;
  dotClass: string;
}): React.ReactNode {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} aria-hidden="true" />
      <span className="font-medium text-ink">{count}</span> {label}
    </span>
  );
}

function FrameworkBar({ breakdown }: { breakdown: FrameworkBreakdown }): React.ReactNode {
  const applicable =
    breakdown.total - breakdown.notApplicable - breakdown.notAssessed;
  if (applicable === 0) return null;

  const cPct = (breakdown.compliant / applicable) * 100;
  const pPct = (breakdown.partiallyCompliant / applicable) * 100;
  const nPct = (breakdown.nonCompliant / applicable) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-ink">{breakdown.frameworkName}</span>
        <span className="text-xs text-ink-muted font-mono">
          {breakdown.complianceRate}%
        </span>
      </div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-sm bg-surface-inset"
        role="img"
        aria-label={`${breakdown.frameworkName}: ${breakdown.complianceRate}% compliant`}
      >
        {cPct > 0 && (
          <div
            className="bg-success transition-all duration-300"
            style={{ width: `${cPct}%` }}
            title={`Compliant: ${breakdown.compliant}`}
          />
        )}
        {pPct > 0 && (
          <div
            className="bg-warning transition-all duration-300"
            style={{ width: `${pPct}%` }}
            title={`Partial: ${breakdown.partiallyCompliant}`}
          />
        )}
        {nPct > 0 && (
          <div
            className="bg-danger transition-all duration-300"
            style={{ width: `${nPct}%` }}
            title={`Non-Compliant: ${breakdown.nonCompliant}`}
          />
        )}
      </div>
      <div className="flex gap-3 mt-1">
        <span className="text-[11px] text-ink-subtle">
          {breakdown.compliant} compliant
        </span>
        <span className="text-[11px] text-ink-subtle">
          {breakdown.partiallyCompliant} partial
        </span>
        <span className="text-[11px] text-ink-subtle">
          {breakdown.nonCompliant} non-compliant
        </span>
      </div>
    </div>
  );
}

function riskScoreColor(score: number): string {
  if (score > 2) return "text-danger";
  if (score > 1) return "text-warning";
  return "text-success";
}

export { ExecutiveSummary, type ExecutiveSummaryProps };
