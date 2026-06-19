#!/bin/sh
set -e
HOOK_DIR="$(git rev-parse --git-dir)/hooks"
cp scripts/git-hooks/commit-msg "$HOOK_DIR/commit-msg"
chmod +x "$HOOK_DIR/commit-msg"
echo "Installed commit-msg hook"
