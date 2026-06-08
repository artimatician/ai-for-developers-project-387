# Schedule a Call — Test Suite

Python + Playwright + pytest test suite covering all 13 API endpoints (guest + owner) with 40 API tests and 5 browser-level tests.

## Prerequisites

```bash
pip install -r tests/requirements.txt
```

Playwright browsers are optional — API tests don't need them, and browser tests are automatically skipped when no browser is found.

### Playwright browser system dependencies

Browser tests require Playwright's bundled Chromium. After installing the Python package, download it:

```bash
python3 -m playwright install chromium
```

Ubuntu 26.04 LTS is not yet officially supported by Playwright (as of version 1.59.1). Use this command:
```bash
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 python3 -m playwright install chromium
```

On a minimal system (Docker, CI, etc.) Chromium may fail to start due to missing shared libraries. Install them with:

```bash
# Ubuntu / Debian
sudo apt-get install -y \
  libnss3 libnspr4 \
  libatk1.0-0t64 \
  libatk-bridge2.0-0t64\
  libatspi2.0-0t64 \
  libcups2t64 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 libdrm2 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 \
  libwayland-client0
```

> The `t64` suffix is used on Ubuntu 24.10+ for the 64-bit time_t transition.
> On older releases drop the suffix (e.g. `libglib2.0-0` instead of `libglib2.0-0t64`).

After installing the libraries, verify Chromium runs:

```bash
python3 -c "from playwright.sync_api import sync_playwright; p=sync_playwright().start(); print(p.chromium.executable_path); p.stop()"
```

The `_playwright_browser_available()` check in `conftest.py` verifies the executable exists and auto-skips browser tests if it is absent.

## Quick Start

```bash
# Orchestrated: starts backend + frontend, runs tests, cleans up
./tests/run-tests.sh
```

Or step by step:

```bash
# Terminal 1 — Backend (required)
cd backend && python3 manage.py runserver 0.0.0.0:4010 --noreload

# Terminal 2 — Frontend (required only for browser tests)
cd frontend && npm run dev

# Terminal 3 — Run tests
python3 -m pytest tests/ -v --tb=short

# API tests only (skip browser tests)
python3 -m pytest tests/ -v --tb=short -m "not browser"

# Browser tests only (requires frontend + Playwright browsers)
python3 -m pytest tests/ -v --tb=short -m browser
```

## Structure

```
tests/
  pytest.ini               — pytest config (excludes backend/ from collection)
  requirements.txt          — Python dependencies
  run-tests.sh              — orchestration script
  .gitignore                — excludes __pycache__/ and .pytest_cache/
  conftest.py               — fixtures: api_client, event_type, second_event_type,
                              unique_time, future_slot; browser detection
  helpers/
    api.py                  — typed wrappers for all 13 API endpoints
  guest/
    test_happy_path.py      — G1, G3 (2 browser tests + 1 API)
    test_booking_validation.py  — G4, G7 (9 API tests)
    test_availability_edge.py   — G2, G5, G6, G8 (8 API tests)
  owner/
    test_event_types.py     — O1 (10 tests, 1 browser)
    test_bookings_blackouts.py  — O2, O3 (6 tests)
    test_dashboard.py           — O4 (2 browser tests)
    test_integration_edge.py    — E2–E6 (7 API tests)
```

## Test Types

| Type | Mark | Count | Requires |
|------|------|-------|----------|
| API | (none) | 40 | Backend on :4010 |
| Browser | `@pytest.mark.browser` | 5 | Backend + Frontend + Playwright browsers |

## Total: 45 tests (40 API + 5 browser)

All API tests use `requests.Session` with `trust_env=False` to bypass the HTTP proxy. Browser tests use `@pytest.mark.browser` and auto-skip when Playwright Chromium is not found under the Playwright cache.

## Fixtures

| Fixture | Scope | Description |
|---------|-------|-------------|
| `api_client` | session | `requests.Session`-based client pointed at `http://localhost:4010`, proxy disabled |
| `event_type` | function | Creates an event type (name="Test Call", timezone="UTC"), returns `{id, name, timezone}` |
| `second_event_type` | function | Creates a second event type with `America/New_York` timezone |
| `unique_time` | function | Callable factory returning ISO 8601 UTC times starting at 14:00 (day+2), incrementing 30min per call across multiple days |
| `future_slot` | function | Books a guaranteed-available slot for test setup, returns the start time string |

## Key Conventions

- **No `data-testid`** — browser locators use text content, roles, and Mantine CSS classes
- **Proxy bypass** — `session.trust_env = False` in `conftest.py` disables HTTP proxy for all API calls
- **Global conflict model** — bookings and blackouts block slots across all event types, not per-event-type
- **Two timezones** — tests use `UTC` (default) and `America/New_York` (UTC-4 in June)
- **`unique_time` fixture** generates collision-free times starting at 14:00 (after blackout window 09:00–13:00), 30min increments, spanning multiple days
- **`future_slot` fixture** makes a real booking to claim a time, guaranteeing it's available before testing around it
- **Browser tests** detected by presence of `page` fixture parameter; automatically skipped if no Playwright Chromium installed
- **SQLite `:memory:`** — database is reset only on backend restart, not between test runs
