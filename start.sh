#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=4010
FRONTEND_PORT=3000
BACKEND_PID=""

cleanup() {
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null
    wait "$BACKEND_PID" 2>/dev/null || true
    echo ""
    echo "Backend server stopped."
  fi
}

trap cleanup EXIT

echo "Cleaning up existing processes on ports $BACKEND_PORT and $FRONTEND_PORT..."
for port in $BACKEND_PORT $FRONTEND_PORT; do
  fuser -k "$port/tcp" >/dev/null 2>&1 || true
done
pkill -f "next dev" 2>/dev/null || true
sleep 1
rm -rf "$ROOT_DIR/frontend/.next/dev" 2>/dev/null || true

# Install backend dependencies if missing
if ! python3 -c "import django" 2>/dev/null; then
  echo "Installing backend dependencies..."
  python3 -m pip install -r "$ROOT_DIR/backend/requirements.txt" --break-system-packages 2>/dev/null || \
  python3 -m pip install django djangorestframework django-cors-headers --break-system-packages
fi

# Compile TypeSpec spec if output missing
if [ ! -f "$ROOT_DIR/spec/tsp-output/@typespec/openapi3/openapi.yaml" ]; then
  echo "Compiling TypeSpec spec..."
  cd "$ROOT_DIR/spec" && npm install 2>/dev/null && npx tsp compile main.tsp
fi

# Install frontend dependencies if missing
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$ROOT_DIR/frontend" && npm install
fi

# Regenerate TypeScript types if missing
if [ ! -f "$ROOT_DIR/frontend/src/lib/api-types.ts" ]; then
  echo "Generating TypeScript types..."
  cd "$ROOT_DIR/frontend" && npm run gen:types
fi

echo ""
echo "=== Starting Django backend on port $BACKEND_PORT ==="
cd "$ROOT_DIR/backend"
python3 manage.py runserver 0.0.0.0:"$BACKEND_PORT" --noreload &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
for i in $(seq 1 15); do
  if curl -s --connect-timeout 1 "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "Backend is ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "ERROR: Backend did not start within 15 seconds."
    exit 1
  fi
  sleep 1
done

echo ""
echo "=== Starting Next.js frontend on port $FRONTEND_PORT ==="
echo "Press Ctrl+C to stop all servers."
echo ""
cd "$ROOT_DIR/frontend"
npx next dev --port "$FRONTEND_PORT"
