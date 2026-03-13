# Security Rules — GRC Report Generator

These rules are NON-NEGOTIABLE. Every code change must comply.

## Secrets Management

- NEVER hardcode API keys, database URLs, tokens, or passwords in source code
- Use environment variables for all secrets
- Validate required env vars at startup with a config module
- .env files are gitignored. Provide .env.example with placeholder values only

## Input Validation

- Validate ALL user input server-side using Zod schemas
- Never trust client-side validation alone
- Sanitise strings before database insertion
- Validate enum values against allowed lists (ComplianceStatus, AssessmentStatus)
- Reject requests with unexpected fields (strict Zod schemas)

## Authentication & Authorisation

- Every API route (except auth endpoints) must verify the session
- Row-level security: users can ONLY access their own templates and assessments
- Check `userId` ownership on every read, update, and delete operation
- Use Supabase RLS policies as a second layer of defence

## Data Security

- Use parameterised queries (Prisma handles this by default)
- Never construct SQL strings manually
- Sanitise HTML content in report exports to prevent XSS
- Use Content-Security-Policy headers

## API Security

- Rate limit all API endpoints
- CSRF protection on state-changing operations
- Validate Content-Type headers
- Return consistent error shapes (never leak stack traces)

## Dependency Security

- No packages with known vulnerabilities
- Run `npm audit` before every release
- Pin dependency versions
- Review new dependencies before adding (check download count, maintenance status)

## If a Security Issue is Found

1. STOP current work
2. Document the vulnerability
3. Fix the issue immediately
4. Review codebase for similar patterns
5. Add a test to prevent regression
