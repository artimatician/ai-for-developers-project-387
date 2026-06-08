import os
import pytest
import requests

BACKEND_URL = "http://localhost:4010"


def _playwright_browser_available():
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            path = p.chromium.executable_path
            return os.path.isfile(path)
    except Exception:
        return False


def pytest_configure(config):
    config.addinivalue_line("markers", "browser: marks tests that require a Playwright browser")


def pytest_collection_modifyitems(config, items):
    if not _playwright_browser_available():
        skip = pytest.mark.skip(reason="Playwright browser not available (see tests/README.md)")
        for item in items:
            if "page" in item.fixturenames:
                item.add_marker(skip)


@pytest.fixture(scope="session")
def api_client():
    with requests.Session() as session:
        session.trust_env = False
        yield _ApiClient(session, BACKEND_URL)


class _ApiClient:
    def __init__(self, session, base_url):
        self._session = session
        self._base_url = base_url

    def _url(self, path):
        return self._base_url + path

    def get(self, path, **kwargs):
        return self._session.get(self._url(path), **kwargs)

    def post(self, path, **kwargs):
        return self._session.post(self._url(path), **kwargs)

    def patch(self, path, **kwargs):
        return self._session.patch(self._url(path), **kwargs)

    def delete(self, path, **kwargs):
        return self._session.delete(self._url(path), **kwargs)

    def request(self, method, path, **kwargs):
        return self._session.request(method, self._url(path), **kwargs)


@pytest.fixture(scope="function")
def event_type(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Test Call",
        "description": "30 min consultation",
        "timezone": "UTC",
    })
    assert resp.status_code == 201
    et = resp.json()
    return {"id": et["id"], "name": et["name"], "timezone": et["timezone"]}


@pytest.fixture(scope="function")
def second_event_type(api_client):
    resp = api_client.post("/api/owner/event-types", json={
        "name": "Second Meeting",
        "description": "Another test event type",
        "timezone": "America/New_York",
    })
    assert resp.status_code == 201
    return resp.json()


# TODO: fix - _unique_time_counter is a module-level global that resets on
# pytest restart but the SQLite :memory: backend DB doesn't. Running the
# suite twice without restarting the backend causes SLOT_UNAVAILABLE (409)
# because unique_time() re-generates already-booked slots.
# Fix ideas: make the counter time-aware (derive from current time instead of
# a plain counter), or clean DB between runs, or restart backend automatically.
_unique_time_counter = 0


@pytest.fixture(scope="function")
def unique_time():
    from datetime import datetime, timezone, timedelta
    def _generate():
        global _unique_time_counter
        _unique_time_counter += 1
        slot_minutes = (_unique_time_counter - 1) * 30
        slots_per_day = 8  # 14:00 to 17:30 (8 slots of 30min)
        days = slot_minutes // (slots_per_day * 30)
        slot_in_day = slot_minutes % (slots_per_day * 30)
        start = (datetime.now(timezone.utc) + timedelta(days=2 + days)).replace(
            hour=14, minute=0, second=0, microsecond=0
        ) + timedelta(minutes=slot_in_day)
        return start.strftime("%Y-%m-%dT%H:%M:%SZ")
    return _generate


@pytest.fixture(scope="function")
def future_slot(api_client, event_type, unique_time):
    t = unique_time()
    resp = api_client.post("/api/bookings", json={
        "eventTypeId": event_type["id"],
        "startTime": t,
        "guestName": "Setup User",
    })
    assert resp.status_code == 201, f"future_slot failed at {t}: {resp.json()}"
    return t
