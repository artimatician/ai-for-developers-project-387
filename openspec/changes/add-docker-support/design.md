## Context

The calendar app has three runtime components (Django backend, Next.js frontend, TypeSpec spec compiler) plus a test suite, all requiring manual dependency setup per environment. There is no containerization, no staging environment, and database data is always ephemeral (SQLite `:memory:`).

The backend (`backend/config/settings.py`) already supports `DATABASE_URL` via `dj-database-url` with `:memory:` fallback — no changes needed there. The frontend (`frontend/next.config.ts`) already uses `output: 'standalone'` — no changes needed there either.

## Goals / Non-Goals

**Goals:**
- Single `Dockerfile` with 5 stages (`base-deps`, `dev`, `build`, `preprod`, `prod`)
- `build` stage produces the frontend standalone output, `.next/static/`, and `public/` artifacts
- Dev: no nginx, no supervisor, `:memory:` database, hot-reload via volume mounts
- Preprod: nginx + supervisor, `:memory:` database, pre-built frontend
- Prod: nginx + supervisor, file-based SQLite with persistent volume
- Reverse proxy (nginx) serves frontend + API on single port (8080)
- `/_next/static/` served directly by nginx with aggressive caching
- `/api/health` special-cased to match Django's `/health` endpoint
- supervisord manages nginx, gunicorn (Django), and `next start` processes
- docker-entrypoint runs `migrate --run-syncdb` before starting services
- `Makefile` targets for `docker-dev`, `docker-preprod`, `docker-prod`

**Non-Goals:**
- Multi-container orchestration (single container per environment)
- CI pipeline changes (Docker can be integrated later)
- Deployment to cloud services (just the Docker image)
- Changing existing dev workflow (`make dev` / `start.sh` still works)

## Decisions

### Single Dockerfile with multi-stage targets
**Why**: One source of truth for containerization. Build with `docker build --target <target>` to select environment. Layers shared across targets via the common `base-deps` stage. A dedicated `build` stage runs `npm ci && npm run build` to produce frontend artifacts consumed by `preprod`/`prod`.

Stage inheritance:
```
base-deps ──┬── dev
            ├── build
            └── preprod ── prod
```
- **`base-deps`**: Python 3.11, Node 20, nginx, supervisor, pip packages (shared runtime deps)
- **`dev`**: inherits `base-deps`; source mounted via volume; separate entrypoint without supervisor
- **`build`**: inherits `base-deps`; full source copy; produces `.next/standalone/`, `.next/static/`, `public/`
- **`preprod`**: inherits `base-deps`; copies artifacts from `build`; full supervisor runtime
- **`prod`**: `FROM preprod` — identical image; behavior differs via `DATABASE_URL` env var only

### Base image: python:3.11-slim + Node 20 from nodesource
**Why**: `python:3.11-slim` is a minimal Debian base with Python 3.11 pre-installed. Node 20 is installed via the official NodeSource Debian repo. This avoids needing a separate Node base image while keeping the image slim.

### Nginx reverse proxy on port 8080
**Why**: Single port simplifies deployment. Nginx is lightweight, well-understood, and configured with a simple static config file. Four location blocks:

1. **`= /api/health`** — exact match, proxies to `http://localhost:4010/health` (prefix-stripped). Django serves health at `/health`, not `/api/health`, so nginx rewrites the path.
2. **`/_next/static/`** — served directly from disk at `/app/.next/static/` with `expires 365d` and `Cache-Control: public, immutable`. Bypasses Next.js server for optimal performance.
3. **`/api/`** — proxies to `http://localhost:4010` (full path preserved), passes through to Django REST API.
4. **`/`** — catches everything else, proxies to `http://localhost:3000` (Next.js standalone server).

### supervisord process manager
**Why**: Runs multiple processes (nginx, gunicorn, next) in a single container with proper restart behavior and log forwarding to stdout. Simple ini-based config, no additional runtime dependencies.

### Database persistence via volume mount
**Why**: Prod sets `DATABASE_URL=sqlite:///data/db.sqlite3` and a Docker volume is mounted at `/data/`. Preprod and dev omit this, keeping the `:memory:` default.

### No changes needed to backend/settings.py or next.config.ts
**Why**: Both files already support the required configuration via environment variables (`DATABASE_URL`, `API_URL`, `output: 'standalone'`).

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
- Everything runs behind nginx on port 8080

### Request routing flows

Two distinct request paths exist, depending on origin:

- **Client-side (browser → nginx → upstream)**: Browser requests `http://host:8080/api/event-types` → nginx proxies to `http://localhost:4010/api/event-types` (Django). For `GET /`, nginx proxies to `http://localhost:3000/` (Next.js). `/_next/static/*` is served directly from disk by nginx without reaching any upstream.

- **Server-side (Next.js SSR → Django directly)**: Next.js server-side data fetching calls the API client (`src/lib/api.ts`), which reads `API_URL` env var. Defaults to `http://localhost:4010`, so server-side requests go directly to Django, bypassing nginx entirely. This avoids a double-proxy hop.

- **`/api/health` routing**: nginx exact-match location strips the prefix, passing `/health` to Django on port 4010. This matches Django's actual route at `GET /health` (not `/api/health`).

## Risks / Trade-offs

- **Single container limits scaling**: Both frontend and backend run in the same container, so they can't be scaled independently. Acceptable for this project's scope (scheduling app, not high-traffic).
- **Next.js standalone output + static assets**: The `.next/standalone` plus `.next/static/` plus `public/` together must be copied into the runtime image. `.next/static/` contains client bundles that change every build — can't be cached across images.
- **SQLite concurrency**: File-based SQLite doesn't handle concurrent writes well. Acceptable for a single-container deployment.
