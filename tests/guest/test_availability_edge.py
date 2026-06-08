from datetime import datetime, timezone, timedelta


def test_inactive_event_type_hidden_from_guest_list(api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    types = api_client.get("/api/event-types").json()
    ids = [t["id"] for t in types]
    assert event_type["id"] not in ids


def test_inactive_event_type_returns_404_on_detail(api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    resp = api_client.get(f"/api/event-types/{event_type['id']}")
    assert resp.status_code == 404
    assert resp.json()["code"] == "EVENT_TYPE_NOT_FOUND"


def test_inactive_event_type_returns_404_on_slots(api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    resp = api_client.get(f"/api/event-types/{event_type['id']}/slots")
    assert resp.status_code == 404


# TODO: fix - fails with 409 on second run without backend restart.
# Root cause: _unique_time_counter global resets on pytest restart, but
# SQLite :memory: DB doesn't. Previous run's bookings at day+2,14:00+ are
# still in the DB, so unique_time() generates an already-booked slot.
# Fix ideas: restart backend between runs, or make unique_time time-aware
# (use microseconds since epoch instead of a plain counter), or clean the
# DB before each test module.
def test_cross_event_type_conflict(api_client, event_type, second_event_type, unique_time):
    t = unique_time()

    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": t,
        "guestName": "Alice",
    })
    assert resp.status_code == 201

    resp = api_client.post("/api/bookings", json={
        "eventTypeId": second_event_type["id"],
        "startTime": t,
        "guestName": "Bob",
    })
    assert resp.status_code == 409
    assert resp.json()["code"] == "SLOT_UNAVAILABLE"


def test_booking_blocked_by_blackout(api_client, event_type):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=9, minute=0, second=0, microsecond=0
    )
    start_str = d.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_str = (d + timedelta(hours=3)).strftime("%Y-%m-%dT%H:%M:%SZ")

    api_client.post("/api/owner/blackouts", json={
        "startTime": start_str,
        "endTime": end_str,
        "reason": "Maintenance",
    })

    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": start_str,
        "guestName": "Alice",
    })
    assert resp.status_code == 409
    assert resp.json()["code"] == "SLOT_UNAVAILABLE"
    assert "blackout" in resp.json()["message"]


def test_blackout_marks_slot_unavailable(api_client, event_type):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=10, minute=0, second=0, microsecond=0
    )
    start_str = d.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_str = (d + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

    api_client.post("/api/owner/blackouts", json={
        "startTime": start_str,
        "endTime": end_str,
    })

    slots = api_client.get(f"/api/event-types/{event_type['id']}/slots").json()
    matching = [s for s in slots if s["startTime"] == start_str]
    assert len(matching) == 1
    assert matching[0]["available"] is False


def test_cross_event_type_blackout_marked_slot_unavailable(api_client, event_type, second_event_type):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=11, minute=0, second=0, microsecond=0
    )
    start_str = d.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_str = (d + timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%SZ")

    api_client.post("/api/owner/blackouts", json={
        "startTime": start_str,
        "endTime": end_str,
    })

    slots = api_client.get(f"/api/event-types/{event_type['id']}/slots").json()
    matching = [s for s in slots if s["startTime"] == start_str]
    assert len(matching) == 1, "Slot should exist"
    assert matching[0]["available"] is False

    slots2 = api_client.get(f"/api/event-types/{second_event_type['id']}/slots").json()
    matching2 = [s for s in slots2 if s["startTime"] == start_str]
    if matching2:
        assert matching2[0]["available"] is False


def test_timezone_event_type_slots(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Moscow Time",
        "description": "MSK meeting",
        "timezone": "Europe/Moscow",
    })
    assert resp.status_code == 201
    et = resp.json()

    slots = api_client.get(f"/api/event-types/{et['id']}/slots").json()
    assert len(slots) == 490
    assert all(s["startTime"].endswith("Z") for s in slots)
    assert all(s["endTime"].endswith("Z") for s in slots)
