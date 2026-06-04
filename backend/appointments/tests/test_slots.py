import uuid
from datetime import datetime, timezone, timedelta

from django.test import TestCase, Client

from appointments.models import EventType, Booking, Blackout


class SlotTests(TestCase):
    def setUp(self):
        self.client = Client()
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Test', 'description': 'Test'},
                                content_type='application/json')
        self.et_id = resp.json()['id']

    def test_get_slots_returns_200(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_14_day_window(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        # 14 days * 18 slots per day = 252 total
        self.assertEqual(len(data), 252)

    def test_each_day_has_18_slots(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        # Group by day and verify each has 18
        days = {}
        for slot in data:
            day = slot['startTime'][:10]
            days[day] = days.get(day, 0) + 1
        for day, count in days.items():
            self.assertEqual(count, 18, f"Day {day} has {count} slots, expected 18")

    def test_slots_have_available_true_for_future(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        now = datetime.now(timezone.utc)
        # Find a slot far in the future (should be available)
        future_slots = [s for s in data if 'available' in s]
        any_available = any(s['available'] for s in data)
        self.assertTrue(any_available)

    def test_slots_utc_format(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        for slot in data:
            self.assertTrue(slot['startTime'].endswith('Z'), f"startTime {slot['startTime']} should end with Z")
            self.assertTrue(slot['endTime'].endswith('Z'), f"endTime {slot['endTime']} should end with Z")

    def test_past_slots_unavailable(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        now = datetime.now(timezone.utc)
        # There should be some past slots marked unavailable
        past_found = False
        for slot in data:
            slot_start = datetime.strptime(slot['startTime'], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
            if slot_start < now:
                past_found = True
                self.assertFalse(slot['available'], f"Past slot {slot['startTime']} should be unavailable")
        self.assertTrue(past_found, "Expected some past slots in the 14-day window")

    def test_booking_marks_slot_unavailable(self):
        future = datetime.now(timezone.utc) + timedelta(days=1)
        future = future.replace(hour=10, minute=0, second=0, microsecond=0)
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id,
            'startTime': future.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'Tester',
        }, content_type='application/json')

        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        slot_key = future.strftime('%Y-%m-%dT%H:%M:%SZ')
        for slot in data:
            if slot['startTime'] == slot_key:
                self.assertFalse(slot['available'])
                return
        self.fail(f"Slot {future} not found in response")

    def test_blackout_marks_slot_unavailable(self):
        start = datetime.now(timezone.utc) + timedelta(days=1)
        start = start.replace(hour=10, minute=0, second=0, microsecond=0)
        end = start + timedelta(hours=1)
        Blackout.objects.create(startTime=start, endTime=end, reason='Test')

        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        for slot in data:
            slot_start = slot['startTime']
            if slot_start == start.strftime('%Y-%m-%dT%H:%M:%SZ'):
                self.assertFalse(slot['available'])
                return
        self.fail("Expected slot to be marked unavailable due to blackout")

    def test_cross_event_type_booking(self):
        resp2 = self.client.post('/api/owner/event-types',
                                 {'name': 'Test 2', 'description': 'Test 2'},
                                 content_type='application/json')
        et_id_2 = resp2.json()['id']

        future = datetime.now(timezone.utc) + timedelta(days=1)
        future = future.replace(hour=10, minute=0, second=0, microsecond=0)
        self.client.post('/api/bookings', {
            'eventTypeId': et_id_2,
            'startTime': future.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'Tester',
        }, content_type='application/json')

        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        slot_key = future.strftime('%Y-%m-%dT%H:%M:%SZ')
        for slot in data:
            if slot['startTime'] == slot_key:
                self.assertFalse(slot['available'])
                return
        self.fail("Cross-event-type booking should block slot for all event types")

    def test_inactive_event_type_returns_404(self):
        self.client.patch(f'/api/owner/event-types/{self.et_id}',
                          {'isActive': False}, content_type='application/json')
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        self.assertEqual(response.status_code, 404)

    def test_nonexistent_event_type_returns_404(self):
        response = self.client.get(f'/api/event-types/{uuid.uuid4()}/slots')
        self.assertEqual(response.status_code, 404)

    def test_timezone_effects_slots(self):
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'NY', 'description': 'NY', 'timezone': 'America/New_York'},
                                content_type='application/json')
        ny_id = resp.json()['id']
        response = self.client.get(f'/api/event-types/{ny_id}/slots')
        data = response.json()
        self.assertEqual(len(data), 252)
