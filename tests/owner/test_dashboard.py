import pytest


@pytest.mark.browser
def test_dashboard_page(page, api_client, event_type):
    api_client.post("/api/owner/event-types", json={
        "name": "Second ET", "description": "Another type",
    })

    page.goto("/owner")
    page.wait_for_load_state("networkidle")

    assert page.get_by_text("Dashboard").is_visible()
    assert page.get_by_text("Event Types").is_visible()
    assert page.get_by_text("Bookings").is_visible()
    assert page.get_by_text("Blackouts").is_visible()

    assert page.get_by_text("2").is_visible()
    assert page.get_by_text("0").is_visible()


@pytest.mark.browser
def test_sidebar_navigation(page, api_client, event_type):
    page.goto("/owner")
    page.wait_for_load_state("networkidle")

    assert page.get_by_text("Dashboard").is_visible()

    page.get_by_text("Event Types").first.click()
    page.wait_for_url("**/owner/event-types")
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Event Types").is_visible()

    page.get_by_text("Bookings").first.click()
    page.wait_for_url("**/owner/bookings")
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Bookings").is_visible()

    page.get_by_text("Blackouts").first.click()
    page.wait_for_url("**/owner/blackouts")
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Blackouts").is_visible()

    page.get_by_text("Dashboard").first.click()
    page.wait_for_url("**/owner")
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Dashboard").is_visible()
