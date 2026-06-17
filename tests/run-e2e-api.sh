#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT=4010
BACKEND_PID=""
EXIT_CODE=0

cleanup() {
  echo ""
  echo "Cleaning up..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  echo "Done."
}

trap cleanup EXIT

# Free the port
fuser -k "$BACKEND_PORT/tcp" 2>/dev/null || true
sleep 1

# Start backend
echo "=== Starting backend on port $BACKEND_PORT ==="
cd "$ROOT_DIR/backend"
python3 manage.py runserver 0.0.0.0:"$BACKEND_PORT" --noreload &
BACKEND_PID=$!

# Wait for backend (poll /health, up to 15s)
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

# Run tests
echo "=== Running E2E API-only tests ==="
cd "$ROOT_DIR"
python3 -m pytest tests/ -v -m "not browser" "$@" || EXIT_CODE=$?

exit $EXIT_CODE
