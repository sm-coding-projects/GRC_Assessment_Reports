"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportMetrics, FrameworkBreakdown, FindingRow, RemediationItem } from "@/types/report";

// ─── Styles ──────────────────────────────────────────────────────

const colors = {
  ink: "#1B1F23",
  inkMuted: "#57606A",
  inkSubtle: "#8B949E",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F8FA",
  border: "#D1D9E0",
  accent: "#0550AE",
  success: "#1A7F37",
  successBg: "#DAFBE1",
  warning: "#9A6700",
  warningBg: "#FFF8C5",
  danger: "#CF222E",
  dangerBg: "#FFEBE9",
  neutral: "#6E7781",
  neutralBg: "#F3F4F6",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.ink,
    lineHeight: 1.5,
  },
  coverPage: {
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  coverLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.inkSubtle,
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  coverMeta: {
    fontSize: 11,
    color: colors.inkMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  confidential: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.danger,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    marginBottom: 12,
    marginTop: 20,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  metricLabel: {
    fontSize: 8,
    color: colors.inkMuted,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 8,
    minHeight: 20,
  },
  tableRowDanger: {
    backgroundColor: "#FFEBE920",
  },
  thCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tdCell: {
    fontSize: 8,
    color: colors.ink,
    lineHeight: 1.4,
  },
  domainHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },
  frameworkHeading: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  remediationCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  barContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.inkSubtle,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
});

// ─── Column widths ──────────────────────────────────────────────

const COL = {
  id: "8%",
  control: "40%",
  status: "12%",
  notes: "20%",
  evidence: "20%",
} as const;

// ─── Status Helpers ──────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  compliant: "Compliant",
  partially_compliant: "Partial",
  non_compliant: "Non-Compliant",
  not_applicable: "N/A",
  not_assessed: "Not Assessed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  completed: "Completed",
  in_progress: "In Progress",
  archived: "Archived",
};

const STATUS_COLORS: Record<string, string> = {
  compliant: colors.success,
  partially_compliant: colors.warning,
  non_compliant: colors.danger,
  not_applicable: colors.neutral,
  not_assessed: colors.inkSubtle,
};

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Component Props ─────────────────────────────────────────────

interface PdfTemplateProps {
  assessmentName: string;
  templateName: string;
  assessmentStatus: string;
  date: string;
  metrics: ReportMetrics;
  frameworkBreakdowns: FrameworkBreakdown[];
  findings: FindingRow[];
  remediation: RemediationItem[];
}

// ─── Sub-components ─────────────────────────────────────────────

function TableHeaderRow(): React.ReactNode {
  return (
    <View style={styles.tableHeader}>
      <View style={{ width: COL.id }}><Text style={styles.thCell}>ID</Text></View>
      <View style={{ width: COL.control }}><Text style={styles.thCell}>Control</Text></View>
      <View style={{ width: COL.status }}><Text style={styles.thCell}>Status</Text></View>
      <View style={{ width: COL.notes }}><Text style={styles.thCell}>Notes</Text></View>
      <View style={{ width: COL.evidence }}><Text style={styles.thCell}>Evidence</Text></View>
    </View>
  );
}

function FindingRow({ row }: { row: FindingRow }): React.ReactNode {
  return (
    <View
      style={[
        styles.tableRow,
        row.status === "non_compliant" ? styles.tableRowDanger : {},
      ]}
      wrap={false}
    >
      <View style={{ width: COL.id }}>
        <Text style={[styles.tdCell, { fontFamily: "Courier" }]}>
          {row.controlId}
        </Text>
      </View>
      <View style={{ width: COL.control, paddingRight: 6 }}>
        <Text style={styles.tdCell}>{row.controlName}</Text>
      </View>
      <View style={{ width: COL.status }}>
        <Text
          style={[
            styles.tdCell,
            { color: STATUS_COLORS[row.status] ?? colors.ink, fontFamily: "Helvetica-Bold" },
          ]}
        >
          {STATUS_LABELS[row.status] ?? row.status}
        </Text>
      </View>
      <View style={{ width: COL.notes, paddingRight: 4 }}>
        <Text style={[styles.tdCell, { color: colors.inkMuted }]}>
          {row.notes || "\u2014"}
        </Text>
      </View>
      <View style={{ width: COL.evidence }}>
        <Text style={[styles.tdCell, { color: colors.inkMuted }]}>
          {row.evidence || "\u2014"}
        </Text>
      </View>
    </View>
  );
}

// ─── PDF Document ────────────────────────────────────────────────

function PdfTemplate({
  assessmentName,
  templateName,
  assessmentStatus,
  date,
  metrics,
  frameworkBreakdowns,
  findings,
  remediation,
}: PdfTemplateProps): React.ReactNode {
  // Group findings by framework → domain
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

  const displayDate = formatDate(date);
  const displayStatus = STATUS_LABELS[assessmentStatus] ?? assessmentStatus;

  return (
    <Document>
      {/* ── Cover page ─────────────────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverLabel}>Compliance Assessment Report</Text>
        <Text style={styles.coverTitle}>{assessmentName}</Text>
        <Text style={styles.coverMeta}>Template: {templateName}</Text>
        <Text style={styles.coverMeta}>Status: {displayStatus}</Text>
        <Text style={styles.coverMeta}>Date: {displayDate}</Text>
        <Text style={styles.confidential}>Confidential</Text>
      </Page>

      {/* ── Executive Summary ──────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, { color: colors.accent }]}>
              {metrics.complianceRate}%
            </Text>
            <Text style={styles.metricLabel}>Compliance Rate</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>
              {metrics.assessedCount}/{metrics.totalControls}
            </Text>
            <Text style={styles.metricLabel}>Assessed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text
              style={[
                styles.metricValue,
                { color: metrics.riskScore > 2 ? colors.danger : metrics.riskScore > 1 ? colors.warning : colors.success },
              ]}
            >
              {metrics.riskScore}
            </Text>
            <Text style={styles.metricLabel}>Risk Score</Text>
          </View>
        </View>

        {/* Framework bars */}
        <Text style={styles.sectionTitle}>Per-Framework Compliance</Text>
        {frameworkBreakdowns.map((fw) => {
          const applicable = fw.total - fw.notApplicable - fw.notAssessed;
          if (applicable === 0) return null;
          const cPct = (fw.compliant / applicable) * 100;
          const pPct = (fw.partiallyCompliant / applicable) * 100;
          const nPct = (fw.nonCompliant / applicable) * 100;
          return (
            <View key={fw.frameworkId} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{fw.frameworkName}</Text>
                <Text style={{ fontSize: 9, color: colors.inkMuted }}>{fw.complianceRate}%</Text>
              </View>
              <View style={styles.barContainer}>
                {cPct > 0 && <View style={{ width: `${cPct}%`, backgroundColor: colors.success }} />}
                {pPct > 0 && <View style={{ width: `${pPct}%`, backgroundColor: colors.warning }} />}
                {nPct > 0 && <View style={{ width: `${nPct}%`, backgroundColor: colors.danger }} />}
              </View>
            </View>
          );
        })}

        {/* Bar legend */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
          {([
            ["Compliant", colors.success],
            ["Partial", colors.warning],
            ["Non-Compliant", colors.danger],
          ] as const).map(([label, color]) => (
            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
              <Text style={{ fontSize: 8, color: colors.inkMuted }}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          {assessmentName}
        </Text>
        <Text
          style={[styles.footer, { textAlign: "right", left: undefined }]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* ── Detailed Findings ──────────────────────────────────── */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle} fixed>Detailed Findings</Text>
        {Array.from(grouped.entries()).map(([fwName, domains]) => (
          <View key={fwName}>
            <Text style={styles.frameworkHeading}>{fwName}</Text>
            {Array.from(domains.entries()).map(([domain, rows]) => (
              <View key={domain} style={{ marginBottom: 4 }}>
                <Text style={styles.domainHeading}>{domain}</Text>
                <TableHeaderRow />
                {rows.map((row) => (
                  <FindingRow key={`${row.framework}-${row.controlId}`} row={row} />
                ))}
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {assessmentName}
        </Text>
        <Text
          style={[styles.footer, { textAlign: "right", left: undefined }]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* ── Remediation Roadmap ────────────────────────────────── */}
      {remediation.length > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <Text style={styles.sectionTitle}>Remediation Roadmap</Text>
          {remediation.map((item) => (
            <View
              key={`${item.framework}-${item.controlId}`}
              style={[
                styles.remediationCard,
                {
                  backgroundColor:
                    item.status === "non_compliant" ? "#FFEBE940" : "#FFF8C540",
                },
              ]}
              wrap={false}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: colors.inkMuted }}>
                  {item.frameworkName} / {item.controlId}
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Helvetica-Bold",
                    color: item.priority === "critical" ? colors.danger : colors.warning,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {item.priority}
                </Text>
              </View>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>
                {item.controlName}
              </Text>
              <Text style={{ fontSize: 9, color: colors.inkMuted }}>
                {item.notes || "No analyst notes provided."}
              </Text>
            </View>
          ))}

          <Text style={styles.footer} fixed>
            {assessmentName}
          </Text>
          <Text
            style={[styles.footer, { textAlign: "right", left: undefined }]}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      )}
    </Document>
  );
}

export { PdfTemplate, type PdfTemplateProps };
