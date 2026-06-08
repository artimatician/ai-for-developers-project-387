from datetime import datetime, timezone, timedelta


# TODO: fix - future_slot fixture errors with 409 on second test run
# without backend restart. See test_availability_edge.py for root cause.
def test_list_bookings(api_client, event_type, future_slot):
    resp = api_client.get("/api/owner/bookings")
    assert resp.status_code == 200
    bookings = resp.json()
    matching = [b for b in bookings if b["guestName"] == "Setup User"]
    assert len(matching) >= 1
    assert matching[0]["eventTypeName"] == event_type["name"]


# TODO: fix - fails with 409 on second test run without backend restart.
# See test_availability_edge.py for root cause.
def test_filter_bookings_by_event_type(api_client, event_type, second_event_type, unique_time):
    s1 = unique_time()
    s2 = unique_time()
    r1 = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": s1,
        "guestName": "Alice",
    })
    assert r1.status_code == 201, f"First booking failed: {r1.json()}"
    r2 = api_client.post("/api/bookings", json={
        "eventTypeId": second_event_type["id"],
        "startTime": s2,
        "guestName": "Bob",
    })
    assert r2.status_code == 201, f"Second booking failed: {r2.json()}"

    resp = api_client.get("/api/owner/bookings", params={"eventTypeId": event_type["id"]})
    assert resp.status_code == 200
    bookings = resp.json()
    assert len(bookings) == 1
    assert bookings[0]["guestName"] == "Alice"


# TODO: fix - fails with 409 on second test run without backend restart.
# See test_availability_edge.py for root cause.
def test_bookings_ordered_by_start_time(api_client, event_type, unique_time):
    t1 = unique_time()
    t2 = unique_time()
    earlier, later = sorted([t1, t2])

    r1 = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": later,
        "guestName": "Second",
    })
    assert r1.status_code == 201, f"Later booking failed: {r1.json()}"
    r2 = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": earlier,
        "guestName": "First",
    })
    assert r2.status_code == 201, f"Earlier booking failed: {r2.json()}"

    bookings = api_client.get("/api/owner/bookings").json()
    sorted_bookings = [b for b in bookings if b["guestName"] in ("First", "Second")]
    assert len(sorted_bookings) == 2
    assert sorted_bookings[0]["guestName"] == "First"
    assert sorted_bookings[1]["guestName"] == "Second"


def test_blackout_crud(api_client):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=8, minute=0, second=0, microsecond=0
    )
    start_str = d.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_str = (d + timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%SZ")

    resp = api_client.post("/api/owner/blackouts", json={
        "startTime": start_str,
        "endTime": end_str,
        "reason": "Maintenance window",
    })
    assert resp.status_code == 201
    blackout = resp.json()
    assert blackout["reason"] == "Maintenance window"
    assert "id" in blackout
    assert "createdAt" in blackout

    blackouts = api_client.get("/api/owner/blackouts").json()
    ids = [b["id"] for b in blackouts]
    assert blackout["id"] in ids

    resp = api_client.delete(f"/api/owner/blackouts/{blackout['id']}")
    assert resp.status_code == 204

    blackouts = api_client.get("/api/owner/blackouts").json()
    ids = [b["id"] for b in blackouts]
    assert blackout["id"] not in ids


def test_delete_nonexistent_blackout(api_client):
    import uuid
    resp = api_client.delete(f"/api/owner/blackouts/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["code"] == "BLACKOUT_NOT_FOUND"


def test_create_blackout_end_before_start(api_client):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=10, minute=0, second=0, microsecond=0
    )
    resp = api_client.post("/api/owner/blackouts", json={
        "startTime": d.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "endTime": (d - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ"),
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"
