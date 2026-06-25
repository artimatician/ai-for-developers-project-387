PORT ?= 8080

.DEFAULT_GOAL := help

.PHONY: help install dev test test-spec test-backend test-e2e test-e2e-browser build build-spec gen-types check doctor docker-prod install-hooks

help: ## @description List all targets with descriptions
	@printf 'Usage:\n'
	@printf '  make <target>\n\n'
	@printf 'Targets:\n'
	@grep -E '^[a-zA-Z0-9-]+:.*## @description' $(MAKEFILE_LIST) | awk -F ':.*## @description ' '{printf "  %-20s %s\n", $$1, $$2}'

install:  ## @description Install all dependencies (spec, frontend, backend, tests)
	cd spec && npm ci && cd ../frontend && npm ci && cd ../backend && pip install -r requirements.txt && cd ../tests && pip install -r requirements.txt

dev:  ## @description Start backend (4010) + frontend (3000) dev servers
	./start.sh

test-spec:  ## @description Run spec validation
	cd spec && npm test

test-backend:  ## @description Run backend tests
	cd backend && DISABLE_RATE_LIMIT=true python3 manage.py test

test-e2e:  ## @description Run E2E API-only tests (auto-starts backend)
	./tests/run-e2e-api.sh

test-e2e-browser:  ## @description Run E2E browser tests
	python3 -m pytest tests/ -v -m browser

test: test-spec test-backend test-e2e  ## @description Run all test suites sequentially

build:  ## @description Frontend production build
	cd frontend && npm run build

build-spec:  ## @description Compile TypeSpec to OpenAPI YAML
	cd frontend && npm run build:spec

gen-types:  ## @description Regenerate TypeScript types from OpenAPI spec
	cd frontend && npm run gen:types

check: test build  ## @description Run all tests + build (CI equivalent)

doctor:  ## @description Check system prerequisites and project deps
	@bash scripts/doctor.sh

docker-prod:  ## @description Build and run production Docker image
	docker build --target prod --build-arg PORT=$(PORT) -t calendar:prod . && docker run --rm -p $(PORT):$(PORT) -v calendar-data:/data -e PRODUCTION_DB=true -e PORT=$(PORT) calendar:prod

install-hooks:  ## @description Install git commit-msg hook (Conventional Commits)
	@bash scripts/install-hooks.sh
