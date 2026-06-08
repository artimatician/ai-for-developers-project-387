## Context

The test suite is split into two locations with different scopes:

- **`backend/appointments/tests/`** — 54 Django unit tests (5 files): health, event types, bookings, blackouts, slots. Run via `python3 manage.py test`. Test against an isolated test database (Django's test runner creates a separate :memory: DB).

- **`tests/`** — 45 E2E tests (40 API + 5 browser): use `requests.Session` for API calls and Playwright for browser tests. Run via `python3 -m pytest tests/`. Test against a running backend on `:4010` (and optionally frontend on `:3000`).

## Goals / Non-Goals

**Goals:**
- Capture the test infrastructure's behavioral contract (fixtures, auto-skip, proxy bypass)
- Document test organization and coverage expectations
- Provide a foundation for future test additions or changes

**Non-Goals:**
- No changes to the test suite
- No specification of individual test scenarios (those are in their respective domain specs)

## Decisions

### D1: Two-tier test architecture
Backend unit tests (Django) verify models, serializers, services, and views in isolation. E2E tests verify the full stack through the HTTP API and (for browser tests) through the UI. This avoids the common pitfall of having only one test level.

### D2: `unique_time` fixture avoids conflicts
The `unique_time` callable factory generates ISO 8601 UTC datetimes starting at day+2 at 14:00, incrementing by 30 minutes per call, spanning multiple days. This ensures:
- Times are always in the future (day+2)
- Times avoid the 09:00-13:00 blackout window commonly used in tests (starts at 14:00)
- No two calls produce the same time (global counter)

### D3: `future_slot` fixture guarantees availability
The `future_slot` fixture creates a real booking at a `unique_time` slot. This guarantees a slot is "taken" before test logic that needs to verify behavior around an existing booking.

### D4: Proxy bypass for API reliability
`requests.Session` is configured with `trust_env = False` to prevent corporate HTTP proxies from intercepting API calls. This is essential in CI and developer environments where proxy variables may be set.

### D5: Browser auto-skip, not fail
Browser tests auto-skip (via `pytest_collection_modifyitems`) when Playwright Chromium is not installed. This keeps the barrier to entry low — developers can run API tests without setting up Playwright browsers. The skip message directs them to `tests/README.md` for setup instructions.

### D6: No `data-testid` for browser locators
Browser tests use Mantine's rendered text content, ARIA roles, and CSS class selectors instead of dedicated `data-testid` attributes. This is intentional — it tests the actual user-visible interface rather than test-specific hooks.

## Risks / Tradeoffs

- **[Fragility] No `data-testid`** — Browser tests are more sensitive to text and layout changes. A minor UI text change can break multiple browser tests.
- **[Parallelization] Global `unique_time` counter** — The module-level `_unique_time_counter` means tests cannot run in parallel without collision. Pytest-xdist or similar would break this.
- **[Coverage gap] No auth tests** — Since the app has no authentication, there's no negative testing around auth. Future auth addition is a blind spot.

## Open Questions

- Should there be a `test-dashboard` for the guest pages (browser test), or is the existing coverage sufficient?
- Should the `unique_time` counter reset between test sessions to prevent overflow on long-running servers?
