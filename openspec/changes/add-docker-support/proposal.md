## Why

The app currently requires manual dependency setup (system Python, Node.js, pip install, npm install, database config) across environments. Docker eliminates this friction, ensures identical environments for dev/staging/production, and enables a pre-production staging environment that mirrors production infrastructure without requiring persistent storage.

## What Changes

- Single multi-stage `Dockerfile` with 4 targets: `base-deps`, `dev`, `preprod`, `prod`
- `.dockerignore` to exclude build artifacts from the Docker context
- Infrastructure configs: nginx reverse proxy, supervisord process manager, docker entrypoint script
- `backend/config/settings.py`: read `DATABASE_URL` via `dj-database-url` with `:memory:` fallback
- `Makefile` targets: `docker-dev`, `docker-preprod`, `docker-prod`
- No API changes, no behavioral changes to existing features

## Capabilities

### New Capabilities
- `docker-setup`: Docker infrastructure for the calendar app — multi-stage Dockerfile, reverse proxy config, process management, persistent vs ephemeral database configuration

### Modified Capabilities
*(none — this change is infrastructure-only, no spec-level behavior changes)*

## Impact

- **Files added**: `Dockerfile`, `.dockerignore`, `docker/nginx.conf`, `docker/supervisord.conf`, `docker/entrypoint.sh`
- **Files modified**: `backend/config/settings.py`, `Makefile`
- **Dependencies added**: nginx (runtime), supervisor (runtime) — in Docker images only, not host
- **No API, schema, or frontend changes**
