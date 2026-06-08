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
        # 14 days * 35 slots per day = 490 total (15-min intervals, 09:00-17:30 for 30-min duration)
        self.assertEqual(len(data), 490)

    def test_each_day_has_35_slots(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        days = {}
        for slot in data:
            day = slot['startTime'][:10]
            days[day] = days.get(day, 0) + 1
        for day, count in days.items():
            self.assertEqual(count, 35, f"Day {day} has {count} slots, expected 35")

    def test_slots_have_available_true_for_future(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
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
        self.assertEqual(len(data), 490)

    def test_slots_with_duration_param(self):
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Long Meeting', 'description': 'Test', 'duration': 60},
                                content_type='application/json')
        et_id = resp.json()['id']
        response = self.client.get(f'/api/event-types/{et_id}/slots?duration=60')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # With 60-min duration, valid start times: 09:00 to 17:00 (33 per day)
        # 09:00, 09:15, ..., 17:00 = 33 start times * 14 = 462
        self.assertEqual(len(data), 462)

    def test_slots_with_invalid_duration_param(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots?duration=7')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_slots_with_duration_exceeding_event_type_max(self):
        # Event type created with default duration=30, so 60 exceeds max
        response = self.client.get(f'/api/event-types/{self.et_id}/slots?duration=60')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_15min_start_time_slots(self):
        response = self.client.get(f'/api/event-types/{self.et_id}/slots')
        data = response.json()
        # First slot of the day should be at 09:00
        first_slots = [s for s in data if s['startTime'].endswith('09:00:00Z')]
        self.assertTrue(len(first_slots) > 0)
        # Check that 15-min boundary slots exist
        has_15 = any(s['startTime'].endswith(':15:00Z') for s in data)
        has_45 = any(s['startTime'].endswith(':45:00Z') for s in data)
        self.assertTrue(has_15, "Should have 15-min boundary slots")
        self.assertTrue(has_45, "Should have 45-min boundary slots")
