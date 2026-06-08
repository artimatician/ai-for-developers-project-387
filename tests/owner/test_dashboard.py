import pytest


@pytest.mark.browser
def test_dashboard_page(page, api_client, event_type):
    api_client.post("/api/owner/event-types", json={
        "name": "Second ET", "description": "Another type",
    })

    page.goto("/owner")
    page.wait_for_load_state("networkidle")

    assert page.get_by_role("heading", name="Dashboard").is_visible()
    assert page.get_by_role("link", name="Event Types", exact=True).is_visible()
    assert page.get_by_role("link", name="Bookings", exact=True).is_visible()
    assert page.get_by_role("link", name="Blackouts", exact=True).is_visible()


@pytest.mark.browser
def test_sidebar_navigation(page, api_client, event_type):
    page.goto("/owner")
    page.wait_for_load_state("networkidle")

    assert page.get_by_role("heading", name="Dashboard").is_visible()

    page.get_by_role("link", name="Event Types", exact=True).click()
    page.get_by_role("heading", name="Event Types").wait_for(state="visible", timeout=5000)

    page.get_by_role("link", name="Bookings", exact=True).click()
    page.get_by_role("heading", name="Bookings").wait_for(state="visible", timeout=5000)

    page.get_by_role("link", name="Blackouts", exact=True).click()
    page.get_by_role("heading", name="Blackouts").wait_for(state="visible", timeout=5000)

    page.get_by_role("link", name="Dashboard", exact=True).click()
    page.get_by_role("heading", name="Dashboard").wait_for(state="visible", timeout=5000)
