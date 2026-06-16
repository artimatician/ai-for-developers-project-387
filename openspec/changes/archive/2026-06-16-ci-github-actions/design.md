## Context

The project has three independent test suites and no CI. A GitHub Actions workflow is being added to run all three on every push to `main` and every pull request. The workflow must be maintainable, fast, and reliable — it replaces no existing infrastructure since there's nothing to replace.

## Goals / Non-Goals

**Goals:**
- Run spec validation (32 checks), backend Django tests (54 tests), and E2E API tests (40 tests) on every push/PR
- Pinned, deterministic runtime versions (Node 20 LTS, Python 3.12)
- Fresh backend process per CI run (avoids SQLite `:memory:` state leaking between runs)
- Dependency caching for npm to keep job under 3 minutes
- Fail-fast: any phase failure stops the workflow

**Non-Goals:**
- Browser E2E tests (5 tests, require Playwright + Chromium system deps — deferred)
- Python dependency lockfile (requirements.txt with loose pins is sufficient for current team size)
- Parallel job execution (sequential is simpler and fast enough)
- Deployment or release automation
- Cross-repo CI (only this repo)

## Decisions

1. **Sequential single job** — Three phases in one job, no matrix, no service containers. Each phase has clear failure output. Total estimated runtime ~2 min (15 min timeout as safety net).

2. **npm ci over npm install** — Deterministic builds from lockfile. Both `spec/` and `frontend/` have committed `package-lock.json`. Falls back to `npm install` if lockfile is absent (defensive — shouldn't happen).

3. **Pre-install deps before run-tests.sh** — We `npm ci` and `pip install` in dedicated steps before the orchestration step. The `run-tests.sh` script checks whether deps exist (`[ ! -d node_modules ]`, `import django`) and skips installation when they do — so it proceeds straight to server start + test run.

4. **Reuse run-tests.sh for E2E phase** — The existing script handles server lifecycle (start backend :4010, start frontend :3000, cleanup). Passing `-m "not browser"` filters to API-only tests. No new orchestration code needed.

5. **actions/cache for node_modules** — Cache keyed by `package-lock.json` hash with `restore-keys` fallback. Saves ~30-60s per run on cache hit. Pip caching is handled automatically by `actions/setup-python`.

6. **Node 20 LTS, Python 3.12** — Both are latest LTS-equivalent stable releases on GitHub's `ubuntu-latest` runners. Satisfies Next.js 16 (needs Node ≥ 18) and Django 5.2 (supports Python 3.10–3.13).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **run-tests.sh uses `--break-system-packages`** | This branch only triggers if Django is not importable. We pre-install with `setup-python`'s venv, so Django is always importable — the branch is never hit. |
| **run-tests.sh uses `fuser`/`pkill`** | Clean CI container has no processes on those ports. Safe. |
| **`unique_time` fixture counter** | Counter resets on pytest restart, but backend SQLite `:memory:` persists. In CI, the backend starts fresh per run — no cross-run state leakage. |
| **npm ci fails if lockfile out of sync** | This is desired behavior — it catches mismatches between `package.json` and `package-lock.json`. |
| **Python deps not locked** | `requirements.txt` uses loose pins (`django>=5.2`). Minor risk of unexpected upgrades breaking CI. Acceptable for current stage. |
