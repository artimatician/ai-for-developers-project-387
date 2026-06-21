## 1. Project Configuration

- [x] 1.1 Create `.dockerignore` — exclude `node_modules`, `__pycache__`, `.next`, `*.sqlite3`, `.git`, `.venv`, `.env`, `.opencode`

## 2. Backend Configuration

- [x] 2.1 Modify `backend/config/settings.py` — add `PRODUCTION_DB=true` branch that sets file-based SQLite at `/data/db.sqlite3` with WAL-mode OPTIONS (`timeout=2`, `init_command` with `journal_mode=WAL`, `synchronous=NORMAL`, `journal_size_limit=65536`, `cache_size=-8000`) and auto-generated `SECRET_KEY` via `secrets.token_urlsafe(50)`; keep `DATABASE_URL` and `:memory:` fallbacks unchanged

## 3. Docker Infrastructure Configs

- [x] 3.1 Create `docker/nginx.conf` — 4 location blocks: exact-match `= /api/health` proxying to `localhost:4010/health` (prefix-stripped), `/_next/static/` alias to `/app/.next/static/` with immutable cache, `/api/` proxy to `localhost:4010` (full path), `/` proxy to `localhost:3000`; proxy headers on all upstream locations
- [x] 3.2 Create `docker/supervisord.conf` — `nodaemon=true`, 3 programs: nginx `daemon off`, gunicorn `config.wsgi:application` on `:4010` from `/app/backend`, `node /app/server.js` with `PORT=3000`; stdout/stderr log forwarding to `/dev/stdout`/`/dev/stderr`
- [x] 3.3 Create `docker/entrypoint.sh` — `mkdir -p /data`, `cd /app/backend`, `python manage.py migrate --run-syncdb`, set `API_URL="${API_URL:-http://localhost:4010}"`, `exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf`

## 4. Dockerfile (3 stages)

- [x] 4.1 Create `base-deps` stage — `FROM python:3.11-slim`, install curl + nginx + supervisor via apt, Node 20 from nodesource, then `pip install --no-cache-dir -r backend/requirements.txt`
- [x] 4.2 Create `build` stage — `FROM base-deps`, copy all source, run `npm ci && npm run build` in `frontend/`; produces `.next/standalone/`, `.next/static/`, `public/` artifacts
- [x] 4.3 Create `prod` target — `FROM build`, copy docker configs (`nginx.conf`, `supervisord.conf`, `entrypoint.sh`), `WORKDIR /app/backend`, `EXPOSE 8080`, `ENTRYPOINT ["/entrypoint.sh"]`

## 5. Makefile Targets

- [x] 5.1 Add `docker-prod` — build `prod` target, run with port `8080:8080`, volume `calendar-data:/data`, env `PRODUCTION_DB=true`

## 7. PORT environment variable support

- [x] 7.1 Modify `docker/nginx.conf` — replace `listen 8080` with `listen __PORT__` placeholder
- [x] 7.2 Modify `docker/entrypoint.sh` — read `${PORT:-8080}`, `sed`-replace `__PORT__` in nginx.conf before starting supervisord
- [x] 7.3 Modify `Dockerfile` — add `ARG PORT=8080`, `ENV PORT=$PORT`, change `EXPOSE 8080` to `EXPOSE $PORT`
- [x] 7.4 Modify `Makefile` — add `PORT ?= 8080`, pass `--build-arg PORT=$(PORT)` to docker build, pass `-e PORT=$(PORT)` and `-p $(PORT):$(PORT)` to docker run
- [x] 7.5 Verify PORT override works — build with `PORT=9090`, confirm container is reachable on port 9090 and `GET /api/health` returns 200

## 6. Verification

- [x] 6.1 Verify `make docker-prod` with persistence — nginx on 8080; `curl localhost:8080/api/health` returns `{"status":"ok"}`; `curl localhost:8080/` returns frontend HTML; `curl -sI localhost:8080/_next/static/chunks/<name>.js` returns 200 with `Cache-Control: public, immutable`; create a booking via API (`POST /api/bookings`), restart container, `GET /api/owner/bookings` returns the booking; without volume mount, data is lost on restart
