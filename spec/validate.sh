#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$ROOT/tsp-output/@typespec/openapi3/openapi.yaml"
PASS=0
FAIL=0

green() { echo -e "\033[32m✓ $1\033[0m"; PASS=$((PASS + 1)); }
red()   { echo -e "\033[31m✗ $1\033[0m"; FAIL=$((FAIL + 1)); }

# ----- 1. Compilation -----
echo "--- Test: Compilation ---"
RC=0
"$ROOT/node_modules/.bin/tsp" compile . > /dev/null 2>&1 || RC=$?
if [ "$RC" -eq 0 ]; then
  green "tsp compile . succeeded (exit 0)"
else
  red "tsp compile . failed (exit $RC)"
fi

if [ -f "$OUTPUT" ]; then
  green "OpenAPI output exists at $OUTPUT"
else
  red "OpenAPI output not found"
fi

# ----- 2. Operation count -----
echo -e "\n--- Test: Operation count ---"
OP_COUNT=$(grep -c 'operationId:' "$OUTPUT" 2>/dev/null || echo 0)
if [ "$OP_COUNT" -eq 13 ]; then
  green "Expected 13 operations, found $OP_COUNT"
else
  red "Expected 13 operations, found $OP_COUNT"
fi

# ----- 3. Expected operation IDs -----
echo -e "\n--- Test: Operation IDs ---"
EXPECTED_OPS=(
  "Owner_listEventTypes"
  "Owner_createEventType"
  "Owner_getEventType"
  "Owner_updateEventType"
  "Owner_listBookings"
  "Owner_listBlackouts"
  "Owner_createBlackout"
  "Owner_deleteBlackout"
  "Guest_listActiveEventTypes"
  "Guest_getActiveEventType"
  "Guest_getSlots"
  "Guest_createBooking"
  "Health_health"
)
for op in "${EXPECTED_OPS[@]}"; do
  if grep -q "operationId: $op" "$OUTPUT"; then
    green "  $op"
  else
    red "  $op (not found)"
  fi
done

# ----- 4. Schema count (under components/schemas, not parameters) -----
echo -e "\n--- Test: Schema count ---"
SCHEMA_COUNT=$(grep -c '^    [A-Z][a-zA-Z]*:$' "$OUTPUT" 2>/dev/null || echo 0)
if [ "$SCHEMA_COUNT" -eq 11 ]; then
  green "Expected 11 schemas (OwnerBookingsParams fields are in parameters, not schemas), found $SCHEMA_COUNT"
else
  red "Expected 11 schemas, found $SCHEMA_COUNT"
fi

# ----- 5. Expected schemas -----
echo -e "\n--- Test: Schema names ---"
EXPECTED_SCHEMAS=(
  "Blackout"
  "Booking"
  "CreateBlackoutRequest"
  "CreateBookingRequest"
  "CreateEventTypeRequest"
  "Error"
  "EventType"
  "GuestBookingResponse"
  "PublicEventType"
  "TimeSlot"
  "UpdateEventTypeRequest"
)
for schema in "${EXPECTED_SCHEMAS[@]}"; do
  if grep -q "^    $schema:" "$OUTPUT"; then
    green "  $schema"
  else
    red "  $schema (not found)"
  fi
done

# ----- 6. Query parameters (not body) -----
echo -e "\n--- Test: Query parameters ---"
if grep -q "OwnerBookingsParams.eventTypeId:" "$OUTPUT" && \
   grep -q "in: query" "$OUTPUT"; then
  green "OwnerBookingsParams are query parameters"
else
  red "OwnerBookingsParams not found as query parameters"
fi

# ----- 7. Path parameters (operations with {id}) -----
echo -e "\n--- Test: Path parameters ---"
PATH_PARAM_COUNT=$(grep -c "in: path" "$OUTPUT" 2>/dev/null || echo 0)
if [ "$PATH_PARAM_COUNT" -eq 5 ]; then
  green "Expected 5 path parameters (event-types get/patch, event-types/{id}/slots, blackouts delete), found $PATH_PARAM_COUNT"
else
  red "Expected 5 path parameters, found $PATH_PARAM_COUNT"
fi

# ----- 8. HTTP methods -----
echo -e "\n--- Test: HTTP methods ---"
METHOD_COUNT=$(grep -cE '^\s{4}(get:|post:|patch:|delete:)' "$OUTPUT" 2>/dev/null || echo 0)
if [ "$METHOD_COUNT" -eq 13 ]; then
  green "Expected 13 HTTP method entries, found $METHOD_COUNT"
else
  red "Expected 13 HTTP method entries, found $METHOD_COUNT"
fi

# ----- 9. POST endpoints count -----
echo -e "\n--- Test: POST endpoints ---"
POST_COUNT=$(grep -c '^    post:' "$OUTPUT" 2>/dev/null || echo 0)
if [ "$POST_COUNT" -eq 3 ]; then
  green "Expected 3 POST endpoints (createEventType, createBlackout, createBooking), found $POST_COUNT"
else
  red "Expected 3 POST endpoints, found $POST_COUNT"
fi

# ----- Summary -----
echo -e "\n========================"
echo "Results: $PASS passed, $FAIL failed"
echo "========================"
[ "$FAIL" -eq 0 ] || exit 1
