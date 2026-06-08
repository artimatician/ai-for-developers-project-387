# Delta for test-strategy

## ADDED Requirements

### Requirement: Backend Has Unit Tests
The system SHALL have a suite of Django unit tests covering the backend implementation.

#### Scenario: Backend unit test count
- WHEN the command `python3 manage.py test` is run
- THEN 54 tests SHALL pass
- AND tests SHALL cover health check, event types, bookings, blackouts, and slots

#### Scenario: Backend test structure
- WHEN the test suite is examined
- THEN there SHALL be test files for health (`test_health.py`), event types (`test_event_types.py`), bookings (`test_bookings.py`), blackouts (`test_blackouts.py`), and slots (`test_slots.py`)
- AND all tests SHALL be in `backend/appointments/tests/`

### Requirement: E2E Test Suite Exists
The system SHALL have an E2E test suite at `tests/` that tests the full stack through the HTTP API.

#### Scenario: E2E test count
- WHEN the command `python3 -m pytest tests/ -v -m "not browser" --tb=short` is run
- THEN 40 API tests SHALL pass
- AND the backend SHALL be running on port 4010

#### Scenario: E2E test includes browser tests
- WHEN Playwright Chromium is installed
- AND the frontend is running on port 3000
- AND the backend is running on port 4010
- THEN `python3 -m pytest tests/ -v -m browser --tb=short` SHALL run 5 browser tests

#### Scenario: E2E test structure
- WHEN the test suite is examined
- THEN there SHALL be guest tests in `tests/guest/` (happy path, booking validation, availability edge cases)
- AND owner tests in `tests/owner/` (event types, bookings/blackouts, dashboard, integration edge cases)
- AND a shared `tests/helpers/api.py` with typed API wrappers

### Requirement: unique_time Fixture Generates Conflict-Free Times
The system SHALL provide a `unique_time` fixture that generates ISO 8601 UTC datetime strings guaranteed not to conflict with each other.

#### Scenario: unique_time produces unique times
- WHEN `unique_time()` is called multiple times
- THEN each call SHALL return a different ISO 8601 UTC datetime
- AND times SHALL be at 30-minute intervals starting at 14:00
- AND times SHALL be at least 2 days in the future

#### Scenario: unique_time spans multiple days
- WHEN `unique_time()` is called more than 8 times
- THEN the 9th call SHALL return a time on the next day
- AND the time SHALL still be at 14:00 or later

### Requirement: future_slot Fixture Books Guaranteed Slot
The system SHALL provide a `future_slot` fixture that creates a real booking at a guaranteed-available time.

#### Scenario: future_slot creates booking
- WHEN the `future_slot` fixture is used
- THEN a booking SHALL be created via POST `/api/bookings`
- AND the booking SHALL use the `event_type` and `unique_time` fixtures

### Requirement: Browser Tests Auto-Skip Without Playwright
The system SHALL automatically skip browser tests when Playwright Chromium is not installed.

#### Scenario: Browser tests skip
- WHEN Playwright Chromium is not installed
- AND the command `python3 -m pytest tests/ -v` is run
- THEN tests that require a `page` fixture SHALL be skipped
- AND API tests SHALL still run normally

#### Scenario: Skip message
- WHEN a browser test is skipped due to missing Playwright
- THEN the skip message SHALL direct the user to `tests/README.md`

### Requirement: API Calls Bypass HTTP Proxy
The system SHALL configure the API client to bypass HTTP proxy settings for reliable local API calls.

#### Scenario: Proxy is disabled
- WHEN the `api_client` fixture makes an API request
- THEN the request SHALL use `trust_env = False`
- AND the request SHALL go directly to the backend on port 4010

### Requirement: Tests Cover Multiple Timezones
The system SHALL test with both UTC and America/New_York timezones.

#### Scenario: UTC timezone testing
- WHEN tests use the `event_type` fixture
- THEN the event type SHALL have timezone "UTC"

#### Scenario: America/New_York timezone testing
- WHEN tests use the `second_event_type` fixture
- THEN the event type SHALL have timezone "America/New_York"

### Requirement: Orchestrated Test Runner Exists
The system SHALL provide an orchestrated script that starts the backend and frontend, runs tests, and cleans up.

#### Scenario: run-tests.sh orchestrates
- WHEN `./tests/run-tests.sh` is executed
- THEN the script SHALL start the backend on port 4010
- AND the script SHALL start the frontend on port 3000
- AND the script SHALL run all tests
- AND the script SHALL stop both servers after tests complete
