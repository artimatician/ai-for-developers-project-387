## Why

The project has ~14 distinct commands spread across AGENTS.md — spec validation, backend tests, frontend dev, E2E tests, type generation, build. No unified entry point exists. A Makefile provides discoverable, consistent shortcuts (`make test`, `make dev`, `make build`) and reduces context-switching when jumping between project areas.

## What Changes

- Add a root `Makefile` with `.PHONY` targets for all common operations
- Targets delegate to existing scripts/commands — no behavior is duplicated
- `make help` lists all available targets via comment parsing
- The following targets are planned:

  | Target | Maps to |
  |--------|---------|
  | `help` | List all targets with descriptions |
  | `install` | Install all dependencies (spec, backend, frontend, test deps) |
  | `dev` | Start backend + frontend dev servers (`./start.sh`) |
  | `test` | Run all test suites sequentially |
  | `test-spec` | TypeSpec validation (`cd spec && npm test`) |
  | `test-backend` | Django unit tests (`cd backend && python3 manage.py test`) |
  | `test-e2e` | E2E API-only tests (`python3 -m pytest tests/ -v -m "not browser"`) |
  | `test-e2e-browser` | E2E browser tests (`python3 -m pytest tests/ -v -m browser`) |
  | `build` | Frontend production build (`cd frontend && npm run build`) |
  | `build-spec` | Compile TypeSpec → OpenAPI (`cd frontend && npm run build:spec`) |
  | `gen-types` | Regenerate TypeScript types (`cd frontend && npm run gen:types`) |
  | `check` | All tests + build (CI-equivalent) |

## Capabilities

### New Capabilities

None. The Makefile is a developer-experience layer — it wraps existing commands without changing any behavioral requirements.

### Modified Capabilities

None. No spec-level behavior changes.

## Impact

- **Created**: `Makefile` at repo root
- **Dev workflow**: Developers can run `make <target>` as an alternative to remembering individual commands. AGENTS.md updated to reference `make` targets.
- **Dependencies**: Only `make` (pre-installed on all Linux/macOS systems)
