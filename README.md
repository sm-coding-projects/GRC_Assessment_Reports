# GRC Report Generator

A self-contained Governance, Risk & Compliance (GRC) assessment platform. Create custom compliance checklists from ISO 27001, SOC 2, NIST CSF 2.0, PCI DSS, HIPAA, and GDPR. Assess businesses against those checklists. Generate downloadable reports.

Built for internal use — admin-managed users, role-based access control, no external auth dependencies.

## Quick Start (Docker)

The fastest way to get running. Requires [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/sm-coding-projects/GRC_Assessment_Reports.git
cd GRC_Assessment_Reports

# Generate a session secret
export SESSION_SECRET=$(openssl rand -hex 32)

# Start PostgreSQL + app (two containers)
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000) and login:

| Field    | Value            |
|----------|------------------|
| Email    | `admin@local`    |
| Password | `ChangeMe123!`   |

**Change the default password immediately** via Settings > Password.

### Configuration

Create a `.env` file in the project root (or set environment variables):

```env
# Required
SESSION_SECRET="your-random-32-char-secret"

# Optional — override defaults
POSTGRES_PASSWORD="grc_password"        # default: grc_password
APP_PORT="3000"                         # default: 3000
ADMIN_EMAIL="admin@local"              # default: admin@local
ADMIN_PASSWORD="ChangeMe123!"          # default: ChangeMe123!
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Local Development (without Docker)

Requires Node.js 20+ and a running PostgreSQL instance.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# 3. Apply database schema and seed admin user
npx prisma db push
node prisma/seed.js

# 4. Start dev server
npm run dev
```

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Frontend                                         │
│  Next.js 15 (App Router) + TypeScript             │
│  Tailwind CSS 4 + Radix UI                        │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│  Backend / API                                    │
│  tRPC + iron-session (encrypted cookies)          │
│  Prisma ORM + bcryptjs                            │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   PostgreSQL 16  │
              │   (Docker)       │
              └──────────────────┘
```

### Authentication

- **No external auth service** — passwords hashed with bcryptjs (cost 12), sessions stored in encrypted httpOnly cookies via iron-session
- **No self-registration** — the admin creates all user accounts
- **No OAuth** — email + password only

### Role-Based Access Control

| Role         | Permissions |
|--------------|-------------|
| `ADMIN`      | Full access. Create/manage users, assign roles, all CRUD operations |
| `READ_WRITE` | Create and edit templates, run assessments, generate reports |
| `READ_ONLY`  | View templates, assessments, and reports. No modifications |

### User Management

Admins manage users at **Settings > Users**:

- Create users with email, name, temporary password, and role
- Change user roles
- Reset passwords
- Delete users (cascades all their data)

## Frameworks Supported

| Framework         | Controls | Scope |
|-------------------|----------|-------|
| **ISO 27001:2022** | 93       | 4 domains (Organisational, People, Physical, Technological) |
| **SOC 2 Type II**  | 65+      | Trust Services Criteria (CC1–CC9 + optional) |
| **NIST CSF 2.0**   | 106      | 6 functions, 22 categories |
| **PCI DSS v4.0**   | 64+      | 12 requirements |
| **HIPAA**          | 50+      | Administrative, Physical, Technical safeguards |
| **GDPR**           | 40+      | Data protection assessment controls |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run docker:up` | Build and start Docker Compose stack |
| `npm run docker:down` | Stop Docker Compose stack |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed admin user (idempotent) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit/integration tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run typecheck` | TypeScript type checking |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + Radix UI primitives |
| API | tRPC + React Query |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | iron-session + bcryptjs |
| State | Zustand (client), React Query (server) |
| PDF Export | @react-pdf/renderer |
| Testing | Vitest + React Testing Library + Playwright |
| Deployment | Docker Compose |

## Project Structure

```
├── docker-compose.yml          # PostgreSQL + app (production)
├── Dockerfile                  # Multi-stage build
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.js                 # Admin user seed script
│   └── migrations/             # PostgreSQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Login page
│   │   ├── (dashboard)/        # Main app
│   │   │   ├── templates/      # Template builder
│   │   │   ├── assessments/    # Assessment runner
│   │   │   ├── reports/        # Report viewer
│   │   │   └── settings/       # Profile, password, user management
│   │   └── api/
│   │       ├── auth/           # Login, logout, password change
│   │       └── trpc/           # tRPC API handler
│   ├── components/
│   │   ├── ui/                 # Design system primitives
│   │   ├── layout/             # Sidebar, header
│   │   ├── settings/           # Add user, reset password drawers
│   │   ├── templates/          # Template builder components
│   │   ├── assessments/        # Assessment runner components
│   │   └── reports/            # Report view/export components
│   ├── lib/
│   │   ├── auth/               # Session + password utilities
│   │   ├── trpc/               # Router, context, procedures (RBAC)
│   │   └── utils/              # Helpers (cn, dates, export)
│   ├── data/frameworks/        # Framework control data
│   ├── stores/                 # Zustand state stores
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
└── scripts/
    └── docker-entrypoint.sh    # DB schema + seed on container start
```

## Security

- Passwords hashed with bcryptjs (cost factor 12)
- Session cookies: httpOnly, secure (in production), sameSite=lax, 24h TTL
- CSRF protection via Origin header validation
- Rate limiting on login (5 attempts/minute per IP)
- All user input validated server-side with Zod
- Parameterized queries via Prisma (no raw SQL injection)
- Content-Security-Policy headers with nonces
- Row-level data isolation (users only access their own data)

## License

MIT
