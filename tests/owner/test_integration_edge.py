import uuid


def test_health_check(api_client):
    resp = api_client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_no_authentication_required(api_client):
    endpoints = [
        ("GET", "/api/event-types"),
        ("GET", f"/api/event-types/{uuid.uuid4()}"),
        ("GET", f"/api/event-types/{uuid.uuid4()}/slots"),
        ("POST", "/api/bookings"),
        ("GET", "/api/owner/event-types"),
        ("GET", f"/api/owner/event-types/{uuid.uuid4()}"),
        ("PATCH", f"/api/owner/event-types/{uuid.uuid4()}"),
        ("GET", "/api/owner/bookings"),
        ("GET", "/api/owner/blackouts"),
        ("POST", "/api/owner/blackouts"),
        ("DELETE", f"/api/owner/blackouts/{uuid.uuid4()}"),
    ]
    for method, path in endpoints:
        resp = api_client.request(method, path)
        assert resp.status_code not in (401, 403), f"{method} {path} returned {resp.status_code}"


def test_404_for_nonexistent_event_type(api_client):
    bad_id = str(uuid.uuid4())
    for path in [
        f"/api/event-types/{bad_id}",
        f"/api/event-types/{bad_id}/slots",
        f"/api/owner/event-types/{bad_id}",
    ]:
        resp = api_client.get(path)
        assert resp.status_code == 404, f"GET {path} returned {resp.status_code}"


def test_404_for_nonexistent_blackout(api_client):
    resp = api_client.delete(f"/api/owner/blackouts/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["code"] == "BLACKOUT_NOT_FOUND"


def test_field_length_limit(api_client):
    long_str = "x" * 1001
    resp = api_client.post("/api/owner/event-types", json={
        "name": long_str,
        "description": "x",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


# TODO: fix - fails with 409 on second test run without backend restart.
# See test_availability_edge.py for root cause.
def test_booking_snapshot_semantics(api_client, event_type, unique_time):
    start_time = unique_time()
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": start_time,
        "guestName": "Snapshot Test",
    })
    assert resp.status_code == 201
    booking = resp.json()
    assert booking["eventTypeName"] == event_type["name"]

    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"name": "Renamed"},
    )

    bookings = api_client.get("/api/owner/bookings").json()
    matching = [b for b in bookings if b["startTime"] == start_time]
    assert len(matching) == 1
    assert matching[0]["eventTypeName"] == event_type["name"]
    assert matching[0]["eventTypeName"] != "Renamed"


def test_slot_count_and_format(api_client, event_type):
    slots = api_client.get(f"/api/event-types/{event_type['id']}/slots").json()
    assert len(slots) == 252

    days = {}
    for slot in slots:
        day = slot["startTime"][:10]
        days[day] = days.get(day, 0) + 1
    for day, count in days.items():
        assert count == 18, f"Day {day} has {count} slots, expected 18"

    for slot in slots:
        assert slot["startTime"].endswith("Z")
        assert slot["endTime"].endswith("Z")
        assert "available" in slot
