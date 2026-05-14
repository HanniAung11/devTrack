from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser


class AuthFlowTests(APITestCase):
    def test_register_developer_and_login_email(self):
        register_response = self.client.post(
            reverse("auth-register"),
            {
                "full_name": "Test User",
                "email": "dev@example.com",
                "password": "StrongPass123",
                "confirm_password": "StrongPass123",
                "role": "DEVELOPER",
            },
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", register_response.data)
        self.assertIn("developer", register_response.data)

        login_response = self.client.post(
            reverse("auth-login"),
            {"email": "dev@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        access_token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        profile_response = self.client.get(reverse("auth-profile"))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["user"]["email"], "dev@example.com")
