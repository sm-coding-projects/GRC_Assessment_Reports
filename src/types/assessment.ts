export type ComplianceStatus =
  | "not_assessed"
  | "compliant"
  | "partially_compliant"
  | "non_compliant"
  | "not_applicable";

export type AssessmentStatus = "in_progress" | "completed" | "archived";

export interface EvidenceFile {
  id: string;
  responseId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: string;
}

export interface AssessmentResponse {
  framework: string;
  controlId: string;
  status: ComplianceStatus;
  notes: string;
  evidence: string;
  evidenceFiles?: EvidenceFile[];
}

export interface Assessment {
  id: string;
  name: string;
  templateId: string;
  status: AssessmentStatus;
  responses: Record<string, AssessmentResponse>;
  createdAt: string;
  updatedAt: string;
}
