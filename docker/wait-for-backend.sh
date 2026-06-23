#!/bin/bash
set -e

BACKEND_URL="${API_URL:-http://localhost:4010}"
MAX_WAIT=30
INTERVAL=1

echo "Waiting for backend at $BACKEND_URL..."

for i in $(seq 1 $MAX_WAIT); do
  if curl -sf "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo "Backend is ready after ${i}s"
    exit 0
  fi
  echo "Attempt $i/$MAX_WAIT - backend not ready, waiting..."
  sleep $INTERVAL
done

echo "Backend health check failed after ${MAX_WAIT}s"
exit 1