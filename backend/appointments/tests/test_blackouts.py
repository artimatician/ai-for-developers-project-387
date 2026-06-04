import uuid
from datetime import datetime, timezone, timedelta

from django.test import TestCase, Client

from appointments.models import EventType, Booking, Blackout


class BlackoutTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.blackout_data = {
            'startTime': (datetime.now(timezone.utc) + timedelta(days=1)).replace(hour=12, minute=0).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'endTime': (datetime.now(timezone.utc) + timedelta(days=1)).replace(hour=14, minute=0).strftime('%Y-%m-%dT%H:%M:%SZ'),
        }

    def test_list_empty(self):
        response = self.client.get('/api/owner/blackouts')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_create_blackout(self):
        response = self.client.post('/api/owner/blackouts', self.blackout_data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn('id', data)
        self.assertIn('startTime', data)
        self.assertIn('endTime', data)
        self.assertIn('createdAt', data)

    def test_create_blackout_end_before_start(self):
        data = {
            'startTime': self.blackout_data['endTime'],
            'endTime': self.blackout_data['startTime'],
        }
        response = self.client.post('/api/owner/blackouts', data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_blackout_missing_required(self):
        response = self.client.post('/api/owner/blackouts', {}, content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_delete_blackout(self):
        create_resp = self.client.post('/api/owner/blackouts', self.blackout_data, content_type='application/json')
        b_id = create_resp.json()['id']
        response = self.client.delete(f'/api/owner/blackouts/{b_id}')
        self.assertEqual(response.status_code, 204)
        # Verify gone
        get_resp = self.client.get('/api/owner/blackouts')
        self.assertEqual(len(get_resp.json()), 0)

    def test_delete_nonexistent(self):
        response = self.client.delete(f'/api/owner/blackouts/{uuid.uuid4()}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'BLACKOUT_NOT_FOUND')
