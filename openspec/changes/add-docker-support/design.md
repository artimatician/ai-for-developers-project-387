## Context

The calendar app has three runtime components (Django backend, Next.js frontend, TypeSpec spec compiler) plus a test suite, all requiring manual dependency setup per environment. There is no containerization and database data is always ephemeral (SQLite `:memory:`).

The backend (`backend/config/settings.py`) currently defaults to SQLite `:memory:` with a `DATABASE_URL` fallback via `dj-database-url`. The frontend (`frontend/next.config.ts`) already uses `output: 'standalone'` — no changes needed there.

## Goals / Non-Goals

**Goals:**
- Single `Dockerfile` with 3 stages (`base-deps`, `build`, `prod`)
- `build` stage produces the frontend standalone output, `.next/static/`, and `public/` artifacts
- `PRODUCTION_DB=true` env var switches from `:memory:` to file-based SQLite at `/data/db.sqlite3` with WAL-mode PRAGMA optimizations
- nginx reverse proxy serves frontend + API on a single port
- Container reads `PORT` env var (default 8080) to determine which port nginx listens on
- `/_next/static/` served directly by nginx with aggressive caching
- `/api/health` special-cased to match Django's `/health` endpoint
- supervisord manages nginx, gunicorn (Django), and `next start` processes
- docker-entrypoint runs `migrate --run-syncdb` before starting services
- `Makefile` target for `docker-prod`
- `SECRET_KEY` optional in production — auto-generated if not set

**Non-Goals:**
- Multi-container orchestration (single container)
- Dev or staging Docker environments (Docker is prod-only; dev uses `start.sh`)
- CI pipeline changes (Docker can be integrated later)
- Deployment to cloud services (just the Docker image)
- Changing existing dev workflow (`make dev` / `start.sh` still works)

## Decisions

### Single Dockerfile with multi-stage targets
**Why**: One source of truth for containerization. Build with `docker build --target prod` to produce the production image. Layers shared across stages via the common `base-deps` stage. A dedicated `build` stage runs `npm ci && npm run build` to produce frontend artifacts consumed by `prod`.

Stage inheritance:
```
base-deps
  ├── build
       └── prod
```
- **`base-deps`**: Python 3.11, Node 20, nginx, supervisor, pip packages (shared runtime deps)
- **`build`**: inherits `base-deps`; full source copy; runs `npm ci && npm run build`; produces `.next/standalone/`, `.next/static/`, `public/`
- **`prod`**: `FROM build`; copies docker configs and entrypoint; `WORKDIR /app/backend`, `EXPOSE 8080`, `ENTRYPOINT ["/entrypoint.sh"]`

### Base image: python:3.11-slim + Node 20 from nodesource
**Why**: `python:3.11-slim` is a minimal Debian base with Python 3.11 pre-installed. Node 20 is installed via the official NodeSource Debian repo. This avoids needing a separate Node base image while keeping the image slim.

### Nginx reverse proxy on configurable port via PORT env var
**Why**: Single port simplifies deployment. Nginx is lightweight, well-understood, and configured with a simple config file using a `__PORT__` placeholder replaced at startup. Four location blocks:

1. **`= /api/health`** — exact match, proxies to `http://localhost:4010/health` (prefix-stripped). Django serves health at `/health`, not `/api/health`, so nginx rewrites the path.
2. **`/_next/static/`** — served directly from disk at `/app/.next/static/` with `expires 365d` and `Cache-Control: public, immutable`. Bypasses Next.js server for optimal performance.
3. **`/api/`** — proxies to `http://localhost:4010` (full path preserved), passes through to Django REST API.
4. **`/`** — catches everything else, proxies to `http://localhost:3000` (Next.js standalone server).

### supervisord process manager
**Why**: Runs multiple processes (nginx, gunicorn, next) in a single container with proper restart behavior and log forwarding to stdout. Simple ini-based config, no additional runtime dependencies.

### Database persistence via PRODUCTION_DB env var
**Why**: A single `PRODUCTION_DB=true` environment variable gates the entire production database setup — switching from the default `:memory:` SQLite to a file-based SQLite at `/data/db.sqlite3` with WAL-mode PRAGMA optimizations. This is simpler than requiring users to construct a `DATABASE_URL` and avoids exposing internal configuration details.

The `DATABASE_URL` fallback via `dj-database-url` is retained for non-Docker scenarios where a custom database backend is needed.

### WAL-mode optimizations for production SQLite
**Why**: File-based SQLite without WAL has poor concurrent-read performance — readers block writers and vice versa. WAL (Write-Ahead Logging) mode allows concurrent reads during writes, which is critical for a read-heavy scheduling app. The following PRAGMAs are applied on every connection via Django's `OPTIONS['init_command']`:

| PRAGMA | Value | Rationale |
|--------|-------|-----------|
| `journal_mode=WAL` | WAL | Readers don't block writers; writers don't block readers. Persisted in the database file — set once, stays on across restarts. |
| `synchronous=NORMAL` | NORMAL | With WAL, `NORMAL` is crash-safe and ~2× faster than `FULL`. A crash at worst loses the last few transactions but never corrupts the database. |
| `busy_timeout` | 2000 | 2 seconds. In WAL mode, write conflicts are rare (only when two write transactions collide). This retries transient conflicts before returning `SQLITE_BUSY` to Django. |
| `journal_size_limit` | 65536 | Prevents the WAL file from growing unbounded. At 64 KB the WAL is checkpointed back into the main database. |
| `cache_size` | -8000 | 8 MB page cache (negative value = kilobytes). Adequate for this data volume (three small tables with UUID PKs). |

Using `init_command` means these run on every new connection (idempotent — once WAL mode is set at the file level, the PRAGMA is a no-op). The `timeout=2` option maps directly to SQLite's `busy_timeout`.

### PORT env var configures nginx listen port
**Why**: Port flexibility is important in deployments where 8080 is already in use (e.g., multiple services on same host, constrained cloud environments). A `PORT` environment variable (standard container convention) lets users choose the container's external port without modifying configuration files.

**How**: nginx does not support environment variables in `listen` or `server` directives, so a `sed`-based templating approach is used:
- `nginx.conf` uses a distinct `__PORT__` placeholder: `listen __PORT__;`
- `entrypoint.sh` reads `${PORT:-8080}` and replaces the placeholder before starting supervisord: `sed -i "s/__PORT__/$PORT/g" /etc/nginx/sites-enabled/default`
- `Dockerfile` sets `ENV PORT=8080` and `EXPOSE $PORT` (using `ARG PORT=8080` since `EXPOSE` does not support `ENV` directly)
- `Makefile` uses `PORT ?= 8080` and passes `--build-arg PORT=$(PORT)` to `docker build`, `-e PORT=$(PORT) -p $(PORT):$(PORT)` to `docker run`

A distinct `__PORT__` placeholder was chosen over `envsubst` to avoid accidentally substituting `$VAR` references in `proxy_pass` or other nginx directives.

### SECRET_KEY auto-generation in production
**Why**: The app doesn't use sessions, CSRF, auth, or any cryptographic signing features (see `settings.py`: empty `DEFAULT_AUTHENTICATION_CLASSES`, no `SessionMiddleware`, no `CsrfViewMiddleware`). SECRET_KEY is unused at runtime. When `PRODUCTION_DB=true`, a random 50-character key is generated via `secrets.token_urlsafe(50)` if `SECRET_KEY` is not explicitly set. This avoids linter warnings about hardcoded keys while keeping the env var optional.

### No other changes needed to settings.py or next.config.ts
**Why**: The frontend already uses `output: 'standalone'`. The backend's `DATABASE_URL` fallback and the new `PRODUCTION_DB` branch handle all database configuration needs. `API_URL` defaults to `http://localhost:4010` which is correct for server-side Next.js → Django communication within the container.

### Container directory layout

```
/app/
  server.js                  # Next.js standalone entry point
  package.json               # Next.js standalone metadata
  node_modules/              # Next.js runtime dependencies (minimal)
  .next/
    BUILD_ID                 # Build identifier
    server/                  # Server-side route handlers
    static/                  # Client-side JS/CSS bundles (copied from build output)
  public/                    # Static assets (SVGs, favicon)
  backend/
    manage.py                # Django management script
    config/                  # Django settings, URLs, WSGI
    appointments/            # Django app
/data/                       # Docker volume mount for persistent SQLite (prod only)
```

- Django runs from `/app/backend/` (WORKDIR)
- Next.js standalone runs from `/app/` (server.js at root)
- nginx serves `/_next/static/*` from `/app/.next/static/`
- Everything runs behind nginx on the port specified by the `PORT` env var (default 8080)

### Request routing flows

Two distinct request paths exist, depending on origin:

- **Client-side (browser → nginx → upstream)**: Browser requests `http://host:8080/api/event-types` → nginx proxies to `http://localhost:4010/api/event-types` (Django). For `GET /`, nginx proxies to `http://localhost:3000/` (Next.js). `/_next/static/*` is served directly from disk by nginx without reaching any upstream.

- **Server-side (Next.js SSR → Django directly)**: Next.js server-side data fetching calls the API client (`src/lib/api.ts`), which reads `API_URL` env var. Defaults to `http://localhost:4010`, so server-side requests go directly to Django, bypassing nginx entirely. This avoids a double-proxy hop.

- **`/api/health` routing**: nginx exact-match location strips the prefix, passing `/health` to Django on port 4010. This matches Django's actual route at `GET /health` (not `/api/health`).

### Entrypoint behavior

The `docker/entrypoint.sh` script:
1. Creates `/data/` directory (important for first run — the Docker volume has no pre-created path)
2. Reads `${PORT:-8080}` and replaces the `__PORT__` placeholder in nginx.conf via `sed`
3. Sets `API_URL="${API_URL:-http://localhost:4010}"`
4. Runs `python manage.py migrate --run-syncdb` from `/app/backend`
5. Exec supervisord

## Risks / Trade-offs

- **Single container limits scaling**: Both frontend and backend run in the same container, so they can't be scaled independently. Acceptable for this project's scope (scheduling app, not high-traffic).
- **Next.js standalone output + static assets**: The `.next/standalone` plus `.next/static/` plus `public/` together must be copied into the runtime image. `.next/static/` contains client bundles that change every build — can't be cached across images.
- **SQLite concurrency**: WAL mode dramatically improves concurrent-read performance but write concurrency remains limited. Acceptable for a single-container deployment with modest write volume.
- **PRODUCTION_DB is a boolean gate**: No support for customizing the database path or connection parameters via env vars beyond the `PRODUCTION_DB` switch itself. If custom paths are needed, the `DATABASE_URL` fallback can be used instead (but without the WAL-mode optimizations).
