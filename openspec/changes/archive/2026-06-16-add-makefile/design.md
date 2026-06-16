## Context

The project has three independent areas (spec, backend, frontend, tests) each with their own commands. Currently all commands are documented in AGENTS.md but there's no unified entry point. A Makefile will sit at the repo root as a thin wrapper — each target shells out to exactly one existing command or script, never duplicating logic.

## Goals / Non-Goals

**Goals:**
- Single `make <target>` surface for every common operation
- Targets delegate to existing commands/scripts — zero behavior duplication
- Self-documenting via `make help` (parsing `##` comments above each target)
- Works out of the box with just `make` (no additional tooling)
- `.PHONY` on all targets — no file-output tracking needed

**Non-Goals:**
- Replacing `./start.sh` or `./tests/run-tests.sh` internals
- Cross-platform beyond Linux/macOS (project is Linux-first, macOS is secondary)
- Task parallelism or job orchestration (sequential targets suffice)
- Installing system packages or managing Python/node versions
- Behavioral spec changes — this is purely a developer-experience layer

## Decisions

1. **Single flat Makefile at root** — Targets use `cd <dir> && <command>`, matching existing project conventions. No recursive Makefiles or included makefiles.

2. **`.PHONY` for all targets** — Every target runs on every invocation. No real file outputs to track.

3. **`help` as default goal** — `make` with no args prints a formatted list of all targets. Pattern: `## @description` comment above each target, parsed by a `help` target using `grep` and `sed`.

4. **Thin delegation** — Each target shells out to exactly one existing command. For example:
   - `make dev` → `./start.sh`
   - `make test-spec` → `cd spec && npm test`
   - `make test-e2e` → `python3 -m pytest tests/ -v -m "not browser"`
   No complex logic or multi-command orchestration in the Makefile itself.

5. **`make test` runs all suites sequentially** — `test-spec`, `test-backend`, `test-e2e` in that order with `&&` chaining (fail-fast).

6. **`make check` as CI equivalent** — `test` + `build` in sequence. Mirrors what CI would run.

7. **No `all` target** — Not meaningful for a project with independent entry points.

8. **`make install` installs all deps** — Runs `npm ci` in spec and frontend, `pip install -r` for backend, `pip install -r` for tests. This is additive — it uses `.. && ..` so all are attempted even if one fails.

9. **`make doctor` as read-only diagnostic** — A `doctor` target checks system prerequisites and project dependencies are in place before running anything else. It delegates to `scripts/doctor.sh` which performs isolated checks (one per tool/dep) and reports `PASS`/`FAIL` for each. No side effects — read-only, never installs anything. Plain text output, no special characters or colors.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Makefile drifts from actual commands** | Targets are thin wrappers (one command each). Changes to underlying commands are unlikely, and when they happen, the Makefile is trivial to update. |
| **`make install` may fail on one dep** | Using `&&` chaining means first failure stops. Acceptable — user can run individual `make install-*` targets if needed. |
| **Help formatting may break on non-GNU make** | macOS ships BSD `make` which handles the syntax fine. `grep`/`sed` patterns used for help parsing are POSIX-compatible. |
