.DEFAULT_GOAL := help

.PHONY: help install dev test test-spec test-backend test-e2e test-e2e-browser build build-spec gen-types check doctor

help:  ## @description List all targets with descriptions
	@printf '\033[33mUsage:\033[0m\n'
	@printf '  make \033[36m<target>\033[0m\n\n'
	@printf '\033[33mTargets:\033[0m\n'
	@grep -E '^[a-zA-Z0-9_-]+:.*## @description' $(MAKEFILE_LIST) | awk -F ':.*## @description ' '{printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## @description Install all dependencies (spec, frontend, backend, tests)
	cd spec && npm ci && cd ../frontend && npm ci && cd ../backend && pip install -r requirements.txt && cd ../tests && pip install -r requirements.txt

dev:  ## @description Start backend (4010) + frontend (3000) dev servers
	./start.sh

test-spec:  ## @description Run spec validation
	cd spec && npm test

test-backend:  ## @description Run backend tests
	cd backend && python3 manage.py test

test-e2e:  ## @description Run E2E API-only tests
	python3 -m pytest tests/ -v -m "not browser"

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
