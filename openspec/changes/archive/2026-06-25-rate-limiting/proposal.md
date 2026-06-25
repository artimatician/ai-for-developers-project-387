## Why

The backend has no request rate limiting at any layer. A single client can saturate the API with
unlimited requests, risking resource exhaustion on the small SQLite-backed server. Both the
Django app and the production nginx proxy need throttling to protect against accidental or
malicious overuse.

## What Changes

- **Django/DRF throttle** — custom `ClientAnonRateThrottle` class on all `@api_view` endpoints
  that reads `X-Forwarded-For` (proxy-aware) with fallback to `REMOTE_ADDR`
- **nginx `limit_req`** — `30r/m` zone with `burst=20 nodelay` on `/api/` location (production
  only, first line of defense)
- **429 error format** — custom DRF exception handler returns
  `{"code": "RATE_LIMITED", "message": "Too many requests. Try again in N seconds."}` matching
  project error convention
- **`DISABLE_RATE_LIMIT` env var** — bypasses DRF throttle when `true`/`1`, set in both Makefile
  and E2E test scripts to prevent test suites from hitting the 60/min limit
- **Configurable rate** — `RATE_LIMIT_ANON` env var (default `60/minute`) for the DRF throttle

## Capabilities

### New Capabilities

- `rate-limiting`: two-layer request throttling (DRF + nginx) with proxy-aware IP detection,
  configurable rates, test bypass, and consistent error format

### Modified Capabilities

None. No existing behavior changes — rate limiting is additive.

## Impact

- **Created**: `backend/appointments/throttles.py`, `backend/appointments/exceptions.py`
- **Modified**: `backend/config/settings.py`, `docker/nginx.conf`, `Makefile`,
  `tests/run-e2e-api.sh`, `tests/run-tests.sh`
- **No frontend changes** — rate limiting is transparent to the client (errors surface naturally)
- **Test suites unaffected** — `DISABLE_RATE_LIMIT=true` is set automatically in all test
  invocations
