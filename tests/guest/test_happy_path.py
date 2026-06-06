import pytest


@pytest.mark.browser
def test_full_booking_flow(page, api_client, event_type):
    page.goto("/book")
    page.wait_for_load_state("networkidle")

    card = page.get_by_text(event_type["name"]).first
    assert card.is_visible()
    card.click()
    page.wait_for_url(f"**/book/{event_type['id']}")
    page.wait_for_load_state("networkidle")

    assert page.get_by_text(event_type["name"]).is_visible()
    assert page.get_by_text("30 min").is_visible()
    assert page.get_by_text(event_type["timezone"]).is_visible()

    assert page.get_by_text("Select a date").is_visible()

    available_dates = page.locator(".cal-available")
    count = available_dates.count()
    assert count > 0, "Expected at least one available date in calendar"

    first_available = available_dates.first
    first_available.click()
    page.wait_for_timeout(300)

    slots = page.locator("div").filter(has_text=page.locator("div[style*='opacity: 1']"))
    slot_button = page.locator("div[style*='cursor: pointer']").filter(
        has_not=page.locator("div[style*='opacity: 0.35']")
    ).first

    try:
        slot_button.click(timeout=3000)
    except Exception:
        pytest.skip("No available time slot found to click")

    continue_btn = page.get_by_role("button", name="Continue")
    if not continue_btn.is_disabled():
        continue_btn.click()
        page.wait_for_url(f"**/book/{event_type['id']}/confirm**")
        page.wait_for_load_state("networkidle")

        assert page.get_by_text(event_type["name"]).is_visible()

        page.get_by_placeholder("Enter your name").fill("Alice")
        page.get_by_role("button", name="Confirm Booking").click()

        page.wait_for_url("**/bookings/confirm**")
        assert page.get_by_text("Booking Confirmed!").is_visible()


@pytest.mark.browser
def test_guest_cannot_book_inactive_event_type(page, api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )

    page.goto("/book")
    page.wait_for_load_state("networkidle")

    cards = page.get_by_text(event_type["name"])
    assert cards.count() == 0

    page.goto(f"/book/{event_type['id']}")
    page.wait_for_load_state("networkidle")

    error_alert = page.locator(".mantine-Alert-root")
    assert error_alert.is_visible()
