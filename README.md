# GRC Report Generator

A compliance assessment platform for GRC analysts. Create custom checklists from ISO 27001, SOC 2, NIST CSF, PCI DSS, HIPAA, and GDPR. Assess businesses. Generate downloadable reports.

## Quick Start

```bash
git clone https://github.com/sm-coding-projects/GRC_Assessment_Reports.git
cd GRC_Assessment_Reports
./setup.sh       # installs deps, creates DB, ready to go
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Manual Setup

If you prefer step-by-step:

```bash
npm install              # also generates Prisma client
cp .env.example .env     # local SQLite — no external services needed
npx prisma db push       # creates the local database
npm run dev
```

### Prerequisites

- Node.js 20+
- npm

That's it — the app uses SQLite locally, so no external database or Docker is needed.

### Optional: Local Supabase (for auth)

If you need Supabase Auth locally, install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) and run:

```bash
npm run dev:supabase
```

This starts Supabase alongside the dev server. Update `.env` with the local Supabase keys printed by `supabase start`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:supabase` | Start dev server + local Supabase |
| `npm run build` | Production build |
| `npm run setup` | Copy .env + create local database |
| `npm run test` | Run unit/integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio |

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 + Radix UI
- Prisma (SQLite locally, PostgreSQL in production)
- tRPC + React Query + Zustand
- Vitest + Playwright

## Frameworks Supported

- **ISO 27001:2022** — 93 controls across 4 domains
- **SOC 2 Type II** — Trust Services Criteria (CC1-CC9 + optional)
- **NIST CSF 2.0** — 6 functions, 22 categories
- **PCI DSS v4.0** — 12 requirements
- **HIPAA** — Administrative, Physical, Technical safeguards
- **GDPR** — Data protection assessment controls

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login, register
│   ├── (dashboard)/      # Main app (templates, assessments, reports)
│   └── api/              # tRPC API routes
├── components/           # UI components
│   ├── ui/               # Primitives (button, input, table, etc.)
│   ├── layout/           # Sidebar, header, breadcrumbs
│   ├── templates/        # Template builder components
│   ├── assessments/      # Assessment runner components
│   └── reports/          # Report view/export components
├── data/frameworks/      # Framework control data (ISO, SOC 2, etc.)
├── lib/                  # Database, auth, tRPC, utilities
├── stores/               # Zustand state stores
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## License

MIT
