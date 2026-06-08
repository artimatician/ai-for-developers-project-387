import uuid
from datetime import datetime, timezone, timedelta

from django.test import TestCase, Client

from appointments.models import EventType, Booking, Blackout


class BookingTests(TestCase):
    def setUp(self):
        self.client = Client()
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Test Meeting', 'description': 'A test'},
                                content_type='application/json')
        self.event_type_id = resp.json()['id']
        self.event_type_name = resp.json()['name']

    def _get_future_slot_start(self):
        now = datetime.now(timezone.utc)
        future = now + timedelta(days=1)
        future = future.replace(hour=10, minute=0, second=0, microsecond=0)
        return future.strftime('%Y-%m-%dT%H:%M:%SZ')

    def test_create_booking_valid(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn('startTime', data)
        self.assertIn('endTime', data)
        self.assertIn('duration', data)
        self.assertEqual(data['duration'], 30)
        self.assertEqual(data['eventTypeName'], 'Test Meeting')
        self.assertNotIn('id', data)
        self.assertNotIn('notes', data)
        self.assertNotIn('eventTypeId', data)
        self.assertNotIn('guestName', data)

    def test_endtime_is_start_plus_30min(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        start_dt = datetime.fromisoformat(data['startTime'].replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(data['endTime'].replace('Z', '+00:00'))
        self.assertEqual(end_dt - start_dt, timedelta(minutes=30))

    def test_create_booking_nonexistent_event_type(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': str(uuid.uuid4()),
            'startTime': start,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'EVENT_TYPE_NOT_FOUND')

    def test_create_booking_inactive_event_type(self):
        self.client.patch(f'/api/owner/event-types/{self.event_type_id}',
                          {'isActive': False}, content_type='application/json')
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'EVENT_TYPE_INACTIVE')

    def test_create_booking_past_time(self):
        past = (datetime.now(timezone.utc) - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ')
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': past,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_misaligned_start(self):
        misaligned = datetime.now(timezone.utc) + timedelta(days=1)
        misaligned = misaligned.replace(hour=10, minute=17, second=0, microsecond=0)
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': misaligned.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_15min_boundary(self):
        start = datetime.now(timezone.utc) + timedelta(days=1)
        start = start.replace(hour=10, minute=15, second=0, microsecond=0)
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_booking_with_duration(self):
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Long Meeting', 'description': 'Test', 'duration': 60},
                                content_type='application/json')
        et_id = resp.json()['id']
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': et_id,
            'startTime': start,
            'guestName': 'John Doe',
            'duration': 45,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        start_dt = datetime.fromisoformat(data['startTime'].replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(data['endTime'].replace('Z', '+00:00'))
        self.assertEqual(end_dt - start_dt, timedelta(minutes=45))

    def test_create_booking_duration_exceeds_event_type_max(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
            'duration': 60,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_duration_not_multiple_of_15(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
            'duration': 22,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_duration_below_minimum(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
            'duration': 5,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_end_time_outside_operating_hours(self):
        start = datetime.now(timezone.utc) + timedelta(days=1)
        start = start.replace(hour=17, minute=30, second=0, microsecond=0)
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'John Doe',
            'duration': 45,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_outside_operating_hours(self):
        outside = datetime.now(timezone.utc) + timedelta(days=1)
        outside = outside.replace(hour=20, minute=0, second=0, microsecond=0)
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': outside.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_conflict_with_booking(self):
        start = self._get_future_slot_start()
        self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'First',
        }, content_type='application/json')
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'Second',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['code'], 'SLOT_UNAVAILABLE')

    def test_create_booking_conflict_with_blackout(self):
        start = datetime.now(timezone.utc) + timedelta(days=1)
        start = start.replace(hour=10, minute=0, second=0, microsecond=0)
        end = start + timedelta(hours=2)
        Blackout.objects.create(startTime=start, endTime=end, reason='Test blackout')
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['code'], 'SLOT_UNAVAILABLE')

    def test_create_booking_missing_fields(self):
        response = self.client.post('/api/bookings', {}, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_booking_optional_notes(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
            'notes': 'Some notes',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_booking_without_notes(self):
        start = self._get_future_slot_start()
        response = self.client.post('/api/bookings', {
            'eventTypeId': self.event_type_id,
            'startTime': start,
            'guestName': 'John Doe',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)


class BookingOwnerListTests(TestCase):
    def setUp(self):
        self.client = Client()
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Test', 'description': 'Test'},
                                content_type='application/json')
        self.et_id = resp.json()['id']
        resp2 = self.client.post('/api/owner/event-types',
                                 {'name': 'Test 2', 'description': 'Test 2'},
                                 content_type='application/json')
        self.et_id_2 = resp2.json()['id']

    def _get_future_slot_start(self, hour=10):
        now = datetime.now(timezone.utc)
        future = now + timedelta(days=1)
        future = future.replace(hour=hour, minute=0, second=0, microsecond=0)
        return future.strftime('%Y-%m-%dT%H:%M:%SZ')

    def test_list_bookings(self):
        start = self._get_future_slot_start()
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start, 'guestName': 'John',
        }, content_type='application/json')
        response = self.client.get('/api/owner/bookings')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_filter_by_event_type(self):
        start = self._get_future_slot_start()
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start, 'guestName': 'John',
        }, content_type='application/json')
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id_2, 'startTime': start, 'guestName': 'Jane',
        }, content_type='application/json')
        response = self.client.get(f'/api/owner/bookings?eventTypeId={self.et_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_filter_by_time_range(self):
        start1 = self._get_future_slot_start(10)
        start2 = self._get_future_slot_start(11)
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start1, 'guestName': 'John',
        }, content_type='application/json')
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start2, 'guestName': 'Jane',
        }, content_type='application/json')
        response = self.client.get(f'/api/owner/bookings?from={start1}&to={start1}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_pagination(self):
        start_base = datetime.now(timezone.utc) + timedelta(days=1)
        for i in range(5):
            start = start_base.replace(hour=10 + i, minute=0, second=0, microsecond=0)
            self.client.post('/api/bookings', {
                'eventTypeId': self.et_id,
                'startTime': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'guestName': f'Guest {i}',
            }, content_type='application/json')
        response = self.client.get('/api/owner/bookings?limit=2&offset=0')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_default_limit(self):
        start_base = datetime.now(timezone.utc) + timedelta(days=1)
        for i in range(25):
            start = (start_base + timedelta(days=i)).replace(hour=10, minute=0, second=0, microsecond=0)
            self.client.post('/api/bookings', {
                'eventTypeId': self.et_id,
                'startTime': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'guestName': f'Guest {i}',
            }, content_type='application/json')
        response = self.client.get('/api/owner/bookings')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 20)

    def test_ordering_by_start_time(self):
        start1 = self._get_future_slot_start(11)
        start2 = self._get_future_slot_start(10)
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start1, 'guestName': 'Second',
        }, content_type='application/json')
        self.client.post('/api/bookings', {
            'eventTypeId': self.et_id, 'startTime': start2, 'guestName': 'First',
        }, content_type='application/json')
        response = self.client.get('/api/owner/bookings')
        data = response.json()
        self.assertEqual(data[0]['guestName'], 'First')
        self.assertEqual(data[1]['guestName'], 'Second')
