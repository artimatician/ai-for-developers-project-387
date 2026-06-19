## 1. Project Configuration

- [ ] 1.1 Create `.dockerignore` — exclude `node_modules`, `__pycache__`, `.next`, `*.sqlite3`, `.git`, `.venv`, `.env`, `.opencode`

## 2. Docker Infrastructure Configs

- [ ] 2.1 Create `docker/nginx.conf` — 4 location blocks: exact-match `= /api/health` proxying to `localhost:4010/health` (prefix-stripped), `/_next/static/` alias to `/app/.next/static/` with immutable cache, `/api/` proxy to `localhost:4010` (full path), `/` proxy to `localhost:3000`; proxy headers on all upstream locations
- [ ] 2.2 Create `docker/supervisord.conf` — `nodaemon=true`, 3 programs: nginx `daemon off`, gunicorn `config.wsgi:application` on `:4010` from `/app/backend`, `node /app/server.js` with `PORT=3000`; stdout/stderr log forwarding to `/dev/stdout`/`/dev/stderr`
- [ ] 2.3 Create `docker/entrypoint.sh` (preprod/prod) — `cd /app/backend`, `python manage.py migrate --run-syncdb`, set `API_URL="${API_URL:-http://localhost:4010}"`, `exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf`
- [ ] 2.4 Create `docker/entrypoint-dev.sh` (dev) — `cd /app/backend`, `python manage.py migrate --run-syncdb`, start `manage.py runserver 0.0.0.0:4010 --noreload` + `next dev --port 3000` in parallel; no nginx, no supervisor

## 3. Dockerfile (5 stages, Option A — preprod inherits base-deps)

- [ ] 3.1 Create `base-deps` stage — `FROM python:3.11-slim`, install curl + nginx + supervisor via apt, Node 20 from nodesource, then `pip install --no-cache-dir -r backend/requirements.txt` (all pure Python wheels, no build tools needed)
- [ ] 3.2 Create `dev` target — `FROM base-deps`, expose 3000 4010, copy and set `entrypoint-dev.sh` as ENTRYPOINT; source code mounted via volume at runtime; no nginx/supervisor processes
- [ ] 3.3 Create `build` stage — `FROM base-deps`, copy all source, run `npm ci && npm run build` in `frontend/`; produces `.next/standalone/`, `.next/static/`, `public/` artifacts
- [ ] 3.4 Create `preprod` target — `FROM base-deps`, copy from `build`: `.next/standalone/.` → `/app/`, `.next/static/` → `/app/.next/static/`, `public/` → `/app/public/`, `backend/` → `/app/backend/`; copy docker configs; `WORKDIR /app/backend`, `EXPOSE 8080`, `ENTRYPOINT ["/entrypoint.sh"]`
- [ ] 3.5 Create `prod` target — `FROM preprod`, identical image; runtime behavior differs via `DATABASE_URL` env var for persistent SQLite on `/data/` volume

## 4. Makefile Targets

- [ ] 4.1 Add `docker-dev` — build `dev` target, run with `-v $(PWD):/app` and ports `3000:3000` `4010:4010`
- [ ] 4.2 Add `docker-preprod` — build `preprod` target, run with port `8080:8080`
- [ ] 4.3 Add `docker-prod` — build `prod` target, run with port `8080:8080`, volume `calendar-data:/data`, env `DATABASE_URL=sqlite:///data/db.sqlite3`

## 5. Verification

- [ ] 5.1 Verify `make docker-dev` — both servers start; `curl localhost:3000` returns frontend HTML; `curl localhost:4010/health` returns `{"status":"ok"}`; no nginx or supervisor processes in container
- [ ] 5.2 Verify `make docker-preprod` — nginx on 8080; `curl localhost:8080/api/health` returns `{"status":"ok"}` (via nginx prefix-stripping); `curl localhost:8080/` returns frontend HTML; `curl -sI localhost:8080/_next/static/` returns 200 with `Cache-Control: public, immutable`; no data persists after container restart
- [ ] 5.3 Verify `make docker-prod` — create a booking via API (`POST /api/bookings`), restart container, `GET /api/owner/bookings` returns the booking; without volume mount, data is lost on restart
