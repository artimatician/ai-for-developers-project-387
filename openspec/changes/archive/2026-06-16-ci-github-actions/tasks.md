## 1. Create CI workflow file

- [x] 1.1 Create `.github/workflows/ci.yml` with checkout, Node 20 LTS, Python 3.12 setup steps
- [x] 1.2 Add cache configuration for `spec/node_modules` and `frontend/node_modules` keyed by `package-lock.json` hash
- [x] 1.3 Add spec validation phase: `cd spec && npm ci && npm test`
- [x] 1.4 Add backend tests phase: `pip install -r backend/requirements.txt && python backend/manage.py test`
- [x] 1.5 Add E2E API tests phase: install frontend deps + test deps, then `./tests/run-tests.sh -m "not browser"`
- [x] 1.6 Set `timeout-minutes: 15` on the job

## 2. Verify (manual — requires push to GitHub)

- [x] 2.1 Push to a branch and confirm the workflow triggers and passes all three phases
- [x] 2.2 Introduce a deliberate spec error and confirm CI fails on the spec validation phase
- [x] 2.3 Confirm the workflow file has valid YAML syntax
