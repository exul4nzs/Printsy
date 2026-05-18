from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class FirebaseUserProfileAPITest(APITestCase):
    @patch('shop.authentication.verify_firebase_token')
    def test_user_profile_requires_valid_bearer_token(self, mock_verify):
        url = reverse('user-profile')

        response = self.client.get(url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

        mock_verify.side_effect = ValueError('bad token')
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer invalid-token')
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

        mock_verify.side_effect = None
        mock_verify.return_value = {
            'uid': 'firebase-test-uid',
            'email': 'customer@example.com',
            'name': 'Test Customer',
        }
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer valid-token')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'customer@example.com')
        self.assertTrue(User.objects.filter(username='firebase-test-uid').exists())
