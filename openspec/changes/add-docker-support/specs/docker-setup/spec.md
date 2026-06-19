## ADDED Requirements

### Requirement: Multi-stage Dockerfile
The project SHALL provide a single `Dockerfile` with five named build stages: `base-deps`, `dev`, `build`, `preprod`, and `prod`. The `build` stage SHALL produce the frontend artifacts (`standalone`, `.next/static/`, `public/`) for the `preprod` and `prod` targets.

#### Scenario: Dockerfile targets are buildable
- **WHEN** running `docker build --target <target> -t calendar:<target> .` for each of `dev`, `build`, `preprod`, `prod`
- **THEN** each build SHALL succeed without errors

### Requirement: Dev target — no nginx, no supervisor, memory database
The `dev` target SHALL run the Django development server and `next dev` without nginx or supervisord, using the default `:memory:` SQLite database.

#### Scenario: Dev starts both servers
- **WHEN** running the `dev` container with port mappings
- **THEN** the Django dev server SHALL be available on port 4010 and the Next.js dev server on port 3000
- **AND** there SHALL be no nginx or supervisord processes running

### Requirement: Preprod target — nginx + supervisor, memory database
The `preprod` target SHALL run gunicorn (Django) and `next start` (built frontend) behind an nginx reverse proxy on port 8080, managed by supervisord, using the default `:memory:` SQLite database. It SHALL copy the standalone server, `.next/static/`, and `public/` from the `build` stage, and SHALL inherit Python packages and runtime tools from `base-deps` (not install them fresh).

#### Scenario: Preprod serves frontend and API on single port
- **WHEN** running the `preprod` container with port mapping `8080:8080`
- **THEN** `GET /api/health` SHALL return a 200 response from Django
- **AND** `GET /` SHALL return the Next.js frontend page
- **AND** supervisord SHALL be managing nginx, gunicorn, and the Next.js process

### Requirement: Prod target — nginx + supervisor, file-based database
The `prod` target SHALL support a persistent SQLite database via the `DATABASE_URL` environment variable, with a Docker volume mounted at `/data/`. The process management SHALL be identical to preprod.

#### Scenario: Prod persists data across container restarts
- **WHEN** running the `prod` container with `-e DATABASE_URL=sqlite:///data/db.sqlite3 -v data:/data`
- **AND** a booking is created
- **AND** the container is restarted
- **THEN** the booking SHALL still exist after restart

### Requirement: docker-entrypoint runs database sync
The container entrypoint SHALL run `python manage.py migrate --run-syncdb` before starting any services, ensuring the database schema is up to date.

#### Scenario: Schema is applied on startup
- **WHEN** the container starts
- **THEN** `manage.py migrate --run-syncdb` SHALL be executed before supervisord (or dev servers) starts
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

### Requirement: Makefile Docker targets
The root `Makefile` SHALL provide `docker-dev`, `docker-preprod`, and `docker-prod` targets to build and run the corresponding Docker images.

#### Scenario: Make docker-dev builds and runs
- **WHEN** running `make docker-dev`
- **THEN** the `dev` target SHALL be built and the container SHALL start with appropriate volume mounts and port mappings
