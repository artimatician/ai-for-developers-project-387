#!/usr/bin/env bash
set -euo pipefail

PRISM_PORT=4010
DEV_PORT=3000
PRISM_PID=""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  if [ -n "$PRISM_PID" ] && kill -0 "$PRISM_PID" 2>/dev/null; then
    kill "$PRISM_PID" 2>/dev/null
    wait "$PRISM_PID" 2>/dev/null || true
    echo ""
    echo "Mock API server stopped."
  fi
}

trap cleanup EXIT

# Kill any existing dev servers on the target ports
for port in $PRISM_PORT $DEV_PORT; do
  fuser -k "$port/tcp" 2>/dev/null || true
done

# Kill any lingering Next.js dev server processes (they use .next/dev/ for tracking)
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Clean up stale Next.js dev state so it doesn't think another instance is running
rm -rf "$SCRIPT_DIR/.next/dev" 2>/dev/null || true

echo
echo "=== Compiling TypeSpec to OpenAPI ==="
cd "$SCRIPT_DIR/../spec"
npx tsp compile main.tsp

echo ""
echo "=== Starting Prism mock API server on port $PRISM_PORT ==="
cd "$SCRIPT_DIR"
npx prism mock "../spec/tsp-output/@typespec/openapi3/openapi.yaml" --port "$PRISM_PORT" &
PRISM_PID=$!

echo "Waiting for mock API server to be ready..."
for i in $(seq 1 30); do
  if curl -s --connect-timeout 1 "http://localhost:$PRISM_PORT/health" > /dev/null 2>&1; then
    echo "Mock API server is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Mock API server did not start within 30 seconds."
    exit 1
  fi
  sleep 1
done

echo ""
echo "=== Starting Next.js dev server on port $DEV_PORT ==="
echo "Press Ctrl+C to stop all servers."
echo ""

cd "$SCRIPT_DIR"
npx next dev --port "$DEV_PORT"
