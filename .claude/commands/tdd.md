# /tdd — Test-Driven Development workflow

Implement the requested feature using strict TDD:

1. **RED**: Write a failing test that describes the desired behaviour
2. **GREEN**: Write the minimum code to make the test pass
3. **REFACTOR**: Clean up while keeping tests green
4. Repeat for each behaviour

Rules:
- Write the test FIRST. Do not write implementation before the test exists.
- One behaviour per test. Keep tests focused.
- Run `npx vitest run [file]` after each step to confirm red→green.
- Use factories from `tests/fixtures/` for test data.
- Mock external dependencies (database, auth, API).
- Aim for 80%+ coverage on the implemented feature.
