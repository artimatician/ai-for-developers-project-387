import uuid
from datetime import datetime, timezone, timedelta


def test_booking_nonexistent_event_type(api_client):
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": str(uuid.uuid4()),
        "startTime": "2026-07-01T10:00:00Z",
        "guestName": "Alice",
    })
    assert resp.status_code == 404
    assert resp.json()["code"] == "EVENT_TYPE_NOT_FOUND"


def test_booking_inactive_event_type(api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=10, minute=0, second=0, microsecond=0
    )
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "guestName": "Alice",
    })
    assert resp.status_code == 404
    assert resp.json()["code"] == "EVENT_TYPE_INACTIVE"


def test_booking_past_time(api_client, event_type):
    past = (datetime.now(timezone.utc) - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": past,
        "guestName": "Alice",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


def test_booking_misaligned_start(api_client, event_type):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=10, minute=17, second=0, microsecond=0
    )
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": d.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "guestName": "Alice",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


def test_booking_outside_operating_hours(api_client, event_type):
    d = (datetime.now(timezone.utc) + timedelta(days=2)).replace(
        hour=20, minute=0, second=0, microsecond=0
    )
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": d.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "guestName": "Alice",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


def test_booking_missing_required_fields(api_client):
    resp = api_client.post("/api/bookings", json={})
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


# TODO: fix - future_slot fixture errors with 409 on second test run
# without backend restart. See test_availability_edge.py for root cause.
def test_double_booking_same_slot(api_client, event_type, future_slot):
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": future_slot,
        "guestName": "Alice",
    })
    assert resp.status_code == 409
    assert resp.json()["code"] == "SLOT_UNAVAILABLE"


# TODO: fix - fails with 409 on second test run without backend restart.
# See test_availability_edge.py for root cause.
def test_booking_optional_notes(api_client, event_type, unique_time):
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": unique_time(),
        "guestName": "Alice",
        "notes": "Some additional info",
    })
    assert resp.status_code == 201
    assert resp.json()["eventTypeName"] == event_type["name"]


# TODO: fix - fails with 409 on second test run without backend restart.
# See test_availability_edge.py for root cause.
def test_booking_response_shape(api_client, event_type, unique_time):
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": unique_time(),
        "guestName": "Alice",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "startTime" in data
    assert "endTime" in data
    assert "duration" in data
    assert data["duration"] == 30
    assert data["eventTypeName"] == event_type["name"]
    assert "id" not in data
    assert "notes" not in data
    assert "eventTypeId" not in data
    assert "guestName" not in data
