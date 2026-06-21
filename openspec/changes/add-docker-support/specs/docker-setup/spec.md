## ADDED Requirements

### Requirement: Multi-stage Dockerfile
The project SHALL provide a single `Dockerfile` with three named build stages: `base-deps`, `build`, and `prod`. The `build` stage SHALL produce the frontend artifacts (`standalone`, `.next/static/`, `public/`) for the `prod` target.

#### Scenario: Dockerfile targets are buildable
- **WHEN** running `docker build --target prod -t calendar:prod .`
- **THEN** the build SHALL succeed without errors

### Requirement: Prod target — nginx + supervisor, file-based database with WAL mode
The `prod` target SHALL run gunicorn (Django) and `next start` (built frontend) behind an nginx reverse proxy on port 8080, managed by supervisord. It SHALL support a persistent SQLite database at `/data/db.sqlite3` with WAL-mode optimizations, enabled via the `PRODUCTION_DB=true` environment variable.

#### Scenario: Prod serves frontend and API on single port
- **WHEN** running the `prod` container with port mapping `8080:8080` and `-e PRODUCTION_DB=true`
- **THEN** `GET /api/health` SHALL return a 200 response from Django
- **AND** `GET /` SHALL return the Next.js frontend page
- **AND** supervisord SHALL be managing nginx, gunicorn, and the Next.js process

#### Scenario: Prod persists data across container restarts
- **WHEN** running the `prod` container with `-e PRODUCTION_DB=true -v data:/data`
- **AND** a booking is created
- **AND** the container is restarted
- **THEN** the booking SHALL still exist after restart

#### Scenario: Prod uses WAL mode for concurrent reads
- **WHEN** running the `prod` container with `-e PRODUCTION_DB=true`
- **AND** inspecting the SQLite database journal mode
- **THEN** the journal mode SHALL be `wal`
- **AND** the busy timeout SHALL be 2000ms
- **AND** the synchronous mode SHALL be `NORMAL`

### Requirement: PRODUCTION_DB env var gates production database
The `PRODUCTION_DB=true` environment variable SHALL switch the backend from `:memory:` SQLite to a file-based SQLite at `/data/db.sqlite3` with production WAL-mode PRAGMAs. Without this variable, the default `:memory:` database SHALL be used.

#### Scenario: PRODUCTION_DB=true enables persistence
- **WHEN** running the backend with `PRODUCTION_DB=true`
- **THEN** the database SHALL be at `/data/db.sqlite3`
- **AND** the journal mode SHALL be WAL
- **AND** `SECRET_KEY` SHALL be auto-generated if not explicitly set

#### Scenario: Without PRODUCTION_DB, memory database is used
- **WHEN** running the backend without `PRODUCTION_DB`
- **THEN** the database SHALL be the default `:memory:` SQLite
- **AND** no WAL-mode optimizations SHALL be applied

### Requirement: docker-entrypoint runs database sync
The container entrypoint SHALL create the `/data/` directory if it does not exist, run `python manage.py migrate --run-syncdb` before starting any services, and ensure the database schema is up to date.

#### Scenario: Schema is applied on startup
- **WHEN** the container starts
- **THEN** `/data/` directory SHALL exist
- **AND** `manage.py migrate --run-syncdb` SHALL be executed before supervisord starts
- **AND** all database tables SHALL exist

### Requirement: Nginx reverse proxy configuration
The nginx config SHALL serve on port 8080 with four location blocks:

1. **Exact-match `/api/health`**: proxy to `http://localhost:4010/health` with path rewriting (Django serves health at `/health`).
2. **Prefix-match `/_next/static/`**: serve directly from the filesystem at `/app/.next/static/` with immutable caching headers.
3. **Prefix-match `/api/`**: proxy to `http://localhost:4010` preserving the full `/api/` path for all other API routes.
4. **Catch-all `/`**: proxy to `http://localhost:3000` (Next.js frontend).

All proxy locations SHALL set appropriate headers (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).

#### Scenario: Health endpoint is special-cased
- **WHEN** a request is made to `/api/health`
- **THEN** nginx SHALL forward the request to `http://localhost:4010/health` (prefix stripped)
- **AND** the response SHALL be from the Django backend
- **AND** no other `/api/` path SHALL have its prefix stripped

#### Scenario: Static assets are served directly by nginx
- **WHEN** a request is made to `/_next/static/chunks/foo.js`
- **THEN** nginx SHALL serve the file directly from `/app/.next/static/chunks/foo.js`
- **AND** the response SHALL include `Cache-Control: public, immutable`
- **AND** the response SHALL NOT be proxied to Next.js or Django

#### Scenario: Frontend requests are proxied to Next.js
- **WHEN** a request is made to `/`
- **THEN** nginx SHALL forward the request to `http://localhost:3000/`
- **AND** the response SHALL be from the Next.js server

### Requirement: .dockerignore excludes build artifacts
The `.dockerignore` file SHALL exclude `node_modules`, `__pycache__`, `.next`, `*.sqlite3`, `.git`, and other build artifacts from the Docker build context.

#### Scenario: Build artifacts are excluded
- **WHEN** building any Docker target
- **THEN** the build context SHALL NOT contain `node_modules`, `__pycache__`, `.next`, or `.git` directories

### Requirement: Makefile Docker target
The root `Makefile` SHALL provide a `docker-prod` target to build and run the production Docker image with the `PRODUCTION_DB=true` environment variable and a persistent volume mount at `/data/`.

#### Scenario: Make docker-prod builds and runs
- **WHEN** running `make docker-prod`
- **THEN** the `prod` target SHALL be built
- **AND** the container SHALL start with `-e PRODUCTION_DB=true` and a volume mount
