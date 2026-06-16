## 1. Create root Makefile

- [x] 1.1 Create `Makefile` at repo root with `.DEFAULT_GOAL := help` and `.PHONY` declaration for all targets
- [x] 1.2 Add `help` target that parses `## @description` comments above each target using `grep`/`sed`
- [x] 1.3 Add `install` target: `cd spec && npm ci && cd ../frontend && npm ci && cd ../backend && pip install -r requirements.txt && cd ../tests && pip install -r requirements.txt`
- [x] 1.4 Add `dev` target: `./start.sh`
- [x] 1.5 Add `test-spec` target: `cd spec && npm test`
- [x] 1.6 Add `test-backend` target: `cd backend && python3 manage.py test`
- [x] 1.7 Add `test-e2e` target: `python3 -m pytest tests/ -v -m "not browser"`
- [x] 1.8 Add `test-e2e-browser` target: `python3 -m pytest tests/ -v -m browser`
- [x] 1.9 Add `test` target that chains `test-spec`, `test-backend`, `test-e2e` with `&&`
- [x] 1.10 Add `build` target: `cd frontend && npm run build`
- [x] 1.11 Add `build-spec` target: `cd frontend && npm run build:spec`
- [x] 1.12 Add `gen-types` target: `cd frontend && npm run gen:types`
- [x] 1.13 Add `check` target that chains `test` and `build` with `&&`

## 2. Update AGENTS.md

- [x] 2.1 Add a `## Makefile` section to AGENTS.md listing available `make` targets as an alternative to individual commands
- [x] 2.2 Update the `## Commands` section to reference `make` shortcuts

## 4. Add doctor target

- [x] 4.1 Create `scripts/doctor.sh` with system prerequisite checks (node, npm, python3, pip3, make)
- [x] 4.2 Add project dependency checks to doctor.sh (spec/frontend node_modules, backend/test pip deps)
- [x] 4.3 Add `doctor` target to Makefile (thin delegation to scripts/doctor.sh)
- [x] 4.4 Add `doctor` to AGENTS.md Makefile table and Commands section
- [x] 4.5 Run `make doctor` and confirm output

## 3. Verify

- [x] 3.1 Run `make help` and confirm all targets are listed with descriptions
- [x] 3.2 Run `make test-spec` and confirm spec validation passes (32/32 passed)
- [x] 3.3 Run `make test-backend` and confirm backend tests pass (64/64 passed)
- [x] 3.4 Run `make build` and confirm frontend builds successfully (compiled in 5.0s)
