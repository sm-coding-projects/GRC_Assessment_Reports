# Git Workflow Rules — GRC Report Generator

## Commit Format

Use Conventional Commits:

```
<type>(<scope>): <description>

[optional body]
```

### Types

- `feat`: New feature (template builder, assessment runner, etc.)
- `fix`: Bug fix
- `refactor`: Code restructuring without behaviour change
- `docs`: Documentation changes
- `test`: Adding or fixing tests
- `chore`: Build, config, dependency updates
- `style`: Formatting changes (not CSS — code style)

### Scopes

- `templates`, `assessments`, `reports`, `auth`, `ui`, `db`, `api`

### Examples

```
feat(templates): add multi-framework control selector
fix(assessments): prevent duplicate responses on save
refactor(ui): extract StatusBadge component from assessment table
test(reports): add PDF export integration tests
```

## Branching

- `main` — always deployable, protected
- `feat/<description>` — feature branches
- `fix/<description>` — bug fixes
- `refactor/<description>` — refactoring work

## PR Process

1. Branch from `main`
2. Make changes with atomic commits
3. Run full test suite locally
4. Push and open PR with description of changes
5. Automated checks must pass: TypeScript, lint, tests
6. Merge via squash merge

## Before Committing

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets
- [ ] No `any` types
