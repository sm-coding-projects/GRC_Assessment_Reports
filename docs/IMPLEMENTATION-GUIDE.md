# GRC Report Generator — Implementation Guide

## How to Use This Project with Claude Code

This document explains how to set up your development environment and use Claude Code
effectively with the everything-claude-code patterns to build this application.

---

## Step 0: Prerequisites

Install these before starting:

```bash
# Node.js 20+ (via nvm recommended)
nvm install 20
nvm use 20

# Claude Code CLI (v2.1+)
# Follow: https://docs.anthropic.com/en/docs/claude-code

# Verify
node --version    # v20+
claude --version  # v2.1+
```

---

## Step 1: Install the Everything Claude Code Plugin

This gives you access to all the community agents, skills, hooks, and commands as
a baseline. Our project-specific configs (in `.claude/`) override where needed.

```bash
# Inside Claude Code:
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code

# Copy the common + TypeScript rules to your user-level config:
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/ecc
mkdir -p ~/.claude/rules
cp -r /tmp/ecc/rules/common/* ~/.claude/rules/
cp -r /tmp/ecc/rules/typescript/* ~/.claude/rules/
rm -rf /tmp/ecc
```

---

## Step 2: Scaffold the Project

```bash
# Create the Next.js project
npx create-next-app@latest grc-report-generator \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd grc-report-generator

# Copy the CLAUDE.md and .claude/ directory into the project root
# (from the files we generated)
cp -r /path/to/grc-project/CLAUDE.md .
cp -r /path/to/grc-project/.claude .

# Install core dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-checkbox \
  @radix-ui/react-popover @radix-ui/react-tabs \
  lucide-react \
  zustand \
  @tanstack/react-query \
  zod \
  clsx tailwind-merge \
  @react-pdf/renderer

# Install dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom \
  @playwright/test \
  prisma

# Install Prisma client
npm install @prisma/client

# Install tRPC
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next

# Initialise Prisma
npx prisma init

# Install fonts
# Add to src/app/layout.tsx — see Design System section
```

---

## Step 3: Configure the Design System

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#1B1F23",
          muted: "#57606A",
          subtle: "#8B949E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F6F8FA",
          inset: "#ECEEF1",
        },
        border: {
          DEFAULT: "#D1D9E0",
          muted: "#E8ECEF",
        },
        accent: {
          DEFAULT: "#0550AE",
          hover: "#033D8B",
          subtle: "#DDE8F8",
        },
        success: {
          DEFAULT: "#1A7F37",
          bg: "#DAFBE1",
        },
        warning: {
          DEFAULT: "#9A6700",
          bg: "#FFF8C5",
        },
        danger: {
          DEFAULT: "#CF222E",
          bg: "#FFEBE9",
        },
        neutral: {
          DEFAULT: "#6E7781",
          bg: "#F3F4F6",
        },
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        // NO lg, xl, full — we don't want pills
      },
      letterSpacing: {
        tight: "-0.03em",
        label: "0.05em",
      },
    },
  },
  plugins: [],
};
export default config;
```

### Google Fonts (in layout.tsx)

```tsx
import { DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// For Instrument Serif, use @next/font or Google Fonts CDN link
// since it may not be in next/font/google
```

---

## Step 4: Build in Phases (Using Claude Code)

### Phase 1: Foundation

Open Claude Code in your project directory and run these prompts:

```
# Start Claude Code
cd grc-report-generator
claude

# Prompt 1: Design system primitives
> /plan Build the UI primitive components: Button, Input, Table, Drawer,
> Toast, Badge, and Kbd. Follow the design system in CLAUDE.md exactly.
> Use Radix UI as the unstyled base. No shadcn defaults.

# Prompt 2: Layout
> /plan Build the sidebar layout with collapsible navigation.
> Routes: Dashboard, Templates, Assessments, Settings.
> Use Lucide icons. No emoji.

# Prompt 3: Framework data
> /plan Create the framework data files for ISO 27001, SOC 2, NIST CSF,
> PCI DSS, HIPAA, and GDPR. Read the GRC frameworks skill for structure.

# Prompt 4: Database
> /plan Set up the Prisma schema from CLAUDE.md, configure Supabase
> connection, and create the initial migration.
```

### Phase 2: Core Features

```
# Template Builder
> /plan Build the template builder page. Users pick a framework from the
> sidebar, browse domains, and select individual controls. Support
> search/filter, select-all per domain, and multi-framework templates.

# Assessment Runner
> /plan Build the assessment runner. Users open a template, see all controls
> in a table with status selectors, notes fields, and evidence fields.
> Auto-save on change. Show progress bar. Support keyboard navigation.

# Use TDD for critical logic
> /tdd Implement the compliance rate calculation: given an assessment's
> responses, calculate overall compliance %, per-framework breakdown,
> and per-domain breakdown. Handle edge cases (all N/A, no responses).
```

### Phase 3: Reports

```
> /plan Build the report view page. Executive summary with horizontal
> stacked bar charts (not pie charts), detailed findings tables,
> non-compliant items section, and download buttons for PDF/CSV/HTML.

> /tdd Implement the CSV export function. Verify it handles commas in
> notes, formula injection prevention (=, +, -, @ prefixes), and
> correct column ordering.

> /tdd Implement the PDF export using @react-pdf/renderer. Verify it
> includes all sections: cover, summary, findings, remediation.
```

### Phase 4: Auth & Polish

```
> /plan Integrate Supabase Auth with email + Google OAuth. Protect all
> dashboard routes. Add middleware for auth checks. Set up RLS policies.

> /plan Add keyboard shortcuts: Cmd+K for command palette, Cmd+S for save,
> Escape to close drawers. Use the use-keyboard-shortcut hook.

# Run security review
> /review

# Run full code review
> /review
```

---

## Step 5: Review Workflow

After implementing each feature, run reviews:

```bash
# In Claude Code:
> /review                        # Full code review
> @security-reviewer              # Deep security review

# In terminal:
npx tsc --noEmit                  # Type check
npm run lint                      # Lint
npm run test                      # Unit + integration tests
npx playwright test               # E2E tests
```

---

## Key Patterns from everything-claude-code

### 1. Agent Delegation
When a task is complex, delegate to a specialised agent:
- `@planner` for breaking down features
- `@code-reviewer` for quality checks
- `@security-reviewer` for security audits

### 2. Skills as Domain Knowledge
The GRC frameworks skill (`/.claude/skills/grc-frameworks/SKILL.md`) gives Claude
deep context about compliance standards. This means Claude can generate accurate
control descriptions and understand the domain.

### 3. Rules as Guardrails
Rules in `/.claude/rules/` are always active. They prevent common mistakes
(hardcoded secrets, missing validation, wrong design tokens) without you needing
to repeat instructions.

### 4. Commands as Workflows
`/plan`, `/tdd`, and `/review` give you repeatable workflows. Use them consistently
rather than writing ad-hoc prompts.

### 5. Context Management
Keep prompts focused. Claude Code works best when you:
- Work on one feature at a time
- Reference specific files rather than "the whole project"
- Use `/plan` to create a roadmap, then execute tasks one by one
- Compact context when you notice slowdowns

---

## Design System Reference Card

| Element         | Specification                              |
|-----------------|--------------------------------------------|
| Headings        | Instrument Serif, -0.03em spacing          |
| Body text       | DM Sans 14px, #1B1F23                      |
| Monospace/IDs   | JetBrains Mono 13px, accent colour         |
| Primary button  | bg-accent, text-white, rounded (4px)       |
| Ghost button    | no border, bg-surface-alt on hover         |
| Input height    | 36px, 1px border, rounded (4px)            |
| Card            | bg-surface, no border, rounded-md (6px)    |
| Border radius   | Max 6px. Buttons 4px. NEVER pills.         |
| Icons           | Lucide only, 16px body, 20px nav           |
| Status: Pass    | ● Compliant (#1A7F37)                      |
| Status: Partial | ◐ Partially Compliant (#9A6700)            |
| Status: Fail    | ✕ Non-Compliant (#CF222E)                  |
| Status: N/A     | — Not Applicable (#6E7781)                 |
| Status: Blank   | ○ Not Assessed (#8B949E)                   |
| Sidebar         | 260px expanded, 56px collapsed             |
| Content max-w   | 1200px                                     |
| Page bg         | surface-alt (#F6F8FA)                      |

---

## Deployment

```bash
# Vercel deployment
npm install -g vercel
vercel

# Environment variables to set in Vercel:
# DATABASE_URL         — Supabase Postgres connection string
# DIRECT_URL           — Supabase direct connection (for migrations)
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```

---

## FAQ

**Q: Can I add more frameworks later?**
A: Yes. Create a new file in `src/data/frameworks/` following the same `FrameworkControl[]` structure.

**Q: How do I add team collaboration?**
A: Phase 5. Add an `Organization` model, link users to orgs, share templates/assessments at org level. Add Supabase RLS policies for org-level access.

**Q: Can Claude Code build the whole thing in one session?**
A: No. Work in phases. Each Claude Code session should focus on one feature. Use `/plan` at the start, implement, then `/review` at the end.
