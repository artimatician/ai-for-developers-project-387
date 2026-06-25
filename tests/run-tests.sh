#!/usr/bin/env bash
set -euo pipefail

export DISABLE_RATE_LIMIT=true

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT=4010
FRONTEND_PORT=3000
BACKEND_PID=""
FRONTEND_PID=""
EXIT_CODE=0

cleanup() {
  echo ""
  echo "Cleaning up..."
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  echo "Done."
}

trap cleanup EXIT

for port in $BACKEND_PORT $FRONTEND_PORT; do
  fuser -k "$port/tcp" 2>/dev/null || true
done
pkill -f "next dev" 2>/dev/null || true
sleep 1
rm -rf "$ROOT_DIR/frontend/.next/dev" 2>/dev/null || true

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$ROOT_DIR/frontend" && npm install
fi

if ! python3 -c "import django" 2>/dev/null; then
  echo "Installing backend dependencies..."
  python3 -m pip install -r "$ROOT_DIR/backend/requirements.txt" --break-system-packages 2>/dev/null || \
  python3 -m pip install django djangorestframework django-cors-headers --break-system-packages
fi

echo "=== Starting backend on port $BACKEND_PORT ==="
cd "$ROOT_DIR/backend"
python3 manage.py runserver 0.0.0.0:"$BACKEND_PORT" --noreload &
BACKEND_PID=$!

echo "Waiting for backend..."
for i in $(seq 1 15); do
  if curl -s --connect-timeout 1 "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "ERROR: Backend did not start within 15 seconds."
    exit 1
  fi
  sleep 1
done

echo "=== Starting frontend on port $FRONTEND_PORT ==="
cd "$ROOT_DIR/frontend"
npx next dev --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

echo "Waiting for frontend..."
for i in $(seq 1 30); do
  if curl -s --connect-timeout 1 "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
    echo "Frontend ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Frontend did not start within 30 seconds."
    exit 1
  fi
  sleep 2
done

echo "=== Running tests ==="
cd "$ROOT_DIR/tests"
python3 -m pytest -v --tb=short "$@" || EXIT_CODE=$?

exit $EXIT_CODE
