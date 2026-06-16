# CI Capability

## Purpose

Define the CI/CD pipeline that validates changes to the Calendar application — including spec compilation, backend tests, and E2E API tests — to ensure all contributions meet quality standards before merging.

## Requirements

### Requirement: CI runs on push and pull request
The CI workflow SHALL trigger on every push to the `main` branch and on every pull request targeting `main`.

#### Scenario: Push to main triggers CI
- **WHEN** a commit is pushed to `main`
- **THEN** the CI workflow runs

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated against `main`
- **THEN** the CI workflow runs

### Requirement: Spec validation phase
The CI workflow SHALL compile the TypeSpec spec and run all validation checks (32 checks via `npm test` in `spec/`).

#### Scenario: Spec compiles and passes validation
- **WHEN** the spec validation phase runs
- **THEN** the TypeSpec compiler SHALL produce an OpenAPI YAML at `spec/tsp-output/@typespec/openapi3/openapi.yaml`
- **THEN** the validation script SHALL assert all 13 operations, 11 schemas, 5 path params, and 3 POST endpoints match expected values
- **THEN** the phase exits with code 0

#### Scenario: Spec compilation failure stops workflow
- **WHEN** the TypeSpec spec fails to compile
- **THEN** the spec validation phase SHALL exit with a non-zero code
- **THEN** the workflow SHALL fail immediately (no subsequent phases run)

### Requirement: Backend tests phase
The CI workflow SHALL run the Django backend test suite (54 tests) using Python 3.12.

#### Scenario: All backend tests pass
- **WHEN** the backend tests phase runs
- **THEN** `python backend/manage.py test` SHALL execute all 54 Django tests
- **THEN** the phase exits with code 0

#### Scenario: Backend test failure stops workflow
- **WHEN** any backend test fails
- **THEN** the backend tests phase SHALL exit with a non-zero code
- **THEN** the workflow SHALL fail immediately (E2E API phase does not run)

### Requirement: E2E API tests phase
The CI workflow SHALL start a fresh backend server and frontend dev server, run the 40 API-level E2E tests (skipping 5 browser tests), then clean up the servers.

#### Scenario: All E2E API tests pass
- **WHEN** the E2E API tests phase runs
- **THEN** the backend SHALL start on port 4010 from a fresh SQLite `:memory:` database
- **THEN** the frontend SHALL start on port 3000
- **THEN** pytest SHALL run with marker `-m "not browser"`, executing 40 API tests
- **THEN** the phase exits with code 0
- **THEN** both servers SHALL be stopped after the test run

#### Scenario: Backend server fails to start
- **WHEN** the backend server does not respond on port 4010 within 15 seconds
- **THEN** the E2E phase SHALL exit with a non-zero code
- **THEN** the workflow SHALL fail

#### Scenario: Frontend server fails to start
- **WHEN** the frontend server does not respond on port 3000 within 30 seconds
- **THEN** the E2E phase SHALL exit with a non-zero code
- **THEN** the workflow SHALL fail

#### Scenario: E2E test failure fails workflow
- **WHEN** any API-level E2E test fails
- **THEN** the E2E phase SHALL exit with a non-zero code
- **THEN** the workflow SHALL fail

### Requirement: Deterministic runtime versions
The CI workflow SHALL use pinned versions of Node.js and Python to ensure deterministic behavior across runs.

#### Scenario: Node 20 LTS is used
- **WHEN** the CI workflow runs
- **THEN** Node.js 20.x SHALL be installed and used for all npm operations

#### Scenario: Python 3.12 is used
- **WHEN** the CI workflow runs
- **THEN** Python 3.12 SHALL be installed and used for all pip and Python operations

### Requirement: Dependency caching
The CI workflow SHALL cache `node_modules` directories to reduce install time across runs.

#### Scenario: npm dependencies are cached
- **WHEN** the CI workflow runs and `spec/package-lock.json` has not changed
- **THEN** `spec/node_modules` SHALL be restored from cache (skipping `npm ci` when possible)

#### Scenario: Cache miss triggers full install
- **WHEN** the CI workflow runs and `spec/package-lock.json` or `frontend/package-lock.json` has changed
- **THEN** `npm ci` SHALL install from scratch and cache SHALL be updated for the next run
