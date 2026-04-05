from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from app import create_app


class PortfolioAppTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / 'portfolio-test.db'
        self.app = create_app(
            {
                'TESTING': True,
                'DATABASE': self.db_path,
            }
        )
        self.client = self.app.test_client()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_homepage_renders(self) -> None:
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertIn('Винсента'.encode('utf-8'), response.data)
        self.assertIn(b'/admin/messages', response.data)

    def test_admin_page_renders(self) -> None:
        response = self.client.get('/admin/messages')

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertIn('Сообщения из формы'.encode('utf-8'), response.data)

    def test_content_api_returns_seeded_sections(self) -> None:
        response = self.client.get('/api/content')
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload['profile']['name'], 'Винсента')
        self.assertEqual(len(payload['projects']), 3)
        self.assertGreaterEqual(len(payload['gallery']), 1)

    def test_health_route_reports_ok(self) -> None:
        response = self.client.get('/health')
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(payload['ok'])
        self.assertIn('portfolio-test.db', payload['database'])

    def test_messages_api_rejects_invalid_payload(self) -> None:
        response = self.client.post('/api/messages', json={'name': 'A', 'contact': '', 'message': 'short'})
        payload = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertFalse(payload['ok'])
        self.assertIn('errors', payload)

    def test_messages_api_persists_submission(self) -> None:
        response = self.client.post(
            '/api/messages',
            json={
                'name': 'Анна',
                'contact': '@anna',
                'message': 'Хочу обсудить иллюстрацию для открытки.',
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.get_json()['ok'])

        admin_response = self.client.get('/api/admin/messages')
        messages = admin_response.get_json()

        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]['name'], 'Анна')


if __name__ == '__main__':
    unittest.main()
