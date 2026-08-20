from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.models import User


class AccountsAPITestCase(APITestCase):

    def setUp(self):
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/login/"
        self.me_url = "/api/v1/auth/me/"
        self.refresh_url = "/api/v1/auth/refresh/"
        self.logout_url = "/api/v1/auth/logout/"

        self.user = User.objects.create_user(
            phone="9999999701",
            password="testpassword123",
            first_name="Test",
            last_name="User",
            email="test@example.com",
            role=UserRole.PATIENT,
        )

    def test_unauthenticated_user_cannot_access_me(self):
        response = self.client.get(self.me_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_access_me(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.get(self.me_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["phone"],
            self.user.phone,
        )

        self.assertEqual(
            response.data["role"],
            UserRole.PATIENT,
        )

    def test_user_can_register(self):
        response = self.client.post(
            self.register_url,
            {
                "phone": "9999999702",
                "password": "newpassword123",
                "first_name": "New",
                "last_name": "Patient",
                "email": "new@example.com",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(
            phone="9999999702",
        )

        self.assertEqual(
            user.first_name,
            "New",
        )

        self.assertTrue(
            user.check_password("newpassword123"),
        )

        self.assertEqual(
            user.role,
            UserRole.PATIENT,
        )

        self.assertTrue(
            hasattr(user, "patient_profile"),
        )

    def test_registration_rejects_short_password(self):
        response = self.client.post(
            self.register_url,
            {
                "phone": "9999999703",
                "password": "short",
                "first_name": "Test",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_registration_rejects_duplicate_phone(self):
        response = self.client.post(
            self.register_url,
            {
                "phone": self.user.phone,
                "password": "newpassword123",
                "first_name": "Duplicate",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_user_can_login(self):
        response = self.client.post(
            self.login_url,
            {
                "phone": self.user.phone,
                "password": "testpassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

        self.assertIn(
            "user",
            response.data,
        )

        self.assertEqual(
            response.data["user"]["phone"],
            self.user.phone,
        )

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            self.login_url,
            {
                "phone": self.user.phone,
                "password": "wrongpassword",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login_rejects_unknown_phone(self):
        response = self.client.post(
            self.login_url,
            {
                "phone": "9999999799",
                "password": "testpassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_refresh_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "phone": self.user.phone,
                "password": "testpassword123",
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

    def test_authenticated_user_can_logout(self):
        login_response = self.client.post(
            self.login_url,
            {
                "phone": self.user.phone,
                "password": "testpassword123",
            },
            format="json",
        )

        access_token = login_response.data["access"]
        refresh_token = login_response.data["refresh"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )

        response = self.client.post(
            self.logout_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_logout_requires_refresh_token(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )