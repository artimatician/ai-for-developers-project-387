No behavioral specs changed. The Makefile is a developer-experience layer that wraps existing commands without modifying any requirements.

## Targets added

- **doctor** — Read-only diagnostic of system prerequisites (node, npm, python3, pip3, make) and project dependency status (node_modules, pip packages). Delegates to `scripts/doctor.sh`.
