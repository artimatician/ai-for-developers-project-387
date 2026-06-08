## Why

The project has 99 tests across two test suites (54 backend unit tests, 45 E2E tests with 40 API + 5 browser), with custom fixture infrastructure and auto-skip logic. This testing infrastructure has its own behavioral contract — fixtures produce conflict-free times, browser tests auto-skip without Playwright, proxy bypass is configured. Capturing this as a living spec makes the test behavior predictable and changeable.

## What Changes

- **New spec: `test-strategy/`** — Test levels, counts, fixture behavior, auto-skip rules, commands
- **New `design.md`** — Test infrastructure architecture decisions

## Capabilities

### New Capabilities

- `test-strategy`: Test levels, fixture contracts, browser detection, coverage expectations

## Impact

- **No code changes** — all existing tests remain unchanged
- **Main specs populated**: `openspec/specs/test-strategy/`
