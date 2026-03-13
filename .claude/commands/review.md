# /review — Run code review on current changes

Execute a comprehensive code review:

1. Run `git diff --staged` (or `git diff` if nothing staged) to see changes
2. Use the code-reviewer agent to check quality, security, and design compliance
3. If security-sensitive files changed (auth, API routes, database), also use security-reviewer agent
4. Report findings grouped by severity
5. Check design system compliance for any UI changes

Security-sensitive paths:
- `src/app/api/` — all API routes
- `src/lib/auth.ts` — authentication
- `src/lib/db.ts` — database access
- `src/lib/trpc/` — tRPC procedures
- `prisma/` — database schema
