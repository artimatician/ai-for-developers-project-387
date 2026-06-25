## 1. DRF Throttle Class

- [x] 1.1 Create `backend/appointments/throttles.py` with `ClientAnonRateThrottle(AnonRateThrottle)`
  overriding `get_ident()` for `X-Forwarded-For` support and `allow_request()` for
  `DISABLE_RATE_LIMIT` bypass

## 2. DRF Exception Handler

- [x] 2.1 Create `backend/appointments/exceptions.py` with `custom_exception_handler` returning
  `{"code": "RATE_LIMITED", "message": "..."}` on `Throttled` exceptions

## 3. Settings Configuration

- [x] 3.1 Add `DEFAULT_THROTTLE_CLASSES` pointing to `appointments.throttles.ClientAnonRateThrottle`
- [x] 3.2 Add `DEFAULT_THROTTLE_RATES` with `anon` reading from `RATE_LIMIT_ANON` env var
  (default `60/minute`)
- [x] 3.3 Set `EXCEPTION_HANDLER` to `appointments.exceptions.custom_exception_handler`

## 4. nginx Configuration

- [x] 4.1 Add `limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m` at top of config
- [x] 4.2 Add `limit_req zone=api burst=20 nodelay` in `location /api/` block

## 5. Test Bypass Configuration

- [x] 5.1 Update `Makefile` test-backend target to run with `DISABLE_RATE_LIMIT=true`
- [x] 5.2 Add `export DISABLE_RATE_LIMIT=true` to `tests/run-e2e-api.sh`
- [x] 5.3 Add `export DISABLE_RATE_LIMIT=true` to `tests/run-tests.sh`

## 6. Verification

- [x] 6.1 Run `cd backend && DISABLE_RATE_LIMIT=true python3 manage.py test` — 64 tests pass
  (only pre-existing time-dependent failure)
