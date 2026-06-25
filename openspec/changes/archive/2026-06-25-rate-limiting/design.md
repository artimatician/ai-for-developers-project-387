## Context

The API currently has no request throttling at any layer. The Django backend runs SQLite
(`:memory:` or file-based) with no connection pooling — unbounded requests can cause memory
pressure and slowdowns. In production behind nginx, there is no first-line defense either.

The project follows a specific error format (`{"code": "...", "message": "..."}`), so the
429 response must match this convention.

## Goals / Non-Goals

**Goals:**
- Add DRF `AnonRateThrottle` to all API endpoints with configurable rate (default 60/min)
- Add nginx `limit_req` zone at 30r/m with 20 burst for production flood protection
- Support `X-Forwarded-For` header for correct client IP detection behind nginx
- Return consistent JSON error format on 429
- Provide `DISABLE_RATE_LIMIT` env var to bypass throttling in tests
- Configure all test runners (Makefile, E2E scripts) to set `DISABLE_RATE_LIMIT=true`

**Non-Goals:**
- No per-user or per-endpoint throttling (all endpoints share the same `anon` scope)
- No frontend changes — the existing `api.ts` client handles error responses generically
- No API spec changes — rate limiting is an operational concern, not a behavioral one
- No hard DELETE or IP blocklisting — nginx is the outermost defense

## Decisions

### D1: Two-layer defense (nginx + DRF)
nginx provides a lightweight first-line defense (30r/m + burst) that rejects floods before they
reach Django. DRF provides a slower but more configurable throttle (60/min) with proper JSON
error responses. The nginx limit is intentionally stricter — it's a safety net; the DRF limit
is the user-facing throttle.

### D2: `X-Forwarded-For` with `REMOTE_ADDR` fallback
In production (Docker + nginx), `REMOTE_ADDR` is always the nginx container IP. The real client
IP is in `X-Forwarded-For`. In development (direct access to Django dev server), `REMOTE_ADDR`
is the actual client IP. The throttle checks `X-Forwarded-For` first, falls back to
`REMOTE_ADDR`.

### D3: `AnonRateThrottle` (not `UserRateThrottle` or custom scope)
The project has no auth — all requests are anonymous. `AnonRateThrottle` maps to the `anon`
scope, which is configured in `DEFAULT_THROTTLE_RATES` via the `RATE_LIMIT_ANON` env var.

### D4: `DISABLE_RATE_LIMIT` env var
Tests make ~180-200 API calls in under 30s, which would hit the 60/min limit. Rather than
modifying test code, a simple env var bypass in the throttle class keeps tests clean. Set in
`Makefile` and both E2E test shell scripts.

### D5: nginx `limit_req_zone` at `http` level
The zone declaration must be outside the `server` block (at `http` level in the nginx config
hierarchy). Since this project's `docker/nginx.conf` is a standalone file included directly in
`server` context, the zone is placed at the top (outside `server`). In Docker, this maps to
the `http` block.

### D6: DRF rate limit higher than nginx (60/min vs 30/min)
nginx is the flood gate — it's cheap, fast, and returns 503 (HTML). DRF is the user-facing
throttle — it returns JSON with a meaningful retry message. The DRF rate is deliberately higher
so that legitimate traffic rejected at nginx level (due to burst) still has headroom at the DRF
layer.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **nginx returns HTML on 503** | Acceptable — nginx is the outermost defense. Users hitting it are likely automated/burst traffic, not real users. DRF returns proper JSON for legitimate clients. |
| **Throttle key collisions behind shared NAT** | `X-Forwarded-For` may contain shared IPs (office NAT, VPN). Acceptable — the 60/min rate is generous enough for shared environments. |
| **Rate limit discovered in E2E tests** | `DISABLE_RATE_LIMIT=true` is set in all test entry points. No test code changes needed. |
| **Redis/memcached not available** | DRF's `AnonRateThrottle` uses the default cache backend (Django's local-memory cache). Acceptable for this scale — no external cache dependency. |
