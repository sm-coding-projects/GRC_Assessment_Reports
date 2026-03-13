import { describe, it, expect, beforeEach } from "vitest";
import { useAssessmentStore, computeProgress, makeKey } from "./assessment-store";
import type { ComplianceStatus } from "@/types/assessment";

function getState() {
  return useAssessmentStore.getState();
}

function act(fn: () => void): void {
  fn();
}

beforeEach(() => {
  act(() => getState().reset());
});

describe("useAssessmentStore", () => {
  describe("loadResponses", () => {
    it("loads server responses into store", () => {
      act(() =>
        getState().loadResponses([
          { framework: "iso27001", controlId: "5.1", status: "compliant", notes: "All good", evidence: null },
          { framework: "iso27001", controlId: "5.2", status: "non_compliant", notes: null, evidence: "doc.pdf" },
        ]),
      );

      const { responses, dirty } = getState();
      expect(Object.keys(responses)).toHaveLength(2);
      expect(responses["iso27001::5.1"].status).toBe("compliant");
      expect(responses["iso27001::5.1"].notes).toBe("All good");
      expect(responses["iso27001::5.2"].evidence).toBe("doc.pdf");
      expect(dirty.size).toBe(0);
    });

    it("replaces null notes/evidence with empty strings", () => {
      act(() =>
        getState().loadResponses([
          { framework: "soc2", controlId: "CC1.1", status: "not_assessed", notes: null, evidence: null },
        ]),
      );

      const resp = getState().responses["soc2::CC1.1"];
      expect(resp.notes).toBe("");
      expect(resp.evidence).toBe("");
    });
  });

  describe("setStatus", () => {
    it("updates a control status and marks it dirty", () => {
      act(() =>
        getState().loadResponses([
          { framework: "iso27001", controlId: "5.1", status: "not_assessed", notes: null, evidence: null },
        ]),
      );

      act(() => getState().setStatus("iso27001", "5.1", "compliant"));

      const { responses, dirty } = getState();
      expect(responses["iso27001::5.1"].status).toBe("compliant");
      expect(dirty.has("iso27001::5.1")).toBe(true);
    });

    it("creates a default response if control was not previously loaded", () => {
      act(() => getState().setStatus("hipaa", "164.312", "non_compliant"));

      const resp = getState().responses["hipaa::164.312"];
      expect(resp.status).toBe("non_compliant");
      expect(resp.notes).toBe("");
      expect(resp.evidence).toBe("");
    });

    it("preserves notes and evidence when changing status", () => {
      act(() =>
        getState().loadResponses([
          { framework: "gdpr", controlId: "6", status: "compliant", notes: "Reviewed", evidence: "policy.pdf" },
        ]),
      );

      act(() => getState().setStatus("gdpr", "6", "partially_compliant"));

      const resp = getState().responses["gdpr::6"];
      expect(resp.status).toBe("partially_compliant");
      expect(resp.notes).toBe("Reviewed");
      expect(resp.evidence).toBe("policy.pdf");
    });
  });

  describe("setNotes", () => {
    it("updates notes and marks dirty", () => {
      act(() =>
        getState().loadResponses([
          { framework: "iso27001", controlId: "5.1", status: "compliant", notes: "", evidence: null },
        ]),
      );

      act(() => getState().setNotes("iso27001", "5.1", "Updated notes"));

      expect(getState().responses["iso27001::5.1"].notes).toBe("Updated notes");
      expect(getState().dirty.has("iso27001::5.1")).toBe(true);
    });
  });

  describe("setEvidence", () => {
    it("updates evidence and marks dirty", () => {
      act(() =>
        getState().loadResponses([
          { framework: "soc2", controlId: "CC1.1", status: "not_assessed", notes: null, evidence: null },
        ]),
      );

      act(() => getState().setEvidence("soc2", "CC1.1", "audit-report.pdf"));

      expect(getState().responses["soc2::CC1.1"].evidence).toBe("audit-report.pdf");
      expect(getState().dirty.has("soc2::CC1.1")).toBe(true);
    });
  });

  describe("markSaved", () => {
    it("removes keys from dirty set and records save timestamp", () => {
      act(() => getState().setStatus("iso27001", "5.1", "compliant"));
      act(() => getState().setStatus("iso27001", "5.2", "non_compliant"));

      expect(getState().dirty.size).toBe(2);

      act(() => getState().markSaved(["iso27001::5.1"]));

      const { dirty, lastSavedAt } = getState();
      expect(dirty.size).toBe(1);
      expect(dirty.has("iso27001::5.1")).toBe(false);
      expect(dirty.has("iso27001::5.2")).toBe(true);
      expect(lastSavedAt).toBeInstanceOf(Date);
    });
  });

  describe("getDirtyEntries", () => {
    it("returns only dirty entries with correct data", () => {
      act(() =>
        getState().loadResponses([
          { framework: "iso27001", controlId: "5.1", status: "compliant", notes: "OK", evidence: null },
          { framework: "iso27001", controlId: "5.2", status: "not_assessed", notes: null, evidence: null },
        ]),
      );

      // Only modify one
      act(() => getState().setStatus("iso27001", "5.2", "non_compliant"));

      const entries = getState().getDirtyEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].framework).toBe("iso27001");
      expect(entries[0].controlId).toBe("5.2");
      expect(entries[0].status).toBe("non_compliant");
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      act(() =>
        getState().loadResponses([
          { framework: "iso27001", controlId: "5.1", status: "compliant", notes: null, evidence: null },
        ]),
      );
      act(() => getState().setStatus("iso27001", "5.1", "non_compliant"));
      act(() => getState().setSaving(true));

      act(() => getState().reset());

      const state = getState();
      expect(Object.keys(state.responses)).toHaveLength(0);
      expect(state.dirty.size).toBe(0);
      expect(state.saving).toBe(false);
      expect(state.lastSavedAt).toBeNull();
    });
  });
});

describe("makeKey", () => {
  it("creates a composite key from framework and controlId", () => {
    expect(makeKey("iso27001", "5.1")).toBe("iso27001::5.1");
    expect(makeKey("pci_dss", "1.1.1")).toBe("pci_dss::1.1.1");
  });
});

describe("computeProgress", () => {
  it("correctly counts each status category", () => {
    const responses = {
      "a::1": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::2": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::3": { status: "partially_compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::4": { status: "non_compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::5": { status: "not_applicable" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::6": { status: "not_assessed" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
    };

    const result = computeProgress(responses);

    expect(result.compliant).toBe(2);
    expect(result.partiallyCompliant).toBe(1);
    expect(result.nonCompliant).toBe(1);
    expect(result.notApplicable).toBe(1);
    expect(result.notAssessed).toBe(1);
    expect(result.total).toBe(6);
  });

  it("calculates compliance rate excluding N/A", () => {
    const responses = {
      "a::1": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::2": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::3": { status: "non_compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::4": { status: "not_applicable" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
    };

    const result = computeProgress(responses);

    // 2 compliant / 3 assessable (4 total - 1 N/A) = 66.67%
    expect(result.complianceRate).toBeCloseTo(66.67, 1);
  });

  it("returns 0% compliance rate when all controls are N/A", () => {
    const responses = {
      "a::1": { status: "not_applicable" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::2": { status: "not_applicable" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
    };

    const result = computeProgress(responses);
    expect(result.complianceRate).toBe(0);
  });

  it("returns 100% when all assessable controls are compliant", () => {
    const responses = {
      "a::1": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::2": { status: "compliant" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
      "a::3": { status: "not_applicable" as ComplianceStatus, notes: "", evidence: "", evidenceFiles: [] },
    };

    const result = computeProgress(responses);
    expect(result.complianceRate).toBe(100);
  });

  it("handles empty responses", () => {
    const result = computeProgress({});
    expect(result.total).toBe(0);
    expect(result.complianceRate).toBe(0);
  });
});
