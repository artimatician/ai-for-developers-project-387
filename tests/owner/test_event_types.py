import uuid
import pytest


def test_create_event_type(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Consultation",
        "description": "30 min chat",
        "timezone": "America/New_York",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Consultation"
    assert data["description"] == "30 min chat"
    assert data["timezone"] == "America/New_York"
    assert data["isActive"] is True
    assert "id" in data
    assert "createdAt" in data


def test_create_event_type_default_timezone(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Default TZ",
        "description": "Should default to UTC",
    })
    assert resp.status_code == 201
    assert resp.json()["timezone"] == "UTC"


def test_create_event_type_invalid_timezone(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Bad TZ",
        "description": "x",
        "timezone": "Mars/Midgard",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


def test_create_event_type_missing_name(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "description": "No name",
    })
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_INPUT"


def test_list_event_types_includes_inactive(api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    types = api_client.get("/api/owner/event-types").json()
    ids = [t["id"] for t in types]
    assert event_type["id"] in ids


def test_update_event_type_name(api_client, event_type):
    resp = api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"name": "Updated Name"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"
    assert resp.json()["description"] == "30 min consultation"


def test_update_event_type_timezone(api_client, event_type):
    resp = api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"timezone": "Europe/London"},
    )
    assert resp.status_code == 200
    assert resp.json()["timezone"] == "Europe/London"


def test_toggle_event_type_active(api_client, event_type):
    resp = api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )
    assert resp.status_code == 200
    assert resp.json()["isActive"] is False


def test_update_nonexistent_event_type(api_client):
    resp = api_client.patch(
        f"/api/owner/event-types/{uuid.uuid4()}",
        json={"name": "x"},
    )
    assert resp.status_code == 404
    assert resp.json()["code"] == "EVENT_TYPE_NOT_FOUND"


def test_get_nonexistent_event_type(api_client):
    resp = api_client.get(f"/api/owner/event-types/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["code"] == "EVENT_TYPE_NOT_FOUND"


@pytest.mark.browser
def test_event_type_list_browser(page, api_client):
    api_client.post("/api/owner/event-types", json={
        "name": "Alpha", "description": "First",
    })
    api_client.post("/api/owner/event-types", json={
        "name": "Beta", "description": "Second",
    })

    page.goto("/owner/event-types")
    page.wait_for_load_state("networkidle")

    assert page.get_by_text("Event Types").is_visible()
    assert page.get_by_text("Alpha").is_visible()
    assert page.get_by_text("Beta").is_visible()
