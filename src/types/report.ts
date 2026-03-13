import type { ComplianceStatus } from "./assessment";

export interface ReportMetrics {
  totalControls: number;
  assessedCount: number;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notApplicable: number;
  notAssessed: number;
  complianceRate: number;
  riskScore: number;
}

export interface FrameworkBreakdown {
  frameworkId: string;
  frameworkName: string;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notApplicable: number;
  notAssessed: number;
  total: number;
  complianceRate: number;
}

export interface DomainBreakdown {
  frameworkId: string;
  domainName: string;
  total: number;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  complianceRate: number;
}

export interface FindingRow {
  framework: string;
  frameworkName: string;
  domain: string;
  controlId: string;
  controlName: string;
  status: ComplianceStatus;
  notes: string;
  evidence: string;
}

export interface RemediationItem {
  framework: string;
  frameworkName: string;
  domain: string;
  controlId: string;
  controlName: string;
  status: ComplianceStatus;
  notes: string;
  priority: "critical" | "high" | "medium";
}
