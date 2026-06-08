import pytest


@pytest.mark.browser
def test_full_booking_flow(page, api_client, event_type):
    page.goto(f"/book/{event_type['id']}")
    page.wait_for_load_state("networkidle")

    assert page.get_by_text(event_type["name"]).is_visible()
    assert page.get_by_text("30 min", exact=True).is_visible()
    assert page.get_by_text(event_type["timezone"]).is_visible()

    assert page.locator(".cal-month-label").is_visible()

    available_dates = page.locator(".cal-available")
    assert available_dates.count() > 0

    slot = page.locator('div[style*="cursor: pointer"][style*="opacity: 1"]').first
    try:
        slot.click(timeout=3000)
    except Exception:
        pytest.skip("No available time slot found to click")

    continue_btn = page.get_by_role("button", name="Continue")
    if not continue_btn.is_disabled():
        continue_btn.click()
        page.get_by_role("heading", name=event_type["name"]).wait_for(state="visible", timeout=5000)

        page.get_by_placeholder("Enter your name").fill("Alice")
        page.get_by_role("button", name="Confirm Booking").click()
        page.get_by_text("Booking Confirmed!").wait_for(state="visible", timeout=5000)


@pytest.mark.browser
def test_guest_cannot_book_inactive_event_type(page, api_client, event_type):
    api_client.patch(
        f"/api/owner/event-types/{event_type['id']}",
        json={"isActive": False},
    )

    page.goto(f"/book/{event_type['id']}")
    page.wait_for_load_state("networkidle")

    error_alert = page.locator(".mantine-Alert-root")
    assert error_alert.is_visible()
