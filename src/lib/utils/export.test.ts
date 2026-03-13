import { describe, it, expect } from "vitest";
import {
  calculateComplianceRate,
  calculateRiskScore,
  getDomainBreakdown,
  getFrameworkBreakdown,
  sanitiseCsvCell,
  escapeHtml,
  exportToCsv,
  exportToJson,
  exportToHtml,
  buildFindingRows,
  buildRemediationItems,
} from "./export";
import type { AssessmentResponse } from "@/types/assessment";
import type { FrameworkControl, FrameworkId } from "@/types/framework";

// ─── Test Fixtures ───────────────────────────────────────────────

function makeResponse(
  framework: string,
  controlId: string,
  status: AssessmentResponse["status"],
  notes = "",
  evidence = "",
): AssessmentResponse {
  return { framework, controlId, status, notes, evidence };
}

function makeControl(
  framework: FrameworkId,
  id: string,
  domain: string,
  name = `Control ${id}`,
): FrameworkControl {
  return { id, name, description: `Description for ${id}`, domain, framework };
}

const SAMPLE_RESPONSES: AssessmentResponse[] = [
  makeResponse("iso27001", "5.1", "compliant"),
  makeResponse("iso27001", "5.2", "compliant"),
  makeResponse("iso27001", "5.3", "partially_compliant"),
  makeResponse("iso27001", "5.4", "non_compliant"),
  makeResponse("iso27001", "5.5", "not_applicable"),
  makeResponse("iso27001", "5.6", "not_assessed"),
];

const SAMPLE_CONTROLS: FrameworkControl[] = [
  makeControl("iso27001", "5.1", "A.5 – Organisational Controls", "Information security policies"),
  makeControl("iso27001", "5.2", "A.5 – Organisational Controls", "Information security roles"),
  makeControl("iso27001", "5.3", "A.5 – Organisational Controls", "Segregation of duties"),
  makeControl("iso27001", "5.4", "A.5 – Organisational Controls", "Management responsibilities"),
  makeControl("iso27001", "5.5", "A.5 – Organisational Controls", "Contact with authorities"),
  makeControl("iso27001", "5.6", "A.5 – Organisational Controls", "Threat intelligence"),
];

const SAMPLE_TEMPLATE = {
  id: "tmpl-1",
  name: "ISO 27001 Full Assessment",
  description: "Full assessment template",
  controls: SAMPLE_CONTROLS,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

const SAMPLE_ASSESSMENT = {
  id: "asmt-1",
  name: "Q1 2026 Security Review",
  templateId: "tmpl-1",
  status: "completed" as const,
  responses: Object.fromEntries(
    SAMPLE_RESPONSES.map((r) => [`${r.framework}::${r.controlId}`, r]),
  ),
  createdAt: "2026-03-01T09:00:00Z",
  updatedAt: "2026-03-10T16:30:00Z",
};

// ─── Calculation Tests ───────────────────────────────────────────

describe("calculateComplianceRate", () => {
  it("returns percentage of compliant among applicable responses", () => {
    const rate = calculateComplianceRate(SAMPLE_RESPONSES);
    // applicable = 4 (excl N/A and not_assessed), compliant = 2
    expect(rate).toBe(50);
  });

  it("returns 0 when no applicable responses", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "not_applicable"),
      makeResponse("iso27001", "5.2", "not_assessed"),
    ];
    expect(calculateComplianceRate(responses)).toBe(0);
  });

  it("returns 100 when all applicable are compliant", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "compliant"),
      makeResponse("iso27001", "5.2", "compliant"),
      makeResponse("iso27001", "5.3", "not_applicable"),
    ];
    expect(calculateComplianceRate(responses)).toBe(100);
  });

  it("returns 0 for empty array", () => {
    expect(calculateComplianceRate([])).toBe(0);
  });
});

describe("calculateRiskScore", () => {
  it("weights non-compliant as 3 and partial as 1", () => {
    const score = calculateRiskScore(SAMPLE_RESPONSES);
    // applicable = 4, score = (1*3 + 1*1) / 4 = 1.0
    expect(score).toBe(1);
  });

  it("returns 0 for fully compliant", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "compliant"),
      makeResponse("iso27001", "5.2", "compliant"),
    ];
    expect(calculateRiskScore(responses)).toBe(0);
  });

  it("returns 3 for all non-compliant", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "non_compliant"),
      makeResponse("iso27001", "5.2", "non_compliant"),
    ];
    expect(calculateRiskScore(responses)).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(calculateRiskScore([])).toBe(0);
  });

  it("excludes not_applicable and not_assessed", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "non_compliant"),
      makeResponse("iso27001", "5.2", "not_applicable"),
      makeResponse("iso27001", "5.3", "not_assessed"),
    ];
    // applicable = 1, score = 3 / 1 = 3
    expect(calculateRiskScore(responses)).toBe(3);
  });
});

describe("getDomainBreakdown", () => {
  it("aggregates by domain", () => {
    const responseMap = Object.fromEntries(
      SAMPLE_RESPONSES.map((r) => [`${r.framework}::${r.controlId}`, r]),
    );
    const result = getDomainBreakdown(SAMPLE_CONTROLS, responseMap);
    expect(result).toHaveLength(1);
    expect(result[0].domainName).toBe("A.5 – Organisational Controls");
    expect(result[0].total).toBe(4); // excludes N/A and not_assessed
    expect(result[0].compliant).toBe(2);
    expect(result[0].partiallyCompliant).toBe(1);
    expect(result[0].nonCompliant).toBe(1);
    expect(result[0].complianceRate).toBe(50);
  });

  it("handles multiple domains", () => {
    const controls = [
      makeControl("iso27001", "5.1", "Domain A"),
      makeControl("iso27001", "6.1", "Domain B"),
    ];
    const responses: Record<string, AssessmentResponse> = {
      "iso27001::5.1": makeResponse("iso27001", "5.1", "compliant"),
      "iso27001::6.1": makeResponse("iso27001", "6.1", "non_compliant"),
    };
    const result = getDomainBreakdown(controls, responses);
    expect(result).toHaveLength(2);
    expect(result.find((d) => d.domainName === "Domain A")?.complianceRate).toBe(100);
    expect(result.find((d) => d.domainName === "Domain B")?.complianceRate).toBe(0);
  });
});

describe("getFrameworkBreakdown", () => {
  it("aggregates by framework", () => {
    const result = getFrameworkBreakdown(SAMPLE_RESPONSES);
    expect(result).toHaveLength(1);
    expect(result[0].frameworkId).toBe("iso27001");
    expect(result[0].compliant).toBe(2);
    expect(result[0].nonCompliant).toBe(1);
    expect(result[0].total).toBe(6);
  });

  it("handles multiple frameworks", () => {
    const responses = [
      makeResponse("iso27001", "5.1", "compliant"),
      makeResponse("soc2", "CC1.1", "non_compliant"),
    ];
    const result = getFrameworkBreakdown(responses);
    expect(result).toHaveLength(2);
  });
});

// ─── CSV Sanitisation Tests ──────────────────────────────────────

describe("sanitiseCsvCell", () => {
  it("prefixes cells starting with = to prevent formula injection", () => {
    expect(sanitiseCsvCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
  });

  it("prefixes cells starting with +", () => {
    expect(sanitiseCsvCell("+cmd|/C calc")).toBe("'+cmd|/C calc");
  });

  it("prefixes cells starting with -", () => {
    expect(sanitiseCsvCell("-1+1")).toBe("'-1+1");
  });

  it("prefixes cells starting with @", () => {
    expect(sanitiseCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("prefixes cells starting with |", () => {
    expect(sanitiseCsvCell("|command")).toBe("'|command");
  });

  it("prefixes cells starting with %", () => {
    expect(sanitiseCsvCell("%00")).toBe("'%00");
  });

  it("wraps cells containing commas in double quotes", () => {
    expect(sanitiseCsvCell("hello, world")).toBe('"hello, world"');
  });

  it("wraps cells containing newlines in double quotes", () => {
    expect(sanitiseCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(sanitiseCsvCell('he said "hi"')).toBe('"he said ""hi"""');
  });

  it("handles plain text without modification", () => {
    expect(sanitiseCsvCell("normal text")).toBe("normal text");
  });

  it("trims whitespace", () => {
    expect(sanitiseCsvCell("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitiseCsvCell("")).toBe("");
  });

  it("handles unicode characters", () => {
    expect(sanitiseCsvCell("日本語テスト")).toBe("日本語テスト");
  });

  it("handles unicode with special chars", () => {
    expect(sanitiseCsvCell('Ünîcödé, with "quotes"')).toBe('"Ünîcödé, with ""quotes"""');
  });
});

// ─── HTML Escape Tests ───────────────────────────────────────────

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("AT&T")).toBe("AT&amp;T");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles all entities together", () => {
    expect(escapeHtml('<img src="x" onerror="alert(1)">')).toBe(
      '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
    );
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("preserves plain text", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

// ─── CSV Export Tests ────────────────────────────────────────────

describe("exportToCsv", () => {
  it("produces correct header row", () => {
    const csv = exportToCsv(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Framework,Domain,Control ID,Control Name,Status,Notes,Evidence");
  });

  it("includes all controls", () => {
    const csv = exportToCsv(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const lines = csv.split("\n").filter((l) => l.length > 0);
    // header + 6 controls
    expect(lines.length).toBe(7);
  });

  it("sanitises dangerous cell values", () => {
    const assessment = {
      ...SAMPLE_ASSESSMENT,
      responses: {
        "iso27001::5.1": makeResponse(
          "iso27001",
          "5.1",
          "compliant",
          "=HYPERLINK(\"evil\")",
          "normal",
        ),
      },
    };
    const csv = exportToCsv(assessment, SAMPLE_TEMPLATE);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('"=HYPERLINK');
  });

  it("handles commas in notes", () => {
    const assessment = {
      ...SAMPLE_ASSESSMENT,
      responses: {
        "iso27001::5.1": makeResponse(
          "iso27001",
          "5.1",
          "compliant",
          "note with, comma",
          "",
        ),
      },
    };
    const csv = exportToCsv(assessment, SAMPLE_TEMPLATE);
    expect(csv).toContain('"note with, comma"');
  });

  it("handles unicode in notes", () => {
    const assessment = {
      ...SAMPLE_ASSESSMENT,
      responses: {
        "iso27001::5.1": makeResponse(
          "iso27001",
          "5.1",
          "compliant",
          "日本語のメモ",
          "",
        ),
      },
    };
    const csv = exportToCsv(assessment, SAMPLE_TEMPLATE);
    expect(csv).toContain("日本語のメモ");
  });
});

// ─── JSON Export Tests ───────────────────────────────────────────

describe("exportToJson", () => {
  it("produces valid JSON", () => {
    const json = exportToJson(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes assessment metadata", () => {
    const json = exportToJson(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const data = JSON.parse(json);
    expect(data.assessment.id).toBe("asmt-1");
    expect(data.assessment.name).toBe("Q1 2026 Security Review");
  });

  it("includes template metadata", () => {
    const json = exportToJson(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const data = JSON.parse(json);
    expect(data.template.id).toBe("tmpl-1");
    expect(data.template.name).toBe("ISO 27001 Full Assessment");
  });

  it("includes all responses", () => {
    const json = exportToJson(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const data = JSON.parse(json);
    expect(data.responses).toHaveLength(6);
  });

  it("includes metrics", () => {
    const json = exportToJson(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    const data = JSON.parse(json);
    expect(data.metrics.complianceRate).toBe(50);
    expect(data.metrics.riskScore).toBe(1);
  });
});

// ─── HTML Export Tests ───────────────────────────────────────────

describe("exportToHtml", () => {
  it("produces a complete HTML document", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("includes assessment name", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("Q1 2026 Security Review");
  });

  it("includes template name", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("ISO 27001 Full Assessment");
  });

  it("escapes HTML in notes to prevent XSS", () => {
    const assessment = {
      ...SAMPLE_ASSESSMENT,
      responses: {
        "iso27001::5.1": makeResponse(
          "iso27001",
          "5.1",
          "compliant",
          '<script>alert("xss")</script>',
          "",
        ),
      },
    };
    const html = exportToHtml(assessment, SAMPLE_TEMPLATE);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes HTML in evidence to prevent XSS", () => {
    const assessment = {
      ...SAMPLE_ASSESSMENT,
      responses: {
        "iso27001::5.1": makeResponse(
          "iso27001",
          "5.1",
          "compliant",
          "",
          '<img onerror="alert(1)" src=x>',
        ),
      },
    };
    const html = exportToHtml(assessment, SAMPLE_TEMPLATE);
    expect(html).not.toContain('onerror="alert(1)"');
    expect(html).toContain("&lt;img");
  });

  it("includes compliance metrics", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("50%");
  });

  it("includes inline CSS for self-containment", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("<style>");
  });

  it("includes print media query", () => {
    const html = exportToHtml(SAMPLE_ASSESSMENT, SAMPLE_TEMPLATE);
    expect(html).toContain("@media print");
  });
});

// ─── buildFindingRows Tests ──────────────────────────────────────

describe("buildFindingRows", () => {
  it("returns one row per control", () => {
    const rows = buildFindingRows(SAMPLE_CONTROLS, SAMPLE_ASSESSMENT.responses);
    expect(rows).toHaveLength(6);
  });

  it("maps control data correctly", () => {
    const rows = buildFindingRows(SAMPLE_CONTROLS, SAMPLE_ASSESSMENT.responses);
    const first = rows[0];
    expect(first.controlId).toBe("5.1");
    expect(first.controlName).toBe("Information security policies");
    expect(first.status).toBe("compliant");
    expect(first.domain).toBe("A.5 – Organisational Controls");
  });

  it("defaults to not_assessed for missing responses", () => {
    const rows = buildFindingRows(SAMPLE_CONTROLS, {});
    expect(rows.every((r) => r.status === "not_assessed")).toBe(true);
  });
});

// ─── buildRemediationItems Tests ─────────────────────────────────

describe("buildRemediationItems", () => {
  it("only includes non-compliant and partially compliant items", () => {
    const items = buildRemediationItems(SAMPLE_CONTROLS, SAMPLE_ASSESSMENT.responses);
    expect(items).toHaveLength(2); // 5.3 partial, 5.4 non-compliant
    const statuses = items.map((i) => i.status);
    expect(statuses).not.toContain("compliant");
    expect(statuses).not.toContain("not_applicable");
    expect(statuses).not.toContain("not_assessed");
  });

  it("sorts non-compliant before partially compliant", () => {
    const items = buildRemediationItems(SAMPLE_CONTROLS, SAMPLE_ASSESSMENT.responses);
    expect(items[0].status).toBe("non_compliant");
    expect(items[1].status).toBe("partially_compliant");
  });

  it("assigns critical priority to non-compliant, high to partial", () => {
    const items = buildRemediationItems(SAMPLE_CONTROLS, SAMPLE_ASSESSMENT.responses);
    expect(items[0].priority).toBe("critical");
    expect(items[1].priority).toBe("high");
  });

  it("returns empty array when all compliant", () => {
    const responses: Record<string, AssessmentResponse> = {
      "iso27001::5.1": makeResponse("iso27001", "5.1", "compliant"),
      "iso27001::5.2": makeResponse("iso27001", "5.2", "compliant"),
    };
    const controls = SAMPLE_CONTROLS.slice(0, 2);
    const items = buildRemediationItems(controls, responses);
    expect(items).toHaveLength(0);
  });
});
