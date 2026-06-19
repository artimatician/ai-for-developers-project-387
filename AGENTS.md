# Calendar (Schedule a Call)

Project structure: **TypeSpec API spec** (done), **Next.js frontend** (done), **Django backend** (done).

## Commands

> Most commands also have `make` shortcuts (see [Makefile](#makefile) below).

```sh
make doctor                                            # check prerequisites before setting up
make install-hooks                                     # install git commit-msg hook (Conventional Commits)
cd spec && npm install && npm test                    # compile TypeSpec + run 32 validation checks
cd backend && python3 manage.py test                  # run 54 backend tests
./start.sh                                            # start backend (4010) + frontend (3000)
cd frontend && npm run dev                            # start Next.js dev server only (port 3000)
cd frontend && npm run build                          # production build
cd frontend && npm run build:spec                     # compile TypeSpec → OpenAPI YAML
cd frontend && npm run gen:types                      # regenerate TypeScript types from OpenAPI spec
./tests/run-tests.sh                                  # start backend + frontend, run E2E tests, clean up
python3 -m pytest tests/ -v --tb=short                # run all E2E tests (requires backend on :4010)
python3 -m pytest tests/ -v -m "not browser"          # API-only tests (40 total)
python3 -m pytest tests/ -v -m browser                # browser tests only (5 total)
```

## Structure

- `spec/*.tsp` — TypeSpec API spec (entrypoint `main.tsp`, models, owner/guest ops)
- `backend/` — Django + DRF REST API (port 4010)
- `frontend/` — Next.js 16 + Mantine 7 app (port 3000)
- `tests/` — Python E2E test suite (40 API + 5 browser tests)
- `openspec/` — OpenSpec behavioral specs + changes:
  `specs/` — 11 capability specs (event-types, bookings, blackouts, owner-*, guest-booking-flow, test-strategy)
  `changes/` — change proposals, designs, tasks, delta specs (archived history)
- `.opencode/` — OpenCode workflow skills and commands

## Key conventions

- Backend: Django + DRF REST API under `/api/`, SQLite `:memory:` (resets on restart)
- Frontend: Next.js 16 (App Router), Mantine 7, `@tabler/icons-react`, `dayjs` with timezone plugin
- Frontend proxies `/api/*` to backend via `next.config.ts` rewrite
- All endpoints under `/api`, no version prefix
- Owner endpoints prefixed `/api/owner/`, guest endpoints `/api/`
- UUID v4 resource IDs, ISO 8601 UTC datetimes
- 30-min fixed slot duration, 09:00–18:00 operating hours (per-event-type timezone)
- No auth, no guest cancellation, no hard DELETE on event types (soft-delete via `isActive`)
- Generated build artifacts: `spec/tsp-output/` (gitignored), `frontend/.next/` (gitignored)

## Commit convention

All commits must follow **Conventional Commits** format:

```
<type>: <description>

[optional body]
```

**Types**: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`.

**Examples**: `feat: add dark mode`, `fix: handle empty slot list`, `chore: bump dayjs to 1.11`.

Validated locally via git hook (`make install-hooks`) and in CI on every push/PR.

## Frontend conventions

- **Routes**: `/` (landing page with HeroSection), `/book` (event type selection grid), `/book/[id]` (scheduling page), `/book/[id]/confirm` (booking form), `/bookings/confirm` (post-booking confirmation), `/how-it-works`, `/owner` (dashboard), `/owner/*` (owner sub-pages)
- **Landing page** uses `Navbar` (variant `"landing"`) + `HeroSection` with embedded how-it-works steps
- **Scheduling page** (`/book/[id]`) uses a **3-column layout**: MeetingSummary | CalendarGrid | TimeSlotList
- Components live in `frontend/src/components/` — `Navbar`, `HeroSection`, `EventTypeCard`, `ProfileIntroCard`, `MeetingSummary`, `SchedulingPage`, `CalendarGrid`, `TimeSlotList`, `BookingForm`, `ErrorAlert`, `OwnerSidebar`
- API client in `frontend/src/lib/api.ts`, types in `frontend/src/lib/api-types.ts` (auto-generated)
- Design tokens: landing bg `#FFFFFF`, page bg `#F8FAFC`, card surface `#FFFFFF`, border `#E5E7EB`, text primary `#111827`, text secondary `#6B7280`, accent orange `#F97316`, success green `#16A34A`
- Calendar is a custom component (NOT `@mantine/dates`) for full visual control
- Slots are computed on-the-fly by the API; frontend groups by date in event type's timezone
- Owner pages (`/owner`, `/owner/event-types`, `/owner/bookings`, `/owner/blackouts`) use sidebar layout with `OwnerSidebar`; includes dashboard with summary cards

## Backend conventions

- **Stack**: Django 6.0 + DRF, SQLite `:memory:` (shared cache URI), port 4010
- **Models**: EventType, Booking, Blackout — all with UUID v4 PKs
- **Slot algorithm**: 14-day window starting from today in event type's timezone, 09:00–18:00 operating hours, 30-min slots
- **Conflict model**: Booking and blackout conflicts are global (across all event types)
- **Error format**: All errors return `{ "code": "...", "message": "..." }`
- **Error codes**: `INVALID_INPUT` (400), `EVENT_TYPE_NOT_FOUND` (404), `EVENT_TYPE_INACTIVE` (404), `BLACKOUT_NOT_FOUND` (404), `SLOT_UNAVAILABLE` (409)
- **Auto-migration**: Tables created on startup via `AppConfig.ready()`
- **No migrations directory**: Uses `--run-syncdb` instead of Django migrations
- **54 tests** across 5 test suites: health, event types, bookings, blackouts, slots

## Test conventions

- **Stack**: Python + pytest + requests + Playwright
- **40 API tests** (no browser needed) + **5 browser tests** (auto-skipped if Playwright browser missing)
- **Fixtures** in `tests/conftest.py`: `api_client` (requests.Session, proxy disabled), `event_type`, `second_event_type`, `unique_time` (callable factory), `future_slot`
- **`unique_time`** generates conflict-free ISO 8601 UTC times starting at 14:00 (day+2), 30min increments across multiple days — avoids blackout window 09:00–13:00
- **`future_slot`** books a real slot to guarantee it's available for downstream assertions
- **No `data-testid`** — browser locators use text/role/CSS selectors against Mantine components
- **Proxy bypass**: all API calls go through `requests.Session` with `trust_env = False`
- **Global conflict model**: bookings and blackouts block slots across all event types
- **Database persists** across test runs within the same backend process (SQLite `:memory:`)
- **Browser auto-skip**: `pytest_collection_modifyitems` checks for installed Playwright Chromium and skips `page` fixture tests
- **Two timezones** tested: `UTC` and `America/New_York`

## Spec conventions

- TypeSpec `namespace` blocks (not `interface`), `@route` for path prefixing (no `@autoRoute`)
- `@doc` on every model + operation
- `Error` model marked `@error`; operations return union types for error responses
- Server-generated fields (`id`, `createdAt`, etc.) omitted from request models

## OpenSpec workflow

OpenSpec is the change-management framework used for this project. Workflows are driven by OpenCode skills:

- `openspec-explore` — Investigate problems, brainstorm, clarify requirements (no code)
- `openspec-propose` — Create a change: proposal.md, design.md, tasks.md, delta specs
- `openspec-apply-change` — Implement a change by working through tasks.md
- `openspec-sync-specs` — Merge delta specs back into main specs at `openspec/specs/`
- `openspec-archive-change` — Finalize and archive a completed change

**Cycle**: explore → propose → implement → sync specs → archive.

Main specs live at `openspec/specs/<capability>/spec.md`. Active changes at
`openspec/changes/<name>/`; archived ones at `changes/archive/`.

## Validation

`npm test` in `spec/` compiles `.tsp` → OpenAPI YAML and asserts:
- 13 operations with exact `operationId` values (e.g. `Owner_listEventTypes`)
- 11 schemas, 5 path params, 3 POST endpoints

## Makefile

A root `Makefile` provides shortcuts for common operations. Run `make help` to see all targets.

| Target | Description |
|--------|-------------|
| `help` | List all targets with descriptions |
| `install` | Install all dependencies (spec, frontend, backend, tests) |
| `dev` | Start backend + frontend dev servers |
| `test` | Run all test suites sequentially |
| `test-spec` | Run spec validation |
| `test-backend` | Run backend tests |
| `test-e2e` | Run E2E API-only tests (auto-starts backend) |
| `test-e2e-browser` | Run E2E browser tests |
| `build` | Frontend production build |
| `build-spec` | Compile TypeSpec to OpenAPI YAML |
| `gen-types` | Regenerate TypeScript types from OpenAPI spec |
| `check` | Run all tests + build (CI equivalent) |
| `doctor` | Check system prerequisites and project deps |
| `install-hooks` | Install git commit-msg hook (Conventional Commits) |
