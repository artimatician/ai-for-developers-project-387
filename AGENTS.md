# Calendar (Schedule a Call)

Early-stage project — only the **TypeSpec API spec** exists. No backend/frontend implemented yet.

## Commands

```sh
cd spec && npm install && npm test   # compile TypeSpec + run 32 validation checks
```

## Structure

- `spec/*.tsp` — TypeSpec API spec (entrypoint `main.tsp`, models, owner/guest ops)
- `PLAN.md` — full design doc (data models, endpoints, business rules, slot algorithm)

## Key conventions

- Backend: Django + DRF REST API under `/api/` (not built yet)
- Frontend: Next.js (not built yet)
- All endpoints under `/api`, no version prefix
- Owner endpoints prefixed `/api/owner/`, guest endpoints `/api/`
- UUID v4 resource IDs, ISO 8601 UTC datetimes
- 30-min fixed slot duration, 09:00–18:00 operating hours (per-event-type timezone)
- No auth, no guest cancellation, no hard DELETE on event types (soft-delete via `isActive`)
- Generated build artifacts: `spec/tsp-output/` (gitignored)

## Spec conventions

- TypeSpec `namespace` blocks (not `interface`), `@route` for path prefixing (no `@autoRoute`)
- `@doc` on every model + operation
- `Error` model marked `@error`; operations return union types for error responses
- Server-generated fields (`id`, `createdAt`, etc.) omitted from request models

## Validation

`npm test` in `spec/` compiles `.tsp` → OpenAPI YAML and asserts:
- 13 operations with exact `operationId` values (e.g. `Owner_listEventTypes`)
- 11 schemas, 5 path params, 3 POST endpoints
