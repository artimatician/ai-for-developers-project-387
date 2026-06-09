## Why

The project has 126 tests across three test suites (spec validation, backend unit tests, E2E API tests) but no automated CI. Every push risks regressions going unnoticed until manual testing. A CI pipeline running on push and pull requests will catch failures immediately, enforce spec correctness, and give contributors confidence when making changes.

## What Changes

- Create a `.github/workflows/ci.yml` workflow that runs on every push to `main` and every pull request
- The workflow runs three phases sequentially: (1) TypeSpec spec validation, (2) Django backend unit tests, (3) E2E API tests against a live backend+frontend
- Browser-based E2E tests (5 tests) are excluded from CI — they require Playwright/Chromium system deps and can be added later
- Node.js 20 LTS and Python 3.12 are pinned for deterministic builds
- Dependency caching is configured for `spec/node_modules` and `frontend/node_modules` to speed up runs

## Capabilities

### New Capabilities
- `ci`: Automated continuous integration pipeline — spec validation, backend tests, and E2E API tests run automatically on push and pull request

### Modified Capabilities

None. CI is a new operational layer — it runs existing tests without changing their requirements or behavior.

## Impact

- **Created**: `.github/workflows/ci.yml` — the GitHub Actions workflow file
- **Dev workflow**: Push and PR now trigger automated test runs. Status reported via GitHub checks UI
- **Dependencies**: CI uses GitHub Actions runners (ubuntu-latest) — no external CI service needed
