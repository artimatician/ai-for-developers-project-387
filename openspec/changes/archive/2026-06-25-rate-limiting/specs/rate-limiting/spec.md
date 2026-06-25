## ADDED Requirements

### Requirement: DRF rate limits API requests
The system SHALL throttle API requests per IP address using Django REST Framework's
`AnonRateThrottle`, configurable via the `RATE_LIMIT_ANON` environment variable (default
`60/minute`).

#### Scenario: Request under limit succeeds
- GIVEN a client IP has made fewer than 60 requests in the last minute
- WHEN the client sends a request to any `/api/` endpoint
- THEN the system SHALL return the normal response
- AND the system SHALL NOT apply any throttling

#### Scenario: Request over limit returns 429
- GIVEN a client IP has made 60 or more requests in the last minute
- WHEN the client sends another request to any `/api/` endpoint
- THEN the system SHALL return status 429
- AND the response SHALL have `{"code": "RATE_LIMITED", "message": "Too many requests. Try again in N seconds."}`

#### Scenario: Rate limit bypassed in test mode
- GIVEN the `DISABLE_RATE_LIMIT` environment variable is set to `true` or `1`
- WHEN the client sends any number of requests to any `/api/` endpoint
- THEN the system SHALL NOT apply throttling

### Requirement: DRF throttle detects client IP via proxy headers
The throttle SHALL read the `X-Forwarded-For` header first for proxy environments, falling
back to `REMOTE_ADDR` for direct connections.

#### Scenario: Client IP from X-Forwarded-For
- GIVEN the request includes an `X-Forwarded-For` header with value `203.0.113.1, 10.0.0.1`
- WHEN the throttle identifies the client
- THEN it SHALL use `203.0.113.1` as the client identifier

#### Scenario: Client IP from REMOTE_ADDR
- GIVEN the request has no `X-Forwarded-For` header
- WHEN the throttle identifies the client
- THEN it SHALL use the `REMOTE_ADDR` value as the client identifier

### Requirement: DRF rate is configurable via environment variable
The system SHALL read the rate limit from the `RATE_LIMIT_ANON` environment variable, defaulting
to `60/minute`.

#### Scenario: Custom rate limit
- GIVEN `RATE_LIMIT_ANON` is set to `120/minute`
- WHEN the client sends requests
- THEN the system SHALL allow up to 120 requests per minute before returning 429

### Requirement: nginx rate limits /api/ requests
The nginx reverse proxy SHALL apply a `limit_req` zone of 30 requests per minute with a burst
of 20 on the `/api/` location.

#### Scenario: nginx rejects flood requests
- GIVEN a client sends more than 50 requests per minute (30 rate + 20 burst) to `/api/`
- WHEN the nginx limit is exceeded
- THEN nginx SHALL return status 503

#### Scenario: nginx allows normal traffic
- GIVEN a client sends requests at or below 30 per minute to `/api/`
- WHEN the requests reach nginx
- THEN nginx SHALL proxy them to the backend without rejection

### Requirement: Error response format matches project convention
All 429 responses from DRF SHALL follow the project's standard error format:
`{"code": "RATE_LIMITED", "message": "..."}`.

#### Scenario: 429 error format
- WHEN the system returns a 429 response
- THEN the response body SHALL contain `code` set to `"RATE_LIMITED"`
- AND `message` SHALL contain the retry time in seconds
