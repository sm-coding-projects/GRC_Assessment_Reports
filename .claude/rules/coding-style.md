# Coding Style Rules — GRC Report Generator

## TypeScript

- Strict mode enabled. No `any` types — use `unknown` if truly needed.
- Explicit return types on all exported functions.
- Use `interface` for object shapes, `type` for unions and intersections.
- Prefer `const` over `let`. Never use `var`.
- Destructure props and function parameters.

## React / Next.js

- Functional components only. No class components.
- Use named exports: `export function ControlRow()` not `export default function()`.
  - Exception: `page.tsx`, `layout.tsx`, `error.tsx` which Next.js requires as default exports.
- Colocate related code: component + its hook + its types in the same directory.
- Keep components under 150 lines. Extract sub-components when exceeding this.
- Custom hooks go in `src/hooks/` for shared hooks or next to the component for local ones.
- Never use `useEffect` for derived state. Use `useMemo` or compute inline.
- Server Components by default. Add `"use client"` only when needed (state, effects, browser APIs).

## File Organisation

- Max 300 lines per file. If approaching this, extract.
- One component per file (exception: small related sub-components).
- Group imports: 1) React/Next, 2) third-party, 3) local aliases, 4) relative imports.
- Use path aliases: `@/components`, `@/lib`, `@/data`, `@/types`, `@/hooks`, `@/stores`.

## Naming Conventions

- **Files**: kebab-case (`control-selector.tsx`, `use-keyboard-shortcut.ts`)
- **Components**: PascalCase (`ControlSelector`, `AssessmentTable`)
- **Functions/variables**: camelCase (`getTemplateById`, `isCompliant`)
- **Constants**: UPPER_SNAKE_CASE (`COMPLIANCE_STATUSES`, `MAX_CONTROLS_PER_PAGE`)
- **Types/Interfaces**: PascalCase (`TemplateControl`, `AssessmentResponse`)
- **Enums**: PascalCase with PascalCase values (`ComplianceStatus.Compliant`)

## Immutability

- Never mutate arrays or objects. Use spread, map, filter.
- Zustand stores: always return new state objects from actions.
- Prisma: use `create`, `update`, `delete` — never raw SQL mutations.

## Error Handling

- Every async function: try/catch with meaningful error handling.
- API routes: return consistent error shape `{ error: string, code: string }`.
- Client-side: show toast notification on error. Never silent failures.
- Log errors with context (which operation, which entity ID).

## Styling (Tailwind)

- Use design system CSS variables for colours (see CLAUDE.md).
- No arbitrary values unless absolutely necessary. Define in tailwind config.
- Responsive: mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.
- No `!important`.
- Prefer `gap` over margin for spacing between siblings.
