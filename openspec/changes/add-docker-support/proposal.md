## Why

The app currently requires manual dependency setup (system Python, Node.js, pip install, npm install, database config) across environments. Docker eliminates this friction and enables a single-command production deployment.

## What Changes

- Single multi-stage `Dockerfile` with 3 targets: `base-deps`, `build`, `prod`
- `.dockerignore` to exclude build artifacts from the Docker context
- Infrastructure configs: nginx reverse proxy, supervisord process manager, docker entrypoint script
- `backend/config/settings.py`: add `PRODUCTION_DB=true` env var support — enables file-based SQLite at `/data/db.sqlite3` with WAL-mode optimizations; `SECRET_KEY` auto-generated if unset
- `Makefile` target: `docker-prod`
- No API changes, no behavioral changes to existing features

## Capabilities

### New Capabilities
- `docker-setup`: Docker infrastructure for the calendar app — multi-stage Dockerfile, reverse proxy config, process management, persistent SQLite with WAL-mode production database

### Modified Capabilities
*(none — this change is infrastructure-only, no spec-level behavior changes)*

## Impact

- **Files added**: `Dockerfile`, `.dockerignore`, `docker/nginx.conf`, `docker/supervisord.conf`, `docker/entrypoint.sh`
- **Files modified**: `backend/config/settings.py`, `Makefile`
- **Dependencies added**: nginx (runtime), supervisor (runtime) — in Docker image only, not host
- **No API, schema, or frontend changes**
