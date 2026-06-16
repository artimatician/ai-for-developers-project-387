#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$(dirname "${BASH_SOURCE[0]}")")" && pwd)"

pass_count=0
fail_count=0

check() {
  local label="$1"
  local result="$2"
  local hint="${3:-}"

  if [ "$result" = "0" ]; then
    echo "  PASS    $label"
    pass_count=$((pass_count + 1))
  else
    if [ -n "$hint" ]; then
      echo "  FAIL    $label    $hint"
    else
      echo "  FAIL    $label"
    fi
    fail_count=$((fail_count + 1))
  fi
}

echo "[ System Prerequisites ]"

node_version=$(node --version 2>/dev/null || true)
check "node" "$( [ -n "$node_version" ] && echo 0 || echo 1 )" "Install Node.js (https://nodejs.org)"

npm_version=$(npm --version 2>/dev/null || true)
check "npm" "$( [ -n "$npm_version" ] && echo 0 || echo 1 )" "Install npm (bundled with Node.js)"

python3_version=$(python3 --version 2>/dev/null || true)
check "python3" "$( [ -n "$python3_version" ] && echo 0 || echo 1 )" "Install Python 3 (https://python.org)"

pip3_version=$(pip3 --version 2>/dev/null || true)
check "pip3" "$( [ -n "$pip3_version" ] && echo 0 || echo 1 )" "Install pip3 (python3 -m ensurepip)"

make_version=$(make --version 2>/dev/null || true)
check "make" "$( [ -n "$make_version" ] && echo 0 || echo 1 )" "Install GNU Make"

echo ""
echo "[ Project Dependencies ]"

spec_node_modules="0"
if [ -d "$ROOT_DIR/spec/node_modules" ]; then
  spec_node_modules="0"
else
  spec_node_modules="1"
fi
check "spec/node_modules" "$spec_node_modules" "Run: cd spec && npm ci"

frontend_node_modules="0"
if [ -d "$ROOT_DIR/frontend/node_modules" ]; then
  frontend_node_modules="0"
else
  frontend_node_modules="1"
fi
check "frontend/node_modules" "$frontend_node_modules" "Run: cd frontend && npm ci"

backend_django="1"
if python3 -c "import django" 2>/dev/null; then
  backend_django="0"
fi
check "backend (django)" "$backend_django" "Run: cd backend && pip install -r requirements.txt"

tests_requests="1"
if python3 -c "import requests" 2>/dev/null; then
  tests_requests="0"
fi
check "tests (requests)" "$tests_requests" "Run: cd tests && pip install -r requirements.txt"

echo ""
echo "Result: $fail_count issue(s) found"
if [ "$fail_count" -gt 0 ]; then
  echo "Run 'make install' to fix project dependencies"
fi
