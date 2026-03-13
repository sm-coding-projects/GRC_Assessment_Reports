# Report Generation — Domain Knowledge

## Report Types

### 1. HTML Report (Primary — viewable in browser, printable)
- Self-contained single HTML file with inline CSS
- Print-optimised with `@media print` styles
- Page breaks between framework sections
- Table of contents with anchor links
- Cover page with assessment metadata

### 2. PDF Report (via @react-pdf/renderer)
- Generated client-side using React PDF components
- Matches the HTML report structure
- Professional letterhead area (company name, date, confidential marking)
- Page numbers in footer
- Automatic page breaks between domains

### 3. CSV Export (for spreadsheet analysis)
- One row per control
- Columns: Framework, Domain, Control ID, Control Name, Status, Notes, Evidence
- Must handle: commas in text (quote wrapping), formula injection prevention, unicode
- Formula injection: prefix cells starting with =, +, -, @, |, % with a single quote

### 4. JSON Export (for API integration / reimport)
- Full assessment data in structured JSON
- Includes template metadata, all responses, timestamps
- Useful for backup/restore and inter-system transfer

## Report Structure

### Cover Page
```
[Company Logo Placeholder]

COMPLIANCE ASSESSMENT REPORT

Assessment Name: {name}
Template: {template.name}
Frameworks: {list of framework names}
Date: {completion date}
Prepared by: {user.name}
Status: {Completed / In Progress}

CONFIDENTIAL
```

### Executive Summary
- Total controls assessed: N
- Overall compliance rate: X% (excluding N/A)
- Per-framework compliance rates (horizontal stacked bar chart)
- Per-status breakdown:
  - Compliant: N (green)
  - Partially Compliant: N (amber)
  - Non-Compliant: N (red)
  - Not Applicable: N (grey)
  - Not Assessed: N (light grey)
- Risk score: calculated as (NonCompliant × 3 + Partial × 1) / (Total - NA)

### Compliance Heatmap
- Grid view: frameworks as rows, domains as columns
- Cell colour intensity based on compliance % of that domain
- Quick visual scan of where gaps cluster

### Detailed Findings (per framework)

For each framework:
```
## {Framework Icon} {Framework Name}

### {Domain Name}
| ID    | Control              | Status            | Notes  | Evidence |
|-------|----------------------|-------------------|--------|----------|
| 5.1   | Policies for info... | ● Compliant       | ...    | ...      |
| 5.2   | Roles & resp...      | ◐ Partial         | ...    | ...      |
| 5.3   | Segregation...       | ✕ Non-Compliant   | ...    | ...      |
```

### Remediation Roadmap
- Only non-compliant and partially compliant items
- Sorted by: framework criticality, then domain, then severity
- Each item includes:
  - Control ID and name
  - Current status
  - Analyst notes (what's missing)
  - Recommended action (generic best practice)
  - Priority: Critical / High / Medium

### Appendix
- Methodology notes (which frameworks, assessment date range)
- Evidence reference index
- Glossary of compliance statuses
- Assessor information

## Calculation Logic

### Compliance Rate
```typescript
function calculateComplianceRate(responses: AssessmentResponse[]): number {
  const applicable = responses.filter(r => r.status !== "not_applicable" && r.status !== "not_assessed");
  if (applicable.length === 0) return 0;
  const compliant = applicable.filter(r => r.status === "compliant").length;
  return Math.round((compliant / applicable.length) * 100);
}
```

### Risk Score (0-3 scale, lower is better)
```typescript
function calculateRiskScore(responses: AssessmentResponse[]): number {
  const applicable = responses.filter(r => r.status !== "not_applicable" && r.status !== "not_assessed");
  if (applicable.length === 0) return 0;
  const score = applicable.reduce((sum, r) => {
    if (r.status === "non_compliant") return sum + 3;
    if (r.status === "partially_compliant") return sum + 1;
    return sum;
  }, 0);
  return Math.round((score / applicable.length) * 100) / 100;
}
```

### Domain Compliance Breakdown
```typescript
function getDomainBreakdown(
  controls: FrameworkControl[],
  responses: Record<string, AssessmentResponse>
): DomainBreakdown[] {
  const domains = new Map<string, { total: number; compliant: number; partial: number; nonCompliant: number }>();
  
  for (const control of controls) {
    const key = `${control.framework}-${control.id}`;
    const response = responses[key];
    const domain = domains.get(control.domain) || { total: 0, compliant: 0, partial: 0, nonCompliant: 0 };
    
    if (response && response.status !== "not_applicable" && response.status !== "not_assessed") {
      domain.total++;
      if (response.status === "compliant") domain.compliant++;
      if (response.status === "partially_compliant") domain.partial++;
      if (response.status === "non_compliant") domain.nonCompliant++;
    }
    
    domains.set(control.domain, domain);
  }
  
  return Array.from(domains.entries()).map(([name, data]) => ({
    name,
    total: data.total,
    complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
    ...data,
  }));
}
```

## CSV Export — Safety

### Formula Injection Prevention
Any cell value starting with these characters must be prefixed with a single quote:
- `=` (formula)
- `+` (formula)
- `-` (formula)
- `@` (function)
- `|` (pipe command)
- `%` (percent command)

```typescript
function sanitiseCsvCell(value: string): string {
  const trimmed = value.trim();
  if (/^[=+\-@|%]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  // Wrap in quotes if contains comma, newline, or quote
  if (/[,\n\r"]/.test(trimmed)) {
    return `"${trimmed.replace(/"/g, '""')}"`;
  }
  return trimmed;
}
```

## HTML Export — XSS Prevention
User-provided content (notes, evidence) must be HTML-escaped before insertion:
```typescript
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```
