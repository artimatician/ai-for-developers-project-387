import uuid
import re

from django.test import TestCase, Client

from appointments.models import EventType


class EventTypeOwnerTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.event_type_data = {
            'name': '30 Minute Meeting',
            'description': 'A quick catch-up',
            'timezone': 'UTC',
        }

    def test_list_empty(self):
        response = self.client.get('/api/owner/event-types')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_create_event_type(self):
        response = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['name'], '30 Minute Meeting')
        self.assertEqual(data['description'], 'A quick catch-up')
        self.assertEqual(data['timezone'], 'UTC')
        self.assertTrue(data['isActive'])
        self.assertIn('id', data)
        self.assertIn('createdAt', data)

    def test_create_event_type_invalid_timezone(self):
        data = {**self.event_type_data, 'timezone': 'Mars/Midgard'}
        response = self.client.post('/api/owner/event-types', data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_create_event_type_missing_name(self):
        data = {'description': 'A test'}
        response = self.client.post('/api/owner/event-types', data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['code'], 'INVALID_INPUT')

    def test_list_after_creation(self):
        self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        response = self.client.get('/api/owner/event-types')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_get_by_id(self):
        create_resp = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        et_id = create_resp.json()['id']
        response = self.client.get(f'/api/owner/event-types/{et_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name'], '30 Minute Meeting')

    def test_get_nonexistent(self):
        response = self.client.get(f'/api/owner/event-types/{uuid.uuid4()}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'EVENT_TYPE_NOT_FOUND')

    def test_patch_update(self):
        create_resp = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        et_id = create_resp.json()['id']
        response = self.client.patch(f'/api/owner/event-types/{et_id}',
                                     {'name': 'Updated Name'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name'], 'Updated Name')
        self.assertEqual(response.json()['description'], 'A quick catch-up')

    def test_patch_soft_delete(self):
        create_resp = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        et_id = create_resp.json()['id']
        response = self.client.patch(f'/api/owner/event-types/{et_id}',
                                     {'isActive': False}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['isActive'])

    def test_patch_nonexistent(self):
        response = self.client.patch(f'/api/owner/event-types/{uuid.uuid4()}',
                                     {'name': 'Nope'}, content_type='application/json')
        self.assertEqual(response.status_code, 404)

    def test_created_at_iso_format(self):
        create_resp = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        created_at = create_resp.json()['createdAt']
        self.assertTrue(re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', created_at))

    def test_id_is_uuid(self):
        create_resp = self.client.post('/api/owner/event-types', self.event_type_data, content_type='application/json')
        et_id = create_resp.json()['id']
        uuid.UUID(et_id)

    def test_create_default_timezone(self):
        data = {'name': 'Test', 'description': 'Desc'}
        response = self.client.post('/api/owner/event-types', data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['timezone'], 'UTC')


class EventTypePublicTests(TestCase):
    def setUp(self):
        self.client = Client()

    def _create_active(self):
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Active', 'description': 'Active ET'},
                                content_type='application/json')
        return resp.json()['id']

    def _create_inactive(self):
        resp = self.client.post('/api/owner/event-types',
                                {'name': 'Inactive', 'description': 'Inactive ET'},
                                content_type='application/json')
        et_id = resp.json()['id']
        self.client.patch(f'/api/owner/event-types/{et_id}', {'isActive': False}, content_type='application/json')
        return et_id

    def test_list_only_active(self):
        self._create_active()
        self._create_inactive()
        response = self.client.get('/api/event-types')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['name'], 'Active')

    def test_get_active_by_id(self):
        et_id = self._create_active()
        response = self.client.get(f'/api/event-types/{et_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name'], 'Active')

    def test_get_inactive_by_id_returns_404(self):
        et_id = self._create_inactive()
        response = self.client.get(f'/api/event-types/{et_id}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'EVENT_TYPE_NOT_FOUND')

    def test_get_nonexistent_returns_404(self):
        response = self.client.get(f'/api/event-types/{uuid.uuid4()}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['code'], 'EVENT_TYPE_NOT_FOUND')
