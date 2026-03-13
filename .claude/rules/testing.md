# Testing Rules — GRC Report Generator

## Test-Driven Development

Follow the RED → GREEN → REFACTOR cycle:
1. Write a failing test that describes the desired behaviour
2. Write the minimum code to make it pass
3. Refactor while keeping tests green

## Coverage Requirements

- Minimum 80% code coverage across the project
- 100% coverage on critical paths: auth, data access, report generation
- Run `vitest --coverage` before committing

## Unit Tests (Vitest)

- Test pure functions, hooks, and utilities
- Test Zustand store actions and selectors
- Mock external dependencies (database, auth, API calls)
- File naming: `*.test.ts` or `*.test.tsx` colocated with source
- Each test file mirrors the source file structure

### What to Test

- Framework data integrity (all controls have required fields)
- Template creation/validation logic
- Assessment status calculations (compliance rates, progress)
- Report data aggregation
- Date formatting, CSV generation, input validation
- Zustand store state transitions

## Integration Tests (Vitest + Testing Library)

- Test component rendering with realistic data
- Test form submissions and validation feedback
- Test keyboard navigation and accessibility
- Use `@testing-library/user-event` for interactions

### What to Test

- Template builder: selecting/deselecting controls, search filtering
- Assessment runner: status changes, note editing, progress updates
- Report view: correct data display, export button clicks
- Sidebar navigation state

## End-to-End Tests (Playwright)

- Cover critical user journeys only (not exhaustive)
- Test against a seeded test database

### Critical Journeys

1. Login → Create template → Select controls → Save
2. Open template → Start assessment → Fill responses → Complete
3. View completed assessment → Generate report → Download PDF
4. Edit existing template → Verify assessments still reference it

## Test Data

- Keep test fixtures in `tests/fixtures/`
- Use factory functions to create test data (not inline objects)
- Never use production data in tests
