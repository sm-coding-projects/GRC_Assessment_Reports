"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { ControlRow } from "./control-row";
import { useAssessmentStore, makeKey, DEFAULT_RESPONSE } from "@/stores/assessment-store";
import type { ComplianceStatus, EvidenceFile } from "@/types/assessment";

interface TemplateControl {
  framework: string;
  domain: string;
  controlId: string;
  controlName: string;
  description?: string | null;
}

interface AssessmentTableProps {
  assessmentId: string;
  controls: TemplateControl[];
}

const FRAMEWORK_NAMES: Record<string, string> = {
  iso27001: "ISO 27001",
  soc2: "SOC 2",
  nist_csf: "NIST CSF 2.0",
  pci_dss: "PCI DSS",
  hipaa: "HIPAA",
  gdpr: "GDPR",
};

interface ControlGroup {
  framework: string;
  frameworkLabel: string;
  domains: Array<{
    domain: string;
    controls: TemplateControl[];
  }>;
}

function groupControls(controls: TemplateControl[]): ControlGroup[] {
  const frameworkMap = new Map<string, Map<string, TemplateControl[]>>();

  for (const control of controls) {
    if (!frameworkMap.has(control.framework)) {
      frameworkMap.set(control.framework, new Map());
    }
    const domainMap = frameworkMap.get(control.framework)!;
    if (!domainMap.has(control.domain)) {
      domainMap.set(control.domain, []);
    }
    domainMap.get(control.domain)!.push(control);
  }

  return Array.from(frameworkMap.entries()).map(([framework, domainMap]) => ({
    framework,
    frameworkLabel: FRAMEWORK_NAMES[framework] ?? framework,
    domains: Array.from(domainMap.entries()).map(([domain, domainControls]) => ({
      domain,
      controls: domainControls,
    })),
  }));
}

function AssessmentTable({ assessmentId, controls }: AssessmentTableProps): React.ReactNode {
  const responses = useAssessmentStore((s) => s.responses);
  const setStatus = useAssessmentStore((s) => s.setStatus);
  const setNotes = useAssessmentStore((s) => s.setNotes);
  const setEvidence = useAssessmentStore((s) => s.setEvidence);
  const addEvidenceFile = useAssessmentStore((s) => s.addEvidenceFile);
  const removeEvidenceFile = useAssessmentStore((s) => s.removeEvidenceFile);

  const groups = useMemo(() => groupControls(controls), [controls]);

  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm font-sans">
        {/* Sticky header */}
        <thead className="sticky top-0 z-10 bg-surface border-b border-border">
          <tr>
            <th className="h-10 px-3 text-left align-middle text-xs font-medium text-ink-muted tracking-label uppercase w-[140px]">
              Control ID
            </th>
            <th className="h-10 px-3 text-left align-middle text-xs font-medium text-ink-muted tracking-label uppercase">
              Control Name
            </th>
            <th className="h-10 px-3 text-left align-middle text-xs font-medium text-ink-muted tracking-label uppercase w-[380px]">
              Status
            </th>
            <th className="h-10 px-3 text-right align-middle text-xs font-medium text-ink-muted tracking-label uppercase w-[80px]">
              Info
            </th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <GroupSection
              key={group.framework}
              assessmentId={assessmentId}
              group={group}
              responses={responses}
              onStatusChange={setStatus}
              onNotesChange={setNotes}
              onEvidenceChange={setEvidence}
              onEvidenceFileUploaded={addEvidenceFile}
              onEvidenceFileDeleted={removeEvidenceFile}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface GroupSectionProps {
  assessmentId: string;
  group: ControlGroup;
  responses: Record<string, { status: ComplianceStatus; notes: string; evidence: string; evidenceFiles: EvidenceFile[] }>;
  onStatusChange: (framework: string, controlId: string, status: ComplianceStatus) => void;
  onNotesChange: (framework: string, controlId: string, notes: string) => void;
  onEvidenceChange: (framework: string, controlId: string, evidence: string) => void;
  onEvidenceFileUploaded: (framework: string, controlId: string, file: EvidenceFile) => void;
  onEvidenceFileDeleted: (framework: string, controlId: string, fileId: string) => void;
}

function GroupSection({
  assessmentId,
  group,
  responses,
  onStatusChange,
  onNotesChange,
  onEvidenceChange,
  onEvidenceFileUploaded,
  onEvidenceFileDeleted,
}: GroupSectionProps): React.ReactNode {
  return (
    <>
      {/* Framework header row */}
      <tr>
        <td
          colSpan={4}
          className="px-3 py-2.5 bg-surface-inset border-y border-border"
        >
          <span className="font-serif text-sm font-medium text-ink tracking-tight">
            {group.frameworkLabel}
          </span>
        </td>
      </tr>

      {group.domains.map((domain) => (
        <DomainSection
          key={`${group.framework}-${domain.domain}`}
          assessmentId={assessmentId}
          framework={group.framework}
          domain={domain}
          responses={responses}
          onStatusChange={onStatusChange}
          onNotesChange={onNotesChange}
          onEvidenceChange={onEvidenceChange}
          onEvidenceFileUploaded={onEvidenceFileUploaded}
          onEvidenceFileDeleted={onEvidenceFileDeleted}
        />
      ))}
    </>
  );
}

interface DomainSectionProps {
  assessmentId: string;
  framework: string;
  domain: { domain: string; controls: TemplateControl[] };
  responses: Record<string, { status: ComplianceStatus; notes: string; evidence: string; evidenceFiles: EvidenceFile[] }>;
  onStatusChange: (framework: string, controlId: string, status: ComplianceStatus) => void;
  onNotesChange: (framework: string, controlId: string, notes: string) => void;
  onEvidenceChange: (framework: string, controlId: string, evidence: string) => void;
  onEvidenceFileUploaded: (framework: string, controlId: string, file: EvidenceFile) => void;
  onEvidenceFileDeleted: (framework: string, controlId: string, fileId: string) => void;
}

function DomainSection({
  assessmentId,
  framework,
  domain,
  responses,
  onStatusChange,
  onNotesChange,
  onEvidenceChange,
  onEvidenceFileUploaded,
  onEvidenceFileDeleted,
}: DomainSectionProps): React.ReactNode {
  return (
    <>
      {/* Domain sub-header */}
      <tr>
        <td
          colSpan={4}
          className="px-3 py-2 bg-surface-alt/60 border-b border-border-muted"
        >
          <span className="text-xs font-medium text-ink-muted tracking-label uppercase">
            {domain.domain}
          </span>
        </td>
      </tr>

      {/* Control rows */}
      {domain.controls.map((control) => {
        const key = makeKey(control.framework, control.controlId);
        const response = responses[key] ?? DEFAULT_RESPONSE;

        return (
          <ControlRow
            key={key}
            assessmentId={assessmentId}
            framework={control.framework}
            controlId={control.controlId}
            controlName={control.controlName}
            description={control.description}
            status={response.status}
            notes={response.notes}
            evidence={response.evidence}
            evidenceFiles={response.evidenceFiles}
            onStatusChange={(status) => onStatusChange(control.framework, control.controlId, status)}
            onNotesChange={(notes) => onNotesChange(control.framework, control.controlId, notes)}
            onEvidenceChange={(evidence) => onEvidenceChange(control.framework, control.controlId, evidence)}
            onEvidenceFileUploaded={(file) => onEvidenceFileUploaded(control.framework, control.controlId, file)}
            onEvidenceFileDeleted={(fileId) => onEvidenceFileDeleted(control.framework, control.controlId, fileId)}
          />
        );
      })}
    </>
  );
}

export { AssessmentTable, type AssessmentTableProps };
