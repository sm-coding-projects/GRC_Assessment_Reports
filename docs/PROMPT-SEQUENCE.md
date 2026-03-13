# GRC Report Generator — Claude Code Prompt Sequence

Use these prompts in order. Each one is a single Claude Code session.
Wait for completion before moving to the next.

---

## Session 1: Project Setup

```
Read CLAUDE.md thoroughly. Then:

1. Run the setup.sh script to scaffold the project
2. Configure tailwind.config.ts with the exact design system from CLAUDE.md
3. Set up the src/app/layout.tsx with Instrument Serif (via Google Fonts CDN link 
   tag), DM Sans, and JetBrains Mono fonts
4. Create globals.css with the CSS variables from the design system
5. Verify the dev server starts: npm run dev

Do NOT create any components yet. Just the foundation.
```

## Session 2: UI Primitives

```
Read CLAUDE.md design system section and .claude/rules/coding-style.md.

Build these UI primitive components in src/components/ui/ using Radix UI as the 
unstyled base. Style them with Tailwind using our design tokens. Do NOT copy 
shadcn/ui defaults — build from scratch to match our "Editorial Utility" aesthetic.

Components to build:
1. button.tsx — Solid primary (accent bg), Ghost secondary (transparent, bg on hover). 
   Height 36px. Border-radius 4px. Never pills.
2. input.tsx — 1px border, 36px height, 4px radius. Clear focus ring.
3. select.tsx — Radix Select with our styling. No rounded dropdowns.
4. table.tsx — Alternating row backgrounds (surface-alt), sticky header, 
   sortable column indicators. Dense but readable.
5. drawer.tsx — Slides from right (not centered modal). Radix Dialog base.
6. toast.tsx — Top-right corner, minimal, auto-dismiss. No rounded pills.
7. badge.tsx — Status badge with dot indicator + text. NOT coloured pills.
   Variants: compliant (green dot), partial (amber dot), non-compliant (red dot), 
   not-applicable (grey dot), not-assessed (light grey dot).
8. kbd.tsx — Keyboard shortcut display component (like GitHub's).
9. breadcrumbs.tsx — Simple path breadcrumbs with separator.
10. skeleton.tsx — Loading skeleton with subtle pulse animation.

Write tests for each component in colocated .test.tsx files.
Run: npm run test to verify.
```

## Session 3: Layout Shell

```
Read CLAUDE.md layout section.

Build the dashboard layout shell:

1. src/components/layout/sidebar.tsx
   - 260px expanded, 56px collapsed (icon-only mode)
   - Toggle button at bottom
   - Navigation items with Lucide icons (NO emoji):
     * LayoutDashboard — Dashboard
     * FileStack — Templates  
     * ClipboardCheck — Assessments
     * Settings — Settings
   - Active state: accent-subtle background, accent text, left border indicator
   - User avatar + name at bottom (placeholder for now)
   - Subtle border-right separator

2. src/components/layout/header.tsx
   - Breadcrumbs on left
   - Cmd+K search trigger on right (just the button for now)
   - Clean, minimal — NOT a thick header bar

3. src/app/(dashboard)/layout.tsx
   - Sidebar + main content area
   - Main content: max-width 1200px, centered, bg surface-alt
   - Proper padding: 32px top, 32px left, 24px right

4. src/app/(dashboard)/page.tsx
   - Dashboard home with empty state for now
   - "Welcome to GRC Report Generator" with getting started steps

NO heavy animations. NO hover-lift effects. Clean and professional.
Run: npm run dev and verify the layout renders correctly.
```

## Session 4: Framework Data

```
Read .claude/skills/grc-frameworks/SKILL.md for domain knowledge.

The ISO 27001 data file already exists at src/data/frameworks/iso27001.ts.
Create the remaining framework data files following the same structure:

1. src/data/frameworks/soc2.ts — All Trust Services Criteria (CC1-CC9 mandatory, 
   plus Availability, Processing Integrity, Confidentiality, Privacy optional criteria).
   Include ALL common criteria controls. This is the most important framework 
   after ISO 27001.

2. src/data/frameworks/nist-csf.ts — NIST CSF 2.0 with all 6 functions 
   (Govern, Identify, Protect, Detect, Respond, Recover) and their categories 
   and subcategories.

3. src/data/frameworks/pci-dss.ts — PCI DSS v4.0 all 12 requirements.

4. src/data/frameworks/hipaa.ts — Administrative, Physical, and Technical 
   safeguards with all standards and implementation specifications.

5. src/data/frameworks/gdpr.ts — Practical GDPR assessment controls organised 
   by: Lawful Basis, Consent, Data Subject Rights, DPIAs, Breach Notification, 
   International Transfers, DPO, Records of Processing.

6. src/data/index.ts — Export all frameworks as a typed record.

Each control needs: id, name, description, domain, framework.
Use accurate control descriptions (not placeholder text).
Write a unit test that verifies each framework file: all controls have required 
fields, no duplicate IDs within a framework, domains are consistent.
```

## Session 5: Database + Prisma

```
Read CLAUDE.md database schema section.

1. Copy the Prisma schema from CLAUDE.md into prisma/schema.prisma
2. Configure the Supabase datasource
3. Create src/lib/db.ts with the Prisma client singleton
4. Run: npx prisma db push (or create migration if using Supabase)
5. Create src/lib/trpc/context.ts with auth + db context
6. Create src/lib/trpc/router.ts with empty routers for templates, 
   assessments, reports
7. Create the tRPC API route at src/app/api/trpc/[trpc]/route.ts
8. Create src/lib/trpc/client.ts for frontend usage with React Query

Write integration tests for the Prisma schema: verify all models can be 
created, relationships work, cascading deletes function correctly.

If Supabase isn't set up yet, use a local SQLite database for development 
(change provider to "sqlite" in schema.prisma temporarily).
```

## Session 6: Template Builder

```
Read CLAUDE.md and .claude/skills/grc-frameworks/SKILL.md.

Build the template builder — the most complex UI in the app.

Pages:
- src/app/(dashboard)/templates/page.tsx — List of templates (table view)
- src/app/(dashboard)/templates/new/page.tsx — Template builder

Components:
1. src/components/templates/framework-picker.tsx
   - Vertical tab list of frameworks (left side)
   - Shows framework name, icon (Lucide, not emoji), control count
   - Badge showing how many controls are selected from each framework

2. src/components/templates/control-selector.tsx
   - Right side panel showing domains and controls for selected framework
   - Collapsible domain sections
   - Checkbox per control with ID (monospace) + name + description
   - Select All / Deselect All per domain
   - Search/filter bar at top (filters by ID, name, or description)
   - Selected count shown prominently

3. src/components/templates/template-form.tsx
   - Name input (required)
   - Description textarea (optional)
   - Framework picker + control selector
   - Save button with selected count
   - Discard changes warning if navigating away

4. Template list page:
   - Table with columns: Name, Frameworks (badge per framework), Controls count, 
     Created date, Actions
   - Actions: Edit, Duplicate, Start Assessment, Delete (with confirmation)
   - Empty state with CTA to create first template

Store template data via tRPC mutations. Use optimistic updates.
Write tests for the control selector: search filtering, select all, deselect all.
```

## Session 7: Assessment Runner

```
Read CLAUDE.md and .claude/skills/grc-frameworks/SKILL.md.

Build the assessment runner — where analysts do the actual compliance assessment.

Pages:
- src/app/(dashboard)/assessments/page.tsx — List of assessments
- src/app/(dashboard)/assessments/new/page.tsx — Select template to start
- src/app/(dashboard)/assessments/[id]/page.tsx — Run the assessment

Components:
1. src/components/assessments/assessment-table.tsx
   - Full-width table grouped by framework then domain
   - Columns: Control ID (mono), Control Name, Status, Notes, Evidence
   - Sticky header
   - Domain header rows (spanning full width, subtle bg)

2. src/components/assessments/status-selector.tsx
   - Compact inline selector for compliance status
   - 5 options: each shows dot + short label
   - Keyboard navigable (arrow keys to change status)
   - Currently selected is highlighted with matching bg colour

3. src/components/assessments/control-row.tsx
   - Single row in the assessment table
   - Expandable: click to show notes + evidence text areas
   - Compact when collapsed: just ID, name, status badge
   - Tab through controls with keyboard

4. src/components/assessments/progress-bar.tsx
   - Horizontal stacked bar showing status distribution
   - Not a progress bar — shows proportion of each status
   - Numbers below: X Compliant, Y Partial, Z Non-Compliant, etc.

5. Auto-save: debounced save on every status change or note edit (800ms)
   - Show "Saving..." indicator in header
   - Show "All changes saved" when idle
   - Use Zustand store for local state, sync to server via tRPC

6. Assessment list page:
   - Table: Name, Template, Status, Progress (mini stacked bar), Updated, Actions
   - Filter by status (In Progress / Completed / Archived)

Write tests for: status changes, auto-save debouncing, progress calculation.
```

## Session 8: Report Generation

```
Read .claude/skills/report-generation/SKILL.md thoroughly.

Build the report view and export functionality.

Page: src/app/(dashboard)/assessments/[id]/report/page.tsx

Components:
1. src/components/reports/executive-summary.tsx
   - Compliance rate display (large number, not a donut chart)
   - Per-framework horizontal stacked bars (compliant/partial/non-compliant)
   - Key metrics: total controls, assessed count, risk score

2. src/components/reports/compliance-chart.tsx
   - Horizontal stacked bar chart per framework
   - Use Recharts with our colour tokens
   - NOT pie charts. NOT donut charts. Stacked horizontal bars only.
   - Optional: domain-level heatmap grid

3. src/components/reports/findings-table.tsx
   - Detailed table grouped by framework > domain
   - All columns: ID, Control, Status (badge), Notes, Evidence
   - Highlight non-compliant rows with danger-bg

4. src/components/reports/remediation-section.tsx
   - Only non-compliant and partially compliant items
   - Sorted by severity (non-compliant first, then partial)
   - Each item: control info, analyst notes, priority indicator

5. Export functions in src/lib/utils/export.ts:
   - exportToHtml(assessment, template) — self-contained HTML file
   - exportToCsv(assessment, template) — with formula injection prevention
   - exportToPdf(assessment, template) — using @react-pdf/renderer
   - exportToJson(assessment, template) — full data dump

6. Export buttons in the report header:
   - Download as PDF (primary)
   - Download as CSV
   - Download as HTML
   - Export JSON

Write tests for ALL export functions:
- CSV: commas in text, formula injection, unicode characters
- HTML: XSS prevention in notes/evidence
- PDF: verify all sections render
- Calculation: compliance rate, risk score, domain breakdown
Use /tdd for the export utility functions.
```

## Session 9: Auth + Security

```
Read .claude/rules/security.md and run @security-reviewer.

1. Set up Supabase Auth:
   - src/lib/auth.ts — createClient helpers for server/client
   - src/middleware.ts — protect dashboard routes, redirect to login
   - src/app/(auth)/login/page.tsx — email + Google OAuth
   - src/app/(auth)/register/page.tsx — registration flow

2. Protect all tRPC procedures:
   - Add auth check to tRPC context
   - Every query/mutation verifies userId ownership
   - Return 401 for unauthenticated, 403 for unauthorized

3. Add Supabase Row Level Security policies:
   - Users can only SELECT/INSERT/UPDATE/DELETE their own rows
   - Create RLS migration file

4. Security hardening:
   - Content-Security-Policy headers in next.config.ts
   - Rate limiting middleware on API routes
   - Input sanitisation on all user-facing text fields
   - CSRF protection via Supabase auth tokens

5. Auth UI: clean login page matching our design system
   - No generic auth UI library — build with our primitives
   - Email input, password input, "Sign in with Google" button
   - Error messages inline (not alerts)

Run: /review to verify security compliance.
Run: @security-reviewer for deep security audit.
```

## Session 10: Polish + Keyboard Shortcuts

```
Final polish pass:

1. Keyboard shortcuts:
   - Cmd+K: Command palette (search templates, assessments, navigate)
   - Cmd+S: Save current assessment
   - Escape: Close drawers/modals
   - Tab/Shift+Tab: Navigate between controls in assessment
   - Arrow keys: Change compliance status when status selector is focused

2. Empty states:
   - No templates: illustration-free, text + CTA button
   - No assessments: explain the workflow, link to templates
   - No completed assessments: show how to complete one

3. Loading states:
   - Skeleton loaders (not spinners) for all data-fetching pages
   - Skeleton matches the eventual content layout

4. Toast notifications:
   - Template saved/deleted
   - Assessment auto-saved
   - Export completed
   - Error messages

5. Responsive:
   - Sidebar collapses to icons on tablet
   - Sidebar becomes bottom nav or hamburger on mobile
   - Tables become card lists on mobile
   - Assessment form stacks vertically on mobile

6. Final review:
   - /review — full code review
   - @security-reviewer — security audit
   - npm run test — all tests pass
   - npm run typecheck — no TypeScript errors
   - npm run lint — no lint warnings
   - Manual walkthrough of all user journeys
```

---

## Troubleshooting

### If Claude Code runs out of context
Use `/compact` to summarise the session, then continue with:
```
Read CLAUDE.md for project context. I was working on [specific feature].
The current state is [describe what's done and what's left].
Continue from where I left off.
```

### If the design looks "AI-generated"
Check against CLAUDE.md design system:
- Are fonts correct? (Instrument Serif headings, DM Sans body)
- Are colours from our palette? (Not default Tailwind blues/purples)
- Are border-radii correct? (Max 6px, buttons 4px)
- Are there hover-lift effects? (Remove them)
- Are there emoji in the UI? (Replace with Lucide icons)
- Are cards using drop shadows? (Remove, use background shifts)
- Is the layout a card grid? (Use tables for data)

### If tests are failing
```
Read the failing test output carefully. Then:
1. Check if the component API changed
2. Check if mock data matches current types
3. Run the specific test file: npx vitest run src/path/to/file.test.tsx
4. Fix the issue and re-run
```
