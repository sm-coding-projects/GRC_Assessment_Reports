import { create } from "zustand";
import type { ComplianceStatus, EvidenceFile } from "@/types/assessment";

interface ControlResponse {
  status: ComplianceStatus;
  notes: string;
  evidence: string;
  evidenceFiles: EvidenceFile[];
}

type ResponseKey = `${string}::${string}`; // framework::controlId

interface AssessmentState {
  responses: Record<ResponseKey, ControlResponse>;
  dirty: Set<ResponseKey>;
  saving: boolean;
  lastSavedAt: Date | null;
}

interface AssessmentActions {
  /** Initialise the store from server data */
  loadResponses: (
    data: Array<{
      framework: string;
      controlId: string;
      status: ComplianceStatus;
      notes: string | null;
      evidence: string | null;
      evidenceFiles?: EvidenceFile[];
    }>,
  ) => void;

  /** Update a single control's status */
  setStatus: (framework: string, controlId: string, status: ComplianceStatus) => void;

  /** Update a control's notes */
  setNotes: (framework: string, controlId: string, notes: string) => void;

  /** Update a control's evidence */
  setEvidence: (framework: string, controlId: string, evidence: string) => void;

  /** Add an evidence file to a control */
  addEvidenceFile: (framework: string, controlId: string, file: EvidenceFile) => void;

  /** Remove an evidence file from a control */
  removeEvidenceFile: (framework: string, controlId: string, fileId: string) => void;

  /** Mark dirty keys as synced */
  markSaved: (keys: ResponseKey[]) => void;

  /** Set saving state */
  setSaving: (saving: boolean) => void;

  /** Get dirty entries for syncing */
  getDirtyEntries: () => Array<{
    framework: string;
    controlId: string;
    status: ComplianceStatus;
    notes: string;
    evidence: string;
  }>;

  /** Reset store */
  reset: () => void;
}

function makeKey(framework: string, controlId: string): ResponseKey {
  return `${framework}::${controlId}`;
}

const DEFAULT_RESPONSE: ControlResponse = {
  status: "not_assessed",
  notes: "",
  evidence: "",
  evidenceFiles: [],
};

const INITIAL_STATE: AssessmentState = {
  responses: {},
  dirty: new Set(),
  saving: false,
  lastSavedAt: null,
};

export const useAssessmentStore = create<AssessmentState & AssessmentActions>((set, get) => ({
  ...INITIAL_STATE,

  loadResponses: (data) => {
    const responses: Record<ResponseKey, ControlResponse> = {};
    for (const item of data) {
      const key = makeKey(item.framework, item.controlId);
      responses[key] = {
        status: item.status,
        notes: item.notes ?? "",
        evidence: item.evidence ?? "",
        evidenceFiles: item.evidenceFiles ?? [],
      };
    }
    set({ responses, dirty: new Set(), lastSavedAt: null });
  },

  setStatus: (framework, controlId, status) => {
    const key = makeKey(framework, controlId);
    const prev = get().responses[key] ?? { ...DEFAULT_RESPONSE };
    set((state) => ({
      responses: { ...state.responses, [key]: { ...prev, status } },
      dirty: new Set(state.dirty).add(key),
    }));
  },

  setNotes: (framework, controlId, notes) => {
    const key = makeKey(framework, controlId);
    const prev = get().responses[key] ?? { ...DEFAULT_RESPONSE };
    set((state) => ({
      responses: { ...state.responses, [key]: { ...prev, notes } },
      dirty: new Set(state.dirty).add(key),
    }));
  },

  setEvidence: (framework, controlId, evidence) => {
    const key = makeKey(framework, controlId);
    const prev = get().responses[key] ?? { ...DEFAULT_RESPONSE };
    set((state) => ({
      responses: { ...state.responses, [key]: { ...prev, evidence } },
      dirty: new Set(state.dirty).add(key),
    }));
  },

  addEvidenceFile: (framework, controlId, file) => {
    const key = makeKey(framework, controlId);
    const prev = get().responses[key] ?? { ...DEFAULT_RESPONSE };
    set((state) => ({
      responses: {
        ...state.responses,
        [key]: {
          ...prev,
          evidenceFiles: [file, ...prev.evidenceFiles],
        },
      },
    }));
  },

  removeEvidenceFile: (framework, controlId, fileId) => {
    const key = makeKey(framework, controlId);
    const prev = get().responses[key] ?? { ...DEFAULT_RESPONSE };
    set((state) => ({
      responses: {
        ...state.responses,
        [key]: {
          ...prev,
          evidenceFiles: prev.evidenceFiles.filter((f) => f.id !== fileId),
        },
      },
    }));
  },

  markSaved: (keys) => {
    set((state) => {
      const newDirty = new Set(state.dirty);
      for (const k of keys) {
        newDirty.delete(k);
      }
      return { dirty: newDirty, lastSavedAt: new Date() };
    });
  },

  setSaving: (saving) => set({ saving }),

  getDirtyEntries: () => {
    const { responses, dirty } = get();
    return Array.from(dirty).map((key) => {
      const [framework, controlId] = key.split("::") as [string, string];
      const resp = responses[key] ?? { ...DEFAULT_RESPONSE };
      return {
        framework,
        controlId,
        status: resp.status,
        notes: resp.notes,
        evidence: resp.evidence,
      };
    });
  },

  reset: () => set(INITIAL_STATE),
}));

/** Compute progress counts from responses */
export function computeProgress(responses: Record<string, ControlResponse>): {
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notApplicable: number;
  notAssessed: number;
  total: number;
  complianceRate: number;
} {
  const counts = {
    compliant: 0,
    partiallyCompliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    notAssessed: 0,
    total: 0,
  };

  for (const resp of Object.values(responses)) {
    counts.total++;
    switch (resp.status) {
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

  const assessable = counts.total - counts.notApplicable;
  const complianceRate = assessable > 0 ? (counts.compliant / assessable) * 100 : 0;

  return { ...counts, complianceRate };
}

export { makeKey, DEFAULT_RESPONSE, type ResponseKey, type ControlResponse };
