import type { AssessmentResponse, ComplianceStatus } from "@/types/assessment";
import type { Assessment } from "@/types/assessment";
import type { Template } from "@/types/template";
import type { FrameworkControl } from "@/types/framework";
import type {
  ReportMetrics,
  FrameworkBreakdown,
  DomainBreakdown,
  FindingRow,
  RemediationItem,
} from "@/types/report";
import { frameworks } from "@/data";

// ─── Calculation Functions ───────────────────────────────────────

const EXCLUDED_STATUSES: ComplianceStatus[] = ["not_applicable", "not_assessed"];

function calculateComplianceRate(responses: AssessmentResponse[]): number {
  const applicable = responses.filter((r) => !EXCLUDED_STATUSES.includes(r.status));
  if (applicable.length === 0) return 0;
  const compliant = applicable.filter((r) => r.status === "compliant").length;
  return Math.round((compliant / applicable.length) * 100);
}

function calculateRiskScore(responses: AssessmentResponse[]): number {
  const applicable = responses.filter((r) => !EXCLUDED_STATUSES.includes(r.status));
  if (applicable.length === 0) return 0;
  const score = applicable.reduce((sum, r) => {
    if (r.status === "non_compliant") return sum + 3;
    if (r.status === "partially_compliant") return sum + 1;
    return sum;
  }, 0);
  return Math.round((score / applicable.length) * 100) / 100;
}

function getReportMetrics(responses: AssessmentResponse[]): ReportMetrics {
  const counts = {
    compliant: 0,
    partiallyCompliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    notAssessed: 0,
  };

  for (const r of responses) {
    switch (r.status) {
      case "compliant":
        counts.compliant++;
        break;
      case "partially_compliant":
        counts.partiallyCompliant++;
        break;
      case "non_compliant":
        counts.nonCompliant++;
        break;
      case "not_applicable":
        counts.notApplicable++;
        break;
      case "not_assessed":
        counts.notAssessed++;
        break;
    }
  }

  return {
    totalControls: responses.length,
    assessedCount: responses.length - counts.notAssessed,
    ...counts,
    complianceRate: calculateComplianceRate(responses),
    riskScore: calculateRiskScore(responses),
  };
}

function getFrameworkBreakdown(responses: AssessmentResponse[]): FrameworkBreakdown[] {
  const map = new Map<
    string,
    {
      compliant: number;
      partiallyCompliant: number;
      nonCompliant: number;
      notApplicable: number;
      notAssessed: number;
      total: number;
    }
  >();

  for (const r of responses) {
    const entry = map.get(r.framework) ?? {
      compliant: 0,
      partiallyCompliant: 0,
      nonCompliant: 0,
      notApplicable: 0,
      notAssessed: 0,
      total: 0,
    };
    entry.total++;
    switch (r.status) {
      case "compliant":
        entry.compliant++;
        break;
      case "partially_compliant":
        entry.partiallyCompliant++;
        break;
      case "non_compliant":
        entry.nonCompliant++;
        break;
      case "not_applicable":
        entry.notApplicable++;
        break;
      case "not_assessed":
        entry.notAssessed++;
        break;
    }
    map.set(r.framework, entry);
  }

  return Array.from(map.entries()).map(([frameworkId, data]) => {
    const fw = frameworks[frameworkId as keyof typeof frameworks];
    const applicable = data.total - data.notApplicable - data.notAssessed;
    return {
      frameworkId,
      frameworkName: fw?.name ?? frameworkId,
      ...data,
      complianceRate: applicable > 0 ? Math.round((data.compliant / applicable) * 100) : 0,
    };
  });
}

function getDomainBreakdown(
  controls: FrameworkControl[],
  responses: Record<string, AssessmentResponse>,
): DomainBreakdown[] {
  const map = new Map<
    string,
    { frameworkId: string; total: number; compliant: number; partiallyCompliant: number; nonCompliant: number }
  >();

  for (const control of controls) {
    const key = `${control.framework}::${control.id}`;
    const response = responses[key];
    const domainKey = `${control.framework}::${control.domain}`;
    const entry = map.get(domainKey) ?? {
      frameworkId: control.framework,
      total: 0,
      compliant: 0,
      partiallyCompliant: 0,
      nonCompliant: 0,
    };

    if (response && !EXCLUDED_STATUSES.includes(response.status)) {
      entry.total++;
      if (response.status === "compliant") entry.compliant++;
      if (response.status === "partially_compliant") entry.partiallyCompliant++;
      if (response.status === "non_compliant") entry.nonCompliant++;
    }

    map.set(domainKey, entry);
  }

  return Array.from(map.entries()).map(([domainKey, data]) => {
    const domainName = domainKey.split("::")[1];
    return {
      frameworkId: data.frameworkId,
      domainName,
      total: data.total,
      compliant: data.compliant,
      partiallyCompliant: data.partiallyCompliant,
      nonCompliant: data.nonCompliant,
      complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
    };
  });
}

// ─── Building Report Data ────────────────────────────────────────

function buildFindingRows(
  controls: FrameworkControl[],
  responses: Record<string, AssessmentResponse>,
): FindingRow[] {
  return controls.map((control) => {
    const key = `${control.framework}::${control.id}`;
    const response = responses[key];
    const fw = frameworks[control.framework as keyof typeof frameworks];
    return {
      framework: control.framework,
      frameworkName: fw?.name ?? control.framework,
      domain: control.domain,
      controlId: control.id,
      controlName: control.name,
      status: response?.status ?? "not_assessed",
      notes: response?.notes ?? "",
      evidence: response?.evidence ?? "",
    };
  });
}

function buildRemediationItems(
  controls: FrameworkControl[],
  responses: Record<string, AssessmentResponse>,
): RemediationItem[] {
  const items: RemediationItem[] = [];

  for (const control of controls) {
    const key = `${control.framework}::${control.id}`;
    const response = responses[key];
    if (!response) continue;

    if (response.status === "non_compliant" || response.status === "partially_compliant") {
      const fw = frameworks[control.framework as keyof typeof frameworks];
      items.push({
        framework: control.framework,
        frameworkName: fw?.name ?? control.framework,
        domain: control.domain,
        controlId: control.id,
        controlName: control.name,
        status: response.status,
        notes: response.notes,
        priority: response.status === "non_compliant" ? "critical" : "high",
      });
    }
  }

  // Sort: non-compliant first, then partially compliant
  items.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "non_compliant" ? -1 : 1;
  });

  return items;
}

// ─── Sanitisation ────────────────────────────────────────────────

function sanitiseCsvCell(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return trimmed;
  if (/^[=+\-@|%]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  if (/[,\n\r"]/.test(trimmed)) {
    return `"${trimmed.replace(/"/g, '""')}"`;
  }
  return trimmed;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Status Label Helpers ────────────────────────────────────────

const STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant: "Compliant",
  partially_compliant: "Partially Compliant",
  non_compliant: "Non-Compliant",
  not_applicable: "Not Applicable",
  not_assessed: "Not Assessed",
};

function statusLabel(status: ComplianceStatus): string {
  return STATUS_LABELS[status];
}

// ─── Export: CSV ─────────────────────────────────────────────────

function exportToCsv(assessment: Assessment, template: Template): string {
  const header = "Framework,Domain,Control ID,Control Name,Status,Notes,Evidence";
  const rows = buildFindingRows(template.controls, assessment.responses);

  const lines = rows.map((row) => {
    const fw = frameworks[row.framework as keyof typeof frameworks];
    return [
      sanitiseCsvCell(fw?.name ?? row.framework),
      sanitiseCsvCell(row.domain),
      sanitiseCsvCell(row.controlId),
      sanitiseCsvCell(row.controlName),
      sanitiseCsvCell(statusLabel(row.status)),
      sanitiseCsvCell(row.notes),
      sanitiseCsvCell(row.evidence),
    ].join(",");
  });

  return [header, ...lines].join("\n");
}

// ─── Export: JSON ────────────────────────────────────────────────

function exportToJson(assessment: Assessment, template: Template): string {
  const responseList = Object.values(assessment.responses);
  const metrics = getReportMetrics(responseList);

  const data = {
    exportedAt: new Date().toISOString(),
    assessment: {
      id: assessment.id,
      name: assessment.name,
      status: assessment.status,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    },
    template: {
      id: template.id,
      name: template.name,
      description: template.description,
    },
    metrics,
    responses: template.controls.map((control) => {
      const key = `${control.framework}::${control.id}`;
      const response = assessment.responses[key];
      return {
        framework: control.framework,
        domain: control.domain,
        controlId: control.id,
        controlName: control.name,
        status: response?.status ?? "not_assessed",
        notes: response?.notes ?? "",
        evidence: response?.evidence ?? "",
      };
    }),
  };

  return JSON.stringify(data, null, 2);
}

// ─── Export: HTML ─────────────────────────────────────────────────

function exportToHtml(assessment: Assessment, template: Template): string {
  const responseList = Object.values(assessment.responses);
  const metrics = getReportMetrics(responseList);
  const frameworkData = getFrameworkBreakdown(responseList);
  const findings = buildFindingRows(template.controls, assessment.responses);
  const remediation = buildRemediationItems(template.controls, assessment.responses);

  // Group findings by framework then domain
  const grouped = new Map<string, Map<string, FindingRow[]>>();
  for (const row of findings) {
    if (!grouped.has(row.frameworkName)) {
      grouped.set(row.frameworkName, new Map());
    }
    const domains = grouped.get(row.frameworkName)!;
    if (!domains.has(row.domain)) {
      domains.set(row.domain, []);
    }
    domains.get(row.domain)!.push(row);
  }

  const statusColor: Record<ComplianceStatus, string> = {
    compliant: "#1A7F37",
    partially_compliant: "#9A6700",
    non_compliant: "#CF222E",
    not_applicable: "#6E7781",
    not_assessed: "#8B949E",
  };

  const statusBgColor: Record<ComplianceStatus, string> = {
    compliant: "#DAFBE1",
    partially_compliant: "#FFF8C5",
    non_compliant: "#FFEBE9",
    not_applicable: "#F3F4F6",
    not_assessed: "#F3F4F6",
  };

  const statusSymbol: Record<ComplianceStatus, string> = {
    compliant: "&#9679;",
    partially_compliant: "&#9684;",
    non_compliant: "&#10005;",
    not_applicable: "&mdash;",
    not_assessed: "?",
  };

  let findingsHtml = "";
  for (const [fwName, domains] of grouped) {
    findingsHtml += `<h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:32px 0 16px;color:#1B1F23;">${escapeHtml(fwName)}</h2>`;
    for (const [domain, rows] of domains) {
      findingsHtml += `<h3 style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;margin:20px 0 8px;color:#57606A;letter-spacing:0.05em;text-transform:uppercase;">${escapeHtml(domain)}</h3>`;
      findingsHtml += `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
        <thead><tr style="background:#F6F8FA;border-bottom:1px solid #D1D9E0;">
          <th style="text-align:left;padding:8px 12px;font-weight:600;color:#57606A;width:60px;">ID</th>
          <th style="text-align:left;padding:8px 12px;font-weight:600;color:#57606A;">Control</th>
          <th style="text-align:left;padding:8px 12px;font-weight:600;color:#57606A;width:140px;">Status</th>
          <th style="text-align:left;padding:8px 12px;font-weight:600;color:#57606A;">Notes</th>
          <th style="text-align:left;padding:8px 12px;font-weight:600;color:#57606A;">Evidence</th>
        </tr></thead><tbody>`;
      for (const row of rows) {
        const bgRow = row.status === "non_compliant" ? "background:#FFEBE9;" : "";
        findingsHtml += `<tr style="border-bottom:1px solid #E8ECEF;${bgRow}">
          <td style="padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:12px;">${escapeHtml(row.controlId)}</td>
          <td style="padding:8px 12px;">${escapeHtml(row.controlName)}</td>
          <td style="padding:8px 12px;"><span style="color:${statusColor[row.status]};">${statusSymbol[row.status]} ${escapeHtml(statusLabel(row.status))}</span></td>
          <td style="padding:8px 12px;color:#57606A;">${escapeHtml(row.notes) || "&mdash;"}</td>
          <td style="padding:8px 12px;color:#57606A;">${escapeHtml(row.evidence) || "&mdash;"}</td>
        </tr>`;
      }
      findingsHtml += "</tbody></table>";
    }
  }

  let remediationHtml = "";
  if (remediation.length > 0) {
    remediationHtml = `<h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:32px 0 16px;color:#1B1F23;">Remediation Roadmap</h2>`;
    for (const item of remediation) {
      const bgColor = item.status === "non_compliant" ? "#FFEBE9" : "#FFF8C5";
      const priorityColor = item.priority === "critical" ? "#CF222E" : "#9A6700";
      remediationHtml += `<div style="border:1px solid #D1D9E0;border-radius:6px;padding:16px;margin-bottom:12px;background:${bgColor};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#57606A;">${escapeHtml(item.frameworkName)} / ${escapeHtml(item.controlId)}</span>
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${priorityColor};">${escapeHtml(item.priority)}</span>
        </div>
        <div style="font-weight:600;color:#1B1F23;margin-bottom:4px;">${escapeHtml(item.controlName)}</div>
        <div style="font-size:13px;color:#57606A;">${escapeHtml(item.notes) || "No notes provided."}</div>
      </div>`;
    }
  }

  const frameworkBarsHtml = frameworkData
    .map((fw) => {
      const applicable = fw.total - fw.notApplicable - fw.notAssessed;
      const cPct = applicable > 0 ? (fw.compliant / applicable) * 100 : 0;
      const pPct = applicable > 0 ? (fw.partiallyCompliant / applicable) * 100 : 0;
      const nPct = applicable > 0 ? (fw.nonCompliant / applicable) * 100 : 0;
      return `<div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
          <span style="font-weight:600;color:#1B1F23;">${escapeHtml(fw.frameworkName)}</span>
          <span style="color:#57606A;">${fw.complianceRate}%</span>
        </div>
        <div style="display:flex;height:8px;border-radius:2px;overflow:hidden;background:#ECEEF1;">
          <div style="width:${cPct}%;background:#1A7F37;"></div>
          <div style="width:${pPct}%;background:#9A6700;"></div>
          <div style="width:${nPct}%;background:#CF222E;"></div>
        </div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(assessment.name)} — Compliance Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', system-ui, sans-serif; color: #1B1F23; background: #fff; line-height: 1.5; }
  .page { max-width: 900px; margin: 0 auto; padding: 48px 32px; }
  @media print {
    .page { padding: 24px; max-width: 100%; }
    .no-print { display: none !important; }
    h2 { page-break-before: auto; }
    table { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Cover -->
  <div style="text-align:center;padding:48px 0 32px;border-bottom:2px solid #D1D9E0;margin-bottom:32px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B949E;margin-bottom:24px;">Compliance Assessment Report</div>
    <h1 style="font-family:'Instrument Serif',Georgia,serif;font-size:32px;letter-spacing:-0.03em;color:#1B1F23;margin-bottom:8px;">${escapeHtml(assessment.name)}</h1>
    <div style="font-size:14px;color:#57606A;margin-bottom:4px;">Template: ${escapeHtml(template.name)}</div>
    <div style="font-size:14px;color:#57606A;margin-bottom:4px;">Status: ${escapeHtml(assessment.status)}</div>
    <div style="font-size:14px;color:#57606A;">Date: ${escapeHtml(assessment.updatedAt)}</div>
    <div style="margin-top:24px;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;color:#CF222E;font-weight:600;">Confidential</div>
  </div>

  <!-- Executive Summary -->
  <h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:0 0 16px;color:#1B1F23;">Executive Summary</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
    <div style="background:#F6F8FA;padding:16px;border-radius:6px;text-align:center;">
      <div style="font-size:32px;font-weight:700;color:#0550AE;">${metrics.complianceRate}%</div>
      <div style="font-size:12px;color:#57606A;margin-top:4px;">Compliance Rate</div>
    </div>
    <div style="background:#F6F8FA;padding:16px;border-radius:6px;text-align:center;">
      <div style="font-size:32px;font-weight:700;color:#1B1F23;">${metrics.assessedCount}/${metrics.totalControls}</div>
      <div style="font-size:12px;color:#57606A;margin-top:4px;">Controls Assessed</div>
    </div>
    <div style="background:#F6F8FA;padding:16px;border-radius:6px;text-align:center;">
      <div style="font-size:32px;font-weight:700;color:${metrics.riskScore > 2 ? "#CF222E" : metrics.riskScore > 1 ? "#9A6700" : "#1A7F37"};">${metrics.riskScore}</div>
      <div style="font-size:12px;color:#57606A;margin-top:4px;">Risk Score (0-3)</div>
    </div>
  </div>

  <!-- Status breakdown -->
  <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
    <span style="font-size:13px;"><span style="color:#1A7F37;">&#9679;</span> ${metrics.compliant} Compliant</span>
    <span style="font-size:13px;"><span style="color:#9A6700;">&#9684;</span> ${metrics.partiallyCompliant} Partial</span>
    <span style="font-size:13px;"><span style="color:#CF222E;">&#10005;</span> ${metrics.nonCompliant} Non-Compliant</span>
    <span style="font-size:13px;"><span style="color:#6E7781;">&mdash;</span> ${metrics.notApplicable} N/A</span>
    <span style="font-size:13px;"><span style="color:#8B949E;">?</span> ${metrics.notAssessed} Not Assessed</span>
  </div>

  <!-- Framework bars -->
  <h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:0 0 16px;color:#1B1F23;">Per-Framework Compliance</h2>
  ${frameworkBarsHtml}

  <!-- Detailed Findings -->
  <h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:32px 0 16px;color:#1B1F23;">Detailed Findings</h2>
  ${findingsHtml}

  <!-- Remediation -->
  ${remediationHtml}

  <!-- Footer -->
  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #D1D9E0;font-size:11px;color:#8B949E;text-align:center;">
    Generated by GRC Report Generator &middot; ${escapeHtml(new Date().toISOString().split("T")[0])}
  </div>
</div>
</body>
</html>`;
}

export {
  calculateComplianceRate,
  calculateRiskScore,
  getReportMetrics,
  getFrameworkBreakdown,
  getDomainBreakdown,
  buildFindingRows,
  buildRemediationItems,
  sanitiseCsvCell,
  escapeHtml,
  statusLabel,
  exportToCsv,
  exportToJson,
  exportToHtml,
  STATUS_LABELS,
};
