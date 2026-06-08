## 1. Event Types Spec

- [ ] 1.1 Write spec for owner CRUD operations (create, list, get, update)
- [ ] 1.2 Write spec for soft-delete behavior (isActive flag)
- [ ] 1.3 Write spec for guest visibility rules (active only, 404 if inactive)
- [ ] 1.4 Write spec for validation rules (name/description required, timezone IANA, max lengths)

## 2. Bookings Spec

- [ ] 2.1 Write spec for booking creation (validations, error codes, response shape)
- [ ] 2.2 Write spec for slot generation (14-day window, operating hours, 30-min slots, past slots)
- [ ] 2.3 Write spec for conflict detection (global booking conflicts, blackout conflicts)
- [ ] 2.4 Write spec for owner booking listing (pagination, filtering, sorting)

## 3. Blackouts Spec

- [ ] 2.1 Write spec for blackout creation (validations, required fields)
- [ ] 2.2 Write spec for blackout listing and deletion
- [ ] 2.3 Write spec for blocking behavior (overlapping slots marked unavailable)

## 4. Design Doc

- [ ] 4.1 Write architecture decisions (stack, models, views, URL routing)
- [ ] 4.2 Document design decisions (global conflicts, soft-delete, snapshot naming, slot algorithm)

## 5. Verification

- [ ] 5.1 Review all specs for accuracy against BACKEND_PLAN.md and TypeSpec spec
- [ ] 5.2 Verify spec scenarios match actual API behavior (run existing tests)
