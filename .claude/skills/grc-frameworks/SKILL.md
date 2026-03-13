# GRC Frameworks — Domain Knowledge

## Supported Frameworks

### ISO 27001:2022
- **Full name**: Information Security Management System
- **Structure**: 4 Annex A control themes (Organisational, People, Physical, Technological), 93 controls total
- **Assessment approach**: Each control assessed as Statement of Applicability (SoA) — applicable or not, then compliance status
- **Key domains**: A.5 Organisational (37 controls), A.6 People (8 controls), A.7 Physical (14 controls), A.8 Technological (34 controls)
- **Report expectations**: Gap analysis, Statement of Applicability, risk treatment plan

### SOC 2 Type II
- **Full name**: System and Organization Controls 2
- **Structure**: 5 Trust Services Criteria (Security mandatory, others optional: Availability, Processing Integrity, Confidentiality, Privacy)
- **Assessment approach**: Point-in-time (Type I) or period-of-time (Type II) — evaluate control design AND operating effectiveness
- **Key domains**: CC1–CC9 (Common Criteria), plus optional A1, PI1, C1, P1
- **Report expectations**: Management assertion, system description, testing results, exceptions noted

### NIST Cybersecurity Framework 2.0
- **Full name**: National Institute of Standards and Technology CSF
- **Structure**: 6 Functions (Govern, Identify, Protect, Detect, Respond, Recover), 22 Categories, 106 Subcategories
- **Assessment approach**: Implementation tiers (Partial → Risk-Informed → Repeatable → Adaptive) per subcategory
- **Report expectations**: Current profile, target profile, gap analysis, action plan

### PCI DSS v4.0
- **Full name**: Payment Card Industry Data Security Standard
- **Structure**: 12 Requirements, 6 Goals
- **Assessment approach**: In-Place, Not In-Place, N/A, Compensating Control for each requirement
- **Report expectations**: Report on Compliance (ROC) or Self-Assessment Questionnaire (SAQ)

### HIPAA
- **Full name**: Health Insurance Portability and Accountability Act
- **Structure**: Administrative Safeguards (9 standards), Physical Safeguards (4 standards), Technical Safeguards (5 standards)
- **Assessment approach**: Required vs Addressable specifications — each assessed for implementation status
- **Report expectations**: Risk analysis, risk management plan, gap remediation

### GDPR
- **Full name**: General Data Protection Regulation
- **Structure**: 11 Chapters, 99 Articles — practical assessment focuses on key operational requirements
- **Assessment approach**: Compliance checklist with evidence documentation
- **Key areas**: Lawful basis, consent management, data subject rights, DPIAs, breach notification, international transfers
- **Report expectations**: DPIA, Records of Processing Activities (ROPA), compliance assessment

## Data Model for Controls

Every control follows this structure:
```typescript
interface FrameworkControl {
  id: string;           // e.g. "5.1", "CC1.1", "GV.OC"
  name: string;         // Short name
  description: string;  // What this control requires
  domain: string;       // Parent category/domain
  framework: string;    // Framework identifier
}
```

## Compliance Status Options

Standard 5-point scale used across all frameworks:
1. **Compliant** — Control is fully implemented and effective
2. **Partially Compliant** — Control exists but has gaps or is not fully effective
3. **Non-Compliant** — Control is not implemented or fundamentally inadequate
4. **Not Applicable** — Control does not apply to this organisation's scope
5. **Not Assessed** — Control has not yet been evaluated

## Report Generation Logic

### Executive Summary Calculation
- Compliance Rate = Compliant / (Total - Not Applicable) × 100
- Risk Score = (Non-Compliant × 3 + Partially Compliant × 1) / Total
- Domain-level breakdown for each framework

### Remediation Priority
1. Non-compliant controls in security-critical domains (access control, encryption, incident response)
2. Non-compliant controls in other domains
3. Partially compliant controls
4. Unassessed controls

### Report Sections
1. Cover page with assessment metadata
2. Executive summary with compliance rates per framework
3. Detailed findings by framework → domain → control
4. Remediation roadmap (non-compliant items with recommendations)
5. Appendix: evidence references, methodology notes
